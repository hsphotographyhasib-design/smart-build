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
    // Rate limiting
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

    // Validation
    const body = await request.json()
    const validation = validateBody(resetPasswordSchema, body)
    if (validation.error) return validation.error

    const { token, password } = validation.data

    // TODO: Look up the reset token in the database
    // - Verify the token exists and hasn't expired
    // - Hash the new password and update the user record
    // - Delete the used reset token
    // - Revoke all existing sessions for the user

    // Placeholder: token validation not yet wired to DB
    return NextResponse.json(
      { success: false, error: 'Password reset not yet implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}