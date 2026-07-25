import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySession, isSuperAdminRole } from '@/lib/auth'

// Public paths that don't require auth
const PUBLIC_PATHS = ['/api/auth', '/api/cms/landing', '/api/cms/newsletter', '/register', '/pricing']
const STATIC_EXTENSIONS = ['ico', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'json', 'txt', 'xml', 'webmanifest']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value)

  // Static assets and Next internals — pass through
  if (pathname.startsWith('/_next') || pathname.startsWith('/brand') ||
      STATIC_EXTENSIONS.some(ext => pathname.endsWith(`.${ext}`))) {
    return NextResponse.next()
  }

  // Auth endpoints — always public
  if (pathname.startsWith('/api/auth')) return NextResponse.next()

  // Admin routes — allow through (own auth handled in admin)
  if (pathname.startsWith('/admin')) return NextResponse.next()

  // Public CMS API endpoints
  if (pathname.startsWith('/api/cms/landing') || pathname === '/api/cms/newsletter' || pathname.startsWith('/api/cms/testimonials') || pathname.startsWith('/api/cms/faqs') || pathname.startsWith('/api/cms/partners') || pathname.startsWith('/api/cms/blog') || pathname.startsWith('/api/cms/forms') || pathname.startsWith('/api/platform/plans')) return NextResponse.next()

  // Registration & pricing pages — public
  if (pathname === '/register' || pathname === '/pricing') {
    if (session) {
      // Already logged in, redirect appropriately
      const dest = isSuperAdminRole(session.role) ? '/platform' : '/app'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // Platform routes — only Super Admin
  if (pathname.startsWith('/platform')) {
    if (!session) {
      const url = new URL('/login', req.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
    if (!isSuperAdminRole(session.role)) {
      return NextResponse.redirect(new URL('/app', req.url))
    }
    // Inject tenant context header for API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    return NextResponse.next()
  }

  // API routes — require auth + tenant check
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // For tenant API routes (not platform), ensure tenant context
    if (!pathname.startsWith('/api/platform/') && !isSuperAdminRole(session.role)) {
      if (!session.tenantId) {
        return NextResponse.json({ error: 'No tenant context' }, { status: 403 })
      }
    }
    // Forward tenant info in headers for API routes
    const res = NextResponse.next()
    if (session.tenantId) res.headers.set('x-tenant-id', session.tenantId)
    if (session.branchId) res.headers.set('x-branch-id', session.branchId)
    if (session.role) res.headers.set('x-user-role', session.role)
    return res
  }

  // Login page — public, redirect if already auth'd
  if (pathname === '/login') {
    if (session) {
      const dest = isSuperAdminRole(session.role) ? '/platform' : '/app'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // Root — landing page for guests, redirect auth'd users to their dashboard
  if (pathname === '/') {
    if (session) {
      const dest = isSuperAdminRole(session.role) ? '/platform' : '/app'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // /app routes — require tenant user session
  if (pathname.startsWith('/app')) {
    if (!session) {
      const url = new URL('/login', req.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
    if (isSuperAdminRole(session.role)) {
      // Super admin can still access /app if needed, but redirect to platform by default
      // Allow if they explicitly navigated here
      return NextResponse.next()
    }
    if (!session.tenantId) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp|json|txt|xml|webmanifest)$).*)'],
}
