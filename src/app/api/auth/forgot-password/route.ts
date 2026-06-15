import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { checkRateLimit, rateLimiters } from '@/lib/rate-limit'
import { validateBody, commonSchemas } from '@/lib/api-validate'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: commonSchemas.email,
})

export async function POST(request: NextRequest) {
  try {
    // হার সীমাবদ্ধতা প্রয়োগ করা হচ্ছে
    const rateLimit = checkRateLimit(request, rateLimiters.passwordReset, 'forgot-password')
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many password reset requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfter! / 1000)) },
        }
      )
    }

    // যাচাইকরণ
    const body = await request.json()
    const validation = validateBody(forgotPasswordSchema, body)
    if (validation.error) return validation.error

    const { email } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // ব্যবহারকারী খোঁজা হচ্ছে
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (user) {
      const resetToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // ১ ঘণ্টার মেয়াদ

      // এই ব্যবহারকারীর পূর্ববর্তী অব্যবহৃত রিসেট টোকেন নিষ্ক্রিয় করা হচ্ছে
      await db.passwordReset.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      })

      // নতুন রিসেট টোকেন সংরক্ষণ করা হচ্ছে
      await db.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          email: normalizedEmail,
          expiresAt,
        },
      })

      // প্রোডাকশনে এখানে টোকেনসহ রিসেট লিংক ইমেইল পাঠাতে হবে
      // বর্তমানে ডেভেলপমেন্টের জন্য টোকেন প্রতিক্রিয়ায় ফেরত দেওয়া হচ্ছে
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a reset link has been sent.',
        token: resetToken,
      })
    }

    // ইমেইল গণনা প্রতিরোধ করতে সর্বদা সফলতা প্রদান করা হচ্ছে
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}