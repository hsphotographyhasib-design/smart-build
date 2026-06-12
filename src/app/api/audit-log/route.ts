import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const entity = searchParams.get('entity')
    const action = searchParams.get('action')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (entity) where.entity = entity
    if (action) where.action = action
    if (startDate || endDate) {
      where.createdAt = {} as Record<string, unknown>
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate)
    }

    const [items, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ])

    const data = items.map((log) => ({
      id: log.id,
      userId: log.userId,
      user: log.user,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data, total, page, limit })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}