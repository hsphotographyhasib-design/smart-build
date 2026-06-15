import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, logPermissionAudit } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/roles/[id]/permissions — একটি ভূমিকার জন্য অনুমতি ম্যাট্রিক্স সংগ্রহ করা হচ্ছে
 * নেস্টেড অবজেক্ট প্রদান করে: { module: { feature: { action: boolean } } }
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

    // অনুমোদিত ভূমিকা অনুমতি থেকে ম্যাট্রিক্স তৈরি করা হচ্ছে
    const matrix: Record<string, Record<string, Record<string, boolean>>> = {}

    for (const rp of role.permissions) {
      if (!rp.isAllowed) continue
      const { module, feature, action } = rp.permission

      if (!matrix[module]) matrix[module] = {}
      if (!matrix[module][feature]) matrix[module][feature] = {}
      matrix[module][feature][action] = true
    }

    // সকল অনুমতি সংগ্রহ করে সব কার্য বিদ্যমান কিনা নিশ্চিত করা হচ্ছে (false হলেও)
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
 * PUT /api/roles/[id]/permissions — একটি ভূমিকার অনুমতি ম্যাট্রিক্স আপডেট করা হচ্ছে
 * Body: { "finance.invoice_management.create": true, ... }
 * শুধুমাত্র super_admin। super_admin এর নিজের অনুমতি পরিবর্তন করা যাবে না।
 * সকল পরিবর্তন PermissionAuditLog এ লগ করা হয়। একটি ট্রানজ্যাকশন ব্যবহার করা হয়।
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

    // ফ্ল্যাট কীগুলো { module, feature, action, isAllowed }[] তে পার্স করা হচ্ছে
    const changes: { module: string; feature: string; action: string; isAllowed: boolean }[] = []
    for (const [key, isAllowed] of Object.entries(body)) {
      const parts = key.split('.')
      if (parts.length !== 3) continue
      changes.push({ module: parts[0], feature: parts[1], action: parts[2], isAllowed })
    }

    // এই ভূমিকার জন্য বিদ্যমান অনুমতি সংগ্রহ করা হচ্ছে
    const existingRPs = await db.rolePermission.findMany({
      where: { roleId: id },
      include: { permission: true },
    })

    // বিদ্যমান একটি মানচিত্র তৈরি করা হচ্ছে: "module:feature:action" → RolePermission
    const existingMap = new Map<string, (typeof existingRPs)[number]>()
    for (const rp of existingRPs) {
      const key = `${rp.permission.module}:${rp.permission.feature}:${rp.permission.action}`
      existingMap.set(key, rp)
    }

    const grantedKeys: string[] = []
    const revokedKeys: string[] = []

    await db.$transaction(async (tx) => {
      // প্রতিটি পরিবর্তনের জন্য, RolePermission তৈরি বা আপডেট করা হচ্ছে
      for (const change of changes) {
        const mapKey = `${change.module}:${change.feature}:${change.action}`

        // অনুমতি রেকর্ড খোঁজা বা তৈরি করা হচ্ছে
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
              // পূর্বে অস্বীকৃত অনুমতি পুনরায় সক্রিয় করা হচ্ছে
              await tx.rolePermission.update({
                where: { id: existingRP.id },
                data: { isAllowed: true },
              })
              grantedKeys.push(mapKey)
            }
          } else {
            // নতুন ভূমিকা অনুমতি তৈরি করা হচ্ছে
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
            // অনুমতি বাতিল করা হচ্ছে (false সেট করা হচ্ছে, রেকর্ড রাখা হচ্ছে)
            await tx.rolePermission.update({
              where: { id: existingRP.id },
              data: { isAllowed: false },
            })
            revokedKeys.push(mapKey)
          }
        }
      }
    })

    // অডিট লগ
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