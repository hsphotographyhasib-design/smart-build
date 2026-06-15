import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, logPermissionAudit } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/roles/[id] — সকল অনুমতিসহ একটি ভূমিকা সংগ্রহ করা হচ্ছে
 * প্রশাসক এবং super_admin অ্যাক্সেস করতে পারবেন।
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

    const role = await db.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      )
    }

    const data = {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      level: role.level,
      isSystem: role.isSystem,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map((rp) => ({
        id: rp.id,
        permissionId: rp.permissionId,
        isAllowed: rp.isAllowed,
        module: rp.permission.module,
        feature: rp.permission.feature,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET /api/roles/[id]]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/roles/[id] — একটি ভূমিকার নাম/বিবরণ/isActive আপডেট করা হচ্ছে
 * শুধুমাত্র super_admin আপডেট করতে পারবেন। সিস্টেম ভূমিকা পরিবর্তন করা যাবে না।
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can update roles' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, description, isActive } = body

    const existing = await db.role.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      )
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify a system role' },
        { status: 400 }
      )
    }

    // পরিবর্তন করলে নামের অনন্যতা যাচাই করা হচ্ছে
    if (name && name !== existing.name) {
      const duplicate = await db.role.findUnique({ where: { name } })
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'A role with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (typeof name === 'string') updateData.name = name
    if (typeof description === 'string' || description === null) updateData.description = description
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    const role = await db.role.update({
      where: { id },
      data: updateData,
    })

    const ipAddress = request.headers.get('x-forwarded-for') ?? undefined
    await logPermissionAudit({
      userId: user.id,
      action: 'role_updated',
      entity: 'role',
      entityId: role.id,
      details: JSON.stringify({
        role: role.code,
        changes: updateData,
      }),
      ipAddress,
    })

    return NextResponse.json({ success: true, data: role })
  } catch (error) {
    console.error('[PUT /api/roles/[id]]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/roles/[id] — একটি ভূমিকা মুছে ফেলা হচ্ছে
 * শুধুমাত্র super_admin মুছতে পারবেন। সিস্টেম ভূমিকা বা ব্যবহারকারী-নির্ধারিত ভূমিকা মুছে ফেলা যাবে না।
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can delete roles' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    const existing = await db.role.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      )
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete a system role' },
        { status: 400 }
      )
    }

    // কোনো ব্যবহারকারী এই ভূমিকায় আছে কিনা যাচাই করা হচ্ছে
    const usersWithRole = await db.user.count({
      where: { role: existing.code },
    })

    if (usersWithRole > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete role: ${usersWithRole} user(s) are assigned to this role. Reassign them first.`,
        },
        { status: 400 }
      )
    }

    await db.role.delete({ where: { id } })

    const ipAddress = request.headers.get('x-forwarded-for') ?? undefined
    await logPermissionAudit({
      userId: user.id,
      action: 'role_deleted',
      entity: 'role',
      entityId: id,
      details: JSON.stringify({ name: existing.name, code: existing.code }),
      ipAddress,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('[DELETE /api/roles/[id]]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}