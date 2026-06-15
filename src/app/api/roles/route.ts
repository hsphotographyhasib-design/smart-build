import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, logPermissionAudit } from '@/lib/auth'

/**
 * GET /api/roles — List all roles with permission count
 * Only admin and super_admin can access.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const roles = await db.role.findMany({
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { permissions: true },
        },
      },
    })

    // Count users per role (User.role is a plain string matching Role.code)
    const allUsers = await db.user.findMany({ select: { role: true } })
    const userCountByRole: Record<string, number> = {}
    for (const u of allUsers) {
      userCountByRole[u.role] = (userCountByRole[u.role] || 0) + 1
    }

    const data = roles.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description,
      level: r.level,
      isSystem: r.isSystem,
      isActive: r.isActive,
      permissionCount: r._count.permissions,
      userCount: userCountByRole[r.code] || 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET /api/roles]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/roles — Create a new role
 * Only super_admin can create roles.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can create roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, code, description, level, isActive } = body

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Validate uniqueness
    const existingName = await db.role.findUnique({ where: { name } })
    if (existingName) {
      return NextResponse.json(
        { success: false, error: 'A role with this name already exists' },
        { status: 409 }
      )
    }

    const existingCode = await db.role.findUnique({ where: { code } })
    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'A role with this code already exists' },
        { status: 409 }
      )
    }

    const role = await db.role.create({
      data: {
        name,
        code,
        description: description ?? null,
        level: typeof level === 'number' ? level : 0,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        isSystem: false,
      },
    })

    const ipAddress = request.headers.get('x-forwarded-for') ?? undefined
    await logPermissionAudit({
      userId: user.id,
      action: 'role_created',
      entity: 'role',
      entityId: role.id,
      details: JSON.stringify({ name: role.name, code: role.code }),
      ipAddress,
    })

    return NextResponse.json({ success: true, data: role }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/roles]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}