import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function POST(
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
        activities: {
          include: {
            predecessors: true,
            successors: true,
            resourceAssignments: true,
          },
          orderBy: { order: 'asc' },
        },
        milestones: true,
        calendars: true,
        delays: true,
      },
    })

    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const body = await request.json()
    const snapshotName = body.name || `Snapshot ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`
    const snapshotType = body.snapshotType || 'manual'

    // Serialize current state
    const snapshotData = {
      schedule: {
        name: schedule.name,
        scheduleNo: schedule.scheduleNo,
        scheduleType: schedule.scheduleType,
        status: schedule.status,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        totalDuration: schedule.totalDuration,
        completionPct: schedule.completionPct,
        healthScore: schedule.healthScore,
        version: schedule.version,
        revision: schedule.revision,
      },
      activities: schedule.activities.map((a) => ({
        activityId: a.activityId,
        name: a.name,
        taskType: a.taskType,
        parentId: a.parentId,
        startDate: a.startDate,
        finishDate: a.finishDate,
        duration: a.duration,
        originalDuration: a.originalDuration,
        progress: a.progress,
        plannedProgress: a.plannedProgress,
        actualProgress: a.actualProgress,
        status: a.status,
        priority: a.priority,
        isCritical: a.isCritical,
        isOnCriticalPath: a.isOnCriticalPath,
        totalFloat: a.totalFloat,
        freeFloat: a.freeFloat,
        earlyStart: a.earlyStart,
        earlyFinish: a.earlyFinish,
        lateStart: a.lateStart,
        lateFinish: a.lateFinish,
        wbsCode: a.wbsCode,
        costCode: a.costCode,
        budget: a.budget,
        actualCost: a.actualCost,
        order: a.order,
        weight: a.weight,
      })),
      dependencies: schedule.delays ? [] : [],
      milestones: schedule.milestones.map((m) => ({
        name: m.name,
        date: m.date,
        type: m.type,
        status: m.status,
      })),
      takenAt: new Date().toISOString(),
      takenBy: authUser.name,
    }

    // Serialize dependencies separately
    const deps = await db.scheduleDependency.findMany({
      where: { scheduleId: id },
    })
    snapshotData.dependencies = deps.map((d) => ({
      predecessorId: d.predecessorId,
      successorId: d.successorId,
      depType: d.depType,
      lagDays: d.lagDays,
      leadDays: d.leadDays,
    }))

    const snapshot = await db.scheduleSnapshot.create({
      data: {
        scheduleId: id,
        name: snapshotName,
        snapshotType,
        data: JSON.stringify(snapshotData),
        takenById: authUser.id,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'ScheduleSnapshot',
      entityId: snapshot.id,
      newValues: { name: snapshotName, snapshotType, scheduleId: id },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(snapshot)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create snapshot'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}