/**
 * SmartBuild Queue Helper
 *
 * Thin enqueue helper for API routes. Creates named BullMQ queues backed by
 * a lazy ioredis connection. Safe to import in serverless/edge routes — the
 * Redis connection is only attempted when `enqueue()` is first called, and
 * errors are caught so a missing Redis instance never crashes the Next.js
 * process on boot.
 *
 * Usage (inside a Next.js API route):
 *   import { enqueue } from '@/lib/queue'
 *   await enqueue('notifications', 'send-notification', { userId, type, title, message })
 */

import type { ConnectionOptions, JobsOptions, Queue as BullQueue } from 'bullmq'

// ---------------------------------------------------------------------------
// Job-data interfaces — one per named queue
// ---------------------------------------------------------------------------

export interface NotificationJobData {
  userId: string
  type: string
  title: string
  message: string
  /** Optional JSON-serialisable metadata that gets stored in Notification.data */
  data?: Record<string, unknown>
}

export interface WhatsAppJobData {
  /** OpenWA session ID to send from */
  sessionId: string
  /** WhatsApp chatId, e.g. "601234567890@c.us" */
  chatId: string
  /** Text body; mutually exclusive with mediaUrl */
  text?: string
  /** Remote URL of media to send */
  mediaUrl?: string
  /** 'image' | 'video' | 'document' | 'audio' */
  mediaType?: string
  /** MIME type, required when sending media */
  mimetype?: string
  caption?: string
  filename?: string
  /** Internal reference — conversation or ticket ID */
  referenceId?: string
}

export interface EmailJobData {
  to: string | string[]
  subject: string
  /** Plain-text body (used as fallback) */
  text?: string
  /** HTML body */
  html?: string
  /** Handlebars/Nunjucks template name (resolved by the worker) */
  template?: string
  templateVars?: Record<string, unknown>
  /** Sender override; defaults to DEFAULT_FROM_EMAIL env var */
  from?: string
  attachments?: Array<{
    filename: string
    /** URL or absolute FS path */
    path: string
    contentType?: string
  }>
}

export interface ReportJobData {
  reportType:
    | 'project-summary'
    | 'financial'
    | 'maintenance'
    | 'sla'
    | 'labour'
    | 'invoice'
    | 'custom'
  /** Primary entity to report on (project, client, etc.) */
  entityId?: string
  dateFrom?: string // ISO 8601
  dateTo?: string   // ISO 8601
  /** Requested output format */
  format: 'pdf' | 'xlsx' | 'csv'
  /** User who requested the report — result will be emailed/notified to them */
  requestedByUserId: string
  filters?: Record<string, unknown>
}

export interface QrJobData {
  /** Arbitrary content to encode in the QR code */
  content: string
  /** Pixel size of the output image */
  size?: number
  /** Output format */
  format?: 'png' | 'svg'
  /** Entity this QR code is for (e.g. assetId, ticketId) */
  entityType?: string
  entityId?: string
  /** User to notify when the QR code is ready */
  requestedByUserId?: string
}

export interface PdfJobData {
  /** HTML string to render, or a URL to load in headless Chromium */
  html?: string
  url?: string
  /** Options forwarded to Puppeteer/Playwright page.pdf() */
  pdfOptions?: {
    format?: string
    landscape?: boolean
    margin?: { top?: string; right?: string; bottom?: string; left?: string }
  }
  /** Entity this PDF belongs to */
  entityType?: string
  entityId?: string
  /** User to notify when done */
  requestedByUserId?: string
  /** Filename (without extension) for the generated PDF */
  filename?: string
}

// Union map used by the generic enqueue helper
export interface QueueJobDataMap {
  notifications: NotificationJobData
  whatsapp: WhatsAppJobData
  email: EmailJobData
  reports: ReportJobData
  qr: QrJobData
  pdf: PdfJobData
}

export type QueueName = keyof QueueJobDataMap

// ---------------------------------------------------------------------------
// Default job options
// ---------------------------------------------------------------------------

const DEFAULT_JOB_OPTS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5_000, // 5 s, 10 s, 20 s …
  },
  removeOnComplete: {
    age: 60 * 60 * 24, // keep completed jobs for 24 h
    count: 500,        // keep at most 500 completed
  },
  removeOnFail: false,  // keep failed jobs for DLQ inspection
}

// ---------------------------------------------------------------------------
// Lazy Redis connection
// ---------------------------------------------------------------------------

let _connection: InstanceType<typeof import('ioredis').default> | null = null
let _connectionError: Error | null = null

function getConnection(): InstanceType<typeof import('ioredis').default> {
  if (_connectionError) throw _connectionError
  if (_connection) return _connection

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    _connectionError = new Error(
      '[queue] REDIS_URL is not set — background jobs are disabled',
    )
    throw _connectionError
  }

  // Dynamic import guard: only attempt when actually called (not at module
  // evaluation time), so edge/serverless cold starts never fail.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Redis = require('ioredis') as typeof import('ioredis').default

  _connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
  })

  _connection.on('error', (err: Error) => {
    console.error('[queue] Redis connection error:', err.message)
  })

  return _connection
}

// ---------------------------------------------------------------------------
// Named queues — lazily instantiated, one per queue name
// ---------------------------------------------------------------------------

const _queues = new Map<QueueName, BullQueue>()

function getQueue<N extends QueueName>(name: N): BullQueue<QueueJobDataMap[N]> {
  if (_queues.has(name)) return _queues.get(name) as BullQueue<QueueJobDataMap[N]>

  // Dynamic import guard same as above
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Queue } = require('bullmq') as typeof import('bullmq')

  const connectionOpts: ConnectionOptions = getConnection() as unknown as ConnectionOptions

  const q = new Queue<QueueJobDataMap[N]>(name, {
    connection: connectionOpts,
    defaultJobOptions: DEFAULT_JOB_OPTS,
  })

  _queues.set(name, q as unknown as BullQueue)
  return q
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Enqueue a background job.
 *
 * @param queueName - Target queue (one of the named queues above)
 * @param jobName   - Descriptive job-name string (used in BullMQ UI / logs)
 * @param data      - Typed job payload
 * @param opts      - Optional BullMQ JobsOptions overrides
 *
 * Returns the created Job, or null if Redis is unavailable (logs a warning).
 */
export async function enqueue<N extends QueueName>(
  queueName: N,
  jobName: string,
  data: QueueJobDataMap[N],
  opts?: JobsOptions,
): Promise<import('bullmq').Job<QueueJobDataMap[N]> | null> {
  try {
    const q = getQueue(queueName)
    const job = await q.add(jobName as never, data as never, { ...DEFAULT_JOB_OPTS, ...opts })
    return job
  } catch (err) {
    // Redis unavailable — degrade gracefully so the API route itself does not
    // fail. Log and return null; callers can check the return value if they
    // need strict delivery guarantees.
    console.warn(
      `[queue] Failed to enqueue job "${jobName}" on "${queueName}":`,
      err instanceof Error ? err.message : err,
    )
    return null
  }
}

/**
 * Gracefully close all open queue connections.
 * Call this during process shutdown in long-running processes that import
 * this module (e.g. if used outside of Next.js serverless context).
 */
export async function closeQueues(): Promise<void> {
  await Promise.all([..._queues.values()].map((q) => q.close()))
  _queues.clear()
  if (_connection) {
    await _connection.quit()
    _connection = null
  }
}
