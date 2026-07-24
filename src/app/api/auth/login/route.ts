import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, issueSession } from '@/lib/auth-server'
import { publicUser } from '@/lib/user'

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const user = await db.appUser.findUnique({ where: { email } })
  // Generic message to avoid leaking which part failed.
  if (!user || !user.passwordHash || !(await comparePassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  if (!user.active) {
    return NextResponse.json({ error: 'This account is disabled. Contact an administrator.' }, { status: 403 })
  }

  await issueSession(user)
  return NextResponse.json({ user: publicUser(user) })
}
