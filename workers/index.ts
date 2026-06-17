/**
 * SmartBuild Worker Process — Entry Point
 *
 * Bootstraps all BullMQ workers and wires up graceful shutdown.
 *
 * Start:
 *   node --require tsx/cjs workers/index.ts
 *   # or via workers/package.json start script:
 *   npm start   (inside workers/)
 *
 * Required env vars:
 *   REDIS_URL       — e.g. redis://localhost:6379 or redis://:password@host:6379
 *   DATABASE_URL    — Prisma connection string (sqlite:// / mysql:// / postgresql://)
 */

import Redis from 'ioredis'
import type { ManagedWorker } from './lib/worker-factory'

import { startNotificationWorker } from './jobs/notification.worker'
import { startWhatsAppWorker }     from './jobs/whatsapp.worker'
import { startEmailWorker }        from './jobs/email.worker'
import { startReportWorker }       from './jobs/report.worker'
import { startQrWorker }           from './jobs/qr.worker'
import { startPdfWorker }          from './jobs/pdf.worker'

// ---------------------------------------------------------------------------
// Validate env vars early
// ---------------------------------------------------------------------------

const REDIS_URL = process.env.REDIS_URL
if (!REDIS_URL) {
  console.error('[workers] REDIS_URL is not set. Exiting.')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.warn('[workers] DATABASE_URL is not set — Prisma workers will fail on DB access.')
}

// ---------------------------------------------------------------------------
// Shared ioredis connection
//
// BullMQ requires `maxRetriesPerRequest: null` on the connection used by
// workers (as opposed to the queue-side connection which can use defaults).
// ---------------------------------------------------------------------------

const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy: (times) => Math.min(times * 200, 5_000), // back off up to 5 s
})

redisConnection.on('connect',     () => console.log('[workers] Redis connected'))
redisConnection.on('ready',       () => console.log('[workers] Redis ready'))
redisConnection.on('reconnecting',() => console.log('[workers] Redis reconnecting…'))
redisConnection.on('error',  (err) => console.error('[workers] Redis error:', err.message))

// ---------------------------------------------------------------------------
// Start all workers
// ---------------------------------------------------------------------------

const managedWorkers: ManagedWorker[] = []

function startAllWorkers(): void {
  console.log('[workers] Starting all workers…')

  managedWorkers.push(startNotificationWorker(redisConnection))
  managedWorkers.push(startWhatsAppWorker(redisConnection))
  managedWorkers.push(startEmailWorker(redisConnection))
  managedWorkers.push(startReportWorker(redisConnection))
  managedWorkers.push(startQrWorker(redisConnection))
  managedWorkers.push(startPdfWorker(redisConnection))

  console.log(`[workers] ${managedWorkers.length} workers started`)
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

let shuttingDown = false

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`[workers] Received ${signal} — initiating graceful shutdown…`)

  // Give in-flight jobs up to 30 s to complete
  const SHUTDOWN_TIMEOUT_MS = 30_000
  const timer = setTimeout(() => {
    console.error('[workers] Shutdown timeout exceeded — forcing exit')
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)

  try {
    // Close all workers in parallel (each waits for active jobs to drain)
    await Promise.all(managedWorkers.map((w) => w.close()))
    console.log('[workers] All workers closed')

    // Disconnect from Redis
    await redisConnection.quit()
    console.log('[workers] Redis connection closed')
  } catch (err) {
    console.error('[workers] Error during shutdown:', err)
  } finally {
    clearTimeout(timer)
    process.exit(0)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

process.on('uncaughtException', (err) => {
  console.error('[workers] Uncaught exception:', err)
  shutdown('uncaughtException')
})

process.on('unhandledRejection', (reason) => {
  console.error('[workers] Unhandled rejection:', reason)
  // Do not exit — BullMQ handles job-level errors internally
})

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

startAllWorkers()

console.log('[workers] SmartBuild worker process running. Press Ctrl+C to stop.')
