import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

/**
 * GET /api/roles/my-permissions — Get current user's permissions as flat object
 * Any authenticated user can access.
 * Super admin returns { _super_admin: true }.
 * Others return { "finance.invoice_management.view": true, ... }
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return NextResponse.json({ success: true, data: { _super_admin: true } })
    }

    // Find the role
    const role = await db.role.findUnique({
      where: { code: user.role },
    })

    if (!role) {
      // Unknown role — return empty
      return NextResponse.json({ success: true, data: {} })
    }

    // Get all allowed permissions
    const rolePermissions = await db.rolePermission.findMany({
      where: {
        roleId: role.id,
        isAllowed: true,
      },
      include: {
        permission: true,
      },
    })

    const data: Record<string, boolean> = {}
    for (const rp of rolePermissions) {
      const key = `${rp.permission.module}.${rp.permission.feature}.${rp.permission.action}`
      data[key] = true
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET /api/roles/my-permissions]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}