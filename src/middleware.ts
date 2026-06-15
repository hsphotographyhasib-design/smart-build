import { NextRequest, NextResponse } from 'next/server'
import { canAccessRoute, ROLES } from '@/lib/rbac'

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

// বৈধ ভূমিকার সেট (কুকি ইনজেকশন প্রতিরোধে)
const VALID_ROLES = new Set(Object.values(ROLES))

function isPublicApiRoute(pathname: string): boolean {
  for (const route of PUBLIC_API_ROUTES) {
    if (pathname === route || pathname.startsWith(route + '/')) return true
  }
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // সকল প্রতিক্রিয়ায় নিরাপত্তা হেডার
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // API রুটের জন্য প্রমাণীকরণ গেট
  if (pathname.startsWith('/api/') && !isPublicApiRoute(pathname)) {
    // ধাপ ১: Bearer টোকেন উপস্থিতি পরীক্ষা
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      )
    }

    // ধাপ ২: ভূমিকা কুকি থেকে RBAC পরীক্ষা
    // কুকিটি লগইনের সময় httpOnly হিসেবে সেট হয়
    // এটি এজ রানটাইমে দ্রুত RBAC ফিল্টারিং প্রদান করে
    // কুকি অনুপস্থিত হলে অনুরোধটি পাস হয় (রুট হ্যান্ডলার দায়িত্ব নেবে)
    const roleCookie = request.cookies.get('sb-role')?.value
    if (roleCookie && VALID_ROLES.has(roleCookie)) {
      const method = request.method
      if (!canAccessRoute(roleCookie, pathname, method)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    }
    // কুকি অনুপস্থিত বা অবৈধ হলে অনুরোধটি পাস হয় —
    // ব্যক্তিগত রুট হ্যান্ডলারে withAuth() দিয়ে নিশ্চিত করতে হবে
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icons/).*)'],
}