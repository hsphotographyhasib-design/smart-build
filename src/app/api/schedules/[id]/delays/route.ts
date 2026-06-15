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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const delayType = searchParams.get('delayType')

    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { scheduleId: id }
    if (status) where.status = status
    if (delayType) where.delayType = delayType

    const delays = await db.scheduleDelay.findMany({
      where,
      include: {
        activity: { select: { id: true, activityId: true, name: true } },
        reportedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(delays)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch delays'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

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

    const body = await request.json()
    const { title, activityId, description, delayType, impactDays, impactType, startDate, endDate, recoveryPlan, eotRequested, eotDays, costImpact } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Delay title is required' }, { status: 400 })
    }

    // Verify activity belongs to this schedule if provided
    if (activityId) {
      const activity = await db.scheduleActivity.findFirst({
        where: { id: activityId, scheduleId: id },
      })
      if (!activity) {
        return NextResponse.json({ success: false, error: 'Activity not found in this schedule' }, { status: 404 })
      }
    }

    const delay = await db.scheduleDelay.create({
      data: {
        scheduleId: id,
        activityId: activityId || null,
        title,
        description: description || null,
        delayType: delayType || 'weather',
        impactDays: impactDays || 0,
        impactType: impactType || 'delay',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        recoveryPlan: recoveryPlan || null,
        eotRequested: eotRequested || false,
        eotDays: eotDays || 0,
        costImpact: costImpact || 0,
        reportedById: authUser.id,
      },
      include: {
        activity: { select: { id: true, activityId: true, name: true } },
        reportedBy: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'ScheduleDelay',
      entityId: delay.id,
      newValues: { title, delayType: delayType || 'weather', impactDays: impactDays || 0, scheduleId: id },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(delay)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create delay'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}