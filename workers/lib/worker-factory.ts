/**
 * Worker Factory
 *
 * Creates a BullMQ Worker with:
 *   - Configurable concurrency
 *   - Structured console logging (prefix: [worker:<queue>])
 *   - Per-job attempt logging (start / success / failure)
 *   - Dead-Letter-Queue pattern: when a job exhausts all retries the factory
 *     pushes it to a `<queueName>:dead` queue so it can be inspected /
 *     replayed manually without being discarded.
 *   - Graceful-shutdown helper that workers/index.ts calls on SIGTERM/SIGINT
 */

import { Worker, Queue, type Processor, type ConnectionOptions, type WorkerOptions } from 'bullmq'
import type Redis from 'ioredis'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkerFactoryOptions<T = unknown> {
  /** BullMQ queue name to consume from */
  queueName: string
  /** Job processor function */
  processor: Processor<T>
  /** Number of concurrent jobs (default: 2) */
  concurrency?: number
  /**
   * Shared ioredis connection created in workers/index.ts.
   * Passed through as the BullMQ ConnectionOptions for the Worker AND the
   * DLQ Queue (BullMQ accepts an ioredis instance directly).
   */
  connection: Redis
}

export interface ManagedWorker {
  worker: Worker
  dlqQueue: Queue
  /** Call this during graceful shutdown */
  close(): Promise<void>
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

function makeLogger(queueName: string) {
  const prefix = `[worker:${queueName}]`
  return {
    info:  (...args: unknown[]) => console.log (prefix, ...args),
    warn:  (...args: unknown[]) => console.warn (prefix, ...args),
    error: (...args: unknown[]) => console.error(prefix, ...args),
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createWorker<T = unknown>(
  opts: WorkerFactoryOptions<T>,
): ManagedWorker {
  const {
    queueName,
    processor,
    concurrency = 2,
    connection,
  } = opts

  const log = makeLogger(queueName)
  const dlqName = `${queueName}:dead`

  // The DLQ is a plain BullMQ queue — we only add jobs to it; nothing
  // consumes it automatically (operators replay/discard manually).
  const dlqQueue = new Queue(dlqName, {
    connection: connection as unknown as ConnectionOptions,
    defaultJobOptions: {
      removeOnComplete: false,
      removeOnFail: false,
    },
  })

  const workerOptions: WorkerOptions = {
    connection: connection as unknown as ConnectionOptions,
    concurrency,
    // Let BullMQ handle locking/heartbeat defaults
  }

  const worker = new Worker<T>(
    queueName,
    async (job) => {
      log.info(`[job:${job.id}] "${job.name}" attempt ${job.attemptsMade + 1} — start`, {
        id: job.id,
        name: job.name,
        attempt: job.attemptsMade + 1,
      })

      try {
        const result = await processor(job, job.token as string | undefined)
        log.info(`[job:${job.id}] "${job.name}" — completed`)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        log.warn(`[job:${job.id}] "${job.name}" attempt ${job.attemptsMade + 1} failed: ${message}`)
        // Re-throw so BullMQ marks the job as failed and retries per its opts
        throw err
      }
    },
    workerOptions,
  )

  // -------------------------------------------------------------------
  // Event: stalled — BullMQ detected the job is stalled (worker locked too long)
  // -------------------------------------------------------------------
  worker.on('stalled', (jobId) => {
    log.warn(`[job:${jobId}] stalled — will be retried`)
  })

  // -------------------------------------------------------------------
  // Event: failed — job has exhausted all retries → push to DLQ
  // -------------------------------------------------------------------
  worker.on('failed', async (job, err) => {
    if (!job) return

    // BullMQ's 'failed' event fires for every failed attempt (not just the
    // last). Only push to the DLQ once the job has exhausted all attempts,
    // i.e. attemptsMade has reached the configured maximum.
    const maxAttempts = job.opts.attempts ?? 1
    const isExhausted = (job.attemptsMade ?? 0) >= maxAttempts

    if (!isExhausted) {
      // Still has retries remaining — not yet dead
      return
    }

    log.error(
      `[job:${job.id}] "${job.name}" exhausted all attempts — moving to DLQ "${dlqName}"`,
      { error: err.message },
    )

    try {
      await dlqQueue.add(
        `${job.name}:dead`,
        {
          originalJobId: job.id,
          originalQueue: queueName,
          originalData: job.data,
          failedAt: new Date().toISOString(),
          lastError: err.message,
          attemptsMade: job.attemptsMade,
        },
        {
          // Never remove DLQ entries automatically
          removeOnComplete: false,
          removeOnFail: false,
        },
      )
    } catch (dlqErr) {
      log.error(`[job:${job.id}] Failed to push to DLQ:`, dlqErr)
    }
  })

  // -------------------------------------------------------------------
  // Event: error — unhandled worker error (not a job failure)
  // -------------------------------------------------------------------
  worker.on('error', (err) => {
    log.error('Worker error:', err)
  })

  // -------------------------------------------------------------------
  // Graceful close
  // -------------------------------------------------------------------
  async function close(): Promise<void> {
    log.info('Closing worker and DLQ queue connection…')
    await worker.close()
    await dlqQueue.close()
    log.info('Worker closed.')
  }

  log.info(`Worker started (concurrency: ${concurrency})`)

  return { worker, dlqQueue, close }
}
