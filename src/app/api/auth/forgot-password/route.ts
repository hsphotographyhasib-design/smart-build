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
    // Rate limiting
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

    // Validation
    const body = await request.json()
    const validation = validateBody(forgotPasswordSchema, body)
    if (validation.error) return validation.error

    const { email } = validation.data

    // Look up user – always return success to avoid email enumeration
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (user) {
      // Generate a reset token and store it
      const resetToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

      // TODO: Store the reset token in the database (e.g. a PasswordReset table)
      // TODO: Send the reset link email with the token
    }

    // Always return success to prevent email enumeration
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