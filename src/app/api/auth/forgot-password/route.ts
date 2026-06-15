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

    // ব্যবহারকারী খোঁজা হচ্ছে – ইমেইল গণনা এড়াতে সর্বদা সফলতা প্রদান করা হচ্ছে
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (user) {
      // একটি রিসেট টোকেন তৈরি করে সংরক্ষণ করা হচ্ছে
      const resetToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // ১ ঘণ্টার মেয়াদ

      // TODO: রিসেট টোকেন ডাটাবেজে সংরক্ষণ করুন (যেমন একটি PasswordReset টেবিল)
      // TODO: টোকেনসহ রিসেট লিংক ইমেইল পাঠান
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