import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { checkRateLimit, rateLimiters } from '@/lib/rate-limit'
import { validateBody } from '@/lib/api-validate'

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function POST(request: NextRequest) {
  try {
    // হার সীমাবদ্ধতা প্রয়োগ করা হচ্ছে
    const rateLimit = checkRateLimit(request, rateLimiters.passwordReset, 'reset-password')
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many password reset attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfter! / 1000)) },
        }
      )
    }

    // যাচাইকরণ
    const body = await request.json()
    const validation = validateBody(resetPasswordSchema, body)
    if (validation.error) return validation.error

    const { token, password } = validation.data

    // বৈধ, মেয়াদোত্তীর্ণ নয় এমন রিসেট টোকেন খুঁজা হচ্ছে
    const resetRecord = await db.passwordReset.findUnique({
      where: { token },
      include: { User: true },
    })

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { success: false, error: 'This reset token has already been used' },
        { status: 400 }
      )
    }

    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // নতুন পাসওয়ার্ড হ্যাশ করা হচ্ছে
    const hashedPassword = await bcrypt.hash(password, 12)

    // ব্যবহারকারীর পাসওয়ার্ড আপডেট এবং অ্যাকাউন্ট আনলক করা হচ্ছে
    await db.user.update({
      where: { id: resetRecord.userId },
      data: {
        password: hashedPassword,
        isLocked: false,
        lockoutUntil: null,
        failedLoginAttempts: 0,
        updatedAt: new Date(),
      },
    })

    // রিসেট টোকেন ব্যবহৃত হিসেবে চিহ্নিত করা হচ্ছে
    await db.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    })

    // ব্যবহারকারীর সকল বিদ্যমান সেশন বাতিল করা হচ্ছে
    await db.session.deleteMany({
      where: { userId: resetRecord.userId },
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}