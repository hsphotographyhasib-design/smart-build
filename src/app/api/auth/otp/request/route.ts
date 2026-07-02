import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-server'

/** Normalize to a loose E.164-ish form: keep leading +, digits only otherwise. */
function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  return plus + trimmed.replace(/[^\d]/g, '')
}

export async function POST(req: NextRequest) {
  let body: { phone?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const phone = normalizePhone(body.phone ?? '')
  const digits = phone.replace('+', '')
  if (digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: 'Enter a valid phone number (with country code)' }, { status: 400 })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000)) // 6 digits
  await db.otpChallenge.create({
    data: {
      phone,
      codeHash: await hashPassword(code),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  })

  // --- WhatsApp delivery (dev stub) -------------------------------------
  // Swap this block for a real Twilio / WhatsApp Business API call and read
  // credentials from env (e.g. WHATSAPP_TOKEN, WHATSAPP_PHONE_ID).
  const isDev = process.env.NODE_ENV !== 'production'
  console.log(`[WhatsApp OTP] → ${phone}: ${code}${isDev ? ' (dev)' : ''}`)
  // ----------------------------------------------------------------------

  return NextResponse.json({
    ok: true,
    phone,
    // In dev we surface the code so it can be tested without a real sender.
    ...(isDev ? { devCode: code } : {}),
  })
}
