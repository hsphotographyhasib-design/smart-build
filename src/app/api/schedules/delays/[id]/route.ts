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
    const existing = await db.scheduleDelay.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Delay not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, delayType, impactDays, impactType, startDate, endDate, status, recoveryPlan, eotRequested, eotDays, costImpact } = body

    const delay = await db.scheduleDelay.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description !== undefined ? description : existing.description,
        delayType: delayType ?? existing.delayType,
        impactDays: impactDays !== undefined ? impactDays : existing.impactDays,
        impactType: impactType ?? existing.impactType,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        status: status ?? existing.status,
        recoveryPlan: recoveryPlan !== undefined ? recoveryPlan : existing.recoveryPlan,
        eotRequested: eotRequested !== undefined ? eotRequested : existing.eotRequested,
        eotDays: eotDays !== undefined ? eotDays : existing.eotDays,
        costImpact: costImpact !== undefined ? costImpact : existing.costImpact,
      },
      include: {
        activity: { select: { id: true, activityId: true, name: true } },
        reportedBy: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'ScheduleDelay',
      entityId: id,
      oldValues: { title: existing.title, status: existing.status, impactDays: existing.impactDays },
      newValues: { title: delay.title, status: delay.status, impactDays: delay.impactDays },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(delay)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update delay'
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
    const existing = await db.scheduleDelay.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Delay not found' }, { status: 404 })
    }

    await db.scheduleDelay.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'ScheduleDelay',
      entityId: id,
      oldValues: { title: existing.title },
    })

    return NextResponse.json({ success: true, data: { message: 'Delay deleted successfully' } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete delay'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}