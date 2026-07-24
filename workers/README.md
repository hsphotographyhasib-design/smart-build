# SmartBuild Workers

BullMQ + Redis background-job workers for SmartBuild ERP.
These run as a **separate long-running process** alongside the Next.js app —
they are NOT part of the Next.js build and are never deployed to shared hosting.
Target environment: VPS / Docker.

---

## Architecture overview

```
Next.js API routes
  └─ src/lib/queue.ts (enqueue helper)
        └─ BullMQ Queue → Redis
                            └─ Workers process (this directory)
                                 ├─ notification.worker.ts
                                 ├─ whatsapp.worker.ts
                                 ├─ email.worker.ts
                                 ├─ report.worker.ts
                                 ├─ qr.worker.ts
                                 └─ pdf.worker.ts
```

---

## Queues

| Queue name      | Purpose                                              | Concurrency |
|-----------------|------------------------------------------------------|-------------|
| `notifications` | Write Notification rows + real-time socket push      | 5           |
| `whatsapp`      | Send messages via OpenWA REST API                    | 3           |
| `email`         | Send transactional email (SMTP / Resend / SendGrid)  | 4           |
| `reports`       | Generate xlsx/csv/pdf reports from DB data           | 2           |
| `qr`            | Generate QR code images (PNG/SVG)                    | 4           |
| `pdf`           | Render HTML/URL to PDF via Puppeteer                 | 2           |

### Dead-Letter Queues

Each queue has a companion `<name>:dead` DLQ.  
When a job exhausts all retry attempts the worker-factory pushes a copy of
the job (with `originalData`, `failedAt`, `lastError`) to the DLQ for manual
inspection and replay.

---

## Retry behaviour

Default job options (set in `src/lib/queue.ts`, overridable per-enqueue call):

| Option              | Value                              |
|---------------------|------------------------------------|
| `attempts`          | 3                                  |
| `backoff.type`      | `exponential`                      |
| `backoff.delay`     | 5 000 ms (5 s → 10 s → 20 s …)    |
| `removeOnComplete`  | age 24 h, keep last 500            |
| `removeOnFail`      | `false` (keep for DLQ inspection)  |

---

## Environment variables

| Variable                        | Required | Default                      | Description                                      |
|---------------------------------|----------|------------------------------|--------------------------------------------------|
| `REDIS_URL`                     | Yes      | —                            | `redis://[:[password]@]host:6379[/db]`           |
| `DATABASE_URL`                  | Yes      | —                            | Prisma connection string                         |
| `OPENWA_URL`                    | No       | `http://localhost:2785`      | OpenWA REST API base URL                         |
| `OPENWA_API_KEY`                | No       | `dev-admin-key`              | OpenWA API key header value                      |
| `MAINTENANCE_NOTIFY_BRIDGE_URL` | No       | `http://localhost:3095`      | HTTP bridge URL for maintenance-notify service   |
| `WHATSAPP_REALTIME_BRIDGE_URL`  | No       | `http://localhost:3096`      | HTTP bridge URL for whatsapp-realtime service    |
| `DEFAULT_FROM_EMAIL`            | No       | `noreply@smartbuild.app`     | From address for outgoing email                  |
| `SMTP_HOST`                     | No       | —                            | SMTP server hostname (email worker)              |
| `SMTP_PORT`                     | No       | `587`                        | SMTP port                                        |
| `SMTP_SECURE`                   | No       | `false`                      | Use TLS (`true`/`false`)                         |
| `SMTP_USER`                     | No       | —                            | SMTP auth username                               |
| `SMTP_PASS`                     | No       | —                            | SMTP auth password                               |
| `RESEND_API_KEY`                | No       | —                            | Resend API key (alternative to SMTP)             |
| `QR_OUTPUT_DIR`                 | No       | `/tmp/smartbuild/qr`         | Directory for generated QR code files            |
| `PDF_OUTPUT_DIR`                | No       | `/tmp/smartbuild/pdf`        | Directory for generated PDF files                |
| `REPORTS_OUTPUT_DIR`            | No       | `/tmp/smartbuild/reports`    | Directory for generated report files             |

---

## Running

### Development (hot-reload)

From the **repo root** (not inside `workers/`):

```bash
# Install deps first (from repo root)
npm install bullmq ioredis

# Then run workers
npx tsx workers/index.ts
# or with hot reload:
npx tsx watch workers/index.ts
```

### Production — PM2

```bash
# ecosystem.config.cjs in repo root (example)
module.exports = {
  apps: [
    {
      name: 'smartbuild-workers',
      script: 'workers/index.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        REDIS_URL: 'redis://localhost:6379',
        DATABASE_URL: 'file:./db/smartbuild.db',
      },
    },
  ],
}

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Production — Docker

```dockerfile
# Dockerfile.workers
FROM node:20-alpine
WORKDIR /app

# Copy the whole repo (workers/ + src/lib/ + prisma/)
COPY . .
RUN npm ci --omit=dev
RUN npx prisma generate

CMD ["node", "--import", "tsx/esm", "workers/index.ts"]
```

```yaml
# docker-compose snippet
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped

  workers:
    build:
      context: .
      dockerfile: Dockerfile.workers
    restart: unless-stopped
    depends_on: [redis]
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: file:/app/db/smartbuild.db
      OPENWA_URL: http://openwa:2785
      MAINTENANCE_NOTIFY_BRIDGE_URL: http://maintenance-notify:3095
      WHATSAPP_REALTIME_BRIDGE_URL: http://whatsapp-realtime:3096
```

---

## Enqueueing from API routes

```typescript
// In any Next.js API route:
import { enqueue } from '@/lib/queue'

// Send an in-app notification
await enqueue('notifications', 'ticket-assigned', {
  userId: technician.id,
  type: 'ticket_assigned',
  title: 'New ticket assigned',
  message: `Ticket #${ticket.id} has been assigned to you.`,
  data: { ticketId: ticket.id },
})

// Send a WhatsApp message
await enqueue('whatsapp', 'send-invoice-link', {
  sessionId: 'default',
  chatId: `${client.phone}@c.us`,
  text: `Your invoice ${invoice.number} is ready: ${invoiceUrl}`,
  referenceId: invoice.id,
})

// Generate a report
await enqueue('reports', 'monthly-project-summary', {
  reportType: 'project-summary',
  format: 'xlsx',
  requestedByUserId: user.id,
  dateFrom: startOfMonth.toISOString(),
  dateTo: endOfMonth.toISOString(),
})
```

`enqueue()` returns `null` (instead of throwing) when Redis is unavailable,
so API routes continue to work even if the worker process is down.

---

## BullMQ Dashboard (optional)

Install [bull-board](https://github.com/felixmosh/bull-board) or
[Arena](https://github.com/bee-queue/arena) to get a UI for inspecting queues,
retrying failed jobs, and replaying DLQ entries.
