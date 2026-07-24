import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, issueSession } from '@/lib/auth-server'
import { ROLES } from '@/lib/auth'
import { publicUser } from '@/lib/user'

function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  return plus + trimmed.replace(/[^\d]/g, '')
}

export async function POST(req: NextRequest) {
  let body: { phone?: string; code?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const phone = normalizePhone(body.phone ?? '')
  const code = (body.code ?? '').trim()
  if (!phone || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Enter the 6-digit code' }, { status: 400 })
  }

  const challenge = await db.otpChallenge.findFirst({
    where: { phone, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })
  if (!challenge) {
    return NextResponse.json({ error: 'Code expired or not found. Request a new one.' }, { status: 400 })
  }
  if (challenge.attempts >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 })
  }

  const ok = await comparePassword(code, challenge.codeHash)
  if (!ok) {
    await db.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } })
    return NextResponse.json({ error: 'Incorrect code' }, { status: 401 })
  }

  await db.otpChallenge.update({ where: { id: challenge.id }, data: { consumed: true } })

  // Find existing account by phone, otherwise create a first-time Customer.
  let user = await db.appUser.findUnique({ where: { phone } })
  if (!user) {
    user = await db.appUser.create({
      data: {
        name: body.name?.trim() || `WhatsApp User ${phone.slice(-4)}`,
        email: `${phone.replace('+', '')}@whatsapp.local`,
        phone,
        provider: 'whatsapp',
        role: ROLES.CUSTOMER,
      },
    })
  } else if (!user.active) {
    return NextResponse.json({ error: 'This account is disabled. Contact an administrator.' }, { status: 403 })
  }

  await issueSession(user)
  return NextResponse.json({ user: publicUser(user) })
}
