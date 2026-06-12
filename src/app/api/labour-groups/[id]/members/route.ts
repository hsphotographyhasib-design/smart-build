import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const members = await db.labour.findMany({
      where: { groupId: id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: members })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch labour members'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, phone, aadhaar, dailyRate } = body

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Labour name is required' }, { status: 400 })
    }

    const group = await db.labourGroup.findUnique({ where: { id } })
    if (!group) {
      return NextResponse.json({ success: false, error: 'Labour group not found' }, { status: 404 })
    }

    const labour = await db.labour.create({
      data: {
        groupId: id,
        name: name.trim(),
        phone: phone?.trim() || null,
        aadhaar: aadhaar?.trim() || null,
        dailyRate: parseFloat(dailyRate) || group.rate || 0,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Labour',
      entityId: labour.id,
      newValues: labour,
    })

    return NextResponse.json({ success: true, data: labour }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create labour member'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}