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
    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const dependencies = await db.scheduleDependency.findMany({
      where: { scheduleId: id },
      include: {
        predecessor: { select: { id: true, activityId: true, name: true, startDate: true, finishDate: true } },
        successor: { select: { id: true, activityId: true, name: true, startDate: true, finishDate: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(dependencies)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dependencies'
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
    const { predecessorId, successorId, depType, lagDays } = body

    if (!predecessorId || !successorId) {
      return NextResponse.json(
        { success: false, error: 'predecessorId and successorId are required' },
        { status: 400 }
      )
    }

    if (predecessorId === successorId) {
      return NextResponse.json(
        { success: false, error: 'Predecessor and successor cannot be the same activity' },
        { status: 400 }
      )
    }

    // উভয় কার্যক্রমই এই সময়সূচিতে আছে কিনা যাচাই করা হচ্ছে
    const [pred, succ] = await Promise.all([
      db.scheduleActivity.findFirst({ where: { id: predecessorId, scheduleId: id } }),
      db.scheduleActivity.findFirst({ where: { id: successorId, scheduleId: id } }),
    ])

    if (!pred) {
      return NextResponse.json({ success: false, error: 'Predecessor activity not found in this schedule' }, { status: 404 })
    }
    if (!succ) {
      return NextResponse.json({ success: false, error: 'Successor activity not found in this schedule' }, { status: 404 })
    }

    // সদৃশ নির্ভরতা পরীক্ষা করা হচ্ছে
    const existing = await db.scheduleDependency.findUnique({
      where: {
        scheduleId_predecessorId_successorId: {
          scheduleId: id,
          predecessorId,
          successorId,
        },
      },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: 'This dependency already exists' }, { status: 409 })
    }

    const dependency = await db.scheduleDependency.create({
      data: {
        scheduleId: id,
        predecessorId,
        successorId,
        depType: depType || 'FS',
        lagDays: lagDays || 0,
        leadDays: 0,
      },
      include: {
        predecessor: { select: { id: true, activityId: true, name: true } },
        successor: { select: { id: true, activityId: true, name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'ScheduleDependency',
      entityId: dependency.id,
      newValues: { predecessorId: pred.activityId, successorId: succ.activityId, depType: depType || 'FS' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(dependency)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create dependency'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}