import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.scheduleMilestone.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, date, type, status, weight, notes } = body

    const milestone = await db.scheduleMilestone.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        description: description !== undefined ? description : existing.description,
        date: date ? new Date(date) : existing.date,
        type: type ?? existing.type,
        status: status ?? existing.status,
        weight: weight !== undefined ? weight : existing.weight,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'ScheduleMilestone',
      entityId: id,
      oldValues: { name: existing.name, status: existing.status },
      newValues: { name: milestone.name, status: milestone.status },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(milestone)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update milestone'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.scheduleMilestone.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 })
    }

    await db.scheduleMilestone.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'ScheduleMilestone',
      entityId: id,
      oldValues: { name: existing.name },
    })

    return NextResponse.json({ success: true, data: { message: 'Milestone deleted successfully' } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete milestone'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}