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

    const activity = await db.scheduleActivity.findUnique({
      where: { id },
      include: {
        schedule: { select: { id: true, name: true, scheduleNo: true, scheduleType: true } },
        parent: { select: { id: true, activityId: true, name: true } },
        children: { orderBy: { order: 'asc' } },
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        predecessors: {
          include: {
            predecessor: { select: { id: true, activityId: true, name: true } },
            successor: { select: { id: true, activityId: true, name: true } },
          },
        },
        successors: {
          include: {
            predecessor: { select: { id: true, activityId: true, name: true } },
            successor: { select: { id: true, activityId: true, name: true } },
          },
        },
        resourceAssignments: {
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          include: { createdBy: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        delays: { orderBy: { createdAt: 'desc' } },
        attachments: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!activity) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(activity)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity'
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
    const existing = await db.scheduleActivity.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name, description, taskType, parentId, startDate, finishDate,
      duration, priority, isCritical, wbsCode, costCode, budget, notes,
      weight, order, actualCost,
    } = body

    // Auto-calculate finish date if duration changed and start exists
    let calculatedFinish = finishDate !== undefined ? (finishDate ? new Date(finishDate) : null) : existing.finishDate
    if (startDate && duration !== undefined && !finishDate) {
      calculatedFinish = new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000)
    }

    const activity = await db.scheduleActivity.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        description: description !== undefined ? description : existing.description,
        taskType: taskType ?? existing.taskType,
        parentId: parentId !== undefined ? parentId : existing.parentId,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        finishDate: calculatedFinish,
        duration: duration !== undefined ? duration : existing.duration,
        priority: priority ?? existing.priority,
        isCritical: isCritical !== undefined ? isCritical : existing.isCritical,
        wbsCode: wbsCode !== undefined ? wbsCode : existing.wbsCode,
        costCode: costCode !== undefined ? costCode : existing.costCode,
        budget: budget !== undefined ? budget : existing.budget,
        notes: notes !== undefined ? notes : existing.notes,
        weight: weight !== undefined ? weight : existing.weight,
        order: order !== undefined ? order : existing.order,
        actualCost: actualCost !== undefined ? actualCost : existing.actualCost,
      },
    })

    // Auto-recalculate schedule completion if progress-relevant fields changed
    if (duration !== undefined || startDate || finishDate) {
      const stats = await db.scheduleActivity.aggregate({
        where: { scheduleId: existing.scheduleId, taskType: { not: 'summary' } },
        _avg: { progress: true },
      })
      await db.schedule.update({
        where: { id: existing.scheduleId },
        data: { completionPct: Math.round((stats._avg.progress || 0) * 100) / 100 },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'ScheduleActivity',
      entityId: id,
      oldValues: { name: existing.name, duration: existing.duration, status: existing.status },
      newValues: { name: activity.name, duration: activity.duration, status: activity.status },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(activity)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update activity'
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
    const existing = await db.scheduleActivity.findUnique({
      where: { id },
      include: { children: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    if (existing.children.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete activity with child activities. Remove children first.' },
        { status: 400 }
      )
    }

    const scheduleId = existing.scheduleId

    await db.scheduleActivity.delete({ where: { id } })

    // Update schedule total activities count
    const totalActivities = await db.scheduleActivity.count({ where: { scheduleId } })
    const stats = await db.scheduleActivity.aggregate({
      where: { scheduleId, taskType: { not: 'summary' } },
      _avg: { progress: true },
    })
    await db.schedule.update({
      where: { id: scheduleId },
      data: {
        totalActivities,
        completionPct: Math.round((stats._avg.progress || 0) * 100) / 100,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'ScheduleActivity',
      entityId: id,
      oldValues: { activityId: existing.activityId, name: existing.name },
    })

    return NextResponse.json({ success: true, data: { message: 'Activity deleted successfully' } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete activity'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}