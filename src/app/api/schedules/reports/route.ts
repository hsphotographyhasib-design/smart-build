import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'schedule'
    const scheduleId = searchParams.get('scheduleId')
    const projectId = searchParams.get('projectId')

    switch (type) {
      case 'schedule': {
        // Schedule overview report
        const where: Record<string, unknown> = {}
        if (projectId) where.projectId = projectId

        const schedules = await db.schedule.findMany({
          where,
          include: {
            project: { select: { id: true, name: true, code: true } },
            _count: { select: { activities: true, milestones: true, delays: true, dependencies: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        const statusBreakdown = await db.schedule.groupBy({
          by: ['status'],
          _count: true,
        })

        const typeBreakdown = await db.schedule.groupBy({
          by: ['scheduleType'],
          _count: true,
        })

        return NextResponse.json({
          success: true,
          data: {
            reportType: 'schedule',
            schedules: JSON.parse(JSON.stringify(schedules)),
            statusBreakdown,
            typeBreakdown,
            generatedAt: new Date().toISOString(),
          },
        })
      }

      case 'lookahead': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required for lookahead report' }, { status: 400 })
        }

        const now = new Date()
        const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

        const activities = await db.scheduleActivity.findMany({
          where: {
            scheduleId,
            taskType: { not: 'summary' },
            OR: [
              { status: 'in_progress' },
              { startDate: { lte: twoWeeks, gte: now } },
            ],
          },
          include: { resourceAssignments: true },
          orderBy: { startDate: 'asc' },
        })

        const byStatus = {
          not_started: activities.filter((a) => a.status === 'not_started').length,
          in_progress: activities.filter((a) => a.status === 'in_progress').length,
          delayed: activities.filter((a) => a.status === 'delayed').length,
          on_hold: activities.filter((a) => a.status === 'on_hold').length,
        }

        const resourceSummary = new Map<string, { type: string; name: string; qty: number }>()
        for (const a of activities) {
          for (const r of a.resourceAssignments) {
            const key = `${r.resourceType}:${r.resourceId}`
            if (!resourceSummary.has(key)) {
              resourceSummary.set(key, { type: r.resourceType, name: r.resourceName, qty: 0 })
            }
            resourceSummary.get(key)!.qty += r.quantity
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            reportType: 'lookahead',
            scheduleId,
            periodStart: now.toISOString(),
            periodEnd: twoWeeks.toISOString(),
            totalActivities: activities.length,
            byStatus,
            resources: Array.from(resourceSummary.values()),
            activities: JSON.parse(JSON.stringify(activities)),
            generatedAt: new Date().toISOString(),
          },
        })
      }

      case 'critical_path': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required for critical path report' }, { status: 400 })
        }

        const criticalActivities = await db.scheduleActivity.findMany({
          where: { scheduleId, isOnCriticalPath: true },
          include: { resourceAssignments: true },
          orderBy: { earlyStart: 'asc' },
        })

        const nearCritical = await db.scheduleActivity.findMany({
          where: { scheduleId, isOnCriticalPath: false, totalFloat: { lte: 3, gte: 0 } },
          orderBy: { totalFloat: 'asc' },
          take: 20,
        })

        return NextResponse.json({
          success: true,
          data: {
            reportType: 'critical_path',
            scheduleId,
            criticalPathActivities: JSON.parse(JSON.stringify(criticalActivities)),
            nearCriticalActivities: JSON.parse(JSON.stringify(nearCritical)),
            criticalPathLength: criticalActivities.length,
            generatedAt: new Date().toISOString(),
          },
        })
      }

      case 'delay_analysis': {
        const delayWhere: Record<string, unknown> = {}
        if (scheduleId) delayWhere.scheduleId = scheduleId
        if (projectId) {
          const schedules = await db.schedule.findMany({ where: { projectId }, select: { id: true } })
          delayWhere.scheduleId = { in: schedules.map((s) => s.id) }
        }

        const delays = await db.scheduleDelay.findMany({
          where: delayWhere,
          include: {
            schedule: { select: { id: true, name: true, scheduleNo: true } },
            activity: { select: { id: true, activityId: true, name: true } },
            reportedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        const totalImpactDays = delays.reduce((sum, d) => sum + d.impactDays, 0)
        const totalCostImpact = delays.reduce((sum, d) => sum + d.costImpact, 0)
        const eotRequested = delays.filter((d) => d.eotRequested).length
        const eotTotalDays = delays.filter((d) => d.eotRequested).reduce((sum, d) => sum + d.eotDays, 0)

        const byType = delays.reduce<Record<string, number>>((acc, d) => {
          acc[d.delayType] = (acc[d.delayType] || 0) + 1
          return acc
        }, {})

        const byStatus = delays.reduce<Record<string, number>>((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1
          return acc
        }, {})

        return NextResponse.json({
          success: true,
          data: {
            reportType: 'delay_analysis',
            delays: JSON.parse(JSON.stringify(delays)),
            summary: {
              totalDelays: delays.length,
              totalImpactDays,
              totalCostImpact,
              eotRequested,
              eotTotalDays,
              byType,
              byStatus,
            },
            generatedAt: new Date().toISOString(),
          },
        })
      }

      case 'resource_schedule': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required for resource schedule report' }, { status: 400 })
        }

        const resources = await db.scheduleResourceAssignment.findMany({
          where: { scheduleId },
          include: {
            activity: { select: { id: true, activityId: true, name: true, startDate: true, finishDate: true, status: true } },
          },
          orderBy: [{ resourceType: 'asc' }, { resourceName: 'asc' }],
        })

        const byType = resources.reduce<Record<string, { count: number; totalCost: number; totalQuantity: number }>>((acc, r) => {
          if (!acc[r.resourceType]) acc[r.resourceType] = { count: 0, totalCost: 0, totalQuantity: 0 }
          acc[r.resourceType].count++
          acc[r.resourceType].totalCost += r.totalCost
          acc[r.resourceType].totalQuantity += r.quantity
          return acc
        }, {})

        return NextResponse.json({
          success: true,
          data: {
            reportType: 'resource_schedule',
            scheduleId,
            assignments: JSON.parse(JSON.stringify(resources)),
            summary: { byType, totalAssignments: resources.length },
            generatedAt: new Date().toISOString(),
          },
        })
      }

      case 'milestone': {
        const milestoneWhere: Record<string, unknown> = {}
        if (scheduleId) milestoneWhere.scheduleId = scheduleId
        if (projectId) milestoneWhere.projectId = projectId

        const milestones = await db.scheduleMilestone.findMany({
          where: milestoneWhere,
          include: {
            schedule: { select: { id: true, name: true, scheduleNo: true } },
            project: { select: { id: true, name: true, code: true } },
          },
          orderBy: { date: 'asc' },
        })

        const now = new Date()
        const completed = milestones.filter((m) => m.status === 'completed').length
        const pending = milestones.filter((m) => m.status === 'pending').length
        const delayed = milestones.filter((m) => m.status === 'delayed').length
        const missed = milestones.filter((m) => m.status === 'missed').length
        const overdue = milestones.filter((m) => m.status === 'pending' && m.date && new Date(m.date) < now).length

        return NextResponse.json({
          success: true,
          data: {
            reportType: 'milestone',
            milestones: JSON.parse(JSON.stringify(milestones)),
            summary: { total: milestones.length, completed, pending, delayed, missed, overdue },
            generatedAt: new Date().toISOString(),
          },
        })
      }

      case 'baseline_comparison': {
        if (!scheduleId) {
          return NextResponse.json({ success: false, error: 'scheduleId is required for baseline comparison' }, { status: 400 })
        }

        const currentSchedule = await db.schedule.findUnique({
          where: { id: scheduleId },
          include: {
            baselineSchedule: {
              include: {
                activities: { orderBy: { activityId: 'asc' } },
              },
            },
            activities: { orderBy: { activityId: 'asc' } },
          },
        })

        if (!currentSchedule) {
          return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
        }

        if (!currentSchedule.baselineSchedule) {
          return NextResponse.json({ success: false, error: 'No baseline schedule found for comparison' }, { status: 404 })
        }

        const baselineMap = new Map<string, (typeof currentSchedule.baselineSchedule.activities)[0]>()
        for (const a of currentSchedule.baselineSchedule.activities) {
          baselineMap.set(a.activityId, a)
        }

        const comparisons = currentSchedule.activities
          .filter((a) => a.taskType !== 'summary' && baselineMap.has(a.activityId))
          .map((current) => {
            const baseline = baselineMap.get(current.activityId)!
            const durationVariance = current.duration - baseline.duration
            const progressVariance = current.progress - baseline.progress
            const costVariance = (current.actualCost || 0) - (baseline.budget || 0)
            const startDateVariance = current.startDate && baseline.startDate
              ? Math.ceil((new Date(current.startDate).getTime() - new Date(baseline.startDate).getTime()) / (1000 * 60 * 60 * 24))
              : null

            return {
              activityId: current.activityId,
              name: current.name,
              baselineDuration: baseline.duration,
              currentDuration: current.duration,
              durationVariance,
              baselineProgress: baseline.progress,
              currentProgress: current.progress,
              progressVariance,
              baselineBudget: baseline.budget,
              currentActualCost: current.actualCost,
              costVariance,
              baselineStartDate: baseline.startDate,
              currentStartDate: current.startDate,
              startDateVariance,
              baselineStatus: baseline.status,
              currentStatus: current.status,
              isOnTrack: durationVariance <= 0 && progressVariance >= 0,
            }
          })

        const totalBaselineBudget = Array.from(baselineMap.values()).reduce((s, a) => s + (a.budget || 0), 0)
        const totalCurrentCost = currentSchedule.activities
          .filter((a) => baselineMap.has(a.activityId))
          .reduce((s, a) => s + (a.actualCost || 0), 0)

        return NextResponse.json({
          success: true,
          data: {
            reportType: 'baseline_comparison',
            currentSchedule: { id: currentSchedule.id, name: currentSchedule.name, scheduleNo: currentSchedule.scheduleNo },
            baselineSchedule: { id: currentSchedule.baselineSchedule.id, name: currentSchedule.baselineSchedule.name, scheduleNo: currentSchedule.baselineSchedule.scheduleNo },
            comparisons,
            summary: {
              activitiesCompared: comparisons.length,
              onTrack: comparisons.filter((c) => c.isOnTrack).length,
              behindSchedule: comparisons.filter((c) => !c.isOnTrack).length,
              totalBaselineBudget,
              totalCurrentCost,
              totalCostVariance: totalCurrentCost - totalBaselineBudget,
            },
            generatedAt: new Date().toISOString(),
          },
        })
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown report type: ${type}` }, { status: 400 })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate report'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}