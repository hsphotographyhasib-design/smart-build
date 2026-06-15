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

    const group = await db.labourGroup.findUnique({
      where: { id },
      include: {
        labours: {
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ success: false, error: 'Labour group not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: group })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch labour group'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
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
    const { name, rate, isActive } = body

    const existing = await db.labourGroup.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Labour group not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (rate !== undefined) updateData.rate = parseFloat(rate) || 0
    if (isActive !== undefined) updateData.isActive = isActive

    const group = await db.labourGroup.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'LabourGroup',
      entityId: id,
      oldValues: existing,
      newValues: group,
    })

    return NextResponse.json({ success: true, data: group })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update labour group'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.labourGroup.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Labour group not found' }, { status: 404 })
    }

    await db.labourGroup.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'LabourGroup',
      entityId: id,
      oldValues: existing,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete labour group'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}