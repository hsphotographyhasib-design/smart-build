import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, isRateLimited, createAuditLog } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // হার সীমাবদ্ধতা প্রয়োগ করা হচ্ছে
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // ইমেইল দিয়ে ব্যবহারকারী খোঁজা হচ্ছে
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ব্যবহারকারী সক্রিয় কিনা যাচাই করা হচ্ছে
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Contact administrator.' },
        { status: 401 }
      )
    }

    // ব্যবহারকারী লক করা আছে কিনা যাচাই করা হচ্ছে
    if (user.isLocked && user.lockoutUntil && new Date() < user.lockoutUntil) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000)
      return NextResponse.json(
        { success: false, error: `Account is locked. Try again in ${minutesLeft} minutes.` },
        { status: 401 }
      )
    }

    // পাসওয়ার্ড যাচাই করা হচ্ছে
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      // ব্যর্থ লগইন প্রচেষ্টা বৃদ্ধি করা হচ্ছে - লকআউট সময়সীমার মধ্যে ৫ বার ব্যর্থ হলে অ্যাকাউন্ট লক করা হবে
      const failedAttempts = (user as any).failedLoginAttempts || 0
      const newAttempts = failedAttempts + 1
      const lockoutMinutes = 15
      const lockoutUntil = newAttempts >= 5
        ? new Date(Date.now() + lockoutMinutes * 60 * 1000)
        : null

      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          isLocked: newAttempts >= 5,
          lockoutUntil,
        },
      })

      return NextResponse.json(
        { success: false, error: newAttempts >= 5
          ? `Account is locked due to too many failed attempts. Try again in ${lockoutMinutes} minutes.`
          : 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ব্যবহারকারী লক থাকলেও লকআউটের মেয়াদ শেষ হয়ে গেলে আনলক করা হচ্ছে
    if (user.isLocked && user.lockoutUntil && new Date() > user.lockoutUntil) {
      await db.user.update({
        where: { id: user.id },
        data: { isLocked: false, lockoutUntil: null },
      })
    }

    // সফল লগইনের পর ব্যর্থ লগইন প্রচেষ্টা রিসেট করা হচ্ছে
    await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, isLocked: false, lockoutUntil: null },
    })

    // সেশন তৈরি করা হচ্ছে
    const userAgent = request.headers.get('user-agent') || undefined
    const session = await createSession(user.id, {
      device: userAgent?.includes('Mobile') ? 'mobile' : 'desktop',
      ipAddress: ip,
      userAgent,
    })

    // অডিট লগ তৈরি করা হচ্ছে
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'Session',
      ipAddress: ip,
    })

    return NextResponse.json({
      success: true,
      data: {
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          isActive: user.isActive,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}