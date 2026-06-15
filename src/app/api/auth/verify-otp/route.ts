import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { checkRateLimit, rateLimiters } from '@/lib/rate-limit'
import { validateBody, commonSchemas } from '@/lib/api-validate'
import * as OTPAuth from 'otpauth'

const otpSchema = z.object({
  email: commonSchemas.email,
  code: z.string().min(4, 'OTP code is required').max(8),
})

export async function POST(request: NextRequest) {
  try {
    // হার সীমাবদ্ধতা প্রয়োগ করা হচ্ছে
    const rateLimit = checkRateLimit(request, rateLimiters.otp, 'otp')
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many OTP attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfter! / 1000)) },
        }
      )
    }

    // যাচাইকরণ
    const body = await request.json()
    const validation = validateBody(otpSchema, body)
    if (validation.error) return validation.error

    const { email, code } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // ব্যবহারকারী খোঁজা হচ্ছে
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or OTP code' },
        { status: 400 }
      )
    }

    // TOTP সক্রিয় আছে কিনা পরীক্ষা করা হচ্ছে
    if (!user.totpEnabled || !user.totpSecret) {
      return NextResponse.json(
        { success: false, error: 'TOTP is not enabled for this account' },
        { status: 400 }
      )
    }

    // সংরক্ষিত গোপনীয় থেকে TOTP যাচাইকরণ অবজেক্ট তৈরি করা হচ্ছে
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    })

    // প্রদত্ত কোড যাচাই করা হচ্ছে (বর্তমান এবং আগের সময় উইন্ডো বিবেচনা করা হচ্ছে)
    const delta = totp.validate({ token: code, window: 1 })

    if (delta === null) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}