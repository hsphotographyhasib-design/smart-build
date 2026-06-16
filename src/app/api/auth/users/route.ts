import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { verifyAuth, requireRole, createAuditLog } from '@/lib/auth'

// GET - সকল ব্যবহারকারীর তালিকা (শুধুমাত্র প্রশাসক)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await verifyAuth(request)
    if (!currentUser || !requireRole(currentUser, ['admin', 'hr_manager'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (role) where.role = role
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          isLocked: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              session: { where: { revokedAt: null, expiresAt: { gt: new Date() } }},
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u) => ({
          ...u,
          activeSessions: u._count.session,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - নতুন ব্যবহারকারী তৈরি (শুধুমাত্র প্রশাসক)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await verifyAuth(request)
    if (!currentUser || !requireRole(currentUser, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, name, phone, role } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'supervisor', 'hr_manager', 'accountant', 'store_manager', 'client', 'labour']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

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

    await db.notificationPreference.create({
      data: {
        userId: user.id,
        inApp: true,
        email: true,
        sms: false,
      },
    })

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
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - ব্যবহারকারী আপডেট (শুধুমাত্র প্রশাসক)
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await verifyAuth(request)
    if (!currentUser || !requireRole(currentUser, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, name, phone, role, isActive, password } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const oldValues: Record<string, unknown> = {}
    const newValues: Record<string, unknown> = {}

    if (name !== undefined) {
      oldValues.name = existingUser.name
      updateData.name = name.trim()
      newValues.name = updateData.name
    }
    if (phone !== undefined) {
      oldValues.phone = existingUser.phone
      updateData.phone = phone?.trim() || null
      newValues.phone = updateData.phone
    }
    if (role !== undefined) {
      const validRoles = ['admin', 'supervisor', 'hr_manager', 'accountant', 'store_manager', 'client', 'labour']
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: `Invalid role: ${role}` },
          { status: 400 }
        )
      }
      oldValues.role = existingUser.role
      updateData.role = role
      newValues.role = role
    }
    if (isActive !== undefined) {
      oldValues.isActive = existingUser.isActive
      updateData.isActive = isActive
      newValues.isActive = isActive
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      oldValues,
      newValues,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - ব্যবহারকারী নিষ্ক্রিয় (শুধুমাত্র প্রশাসক)
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await verifyAuth(request)
    if (!currentUser || !requireRole(currentUser, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (id === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // ব্যবহারকারীর সকল সেশন বাতিল করা হচ্ছে
    await db.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    // ব্যবহারকারী নিষ্ক্রিয় করা হচ্ছে
    const user = await db.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, name: true, isActive: true },
    })

    await createAuditLog({
      userId: currentUser.id,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
      oldValues: { isActive: true },
      newValues: { isActive: false },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}