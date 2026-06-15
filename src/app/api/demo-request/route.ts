import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

// প্রতি IP তে প্রতি ঘণ্টায় ৫টি অনুরোধ
const DEMO_REQUEST_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 3_600_000, // ১ ঘণ্টা
}

export async function POST(request: NextRequest) {
  try {
    // হার সীমাবদ্ধতা: প্রতি IP তে প্রতি ঘণ্টায় ৫টি ডেমো অনুরোধ
    const rateLimitResult = checkRateLimit(request, DEMO_REQUEST_RATE_LIMIT, 'demo-request')
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter ?? 3600),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000)),
          },
        }
      )
    }
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      company,
      position,
      country,
      industry,
      employeeCount,
      currentTools,
      requirements,
      preferredDate,
      preferredTime,
      timezone,
      referralSource,
    } = body

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const demoRequest = await db.demoRequest.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        position: position || null,
        country: country?.trim() || null,
        industry: industry || null,
        employeeCount: employeeCount || null,
        currentTools: JSON.stringify(currentTools || []),
        requirements: requirements?.trim() || null,
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null,
        timezone: timezone || null,
        referralSource: referralSource || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: demoRequest.id,
        fullName: demoRequest.fullName,
        email: demoRequest.email,
      },
    })
  } catch (error) {
    console.error('Demo request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}