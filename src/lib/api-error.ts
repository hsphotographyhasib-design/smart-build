/**
 * SmartBuild — centralised API error handling
 *
 * Exports:
 *   ApiError            — typed error class with HTTP status + machine code
 *   handleApiError      — converts any thrown value → structured NextResponse
 *   withErrorHandling   — route-handler wrapper; logs + never leaks stack traces
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger, logRequest, type LogContext } from '@/lib/logger'

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'RATE_LIMITED'
  | 'INTERNAL'
  | 'SERVICE_UNAVAILABLE'

const CODE_TO_STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST:         400,
  UNAUTHORIZED:        401,
  FORBIDDEN:           403,
  NOT_FOUND:           404,
  CONFLICT:            409,
  UNPROCESSABLE:       422,
  RATE_LIMITED:        429,
  INTERNAL:            500,
  SERVICE_UNAVAILABLE: 503,
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly code: ApiErrorCode

  constructor(message: string, code: ApiErrorCode = 'INTERNAL') {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = CODE_TO_STATUS[code]
  }
}

// ---------------------------------------------------------------------------
// handleApiError
// ---------------------------------------------------------------------------

/**
 * Converts any caught value into a structured JSON error response.
 * Stack traces are stripped in production.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code:   error.code,
      },
      { status: error.statusCode }
    )
  }

  // Prisma not-found errors map to 404
  if (
    error instanceof Error &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  ) {
    return NextResponse.json(
      { success: false, error: 'Resource not found', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  // Prisma unique constraint violation → 409
  if (
    error instanceof Error &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  ) {
    return NextResponse.json(
      { success: false, error: 'Resource already exists', code: 'CONFLICT' },
      { status: 409 }
    )
  }

  // Generic / unknown — never leak stack traces in production
  const isDev = process.env.NODE_ENV !== 'production'
  const message = isDev && error instanceof Error ? error.message : 'Internal server error'

  return NextResponse.json(
    { success: false, error: message, code: 'INTERNAL' },
    { status: 500 }
  )
}

// ---------------------------------------------------------------------------
// withErrorHandling
// ---------------------------------------------------------------------------

type RouteHandler = (
  request: NextRequest,
  context?: Record<string, unknown>
) => Promise<NextResponse>

/**
 * Wraps a route handler with:
 *  - automatic try/catch → handleApiError
 *  - structured request logging via logger (method, route, latency, status)
 *
 * Usage:
 *   export const GET = withErrorHandling(async (request) => {
 *     // your handler — throw ApiError or any Error; it will be caught
 *     return NextResponse.json({ success: true, data })
 *   })
 *
 * You can also pass an optional logContext for extra fields (e.g. route name):
 *   export const GET = withErrorHandling(handler, { route: '/api/invoices' })
 */
export function withErrorHandling(
  handler: RouteHandler,
  baseContext: LogContext = {}
): RouteHandler {
  return async (request: NextRequest, context?: Record<string, unknown>) => {
    const start = Date.now()
    const method = request.method
    const route = baseContext.route ?? new URL(request.url).pathname
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      undefined

    let response: NextResponse

    try {
      response = await handler(request, context)
    } catch (err) {
      response = handleApiError(err)

      // Log errors with full context
      const statusCode = response.status
      logger.error('Unhandled route error', {
        method,
        route,
        ip,
        statusCode,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
        // Only include stack in development
        ...(process.env.NODE_ENV !== 'production' && err instanceof Error
          ? { stack: err.stack }
          : {}),
        ...baseContext,
      })

      return response
    }

    logRequest({
      method,
      route,
      ip,
      statusCode: response.status,
      latencyMs: Date.now() - start,
      ...baseContext,
    })

    return response
  }
}
