import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { issueSession } from '@/lib/auth-server'
import { ROLES } from '@/lib/auth'

// Handles the Google OAuth redirect: exchanges the code, upserts the user, issues a session.
export async function GET(req: NextRequest) {
  const origin = process.env.APP_URL || req.nextUrl.origin
  const url = req.nextUrl
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieState = req.cookies.get('g_state')?.value

  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, origin))

  if (url.searchParams.get('error')) return fail('google_denied')
  if (!code || !state || !cookieState || state !== cookieState) return fail('google_state')

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return fail('google_not_configured')

  try {
    // 1. Exchange authorization code for tokens.
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })
    if (!tokenRes.ok) return fail('google_token')
    const tokens = (await tokenRes.json()) as { access_token?: string }
    if (!tokens.access_token) return fail('google_token')

    // 2. Fetch the profile.
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!profileRes.ok) return fail('google_profile')
    const profile = (await profileRes.json()) as {
      id: string
      email: string
      name?: string
      picture?: string
    }
    const email = profile.email?.toLowerCase()
    if (!email) return fail('google_profile')

    // 3. Upsert: link by googleId, else by email, else create a first-time Customer.
    let user =
      (await db.appUser.findUnique({ where: { googleId: profile.id } })) ||
      (await db.appUser.findUnique({ where: { email } }))

    if (!user) {
      user = await db.appUser.create({
        data: {
          name: profile.name || email.split('@')[0],
          email,
          googleId: profile.id,
          avatar: profile.picture ?? null,
          provider: 'google',
          role: ROLES.CUSTOMER,
        },
      })
    } else if (!user.googleId) {
      user = await db.appUser.update({
        where: { id: user.id },
        data: { googleId: profile.id, avatar: user.avatar ?? profile.picture ?? null },
      })
    }

    if (!user.active) return fail('account_disabled')

    await issueSession(user)
    const res = NextResponse.redirect(new URL('/app', origin))
    res.cookies.set('g_state', '', { path: '/', maxAge: 0 })
    return res
  } catch {
    return fail('google_error')
  }
}
