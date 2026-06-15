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

    if (schedule.status === 'archived') {
      return NextResponse.json({ success: false, error: 'Schedule is already archived' }, { status: 400 })
    }

    if (schedule.status === 'draft') {
      return NextResponse.json(
        { success: false, error: 'Draft schedules cannot be archived. Publish or delete them instead.' },
        { status: 400 }
      )
    }

    // আর্কাইভ করার পূর্বে একটি চূড়ান্ত স্ন্যাপশট তৈরি করা হচ্ছে
    const activities = await db.scheduleActivity.findMany({
      where: { scheduleId: id },
      select: { activityId: true, name: true, duration: true, startDate: true, finishDate: true, progress: true, status: true },
      orderBy: { order: 'asc' },
    })

    const snapshotData = {
      archiveEvent: true,
      schedule: { name: schedule.name, scheduleNo: schedule.scheduleNo, previousStatus: schedule.status },
      activitiesCount: activities.length,
      finalCompletionPct: schedule.completionPct,
      finalHealthScore: schedule.healthScore,
      activities: activities,
      archivedAt: new Date().toISOString(),
    }

    await db.scheduleSnapshot.create({
      data: {
        scheduleId: id,
        name: `Archive Snapshot - ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
        snapshotType: 'manual',
        data: JSON.stringify(snapshotData),
        takenById: authUser.id,
      },
    })

    // অবস্থা আর্কাইভড হিসেবে আপডেট করা হচ্ছে
    const updated = await db.schedule.update({
      where: { id },
      data: { status: 'archived' },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'ARCHIVE',
      entity: 'Schedule',
      entityId: id,
      oldValues: { status: schedule.status },
      newValues: { status: 'archived', scheduleNo: schedule.scheduleNo },
    })

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(updated)),
      message: 'Schedule archived successfully',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to archive schedule'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}