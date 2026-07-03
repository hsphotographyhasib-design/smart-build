import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/auth'

// Gates the whole app: unauthenticated users are sent to /login; API calls get 401.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value)

  // Auth endpoints must stay public (login, register, oauth callback, etc.)
  if (pathname.startsWith('/api/auth')) return NextResponse.next()

  // Protect all other API routes with a JSON 401 rather than an HTML redirect.
  if (pathname.startsWith('/api')) {
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  // The login page is public; bounce already-authenticated users into the app.
  if (pathname === '/login') {
    return session ? NextResponse.redirect(new URL('/app', req.url)) : NextResponse.next()
  }

  // No public site: the root (and anything else) opens the authentication
  // page first, or the app if already signed in.
  if (pathname === '/') {
    return NextResponse.redirect(new URL(session ? '/app' : '/login', req.url))
  }

  // Everything else (the app under /app, etc.) requires a session.
  if (!session) {
    const url = new URL('/login', req.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)'],
}
