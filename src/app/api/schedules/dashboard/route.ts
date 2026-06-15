import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const [
      activeSchedulesCount,
      delayedTasksCount,
      upcomingMilestones,
      criticalActivitiesCount,
      completedActivitiesCount,
      scheduleCompletionStats,
      lookaheadActivities,
      resourceAssignments,
      healthScoreStats,
      recentActivities,
    ] = await Promise.all([
      // 1. Active schedules count
      db.schedule.count({ where: { status: 'active' } }),

      // 2. Delayed tasks count
      db.scheduleActivity.count({ where: { status: 'delayed' } }),

      // 3. Upcoming milestones (next 30 days)
      db.scheduleMilestone.findMany({
        where: {
          status: { in: ['pending', 'delayed'] },
          date: { gte: now, lte: thirtyDaysFromNow },
        },
        include: {
          schedule: { select: { id: true, name: true, scheduleNo: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { date: 'asc' },
        take: 20,
      }),

      // 4. Critical activities count
      db.scheduleActivity.count({ where: { isCritical: true } }),

      // 5. Completed activities count
      db.scheduleActivity.count({ where: { status: 'completed' } }),

      // 6. Average project completion %
      db.schedule.aggregate({
        where: { status: { in: ['active', 'published'] } },
        _avg: { completionPct: true },
      }),

      // 7. Lookahead activities (next 2 weeks)
      db.scheduleActivity.findMany({
        where: {
          status: { in: ['not_started', 'in_progress'] },
          startDate: { gte: now, lte: twoWeeksFromNow },
        },
        include: {
          schedule: { select: { id: true, name: true, scheduleNo: true } },
          resourceAssignments: {
            select: { id: true, resourceType: true, resourceName: true, quantity: true, unit: true },
          },
        },
        orderBy: { startDate: 'asc' },
        take: 50,
      }),

      // 8. Resource assignments (for conflict detection)
      db.scheduleResourceAssignment.findMany({
        where: {
          startDate: { lte: twoWeeksFromNow },
        },
        include: {
          activity: { select: { id: true, name: true, startDate: true, finishDate: true } },
          schedule: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),

      // 9. Average schedule health score
      db.schedule.aggregate({
        where: { status: { in: ['active', 'published'] } },
        _avg: { healthScore: true },
      }),

      // 10. Recent schedule activities
      db.scheduleActivity.findMany({
        include: {
          schedule: { select: { id: true, name: true, scheduleNo: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ])

    // Detect resource conflicts: same resource assigned to overlapping activities
    const resourceMap = new Map<string, typeof resourceAssignments[0][]>()
    for (const ra of resourceAssignments) {
      const key = `${ra.resourceType}:${ra.resourceId}`
      if (!resourceMap.has(key)) resourceMap.set(key, [])
      resourceMap.get(key)!.push(ra)
    }

    const conflicts: Array<{
      resourceId: string
      resourceName: string
      resourceType: string
      activities: Array<{ id: string; name: string; startDate: Date | null; finishDate: Date | null }>
    }> = []

    for (const [, assignments] of resourceMap) {
      if (assignments.length < 2) continue
      for (let i = 0; i < assignments.length; i++) {
        for (let j = i + 1; j < assignments.length; j++) {
          const a = assignments[i]
          const b = assignments[j]
          const aStart = a.startDate?.getTime() ?? 0
          const aEnd = a.endDate?.getTime() ?? Infinity
          const bStart = b.startDate?.getTime() ?? 0
          const bEnd = b.endDate?.getTime() ?? Infinity
          if (aStart <= bEnd && bStart <= aEnd) {
            conflicts.push({
              resourceId: a.resourceId,
              resourceName: a.resourceName,
              resourceType: a.resourceType,
              activities: [a, b].map((x) => ({
                id: x.activity.id,
                name: x.activity.name,
                startDate: x.activity.startDate,
                finishDate: x.activity.finishDate,
              })),
            })
          }
        }
      }
    }

    // Fetch critical activities list
    const criticalActivitiesList = await db.scheduleActivity.findMany({
      where: { isCritical: true, status: { in: ['in_progress', 'delayed', 'not_started'] } },
      include: {
        schedule: { select: { id: true, name: true, scheduleNo: true } },
      },
      orderBy: { finishDate: 'asc' },
      take: 10,
    })

    // Map recent activities to the format expected by the dashboard
    const recentActivityList = recentActivities.map((a: any) => ({
      id: a.id,
      text: a.name,
      time: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
      type: a.status || 'updated',
    }))

    // Map milestones to the format expected by the dashboard
    const upcomingMilestoneList = upcomingMilestones.map((m: any) => ({
      id: m.id,
      name: m.name,
      date: m.date,
      scheduleName: m.schedule?.name || '',
      projectName: m.project?.name || '',
      status: m.status,
      daysRemaining: Math.ceil((new Date(m.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }))

    // Map critical activities to the format expected by the dashboard
    const criticalActivityList = criticalActivitiesList.map((a: any) => ({
      id: a.id,
      name: a.name,
      activityId: a.id,
      scheduleName: a.schedule?.name || '',
      progress: a.progressPct || 0,
      status: a.status,
      endDate: a.finishDate || '',
    }))

    return NextResponse.json({
      success: true,
      data: {
        // KPI values
        activeSchedules: activeSchedulesCount,
        delayedTasks: delayedTasksCount,
        upcomingMilestones: upcomingMilestones.length,
        criticalActivities: criticalActivitiesCount,
        avgCompletionPct: scheduleCompletionStats._avg.completionPct ?? 0,
        scheduleHealthScore: healthScoreStats._avg.healthScore ?? 100,
        // Trend values (no historical data yet, default to 0)
        activeSchedulesChange: 0,
        delayedTasksChange: 0,
        upcomingMilestonesChange: 0,
        criticalActivitiesChange: 0,
        avgCompletionChange: 0,
        healthScoreChange: 0,
        // List data
        upcomingMilestoneList,
        criticalActivityList,
        recentActivities: recentActivityList,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}