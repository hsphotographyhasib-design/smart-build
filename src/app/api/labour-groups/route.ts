import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const groups = await db.labourGroup.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { labours: { where: { isActive: true } } } },
        labours: {
          where: { isActive: true },
          select: { id: true, name: true, phone: true, aadhaar: true, dailyRate: true, isActive: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: groups })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch labour groups'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, rate } = body

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Group name is required' }, { status: 400 })
    }

    const group = await db.labourGroup.create({
      data: {
        name: name.trim(),
        rate: parseFloat(rate) || 0,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'LabourGroup',
      entityId: group.id,
      newValues: group,
    })

    return NextResponse.json({ success: true, data: group }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create labour group'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}