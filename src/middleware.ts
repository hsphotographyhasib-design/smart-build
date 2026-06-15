import { NextRequest, NextResponse } from 'next/server'

// Public API routes that do NOT require a Bearer token
const PUBLIC_API_ROUTES = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-otp',
  '/api/whatsapp/webhook',
  '/api/whatsapp/send',
  '/api/whatsapp/bot',
  '/api/whatsapp/account',
  '/api/whatsapp/dashboard',
  '/api/whatsapp/contacts',
  '/api/whatsapp/templates',
  '/api/whatsapp/conversations',
  '/api/demo-request',
  '/api/regional/detect',
  '/api/regional/countries',
  '/api/regional/currencies',
  '/api/regional/exchange-rates',
  '/api/regional/tax-rules',
])

function isPublicApiRoute(pathname: string): boolean {
  for (const route of PUBLIC_API_ROUTES) {
    if (pathname === route || pathname.startsWith(route + '/')) return true
  }
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers for all responses
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Auth gate for API routes
  if (pathname.startsWith('/api/') && !isPublicApiRoute(pathname)) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      )
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icons/).*)'],
}
