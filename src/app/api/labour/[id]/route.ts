import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

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

    const existing = await db.labour.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Labour not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null
    if (body.aadhaar !== undefined) updateData.aadhaar = body.aadhaar?.trim() || null
    if (body.dailyRate !== undefined) updateData.dailyRate = parseFloat(body.dailyRate) || 0
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const labour = await db.labour.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'Labour',
      entityId: id,
      oldValues: existing,
      newValues: labour,
    })

    return NextResponse.json({ success: true, data: labour })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update labour'
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

    const existing = await db.labour.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Labour not found' }, { status: 404 })
    }

    await db.labour.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'Labour',
      entityId: id,
      oldValues: existing,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete labour'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}