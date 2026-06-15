import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, logPermissionAudit } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/roles/[id]/permissions — Get permission matrix for a role
 * Returns nested object: { module: { feature: { action: boolean } } }
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

    // Build the matrix from allowed role permissions
    const matrix: Record<string, Record<string, Record<string, boolean>>> = {}

    for (const rp of role.permissions) {
      if (!rp.isAllowed) continue
      const { module, feature, action } = rp.permission

      if (!matrix[module]) matrix[module] = {}
      if (!matrix[module][feature]) matrix[module][feature] = {}
      matrix[module][feature][action] = true
    }

    // Ensure all actions exist (even if false) by fetching all permissions
    const allPermissions = await db.permission.findMany({
      select: { module: true, feature: true, action: true },
    })

    for (const p of allPermissions) {
      if (!matrix[p.module]) matrix[p.module] = {}
      if (!matrix[p.module][p.feature]) matrix[p.module][p.feature] = {}
      if (matrix[p.module][p.feature][p.action] === undefined) {
        matrix[p.module][p.feature][p.action] = false
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        role: { id: role.id, name: role.name, code: role.code, isSystem: role.isSystem },
        matrix,
      },
    })
  } catch (error) {
    console.error('[GET /api/roles/[id]/permissions]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/roles/[id]/permissions — Update permission matrix for a role
 * Body: { "finance.invoice_management.create": true, ... }
 * Only super_admin. Cannot modify super_admin's own permissions.
 * Logs all changes to PermissionAuditLog. Uses a transaction.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can modify permissions' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    const role = await db.role.findUnique({ where: { id } })
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      )
    }

    if (role.code === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot modify super admin permissions' },
        { status: 400 }
      )
    }

    const body: Record<string, boolean> = await request.json()
    const ipAddress = request.headers.get('x-forwarded-for') ?? undefined

    // Parse the flat keys into { module, feature, action, isAllowed }[]
    const changes: { module: string; feature: string; action: string; isAllowed: boolean }[] = []
    for (const [key, isAllowed] of Object.entries(body)) {
      const parts = key.split('.')
      if (parts.length !== 3) continue
      changes.push({ module: parts[0], feature: parts[1], action: parts[2], isAllowed })
    }

    // Fetch existing permissions for this role
    const existingRPs = await db.rolePermission.findMany({
      where: { roleId: id },
      include: { permission: true },
    })

    // Build a map of existing: "module:feature:action" → RolePermission
    const existingMap = new Map<string, (typeof existingRPs)[number]>()
    for (const rp of existingRPs) {
      const key = `${rp.permission.module}:${rp.permission.feature}:${rp.permission.action}`
      existingMap.set(key, rp)
    }

    const grantedKeys: string[] = []
    const revokedKeys: string[] = []

    await db.$transaction(async (tx) => {
      // For each change, create or update the RolePermission
      for (const change of changes) {
        const mapKey = `${change.module}:${change.feature}:${change.action}`

        // Find or create the permission record
        let permission = await tx.permission.findUnique({
          where: {
            module_feature_action: {
              module: change.module,
              feature: change.feature,
              action: change.action,
            },
          },
        })

        if (!permission) {
          permission = await tx.permission.create({
            data: {
              module: change.module,
              feature: change.feature,
              action: change.action,
            },
          })
        }

        const existingRP = existingMap.get(mapKey)

        if (change.isAllowed) {
          if (existingRP) {
            if (!existingRP.isAllowed) {
              // Re-enable previously denied permission
              await tx.rolePermission.update({
                where: { id: existingRP.id },
                data: { isAllowed: true },
              })
              grantedKeys.push(mapKey)
            }
          } else {
            // Create new role permission
            await tx.rolePermission.create({
              data: {
                roleId: id,
                permissionId: permission.id,
                isAllowed: true,
              },
            })
            grantedKeys.push(mapKey)
          }
        } else {
          if (existingRP && existingRP.isAllowed) {
            // Revoke permission (set to false, keep the record)
            await tx.rolePermission.update({
              where: { id: existingRP.id },
              data: { isAllowed: false },
            })
            revokedKeys.push(mapKey)
          }
        }
      }
    })

    // Audit log
    if (grantedKeys.length > 0 || revokedKeys.length > 0) {
      await logPermissionAudit({
        userId: user.id,
        action: 'permission_updated',
        entity: 'role',
        entityId: id,
        details: JSON.stringify({
          role: role.code,
          granted: grantedKeys,
          revoked: revokedKeys,
          totalChanges: changes.length,
        }),
        ipAddress,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        granted: grantedKeys.length,
        revoked: revokedKeys.length,
        totalChanges: changes.length,
      },
    })
  } catch (error) {
    console.error('[PUT /api/roles/[id]/permissions]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}