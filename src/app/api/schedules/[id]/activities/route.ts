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
    const taskType = searchParams.get('taskType')
    const status = searchParams.get('status')
    const parentId = searchParams.get('parentId')
    const wbsCode = searchParams.get('wbsCode')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { scheduleId: id }
    if (taskType) where.taskType = taskType
    if (status) where.status = status
    if (parentId === 'null') {
      where.parentId = null
    } else if (parentId) {
      where.parentId = parentId
    }
    if (wbsCode) where.wbsCode = { startsWith: wbsCode }

    const [activities, total] = await Promise.all([
      db.scheduleActivity.findMany({
        where,
        include: {
          parent: { select: { id: true, activityId: true, name: true } },
          children: { orderBy: { order: 'asc' } },
          resourceAssignments: { select: { id: true, resourceType: true, resourceName: true, quantity: true, unit: true } },
          predecessors: {
            include: { successor: { select: { id: true, activityId: true, name: true } } },
          },
          successors: {
            include: { predecessor: { select: { id: true, activityId: true, name: true } } },
          },
          _count: { select: { comments: true, delays: true, attachments: true } },
        },
        orderBy: [{ order: 'asc' }, { activityId: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.scheduleActivity.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(activities)),
      total,
      page,
      limit,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activities'
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
    const {
      name, description, taskType, parentId, startDate, finishDate,
      duration, priority, wbsCode, costCode, budget, notes, weight, order,
    } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Activity name is required' }, { status: 400 })
    }

    // Auto-generate activity ID: A0010, A0020, ...
    const lastActivity = await db.scheduleActivity.findFirst({
      where: { scheduleId: id },
      orderBy: { activityId: 'desc' },
    })
    let nextNum = 10
    if (lastActivity?.activityId) {
      const num = parseInt(lastActivity.activityId.replace(/\D/g, ''))
      if (!isNaN(num)) nextNum = num + 10
    }
    const activityId = `A${String(nextNum).padStart(4, '0')}`

    // Auto-calculate finish date from start + duration if finish not provided
    let calculatedFinish = finishDate ? new Date(finishDate) : null
    if (startDate && duration && !finishDate) {
      calculatedFinish = new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000)
    }

    const activity = await db.scheduleActivity.create({
      data: {
        activityId,
        scheduleId: id,
        name,
        description: description || null,
        taskType: taskType || 'task',
        parentId: parentId || null,
        startDate: startDate ? new Date(startDate) : null,
        finishDate: calculatedFinish,
        duration: duration || 0,
        originalDuration: duration || 0,
        priority: priority || 'medium',
        wbsCode: wbsCode || null,
        costCode: costCode || null,
        budget: budget || 0,
        notes: notes || null,
        weight: weight || 1,
        order: order ?? nextNum,
        createdById: authUser.id,
      },
    })

    // Update schedule total activities count
    const totalActivities = await db.scheduleActivity.count({ where: { scheduleId: id } })
    await db.schedule.update({
      where: { id },
      data: { totalActivities },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'ScheduleActivity',
      entityId: activity.id,
      newValues: { activityId, name, scheduleId: id },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(activity)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create activity'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}