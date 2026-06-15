import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, isRateLimited, createAuditLog } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
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

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Contact administrator.' },
        { status: 401 }
      )
    }

    // Check if user is locked
    if (user.isLocked && user.lockoutUntil && new Date() < user.lockoutUntil) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000)
      return NextResponse.json(
        { success: false, error: `Account is locked. Try again in ${minutesLeft} minutes.` },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      // Increment failed login attempts - lock after 5 failed within lockout window
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

    // If user was locked but lockout expired, unlock
    if (user.isLocked && user.lockoutUntil && new Date() > user.lockoutUntil) {
      await db.user.update({
        where: { id: user.id },
        data: { isLocked: false, lockoutUntil: null },
      })
    }

    // Reset failed login attempts on successful login
    await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, isLocked: false, lockoutUntil: null },
    })

    // Create session
    const userAgent = request.headers.get('user-agent') || undefined
    const session = await createSession(user.id, {
      device: userAgent?.includes('Mobile') ? 'mobile' : 'desktop',
      ipAddress: ip,
      userAgent,
    })

    // Create audit log
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