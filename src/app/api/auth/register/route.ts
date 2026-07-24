import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, issueSession } from '@/lib/auth-server'
import { ROLES } from '@/lib/auth'
import { publicUser } from '@/lib/user'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const name = body.name?.trim() || (email ? email.split('@')[0] : '')

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const existing = await db.appUser.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  // First-time sign-up always starts as a Customer.
  const user = await db.appUser.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: ROLES.CUSTOMER,
      provider: 'email',
    },
  })

  await issueSession(user)
  return NextResponse.json({ user: publicUser(user) }, { status: 201 })
}
