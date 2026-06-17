# SmartBuild — Production Infrastructure

> **IMPORTANT: This setup requires a VPS or dedicated server with root/Docker access.**
> It will NOT work on shared hosting (Hostinger, cPanel, etc.) because it requires:
> - Docker or direct Node.js/Bun process management (PM2)
> - Nginx installed and configured at the system level
> - Ports 80 and 443 open on the firewall
> - Ability to bind to privileged ports and run long-lived processes

---

## Directory Layout

```
infra/
├── nginx/
│   ├── nginx.conf              # Main Nginx configuration (http block)
│   └── conf.d/
│       └── smartbuild.conf     # Virtual host: TLS, upstreams, locations
├── docker/
│   ├── Dockerfile              # Multi-stage build for Next.js standalone app
│   └── Dockerfile.realtime     # Build for Socket.IO realtime mini-service
├── docker-compose.yml          # All services: app, realtime, nginx, redis, mysql
├── pm2/
│   └── ecosystem.config.js     # PM2 process config (alternative to Docker)
└── README.md                   # This file
```

---

## Required Environment Variables

Copy `.env.example` to `.env` in the repo root and fill in all values before deploying.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL DSN: `mysql://user:pass@host:3306/db` (or `file:./db/smartbuild.db` for SQLite dev) |
| `JWT_SECRET` | Yes | Long random string for JWT signing (min 32 chars) |
| `NEXTAUTH_SECRET` | Yes | NextAuth.js session encryption secret |
| `NEXTAUTH_URL` | Yes | Full public URL: `https://app.smartbuild.io` |
| `MYSQL_ROOT_PASSWORD` | Yes (Docker) | MySQL root password |
| `MYSQL_PASSWORD` | Yes (Docker) | MySQL app user password |
| `REDIS_PASSWORD` | Recommended | Redis password (default: `changeme_redis`) |
| `REDIS_URL` | No | Defaults to `redis://redis:6379` inside Docker |
| `REALTIME_BRIDGE_URL` | No | Bridge URL: `http://realtime:3096` (Docker) or `http://127.0.0.1:3096` (PM2) |
| `CORS_ORIGIN` | No | Allowed CORS origin for Socket.IO: `https://app.smartbuild.io` |
| `DOMAIN` | Yes (Nginx) | Your domain name, replaces `${DOMAIN}` in smartbuild.conf |

Generate secrets with:
```bash
openssl rand -base64 48
```

---

## Deployment Path A — Docker Compose (Recommended)

### Prerequisites

```bash
# Ubuntu 22.04+
apt update && apt install -y docker.io docker-compose-plugin curl
systemctl enable --now docker
```

### 1. Clone the repo

```bash
git clone git@github.com:YOUR_ORG/smartbuild.git /opt/smartbuild
cd /opt/smartbuild
```

### 2. Configure environment

```bash
cp .env.example .env
nano .env   # Fill in all required values
```

### 3. Configure the domain in Nginx

Edit `infra/nginx/conf.d/smartbuild.conf` and replace every `${DOMAIN}` with your actual domain (e.g. `app.smartbuild.io`):

```bash
sed -i 's/${DOMAIN}/app.smartbuild.io/g' infra/nginx/conf.d/smartbuild.conf
```

### 4. Obtain TLS certificates (before starting Nginx on 443)

**Option A — Certbot on the host** (recommended first time):

```bash
apt install -y certbot
# Temporarily stop anything on port 80
certbot certonly --standalone -d app.smartbuild.io
# Certs land in /etc/letsencrypt/live/app.smartbuild.io/
```

Then mount `/etc/letsencrypt` from the host into the nginx container (already configured in `docker-compose.yml` as a named volume — adjust the volume definition to a bind mount if certs are on the host):

```yaml
# In infra/docker-compose.yml, change:
- letsencrypt:/etc/letsencrypt:ro
# to a bind mount:
- /etc/letsencrypt:/etc/letsencrypt:ro
```

**Option B — Certbot sidecar** (see commented `certbot` service in `docker-compose.yml`):

Uncomment the certbot service, start it first, then bring up nginx after certs exist.

**Option C — Temporary self-signed cert** (testing only):

```bash
mkdir -p /etc/letsencrypt/live/app.smartbuild.io
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/app.smartbuild.io/privkey.pem \
  -out    /etc/letsencrypt/live/app.smartbuild.io/fullchain.pem \
  -subj "/CN=app.smartbuild.io"
cp /etc/letsencrypt/live/app.smartbuild.io/fullchain.pem \
   /etc/letsencrypt/live/app.smartbuild.io/chain.pem
```

### 5. Build and start

```bash
cd /opt/smartbuild

# Build images
docker compose -f infra/docker-compose.yml build

# Start all services in background
docker compose -f infra/docker-compose.yml up -d

# Watch logs
docker compose -f infra/docker-compose.yml logs -f
```

### 6. Run database migrations (first deploy only)

```bash
docker compose -f infra/docker-compose.yml exec app \
  npx prisma migrate deploy
```

### 7. Verify health

```bash
# All containers should show healthy
docker compose -f infra/docker-compose.yml ps

# Nginx health endpoint
curl -I http://localhost/nginx-health

# App health (via Nginx)
curl -I https://app.smartbuild.io/

# Socket.IO HTTP bridge (internal check from inside the network)
docker compose -f infra/docker-compose.yml exec realtime \
  curl -sX POST http://localhost:3096/api/events \
    -H "Content-Type: application/json" \
    -d '{"room":"test","event":"ping"}'
```

### Updating the app

```bash
git pull origin main

# Rebuild app image only (zero-downtime with nginx keepalive)
docker compose -f infra/docker-compose.yml build app
docker compose -f infra/docker-compose.yml up -d --no-deps app

# If schema changed:
docker compose -f infra/docker-compose.yml exec app \
  npx prisma migrate deploy
```

### Certificate renewal

Auto-renewal cron is installed by certbot. Verify:
```bash
certbot renew --dry-run
# or with the certbot sidecar:
docker compose -f infra/docker-compose.yml exec certbot certbot renew --dry-run
```

After renewal, reload Nginx to pick up new certs:
```bash
docker compose -f infra/docker-compose.yml exec nginx nginx -s reload
```

---

## Deployment Path B — PM2 + System Nginx (bare-metal / no Docker)

Use this path when Docker is not available or you prefer direct process management.

### Prerequisites

```bash
# Node.js 20 (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20 && nvm use 20 && nvm alias default 20

# Bun (for the realtime mini-service)
curl -fsSL https://bun.sh/install | bash

# PM2
npm install -g pm2

# Nginx (with Brotli — optional)
apt install -y nginx
# For brotli support:
# apt install -y libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static
# Then add to /etc/nginx/nginx.conf:
#   load_module modules/ngx_http_brotli_filter_module.so;
#   load_module modules/ngx_http_brotli_static_module.so;

# MySQL 8
apt install -y mysql-server
mysql_secure_installation

# Redis
apt install -y redis-server
```

### 1. Clone and install

```bash
git clone git@github.com:YOUR_ORG/smartbuild.git /opt/smartbuild
cd /opt/smartbuild
npm ci
cd mini-services/whatsapp-realtime && bun install && cd ../..
```

### 2. Set environment variables

```bash
cp .env.example .env
nano .env
# Export into shell for builds:
set -a; source .env; set +a
```

### 3. Build Next.js

```bash
npx prisma generate
npm run build
# The build script copies static assets into .next/standalone automatically
```

### 4. Configure Nginx

```bash
# Copy configuration files
cp infra/nginx/nginx.conf    /etc/nginx/nginx.conf
cp infra/nginx/conf.d/smartbuild.conf /etc/nginx/conf.d/smartbuild.conf

# Replace domain placeholder
sed -i 's/${DOMAIN}/app.smartbuild.io/g' /etc/nginx/conf.d/smartbuild.conf

# Test configuration
nginx -t

# Reload
systemctl reload nginx
```

### 5. Obtain TLS certificates

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d app.smartbuild.io
# Follow prompts. Certbot modifies smartbuild.conf automatically.
```

### 6. Create log directory

```bash
mkdir -p /var/log/smartbuild
```

### 7. Start with PM2

```bash
cd /opt/smartbuild

# Start all processes with the production env profile
pm2 start infra/pm2/ecosystem.config.js --env production

# Persist across reboots
pm2 startup   # Copy and run the printed command
pm2 save
```

### 8. Check status

```bash
pm2 list
pm2 monit
pm2 logs smartbuild-app --lines 50
pm2 logs smartbuild-realtime --lines 50
```

### Updating (PM2 path)

```bash
cd /opt/smartbuild
git pull origin main
npm ci
npx prisma generate
npm run build

# Zero-downtime reload (cluster mode)
pm2 reload smartbuild-app

# Restart realtime service
pm2 restart smartbuild-realtime
```

---

## WebSocket Proxying — How It Works

Socket.IO clients connect to `wss://app.smartbuild.io/socket.io/`.

The flow through the stack:

```
Browser
  └── TLS termination at Nginx (port 443)
       └── Location /socket.io/ → upstream socketio_server (127.0.0.1:3006)
            └── Socket.IO server in mini-services/whatsapp-realtime/index.ts
```

Key Nginx configuration for WebSocket support (in `conf.d/smartbuild.conf`):

```nginx
location /socket.io/ {
    proxy_pass http://socketio_server;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout    3600s;   # Critical — long-polling hangs here
    proxy_send_timeout    3600s;
    proxy_buffering    off;
}
```

**Why `proxy_read_timeout 3600s`?**
Socket.IO uses HTTP long-polling as a fallback transport. A polling request "parks" on the server until an event arrives or the timeout fires. If Nginx times out first (default 90 s), the client gets a 504 and reconnects — wasting bandwidth and causing jitter. 3600 s (1 hour) is a safe upper bound; Socket.IO's own `pingTimeout` (5 s) and `pingInterval` (25 s) will detect dead connections before this timeout.

**Socket.IO path configuration:**
The realtime service sets `path: '/'` in its `Server` constructor. This means Socket.IO protocol messages go to `/socket.io/...` at the Nginx level (Socket.IO appends its own namespace to the configured path).

**Multi-node Socket.IO (future scaling):**
To run more than one realtime container, enable the Redis adapter:
```bash
bun add @socket.io/redis-adapter ioredis
```
Then update `index.ts` and add the extra instances to the `socketio_server` upstream block in Nginx.

---

## HTTP Bridge

The realtime service also exposes an HTTP bridge on port `3096` at `POST /api/events`.

The Next.js backend calls this endpoint to push events to connected WebSocket clients without the backend itself needing to maintain a Socket.IO connection:

```
Next.js API route
  └── POST http://realtime:3096/api/events  (Docker internal network)
       └── io.to(room).emit(event, data)
            └── Pushed to all connected clients in that room
```

Port 3096 is intentionally **not exposed** through Nginx — it is an internal service-to-service endpoint only.

---

## Assumptions and Notes

1. **Database**: `schema.prisma` currently uses `provider = "sqlite"`. The Docker Compose file provisions MySQL for production. To switch, update the datasource provider and run `prisma migrate dev --name init` on the new database. The `DATABASE_URL` env var controls which database is used at runtime.

2. **File uploads**: The `upload/` directory in the repo root is used for local uploads. In Docker, this is mounted as a named volume `uploads-data`. For production with multiple app instances, use S3/MinIO and update the `/uploads/`, `/media/`, `/files/` location blocks in `smartbuild.conf`.

3. **Brotli**: The `fholzer/nginx-brotli` Docker image provides Nginx with the brotli module pre-compiled. On bare-metal Ubuntu, install `libnginx-mod-http-brotli-*` packages and add the `load_module` directives. The brotli directives in `smartbuild.conf` are commented out until you confirm the module is available.

4. **HTTP/2**: Enabled via `http2 on` in the server block (Nginx 1.25.1+ syntax). For older Nginx, replace with `listen 443 ssl http2;`.

5. **PM2 cluster mode**: Only the Next.js app runs in cluster mode. The realtime service must run in fork mode (single process) to avoid split-brain with Socket.IO rooms — unless you add the Redis adapter.

6. **CORS for Socket.IO**: The realtime service currently sets `origin: '*'`. In production, set `CORS_ORIGIN` env var and update `index.ts` to use it. The Content-Security-Policy header in Nginx also includes `wss://${DOMAIN}` in `connect-src`.

7. **Rate limiting**: Zones are defined in `nginx.conf` and applied in `smartbuild.conf`. Burst values are intentional — `nodelay` means burst requests are served immediately without queuing, but excess beyond burst returns 429.

8. **This infrastructure does NOT work on shared hosting.** Shared hosting environments (Hostinger Web Hosting, cPanel servers) do not allow: binding to ports 80/443, running Docker, managing system Nginx configuration, or keeping long-lived Node.js processes running. You need a VPS (e.g. Hostinger KVM VPS, DigitalOcean Droplet, Hetzner Cloud) or a dedicated server.
