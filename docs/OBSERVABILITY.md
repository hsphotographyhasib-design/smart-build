# SmartBuild — Observability Guide

## Health endpoints

| Endpoint | Purpose | Expected status |
|---|---|---|
| `GET /api/health` | Liveness — process is running, no DB call | `200` always |
| `GET /api/liveness` | Minimal liveness (identical semantics, alternative path) | `200` always |
| `GET /api/ready` | Readiness — checks DB + realtime bridge | `200` ready / `503` degraded |

### `/api/ready` response shape

```jsonc
// 200 — all checks green
{
  "status": "ready",
  "checks": {
    "database":  { "status": "ok",   "latencyMs": 4  },
    "realtime":  { "status": "ok",   "latencyMs": 12 }
  }
}

// 503 — database is down (realtime degradation does NOT trigger 503)
{
  "status": "degraded",
  "checks": {
    "database":  { "status": "fail", "latencyMs": 2001, "error": "Connection refused" },
    "realtime":  { "status": "ok",   "latencyMs": 9   }
  }
}
```

Environment variable: set `REALTIME_BRIDGE_URL` to override the default `http://localhost:3096`.

---

## Structured logger (`src/lib/logger.ts`)

Zero dependencies — wraps `console.*` and emits newline-delimited JSON.

```ts
import { logger, logRequest } from '@/lib/logger'

// Basic levels
logger.info('invoice created', { userId, route: '/api/invoices', invoiceId })
logger.warn('rate limit approaching', { ip, route })
logger.error('payment failed', { error: err.message, userId })

// Request completion helper
logRequest({
  method:     request.method,
  route:      '/api/invoices',
  statusCode: 201,
  latencyMs:  Date.now() - start,
  userId:     user.id,
  ip:         request.headers.get('x-forwarded-for') ?? undefined,
})
```

Set `LOG_LEVEL=debug|info|warn|error` in `.env` (defaults to `debug` in development, `info` in production).

Sample JSON log line:

```json
{"level":"info","timestamp":"2026-06-17T08:00:00.000Z","message":"request","method":"GET","route":"/api/invoices","statusCode":200,"latencyMs":34,"userId":"usr_abc"}
```

---

## API error handling (`src/lib/api-error.ts`)

### `ApiError`

```ts
import { ApiError } from '@/lib/api-error'

throw new ApiError('Invoice not found', 'NOT_FOUND')   // → 404
throw new ApiError('Duplicate entry', 'CONFLICT')      // → 409
throw new ApiError('Token expired', 'UNAUTHORIZED')    // → 401
```

Available codes and their HTTP status mappings:

| Code | Status |
|---|---|
| `BAD_REQUEST` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `UNPROCESSABLE` | 422 |
| `RATE_LIMITED` | 429 |
| `INTERNAL` | 500 |
| `SERVICE_UNAVAILABLE` | 503 |

### `withErrorHandling` wrapper

```ts
import { withErrorHandling, ApiError } from '@/lib/api-error'

export const GET = withErrorHandling(
  async (request) => {
    const user = await verifyAuth(request)
    if (!user) throw new ApiError('Unauthorized', 'UNAUTHORIZED')

    const data = await db.invoice.findMany()
    return NextResponse.json({ success: true, data })
  },
  { route: '/api/invoices' }  // optional extra log context
)
```

The wrapper automatically:
- catches all thrown errors and converts them via `handleApiError`
- logs every request (method, route, latency, status) as structured JSON
- strips stack traces in production responses

---

## React ErrorBoundary (`src/components/common/error-boundary.tsx`)

Plain-Tailwind, no UI-lib deps.

```tsx
import { ErrorBoundary } from '@/components/common/error-boundary'

// Wrap any subtree
<ErrorBoundary>
  <InvoiceTable />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<p className="text-red-500">Failed to load</p>}>
  <Chart />
</ErrorBoundary>

// Wire Sentry
<ErrorBoundary onError={(err, info) => Sentry.captureException(err, { extra: info })}>
  <App />
</ErrorBoundary>
```

---

## Recommended future integrations

### Prometheus + Grafana

```
npm install prom-client
```

Create `src/lib/metrics.ts` with a `Counter`/`Histogram` for request count and latency, then expose them via `GET /api/metrics` (guard behind an internal network or bearer token). Point Grafana at the Prometheus scrape target.

### Sentry

```
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Wire the DSN via `NEXT_PUBLIC_SENTRY_DSN`. Then pass the `onError` prop to `<ErrorBoundary>`:

```ts
onError={(err) => Sentry.captureException(err)}
```

In server-side handlers, add `Sentry.captureException(err)` inside `withErrorHandling` before calling `handleApiError`.

### OpenTelemetry

```
npm install @vercel/otel @opentelemetry/sdk-trace-node
```

Add `instrumentation.ts` at the project root and configure an OTLP exporter pointing at your collector (e.g. Grafana Tempo, Jaeger, Honeycomb). The `withErrorHandling` wrapper is the right place to call `span.recordException(err)`.

### Structured logging upgrade (optional)

Replace the console-based logger with **pino** for higher throughput and native JSON serialisers:

```
npm install pino pino-pretty
npm install -D @types/pino
```

Drop-in: replace the `emit` function body in `src/lib/logger.ts` with `pino({ level: MIN_LEVEL }).child({})`. The public `logger` API surface stays the same, so no callers need changing.

Alternatively use **winston** if you need multiple transport targets (file + console + HTTP):

```
npm install winston
```

---

## New dependencies (recommended, not installed)

| Package | Purpose |
|---|---|
| `pino` + `pino-pretty` | High-performance structured logger (replaces console logger) |
| `@sentry/nextjs` | Error tracking & session replay |
| `prom-client` | Prometheus metrics exposition |
| `@vercel/otel` | OpenTelemetry integration for Vercel / Next.js |
| `@opentelemetry/sdk-trace-node` | Distributed tracing |
