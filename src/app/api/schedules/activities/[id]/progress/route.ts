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
    const existing = await db.scheduleActivity.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    const body = await request.json()
    const { progress, actualProgress, status } = body

    if (progress === undefined && actualProgress === undefined && !status) {
      return NextResponse.json(
        { success: false, error: 'Provide at least one of: progress, actualProgress, status' },
        { status: 400 }
      )
    }

    // Auto-derive status from progress if status not explicitly provided
    let derivedStatus = status ?? existing.status
    if (!status && progress !== undefined) {
      if (progress >= 100) derivedStatus = 'completed'
      else if (progress > 0) derivedStatus = 'in_progress'
      else derivedStatus = 'not_started'
    }

    // Auto-complete all fields when marked as completed
    let finalProgress = progress !== undefined ? progress : existing.progress
    let finalActualProgress = actualProgress !== undefined ? actualProgress : existing.actualProgress
    if (derivedStatus === 'completed') {
      finalProgress = 100
      finalActualProgress = 100
    }

    const activity = await db.scheduleActivity.update({
      where: { id },
      data: {
        progress: finalProgress,
        actualProgress: finalActualProgress,
        plannedProgress: existing.plannedProgress, // keep existing planned
        status: derivedStatus,
      },
    })

    // Recalculate schedule completion percentage
    const stats = await db.scheduleActivity.aggregate({
      where: { scheduleId: existing.scheduleId, taskType: { not: 'summary' } },
      _avg: { progress: true },
      _count: true,
    })
    const completionPct = stats._count > 0 ? Math.round((stats._avg.progress || 0) * 100) / 100 : 0

    // Recalculate health score based on delayed count and completion
    const delayedCount = await db.scheduleActivity.count({
      where: { scheduleId: existing.scheduleId, status: 'delayed' },
    })
    const totalNonSummary = await db.scheduleActivity.count({
      where: { scheduleId: existing.scheduleId, taskType: { not: 'summary' } },
    })
    const delayRatio = totalNonSummary > 0 ? delayedCount / totalNonSummary : 0
    const healthScore = Math.max(0, Math.round(100 - (delayRatio * 50) - ((100 - completionPct) * 0.3)))

    await db.schedule.update({
      where: { id: existing.scheduleId },
      data: { completionPct, healthScore },
    })

    // If this is a parent (summary) task, auto-update plannedProgress from children
    if (existing.taskType === 'summary') {
      const children = await db.scheduleActivity.findMany({
        where: { parentId: id },
        select: { progress: true, weight: true },
      })
      if (children.length > 0) {
        const totalWeight = children.reduce((sum, c) => sum + c.weight, 0)
        const weightedProgress = children.reduce((sum, c) => sum + c.progress * (c.weight / totalWeight), 0)
        await db.scheduleActivity.update({
          where: { id },
          data: { progress: Math.round(weightedProgress * 100) / 100 },
        })
      }
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE_PROGRESS',
      entity: 'ScheduleActivity',
      entityId: id,
      oldValues: { progress: existing.progress, status: existing.status },
      newValues: { progress: finalProgress, status: derivedStatus },
    })

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(activity)),
      scheduleUpdate: { completionPct, healthScore },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update progress'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}