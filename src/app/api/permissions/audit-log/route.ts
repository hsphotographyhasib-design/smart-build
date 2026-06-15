import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

/**
 * GET /api/permissions/audit-log — পৃষ্ঠাযুক্ত অনুমতি অডিট লগ সংগ্রহ করা হচ্ছে
 * শুধুমাত্র super_admin।
 * কোয়েরি প্যারামিটার: page, limit, action, userId
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admin can view audit logs' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20))
    const action = searchParams.get('action') ?? undefined
    const userId = searchParams.get('userId') ?? undefined

    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (userId) where.userId = userId

    const [logs, total] = await Promise.all([
      db.permissionAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.permissionAuditLog.count({ where }),
    ])

    // প্রত্যাবর্তিত লগের জন্য ব্যবহারকারী নাম একসাথে সমাধান করা হচ্ছে
    const userIds = [...new Set(logs.map((l) => l.userId).filter((id): id is string => !!id))]
    const userMap = new Map<string, { name: string; email: string }>()
    if (userIds.length > 0) {
      const users = await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
      for (const u of users) {
        userMap.set(u.id, { name: u.name, email: u.email })
      }
    }

    const data = logs.map((log) => {
      const userInfo = log.userId ? userMap.get(log.userId) : null
      return {
        id: log.id,
        userId: log.userId,
        userName: userInfo?.name ?? null,
        userEmail: userInfo?.email ?? null,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        details: log.details,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        logs: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/permissions/audit-log]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}