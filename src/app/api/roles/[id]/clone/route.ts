import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, logPermissionAudit } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/roles/[id]/clone — সকল অনুমতিসহ একটি ভূমিকা ক্লোন করা হচ্ছে
 * শুধুমাত্র super_admin।
 * Body: { name: "নতুন ভূমিকার নাম", code: "new_role_code" }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can clone roles' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, code, description } = body

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // উৎস ভূমিকা বিদ্যমান কিনা যাচাই করা হচ্ছে
    const sourceRole = await db.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    })

    if (!sourceRole) {
      return NextResponse.json(
        { success: false, error: 'Source role not found' },
        { status: 404 }
      )
    }

    // নাম এবং কোডের অনন্যতা যাচাই করা হচ্ছে
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

    const ipAddress = request.headers.get('x-forwarded-for') ?? undefined

    // একটি ট্রানজ্যাকশনে নতুন ভূমিকা তৈরি করে অনুমতি কপি করা হচ্ছে
    const newRole = await db.$transaction(async (tx) => {
      const created = await tx.role.create({
        data: {
          name,
          code,
          description: description ?? sourceRole.description ?? null,
          level: sourceRole.level,
          isActive: true,
          isSystem: false,
        },
      })

      // উৎস থেকে সকল ভূমিকা অনুমতি কপি করা হচ্ছে
      if (sourceRole.permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: sourceRole.permissions.map((rp) => ({
            roleId: created.id,
            permissionId: rp.permissionId,
            isAllowed: rp.isAllowed,
          })),
        })
      }

      return created
    })

    await logPermissionAudit({
      userId: user.id,
      action: 'role_cloned',
      entity: 'role',
      entityId: newRole.id,
      details: JSON.stringify({
        sourceRole: sourceRole.code,
        newRole: newRole.code,
        permissionsCopied: sourceRole.permissions.length,
      }),
      ipAddress,
    })

    return NextResponse.json({ success: true, data: newRole }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/roles/[id]/clone]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}