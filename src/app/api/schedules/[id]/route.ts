import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const schedule = await db.schedule.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        parentSchedule: { select: { id: true, name: true, scheduleNo: true } },
        baselineSchedule: { select: { id: true, name: true, scheduleNo: true } },
        activities: {
          include: {
            children: true,
            resourceAssignments: { select: { id: true, resourceType: true, resourceName: true, quantity: true } },
          },
          orderBy: { order: 'asc' },
        },
        milestones: { orderBy: { date: 'asc' } },
        calendars: { where: { isDefault: true } },
        delays: { where: { status: 'open' } },
        _count: { select: { snapshots: true, comments: true, attachments: true, dependencies: true } },
      },
    })

    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(schedule)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch schedule'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.schedule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, scheduleType, description, startDate, endDate, notes, healthScore } = body

    // তারিখ পরিবর্তন হলে মোট সময়কাল গণনা করা হচ্ছে
    let totalDuration = existing.totalDuration
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      totalDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }

    // কার্যক্রম থেকে সম্পন্নের শতাংশ পুনঃগণনা করা হচ্ছে
    const activityStats = await db.scheduleActivity.aggregate({
      where: { scheduleId: id, taskType: { not: 'summary' } },
      _avg: { progress: true },
      _count: true,
    })
    const completionPct = activityStats._count > 0 ? Math.round((activityStats._avg.progress || 0) * 100) / 100 : 0

    // মোট কার্যক্রম পুনঃগণনা করা হচ্ছে
    const totalActivities = await db.scheduleActivity.count({ where: { scheduleId: id } })

    const updateData: Record<string, unknown> = {
      name: name ?? existing.name,
      scheduleType: scheduleType ?? existing.scheduleType,
      description: description !== undefined ? description : existing.description,
      startDate: startDate ? new Date(startDate) : existing.startDate,
      endDate: endDate ? new Date(endDate) : existing.endDate,
      totalDuration,
      notes: notes !== undefined ? notes : existing.notes,
      healthScore: healthScore !== undefined ? healthScore : existing.healthScore,
      completionPct,
      totalActivities,
    }

    const schedule = await db.schedule.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'Schedule',
      entityId: id,
      oldValues: { name: existing.name, completionPct: existing.completionPct },
      newValues: { name: schedule.name, completionPct: schedule.completionPct },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(schedule)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update schedule'
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
    const existing = await db.schedule.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Only draft schedules can be deleted' },
        { status: 400 }
      )
    }

    await db.schedule.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'Schedule',
      entityId: id,
      oldValues: { scheduleNo: existing.scheduleNo, name: existing.name },
    })

    return NextResponse.json({ success: true, data: { message: 'Schedule deleted successfully' } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete schedule'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}