import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number
  resetTime: number
  blockUntil?: number
}

export interface RateLimitConfig {
  maxRequests: number       // max requests allowed in the window
  windowMs: number          // time window in milliseconds
  blockDurationMs?: number  // how long to block after exceeding (defaults to windowMs)
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number       // only present when the request is blocked
}

// ---------------------------------------------------------------------------
// RateLimiter – in-memory sliding-window rate limiter
// For production deployments with multiple server instances, replace the Map
// store with a Redis-backed implementation.
// ---------------------------------------------------------------------------

class RateLimiter {
  private store: Map<string, RateLimitEntry>

  constructor() {
    this.store = new Map()

    // Periodically clean up expired entries every 60 s
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60_000)
    }
  }

  /**
   * Check whether a request identified by `key` should be allowed.
   */
  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const blockDuration = config.blockDurationMs ?? config.windowMs

    const entry = this.store.get(key)

    // No existing entry – first request in the window
    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      })

      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      }
    }

    // Currently blocked
    if (entry.blockUntil && now < entry.blockUntil) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
      }
    }

    // Window expired while blocked – allow through with a fresh window
    if (entry.blockUntil && now >= entry.blockUntil) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      })

      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      }
    }

    // Within the window – increment counter
    entry.count++

    if (entry.count > config.maxRequests) {
      // Block the key
      entry.blockUntil = now + blockDuration

      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil(blockDuration / 1000),
      }
    }

    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Remove expired entries to prevent unbounded memory growth.
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    this.store.forEach((entry, key) => {
      if (entry.blockUntil) {
        if (now > entry.blockUntil + entry.resetTime) {
          keysToDelete.push(key)
        }
      } else if (now > entry.resetTime) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach((key) => this.store.delete(key))
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

const limiter = new RateLimiter()

// ---------------------------------------------------------------------------
// Pre-configured rate limit configs
// ---------------------------------------------------------------------------

export const rateLimiters = {
  // Login: 5 attempts per minute, block for 5 minutes
  login: {
    maxRequests: 5,
    windowMs: 60_000,
    blockDurationMs: 300_000,
  } satisfies RateLimitConfig,

  // OTP: 5 per minute, block for 5 minutes
  otp: {
    maxRequests: 5,
    windowMs: 60_000,
    blockDurationMs: 300_000,
  } satisfies RateLimitConfig,

  // Password reset: 3 per hour, block for 15 minutes
  passwordReset: {
    maxRequests: 3,
    windowMs: 3_600_000,
    blockDurationMs: 900_000,
  } satisfies RateLimitConfig,

  // Search: 30 per minute
  search: {
    maxRequests: 30,
    windowMs: 60_000,
  } satisfies RateLimitConfig,

  // General API: 100 per minute
  general: {
    maxRequests: 100,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Derive a rate-limit key from the request (IP-based by default).
 * A `keyPrefix` can be supplied to namespace keys per route.
 */
function deriveKey(request: NextRequest, keyPrefix?: string): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  return keyPrefix ? `${keyPrefix}:${ip}` : ip
}

/**
 * Check a rate limit for the given request and config.
 * Returns a `RateLimitResult` with `success: false` when blocked.
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix?: string
): RateLimitResult {
  const key = deriveKey(request, keyPrefix)
  return limiter.check(key, config)
}

/**
 * Middleware-style function for Next.js route handlers.
 * Returns `null` if the request is allowed, or a 429 `NextResponse` if blocked.
 *
 * Usage:
 *   export async function POST(request: NextRequest) {
 *     const blocked = withRateLimit(rateLimiters.login, 'login')(request)
 *     if (blocked) return blocked
 *     // ... handle request
 *   }
 */
export function withRateLimit(
  config: RateLimitConfig,
  keyPrefix?: string
): (request: NextRequest) => NextResponse | null {
  return (request: NextRequest): NextResponse | null => {
    const result = checkRateLimit(request, config, keyPrefix)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter ?? 60),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          },
        }
      )
    }

    return null
  }
}