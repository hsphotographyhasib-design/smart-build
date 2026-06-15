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
      // ১. সক্রিয় সময়সূচির সংখ্যা
      db.schedule.count({ where: { status: 'active' } }),

      // ২. বিলম্বিত কাজের সংখ্যা
      db.scheduleActivity.count({ where: { status: 'delayed' } }),

      // ৩. আসন্ন মাইলফলক (পরবর্তী ৩০ দিন)
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

      // ৪. গুরুত্বপূর্ণ কার্যক্রমের সংখ্যা
      db.scheduleActivity.count({ where: { isCritical: true } }),

      // ৫. সম্পন্ন কার্যক্রমের সংখ্যা
      db.scheduleActivity.count({ where: { status: 'completed' } }),

      // ৬. গড় প্রকল্প সম্পন্নের শতাংশ
      db.schedule.aggregate({
        where: { status: { in: ['active', 'published'] } },
        _avg: { completionPct: true },
      }),

      // ৭. পূর্বরূপ কার্যক্রম (পরবর্তী ২ সপ্তাহ)
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

      // ৮. সম্পদ বরাদ্দ (দ্বন্দ্ব সনাক্তকরণের জন্য)
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

      // ৯. গড় সময়সূচি স্বাস্থ্য স্কোর
      db.schedule.aggregate({
        where: { status: { in: ['active', 'published'] } },
        _avg: { healthScore: true },
      }),

      // ১০. সাম্প্রতিক সময়সূচি কার্যক্রম
      db.scheduleActivity.findMany({
        include: {
          schedule: { select: { id: true, name: true, scheduleNo: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ])

    // সম্পদ দ্বন্দ্ব সনাক্তকরণ: একই সম্পদ অতিক্রান্ত কার্যক্রমে বরাদ্দকৃত
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

    // গুরুত্বপূর্ণ কার্যক্রমের তালিকা আনা হচ্ছে
    const criticalActivitiesList = await db.scheduleActivity.findMany({
      where: { isCritical: true, status: { in: ['in_progress', 'delayed', 'not_started'] } },
      include: {
        schedule: { select: { id: true, name: true, scheduleNo: true } },
      },
      orderBy: { finishDate: 'asc' },
      take: 10,
    })

    // সাম্প্রতিক কার্যক্রমগুলো ড্যাশবোর্ডের প্রত্যাশিত বিন্যাসে ম্যাপ করা হচ্ছে
    const recentActivityList = recentActivities.map((a: any) => ({
      id: a.id,
      text: a.name,
      time: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
      type: a.status || 'updated',
    }))

    // মাইলফলকগুলো ড্যাশবোর্ডের প্রত্যাশিত বিন্যাসে ম্যাপ করা হচ্ছে
    const upcomingMilestoneList = upcomingMilestones.map((m: any) => ({
      id: m.id,
      name: m.name,
      date: m.date,
      scheduleName: m.schedule?.name || '',
      projectName: m.project?.name || '',
      status: m.status,
      daysRemaining: Math.ceil((new Date(m.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }))

    // গুরুত্বপূর্ণ কার্যক্রমগুলো ড্যাশবোর্ডের প্রত্যাশিত বিন্যাসে ম্যাপ করা হচ্ছে
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
        // কর্মক্ষমতা সূচক (KPI) মান
        activeSchedules: activeSchedulesCount,
        delayedTasks: delayedTasksCount,
        upcomingMilestones: upcomingMilestones.length,
        criticalActivities: criticalActivitiesCount,
        avgCompletionPct: scheduleCompletionStats._avg.completionPct ?? 0,
        scheduleHealthScore: healthScoreStats._avg.healthScore ?? 100,
        // প্রবণতা মান (এখনও ঐতিহাসিক তথ্য নেই, ডিফল্ট ০)
        activeSchedulesChange: 0,
        delayedTasksChange: 0,
        upcomingMilestonesChange: 0,
        criticalActivitiesChange: 0,
        avgCompletionChange: 0,
        healthScoreChange: 0,
        // তালিকা তথ্য
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