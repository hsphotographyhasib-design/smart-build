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
    const existing = await db.scheduleDependency.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Dependency not found' }, { status: 404 })
    }

    const body = await request.json()
    const { depType, lagDays, leadDays, isHardConstraint } = body

    const dependency = await db.scheduleDependency.update({
      where: { id },
      data: {
        depType: depType ?? existing.depType,
        lagDays: lagDays !== undefined ? lagDays : existing.lagDays,
        leadDays: leadDays !== undefined ? leadDays : existing.leadDays,
        isHardConstraint: isHardConstraint !== undefined ? isHardConstraint : existing.isHardConstraint,
      },
      include: {
        predecessor: { select: { id: true, activityId: true, name: true } },
        successor: { select: { id: true, activityId: true, name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'ScheduleDependency',
      entityId: id,
      oldValues: { depType: existing.depType, lagDays: existing.lagDays },
      newValues: { depType: dependency.depType, lagDays: dependency.lagDays },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(dependency)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update dependency'
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
    const existing = await db.scheduleDependency.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Dependency not found' }, { status: 404 })
    }

    await db.scheduleDependency.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'ScheduleDependency',
      entityId: id,
      oldValues: { predecessorId: existing.predecessorId, successorId: existing.successorId },
    })

    return NextResponse.json({ success: true, data: { message: 'Dependency deleted successfully' } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete dependency'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}