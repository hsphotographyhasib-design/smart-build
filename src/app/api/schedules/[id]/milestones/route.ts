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
    const type = searchParams.get('type')

    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { scheduleId: id }
    if (status) where.status = status
    if (type) where.type = type

    const milestones = await db.scheduleMilestone.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(milestones)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch milestones'
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
    const { name, description, date, type, projectId, weight, notes } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Milestone name is required' }, { status: 400 })
    }

    const milestone = await db.scheduleMilestone.create({
      data: {
        scheduleId: id,
        name,
        description: description || null,
        date: date ? new Date(date) : null,
        type: type || 'deliverable',
        projectId: projectId || null,
        weight: weight || 1,
        notes: notes || null,
        status: 'pending',
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'ScheduleMilestone',
      entityId: milestone.id,
      newValues: { name, type: type || 'deliverable', scheduleId: id },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(milestone)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create milestone'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}