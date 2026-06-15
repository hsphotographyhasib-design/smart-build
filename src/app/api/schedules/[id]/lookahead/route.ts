import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const weeks = parseInt(searchParams.get('weeks') || '2')

    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const now = new Date()
    const lookaheadEnd = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)

    // Fetch activities that start or are in progress within the lookahead window
    const activities = await db.scheduleActivity.findMany({
      where: {
        scheduleId: id,
        taskType: { not: 'summary' },
        OR: [
          { status: 'in_progress' },
          {
            startDate: { lte: lookaheadEnd },
            finishDate: { gte: now },
          },
        ],
      },
      include: {
        resourceAssignments: {
          orderBy: { resourceType: 'asc' },
        },
        predecessors: {
          include: { predecessor: { select: { id: true, activityId: true, name: true, status: true } } },
        },
        _count: { select: { comments: true, delays: true } },
      },
      orderBy: [{ startDate: 'asc' }, { order: 'asc' }],
    })

    // Group activities by week
    const weekBuckets: Array<{
      weekStart: string
      weekEnd: string
      weekLabel: string
      activities: typeof activities
    }> = []

    for (let w = 0; w < weeks; w++) {
      const weekStart = new Date(now.getTime() + w * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() + (w + 1) * 7 * 24 * 60 * 60 * 1000)

      const weekActivities = activities.filter((a) => {
        const start = a.startDate ? new Date(a.startDate) : null
        const end = a.finishDate ? new Date(a.finishDate) : null
        if (!start && !end) return false
        // Activity overlaps with this week
        if (start && start < weekEnd && end && end > weekStart) return true
        if (start && start >= weekStart && start < weekEnd) return true
        if (end && end >= weekStart && end < weekEnd) return true
        if (a.status === 'in_progress') return true
        return false
      })

      weekBuckets.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        weekLabel: `Week ${w + 1} (${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        activities: weekActivities,
      })
    }

    // Aggregate resource requirements for the lookahead period
    const resourceSummary = new Map<string, { resourceType: string; resourceName: string; totalQuantity: number; unit: string; activities: string[] }>()
    for (const activity of activities) {
      for (const ra of activity.resourceAssignments) {
        const key = `${ra.resourceType}:${ra.resourceId}`
        if (!resourceSummary.has(key)) {
          resourceSummary.set(key, {
            resourceType: ra.resourceType,
            resourceName: ra.resourceName,
            totalQuantity: 0,
            unit: ra.unit,
            activities: [],
          })
        }
        const entry = resourceSummary.get(key)!
        entry.totalQuantity += ra.quantity
        if (!entry.activities.includes(activity.name)) {
          entry.activities.push(activity.name)
        }
      }
    }

    // Summary stats
    const notStarted = activities.filter((a) => a.status === 'not_started').length
    const inProgress = activities.filter((a) => a.status === 'in_progress').length
    const delayed = activities.filter((a) => a.status === 'delayed').length
    const criticalCount = activities.filter((a) => a.isCritical || a.isOnCriticalPath).length

    return NextResponse.json({
      success: true,
      data: {
        scheduleId: id,
        scheduleName: schedule.name,
        lookaheadWeeks: weeks,
        periodStart: now.toISOString(),
        periodEnd: lookaheadEnd.toISOString(),
        summary: {
          totalActivities: activities.length,
          notStarted,
          inProgress,
          delayed,
          critical: criticalCount,
        },
        weeks: JSON.parse(JSON.stringify(weekBuckets)),
        resourceRequirements: Array.from(resourceSummary.values()),
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate lookahead'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}