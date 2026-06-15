import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

/**
 * Strips common XSS vectors from a string value.
 * This is a defence-in-depth measure and does NOT replace proper output
 * encoding on the front-end.
 */
export function sanitizeInput(input: string): string {
  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize unicode
    .normalize('NFC')
    // Strip <script> tags
    .replace(/<\s*script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip HTML event-handler attributes (onclick, onerror, onload, …)
    .replace(
      /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      ' '
    )
    // Strip javascript: URIs
    .replace(/javascript\s*:/gi, '')
    // Strip data: URIs that could carry executable content
    .replace(/data\s*:\s*text\/html/gi, '')
    // Strip vbscript: URIs
    .replace(/vbscript\s*:/gi, '')
}

/**
 * Recursively sanitizes all string values in an object (plain objects & arrays).
 * Non-container / non-string values pass through unchanged.
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
// Redirect safety
// ---------------------------------------------------------------------------

/**
 * Returns `true` when `url` is a safe redirect target (relative or same-origin).
 * Rejects protocol-relative, javascript:, data:, and other dangerous schemes.
 */
export function isSafeRedirect(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  // Allow relative URLs that start with / but not //
  if (url.startsWith('/') && !url.startsWith('//')) return true

  try {
    const parsed = new URL(url, 'http://localhost')
    const safeProtocols = ['http:', 'https:']
    if (!safeProtocols.includes(parsed.protocol)) return false

    // Block external hosts – only allow the same origin
    if (
      parsed.hostname !== 'localhost' &&
      !parsed.hostname.endsWith('.localhost')
    ) {
      // If a NEXT_PUBLIC_APP_URL is configured, compare against it
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
// Secure response helper
// ---------------------------------------------------------------------------

/**
 * Creates a JSON `NextResponse` with common security headers pre-applied.
 */
export function createSecureResponse(
  data: unknown,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })

  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Clickjacking protection
  response.headers.set('X-Frame-Options', 'DENY')
  // XSS protection (legacy, but still useful for older browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Content-Security-Policy for API routes – restrict to same-origin
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'"
  )

  return response
}

// ---------------------------------------------------------------------------
// Client IP extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the most likely client IP address from request headers.
 * Checks common proxy headers in order of trustworthiness.
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