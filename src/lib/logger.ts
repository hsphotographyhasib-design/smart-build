/**
 * SmartBuild — structured JSON logger
 *
 * Zero external dependencies: all output goes through the console so it works
 * in both Node.js (server) and Edge runtimes.  Each log line is a single JSON
 * object, making it easy to ingest with Loki / CloudWatch / any log aggregator.
 *
 * Optional upgrade: replace the console calls with pino (see OBSERVABILITY.md).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** Fields that can be attached to any log entry */
export interface LogContext {
  method?: string
  route?: string
  userId?: string
  ip?: string
  latencyMs?: number
  statusCode?: number
  requestId?: string
  [key: string]: unknown
}

interface LogEntry extends LogContext {
  level: LogLevel
  timestamp: string
  message: string
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function resolveMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL as LogLevel | undefined
  if (env && env in LEVEL_ORDER) return env
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

const MIN_LEVEL = resolveMinLevel()

function emit(level: LogLevel, message: string, context?: LogContext) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return

  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...context,
  }

  const line = JSON.stringify(entry)

  switch (level) {
    case 'debug':
      console.debug(line)
      break
    case 'info':
      console.info(line)
      break
    case 'warn':
      console.warn(line)
      break
    case 'error':
      console.error(line)
      break
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const logger = {
  debug: (message: string, context?: LogContext) => emit('debug', message, context),
  info:  (message: string, context?: LogContext) => emit('info',  message, context),
  warn:  (message: string, context?: LogContext) => emit('warn',  message, context),
  error: (message: string, context?: LogContext) => emit('error', message, context),
}

/**
 * logRequest — convenience helper for logging completed HTTP requests.
 *
 * Usage (inside a route handler, after you have the response):
 *
 *   const start = Date.now()
 *   // ... build response ...
 *   logRequest({
 *     method:     request.method,
 *     route:      '/api/invoices',
 *     statusCode: 200,
 *     latencyMs:  Date.now() - start,
 *     userId:     user?.id,
 *     ip:         request.headers.get('x-forwarded-for') ?? undefined,
 *   })
 */
export function logRequest(context: LogContext & { statusCode?: number }) {
  const level: LogLevel =
    (context.statusCode ?? 200) >= 500
      ? 'error'
      : (context.statusCode ?? 200) >= 400
      ? 'warn'
      : 'info'

  emit(level, 'request', context)
}
