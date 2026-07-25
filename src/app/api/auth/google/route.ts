import { NextRequest, NextResponse } from 'next/server'

// Kicks off Google OAuth. Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env.
export async function GET(req: NextRequest) {
  const origin = process.env.APP_URL || req.nextUrl.origin
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    // Not configured yet — bounce back to the login page with a notice.
    return NextResponse.redirect(new URL('/login?error=google_not_configured', origin))
  }

  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  })

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
  // CSRF guard: remember the state in an httpOnly cookie, checked on callback.
  res.cookies.set('g_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  })
  return res
}
