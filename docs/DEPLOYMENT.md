# SmartBuild ERP - Deployment Guide

## Prerequisites

| Requirement | Minimum Version | Recommended |
|-------------|----------------|-------------|
| [Bun](https://bun.sh/) | 1.0+ | Latest stable |
| Node.js (alternative) | 18+ | 20 LTS |
| Git | 2.30+ | Latest |
| [Caddy](https://caddyserver.com/) (optional, for production TLS) | 2.0+ | Latest |

> **Note:** Bun is the primary runtime. The project uses `bun.lock` for dependency resolution.

---

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url> smartbuild-erp
cd smartbuild-erp
bun install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database (SQLite - file-based, no external DB server needed)
DATABASE_URL="file:./db/dev.db"

# Application
NODE_ENV="development"
PORT=3000
```

For production:

```bash
DATABASE_URL="file:./db/prod.db"
NODE_ENV="production"
PORT=3000
```

### 3. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | SQLite connection string. Use `file:./path/to/db.sqlite` |
| `NODE_ENV` | No | `development` | Set to `production` for optimized builds |
| `PORT` | No | `3000` | Port for the standalone server |

---

## Database Setup

### Generate Prisma Client

```bash
bun run db:generate
```

### Push Schema to Database

This creates/updates the database tables based on `prisma/schema.prisma`:

```bash
bun run db:push
```

### Seed the Database

The seed script creates initial demo data including users, projects, and sample records:

```bash
bun run seed
```

To seed collaboration data (RFIs, discussions, announcements):

```bash
bun run seed:collab
```

### Migration (Alternative to db:push)

For production environments with existing data, use Prisma migrations:

```bash
# Create a new migration
bun run db:migrate

# Reset database (destroys all data)
bun run db:reset
```

---

## Running in Development

```bash
bun run dev
```

This starts the Next.js dev server on `http://localhost:3000` with:
- Hot module replacement (HMR)
- Prisma query logging enabled
- Source maps

### Default Login Credentials

After running the seed script, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@smartbuild.com | admin123 |
| Admin | (see seed data) | (see seed data) |
| Supervisor | (see seed data) | (see seed data) |

Check `src/lib/seed.ts` for all seeded user credentials.

---

## Building for Production

### 1. Build the Application

```bash
bun run build
```

This produces a standalone output in `.next/standalone/` with:
- Self-contained server (`server.js`)
- All necessary Node.js modules bundled
- Static assets copied into `.next/standalone/.next/static/`
- Public directory copied into `.next/standalone/public/`

### 2. Run the Production Server

```bash
bun run start
```

This executes `.next/standalone/server.js` on port 3000. Logs are written to both stdout and `server.log`.

### 3. Using Caddy as Reverse Proxy (Optional)

A `Caddyfile` is provided in the project root:

```
:81 {
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Real-IP {remote_host}
    }
}
```

To run with Caddy (provides automatic HTTPS if you use a domain):

```bash
# Start the app server
bun run start &

# Start Caddy
caddy run
```

For custom domains, modify the `Caddyfile`:

```
erp.yourcompany.com {
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Real-IP {remote_host}
    }
}
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Run `bun run db:push` or `bun run db:migrate` against the production database
- [ ] Run `bun run seed` for initial data (optional)
- [ ] Run `bun run build`
- [ ] Set up a process manager (systemd, PM2) to keep the server running
- [ ] Configure a reverse proxy (Caddy, Nginx) for TLS termination
- [ ] Set up backups for the SQLite database file
- [ ] Configure log rotation for `server.log`

### Systemd Service Example

```ini
# /etc/systemd/system/smartbuild-erp.service
[Unit]
Description=SmartBuild ERP
After=network.target

[Service]
Type=simple
User=smartbuild
WorkingDirectory=/opt/smartbuild-erp
ExecStart=/home/smartbuild/.bun/bin/bun run .next/standalone/server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=DATABASE_URL=file:./db/prod.db

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable smartbuild-erp
sudo systemctl start smartbuild-erp
```

---

## Database Backup

Since SQLite is file-based, backup is simply copying the database file:

```bash
# Simple backup
cp db/prod.db backups/prod-$(date +%Y%m%d-%H%M%S).db

# Automated backup with compression
sqlite3 db/prod.db ".backup /tmp/backup.db"
gzip /tmp/backup.db
mv /tmp/backup.db.gz backups/prod-$(date +%Y%m%d).db.gz
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Use a different port
PORT=3001 bun run start
```

### Database Errors

```bash
# Regenerate Prisma client
bun run db:generate

# Re-push schema
bun run db:push

# Reset everything (WARNING: destroys data)
bun run db:reset
```

### Permission Errors

Ensure the database file and directory are writable by the server process:

```bash
chmod 755 db/
chmod 644 db/prod.db
```

### Build Fails

The project has `ignoreBuildErrors: true` in `next.config.ts`, but if issues persist:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
bun install

# Rebuild
bun run build
```