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

    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    if (schedule.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: `Only draft schedules can be published. Current status: ${schedule.status}` },
        { status: 400 }
      )
    }

    // Auto-create a snapshot before publishing
    const activities = await db.scheduleActivity.findMany({
      where: { scheduleId: id },
      select: { activityId: true, name: true, duration: true, startDate: true, finishDate: true, progress: true, status: true },
      orderBy: { order: 'asc' },
    })

    const snapshotData = {
      publishEvent: true,
      schedule: { name: schedule.name, scheduleNo: schedule.scheduleNo },
      activitiesCount: activities.length,
      activities: activities,
      publishedAt: new Date().toISOString(),
    }

    await db.scheduleSnapshot.create({
      data: {
        scheduleId: id,
        name: `Pre-Publish Snapshot - ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
        snapshotType: 'auto',
        data: JSON.stringify(snapshotData),
        takenById: authUser.id,
      },
    })

    // Update status to published
    const updated = await db.schedule.update({
      where: { id },
      data: { status: 'published' },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'PUBLISH',
      entity: 'Schedule',
      entityId: id,
      oldValues: { status: 'draft' },
      newValues: { status: 'published', scheduleNo: schedule.scheduleNo },
    })

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(updated)),
      message: 'Schedule published successfully',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish schedule'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}