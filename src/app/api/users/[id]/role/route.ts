import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, logPermissionAudit } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/users/[id]/role — Get a user's current role info
 * Admin and super_admin can access.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await verifyAuth(request)
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const role = await db.role.findUnique({
      where: { code: targetUser.role },
      select: { id: true, name: true, code: true, description: true, level: true, isSystem: true },
    })

    const data = {
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email },
      role: role ?? { code: targetUser.role, name: targetUser.role },
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET /api/users/[id]/role]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/[id]/role — Change a user's role
 * Body: { roleId: "role_code_string" } (the role.code, not role.id)
 * Only super_admin. Cannot change own role to non-super_admin.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can change user roles' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = await request.json()
    const { roleId } = body

    if (!roleId || typeof roleId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'roleId (role code) is required' },
        { status: 400 }
      )
    }

    // Find target user
    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate the target role exists
    const targetRole = await db.role.findUnique({
      where: { code: roleId },
    })

    if (!targetRole) {
      return NextResponse.json(
        { success: false, error: `Role "${roleId}" does not exist` },
        { status: 400 }
      )
    }

    // Cannot change own role to non-super_admin
    if (user.id === id && roleId !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own role to a non-super admin role' },
        { status: 400 }
      )
    }

    const previousRole = targetUser.role
    const ipAddress = request.headers.get('x-forwarded-for') ?? undefined

    await db.user.update({
      where: { id },
      data: { role: roleId },
    })

    await logPermissionAudit({
      userId: user.id,
      action: 'user_role_changed',
      entity: 'user_role',
      entityId: id,
      details: JSON.stringify({
        targetUser: targetUser.email ?? targetUser.name,
        previousRole,
        newRole: roleId,
      }),
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: id,
        previousRole,
        newRole: roleId,
      },
    })
  } catch (error) {
    console.error('[PUT /api/users/[id]/role]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}