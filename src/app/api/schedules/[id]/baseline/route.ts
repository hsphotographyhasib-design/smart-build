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

    // Fetch the source schedule with all activities and dependencies
    const sourceSchedule = await db.schedule.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { order: 'asc' },
        },
        dependencies: true,
        milestones: true,
        calendars: true,
      },
    })

    if (!sourceSchedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    // Generate baseline schedule number
    const year = new Date().getFullYear()
    const prefix = 'SCH'
    const count = await db.schedule.count({
      where: { scheduleNo: { startsWith: `${prefix}-${year}` } },
    })
    const scheduleNo = `${prefix}-${year}-${String(count + 1).padStart(7, '0')}`

    // Create baseline schedule
    const baselineSchedule = await db.schedule.create({
      data: {
        scheduleNo,
        name: `${sourceSchedule.name} - Baseline`,
        projectId: sourceSchedule.projectId,
        scheduleType: 'baseline',
        parentScheduleId: sourceSchedule.id,
        status: 'published',
        startDate: sourceSchedule.startDate,
        endDate: sourceSchedule.endDate,
        totalDuration: sourceSchedule.totalDuration,
        totalActivities: sourceSchedule.totalActivities,
        completionPct: sourceSchedule.completionPct,
        healthScore: sourceSchedule.healthScore,
        description: `Baseline created from "${sourceSchedule.name}" (${sourceSchedule.scheduleNo})`,
        createdById: authUser.id,
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    // Build a map of old activity id -> new activity id for dependency mapping
    const activityIdMap = new Map<string, string>()

    // Clone activities to baseline
    for (const activity of sourceSchedule.activities) {
      const newActivity = await db.scheduleActivity.create({
        data: {
          activityId: activity.activityId,
          scheduleId: baselineSchedule.id,
          name: activity.name,
          description: activity.description,
          taskType: activity.taskType,
          parentId: null, // Will set parent mapping after all created
          startDate: activity.startDate,
          finishDate: activity.finishDate,
          duration: activity.duration,
          originalDuration: activity.originalDuration,
          progress: activity.progress,
          plannedProgress: activity.plannedProgress,
          actualProgress: activity.actualProgress,
          status: activity.status,
          priority: activity.priority,
          isCritical: activity.isCritical,
          isOnCriticalPath: activity.isOnCriticalPath,
          totalFloat: activity.totalFloat,
          freeFloat: activity.freeFloat,
          floatDays: activity.floatDays,
          earlyStart: activity.earlyStart,
          earlyFinish: activity.earlyFinish,
          lateStart: activity.lateStart,
          lateFinish: activity.lateFinish,
          physicalComplete: activity.physicalComplete,
          weight: activity.weight,
          order: activity.order,
          wbsCode: activity.wbsCode,
          costCode: activity.costCode,
          budget: activity.budget,
          actualCost: activity.actualCost,
          notes: activity.notes,
          projectId: activity.projectId,
          taskRefId: activity.taskRefId,
          createdById: authUser.id,
        },
      })

      activityIdMap.set(activity.id, newActivity.id)
    }

    // Fix parent relationships
    for (const activity of sourceSchedule.activities) {
      if (activity.parentId && activityIdMap.has(activity.parentId)) {
        await db.scheduleActivity.update({
          where: { id: activityIdMap.get(activity.id)! },
          data: { parentId: activityIdMap.get(activity.parentId)! },
        })
      }
    }

    // Clone dependencies
    for (const dep of sourceSchedule.dependencies) {
      const newPredId = activityIdMap.get(dep.predecessorId)
      const newSuccId = activityIdMap.get(dep.successorId)
      if (newPredId && newSuccId) {
        await db.scheduleDependency.create({
          data: {
            scheduleId: baselineSchedule.id,
            predecessorId: newPredId,
            successorId: newSuccId,
            depType: dep.depType,
            lagDays: dep.lagDays,
            leadDays: dep.leadDays,
            isHardConstraint: dep.isHardConstraint,
          },
        })
      }
    }

    // Clone milestones
    for (const milestone of sourceSchedule.milestones) {
      await db.scheduleMilestone.create({
        data: {
          scheduleId: baselineSchedule.id,
          name: milestone.name,
          description: milestone.description,
          date: milestone.date,
          type: milestone.type,
          status: milestone.status,
          projectId: milestone.projectId,
          weight: milestone.weight,
          notes: milestone.notes,
        },
      })
    }

    // Clone calendars
    for (const calendar of sourceSchedule.calendars) {
      await db.scheduleCalendar.create({
        data: {
          scheduleId: baselineSchedule.id,
          name: calendar.name,
          calendarType: calendar.calendarType,
          startDate: calendar.startDate,
          endDate: calendar.endDate,
          workingDays: calendar.workingDays,
          shiftStart: calendar.shiftStart,
          shiftEnd: calendar.shiftEnd,
          hoursPerDay: calendar.hoursPerDay,
          isDefault: calendar.isDefault,
          description: calendar.description,
        },
      })
    }

    // Update source schedule to point to baseline
    await db.schedule.update({
      where: { id },
      data: { baselineScheduleId: baselineSchedule.id },
    })

    // Also create a snapshot of the current state
    const snapshotData = {
      source: { id, scheduleNo: sourceSchedule.scheduleNo, name: sourceSchedule.name },
      activitiesCount: sourceSchedule.activities.length,
      dependenciesCount: sourceSchedule.dependencies.length,
      milestonesCount: sourceSchedule.milestones.length,
      takenAt: new Date().toISOString(),
    }

    await db.scheduleSnapshot.create({
      data: {
        scheduleId: id,
        name: `Baseline Snapshot - ${new Date().toISOString().slice(0, 10)}`,
        snapshotType: 'baseline',
        data: JSON.stringify(snapshotData),
        takenById: authUser.id,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE_BASELINE',
      entity: 'Schedule',
      entityId: baselineSchedule.id,
      newValues: {
        baselineScheduleNo: scheduleNo,
        sourceScheduleId: id,
        activitiesCloned: sourceSchedule.activities.length,
      },
    })

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(baselineSchedule)),
      stats: {
        activitiesCloned: sourceSchedule.activities.length,
        dependenciesCloned: sourceSchedule.dependencies.length,
        milestonesCloned: sourceSchedule.milestones.length,
        calendarsCloned: sourceSchedule.calendars.length,
      },
    }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create baseline'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}