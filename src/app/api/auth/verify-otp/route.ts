import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, rateLimiters } from '@/lib/rate-limit'
import { validateBody, commonSchemas } from '@/lib/api-validate'

const otpSchema = z.object({
  email: commonSchemas.email,
  code: z.string().min(4, 'OTP code is required').max(8),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
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

    // Validation
    const body = await request.json()
    const validation = validateBody(otpSchema, body)
    if (validation.error) return validation.error

    const { email, code } = validation.data

    // TODO: Implement OTP verification logic
    // - Look up pending OTP for the given email
    // - Verify the code matches and hasn't expired
    // - Mark the OTP as verified / consume it
    // - Activate the user account or complete the auth flow

    return NextResponse.json(
      { success: false, error: 'OTP verification not yet implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}