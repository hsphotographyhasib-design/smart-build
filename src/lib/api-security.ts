import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// স্যানিটাইজেশন
// ---------------------------------------------------------------------------

/**
 * একটি স্ট্রিং মান থেকে সাধারণ XSS ভেক্টর সরানো হচ্ছে।
 * এটি একটি প্রতিরক্ষামূলক ব্যবস্থা এবং সঠিক আউটপুট
 * এনকোডিং প্রতিস্থাপন করে না ফ্রন্ট-এন্ডে।
 */
export function sanitizeInput(input: string): string {
  return input
    // নাল বাইট সরানো হচ্ছে
    .replace(/\0/g, '')
    // ইউনিকোড নরমালাইজ করা হচ্ছে
    .normalize('NFC')
    // <script> ট্যাগ সরানো হচ্ছে
    .replace(/<\s*script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // HTML ইভেন্ট-হ্যান্ডলার অ্যাট্রিবিউট সরানো হচ্ছে (onclick, onerror, onload, …)
    .replace(
      /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      ' '
    )
    // javascript: URI সরানো হচ্ছে
    .replace(/javascript\s*:/gi, '')
    // এক্সিকিউটেবল কন্টেন্ট বহন করতে পারে এমন data: URI সরানো হচ্ছে
    .replace(/data\s*:\s*text\/html/gi, '')
    // vbscript: URI সরানো হচ্ছে
    .replace(/vbscript\s*:/gi, '')
}

/**
 * একটি অবজেক্টে সকল স্ট্রিং মান পুনরাবৃত্তিমূলকভাবে স্যানিটাইজ করা হচ্ছে।
 * কন্টেইনার নয় এমন / স্ট্রিং নয় এমন মান অপরিবর্তিত পাস হয়।
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') return sanitizeInput(obj) as unknown as T
  if (typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    sanitized[key] = sanitizeObject(value)
  }
  return sanitized as unknown as T
}

// ---------------------------------------------------------------------------
// পুনঃনির্দেশন নিরাপত্তা
// ---------------------------------------------------------------------------

/**
 * `url` একটি নিরাপদ পুনঃনির্দেশন লক্ষ্য (আপেক্ষিক বা একই-উৎস) হলে `true` প্রদান করে।
 * প্রোটোকল-আপেক্ষিক, javascript:, data:, এবং অন্যান্য বিপজ্জনক স্কিম প্রত্যাখ্যান করে।
 */
export function isSafeRedirect(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  // / দিয়ে শুরু হয় কিন্তু // দিয়ে নয় এমন আপেক্ষিক URL অনুমোদন করা হচ্ছে
  if (url.startsWith('/') && !url.startsWith('//')) return true

  try {
    const parsed = new URL(url, 'http://localhost')
    const safeProtocols = ['http:', 'https:']
    if (!safeProtocols.includes(parsed.protocol)) return false

    // বহিরাগত হোস্ট ব্লক করা হচ্ছে – শুধুমাত্র একই উৎস অনুমোদন করা হচ্ছে
    if (
      parsed.hostname !== 'localhost' &&
      !parsed.hostname.endsWith('.localhost')
    ) {
      // NEXT_PUBLIC_APP_URL কনফিগার করা থাকলে, তার বিপরীতে তুলনা করা হচ্ছে
      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      if (appUrl) {
        const allowed = new URL(appUrl)
        if (parsed.hostname !== allowed.hostname) return false
      } else {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// নিরাপদ প্রতিক্রিয়া সহায়ক
// ---------------------------------------------------------------------------

/**
 * সাধারণ নিরাপত্তা হেডার পূর্বে প্রয়োগ করে একটি JSON `NextResponse` তৈরি করা হচ্ছে।
 */
export function createSecureResponse(
  data: unknown,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })

  // MIME-টাইপ স্নিফিং প্রতিরোধ করা হচ্ছে
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // ক্লিকজ্যাকিং প্রতিরোধ
  response.headers.set('X-Frame-Options', 'DENY')
  // XSS প্রতিরোধ (পুরনো, তবে পুরনো ব্রাউজারের জন্য এখনও কার্যকর)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  // রেফারার নীতি
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // API রাউটের জন্য Content-Security-Policy – শুধুমাত্র একই-উৎসে সীমাবদ্ধ
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'"
  )

  return response
}

// ---------------------------------------------------------------------------
// ক্লায়েন্ট IP নিষ্কাশন
// ---------------------------------------------------------------------------

/**
 * অনুরোধ হেডার থেকে সম্ভাব্য ক্লায়েন্ট IP ঠিকানা নিষ্কাশন করা হচ্ছে।
 * বিশ্বাসযোগ্যতার ক্রম অনুসারে সাধারণ প্রক্সি হেডার পরীক্ষা করা হচ্ছে।
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    request.headers.get('true-client-ip') || // Akamai
    '127.0.0.1'
  )
}