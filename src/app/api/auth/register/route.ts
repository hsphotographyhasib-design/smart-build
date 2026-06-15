import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { verifyAuth, requireRole, createAuditLog } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // অনুরোধকারী ব্যবহারকারী প্রশাসক কিনা যাচাই করা হচ্ছে
    const currentUser = await verifyAuth(request)
    if (!currentUser || !requireRole(currentUser, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, name, phone, role } = body

    // প্রয়োজনীয় ক্ষেত্রগুলো যাচাই করা হচ্ছে
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // ইমেইল ফরম্যাট যাচাই করা হচ্ছে
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // পাসওয়ার্ডের দৈর্ঘ্য যাচাই করা হচ্ছে
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // ভূমিকা যাচাই করা হচ্ছে
    const validRoles = ['super_admin', 'admin', 'supervisor', 'hr_manager', 'accountant', 'store_manager', 'client', 'labour']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // ব্যবহারকারী আগে থেকেই বিদ্যমান কিনা যাচাই করা হচ্ছে
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // পাসওয়ার্ড হ্যাশ করা হচ্ছে
    const hashedPassword = await bcrypt.hash(password, 10)

    // ব্যবহারকারী তৈরি করা হচ্ছে
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        phone: phone?.trim() || null,
        role: role || 'labour',
        isActive: true,
      },
    })

    // বিজ্ঞপ্তি পছন্দ তৈরি করা হচ্ছে
    await db.notificationPreference.create({
      data: {
        userId: user.id,
        inApp: true,
        email: true,
        sms: false,
      },
    })

    // অডিট লগ তৈরি করা হচ্ছে
    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      newValues: { email: user.email, name: user.name, role: user.role },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}