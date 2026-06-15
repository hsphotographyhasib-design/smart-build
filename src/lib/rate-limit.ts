import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// ধরন (Types)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number
  resetTime: number
  blockUntil?: number
}

export interface RateLimitConfig {
  maxRequests: number       // উইন্ডোতে অনুমোদিত সর্বোচ্চ অনুরোধ সংখ্যা
  windowMs: number          // মিলিসেকেন্ডে সময় উইন্ডো
  blockDurationMs?: number  // সীমা অতিক্রমের পর কতক্ষণ ব্লক করা হবে (ডিফল্ট: windowMs)
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number       // শুধুমাত্র অনুরোধ ব্লক থাকলে উপস্থিত থাকে
}

// ---------------------------------------------------------------------------
// RateLimiter – ইন-মেমরি স্লাইডিং-উইন্ডো হার সীমাবদ্ধকারী
// একাধিক সার্ভার ইনস্ট্যান্স সহ প্রোডাকশন ডিপ্লয়মেন্টের জন্য, Map
// স্টোর Redis-সমর্থিত বাস্তবায়ন দিয়ে প্রতিস্থাপন করুন।
// ---------------------------------------------------------------------------

class RateLimiter {
  private store: Map<string, RateLimitEntry>

  constructor() {
    this.store = new Map()

    // প্রতি 60 সেকেন্ডে মেয়াদোত্তীর্ণ এন্ট্রি নিয়মিত পরিষ্কার করা হচ্ছে
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60_000)
    }
  }

  /**
   * `key` দ্বারা চিহ্নিত অনুরোধটি অনুমোদিত কিনা পরীক্ষা করা হচ্ছে।
   */
  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const blockDuration = config.blockDurationMs ?? config.windowMs

    const entry = this.store.get(key)

    // কোনো বিদ্যমান এন্ট্রি নেই – উইন্ডোতে প্রথম অনুরোধ
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

    // বর্তমানে ব্লক করা হয়েছে
    if (entry.blockUntil && now < entry.blockUntil) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
      }
    }

    // ব্লক থাকাকালীন উইন্ডোর মেয়াদ শেষ – নতুন উইন্ডো দিয়ে অনুমতি দেওয়া হচ্ছে
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

    // উইন্ডোর মধ্যে – কাউন্টার বৃদ্ধি করা হচ্ছে
    entry.count++

    if (entry.count > config.maxRequests) {
      // কী ব্লক করা হচ্ছে
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
   * সীমাহীন মেমরি বৃদ্ধি রোধে মেয়াদোত্তীর্ণ এন্ট্রি সরানো হচ্ছে।
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
// সিঙ্গলটন ইনস্ট্যান্স
// ---------------------------------------------------------------------------

const limiter = new RateLimiter()

// ---------------------------------------------------------------------------
// পূর্ব-কনফিগার করা হার সীমাবদ্ধতার কনফিগ
// ---------------------------------------------------------------------------

export const rateLimiters = {
  // লগইন: প্রতি মিনিটে 5টি প্রচেষ্টা, 5 মিনিটের জন্য ব্লক
  login: {
    maxRequests: 5,
    windowMs: 60_000,
    blockDurationMs: 300_000,
  } satisfies RateLimitConfig,

  // OTP: প্রতি মিনিটে 5টি, 5 মিনিটের জন্য ব্লক
  otp: {
    maxRequests: 5,
    windowMs: 60_000,
    blockDurationMs: 300_000,
  } satisfies RateLimitConfig,

  // পাসওয়ার্ড রিসেট: প্রতি ঘণ্টায় 3টি, 15 মিনিটের জন্য ব্লক
  passwordReset: {
    maxRequests: 3,
    windowMs: 3_600_000,
    blockDurationMs: 900_000,
  } satisfies RateLimitConfig,

  // অনুসন্ধান: প্রতি মিনিটে 30টি
  search: {
    maxRequests: 30,
    windowMs: 60_000,
  } satisfies RateLimitConfig,

  // সাধারণ API: প্রতি মিনিটে 100টি
  general: {
    maxRequests: 100,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const

// ---------------------------------------------------------------------------
// সহায়ক ফাংশন
// ---------------------------------------------------------------------------

/**
 * অনুরোধ থেকে একটি হার-সীমাবদ্ধতার কী প্রাপ্ত করা হচ্ছে (ডিফল্ট: IP-ভিত্তিক)।
 * প্রতি রাউটে কী নেমস্পেস করতে একটি `keyPrefix` দেওয়া যেতে পারে।
 */
function deriveKey(request: NextRequest, keyPrefix?: string): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  return keyPrefix ? `${keyPrefix}:${ip}` : ip
}

/**
 * প্রদত্ত অনুরোধ এবং কনফিগের জন্য হার সীমাবদ্ধতা পরীক্ষা করা হচ্ছে।
 * ব্লক থাকলে `success: false` সহ `RateLimitResult` প্রদান করে।
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
 * Next.js রাউট হ্যান্ডলারের জন্য মিডলওয়্যার-স্টাইল ফাংশন।
 * অনুরোধ অনুমোদিত হলে `null` প্রদান করে, অন্যথায় 429 `NextResponse` প্রদান করে।
 *
 * ব্যবহার:
 *   export async function POST(request: NextRequest) {
 *     const blocked = withRateLimit(rateLimiters.login, 'login')(request)
 *     if (blocked) return blocked
 *     // ... অনুরোধ প্রক্রিয়া করুন
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