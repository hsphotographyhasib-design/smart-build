import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // প্রকল্প বিদ্যমান কিনা যাচাই করা হচ্ছে
    const project = await db.project.findUnique({ where: { id }, select: { id: true } })
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { projectId: id, parentTaskId: null }
    if (status && status !== 'all') {
      where.status = status
    }

    const tasks = await db.projectTask.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        subtasks: {
          orderBy: { order: 'asc' },
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    })

    const data = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      startDate: t.startDate?.toISOString() ?? null,
      endDate: t.endDate?.toISOString() ?? null,
      progress: t.progress,
      order: t.order,
      assignee: t.assignee,
      subtasks: t.subtasks.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        priority: s.priority,
        startDate: s.startDate?.toISOString() ?? null,
        endDate: s.endDate?.toISOString() ?? null,
        progress: s.progress,
        order: s.order,
        assignee: s.assignee,
      })),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Project tasks error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin','supervisor','hr_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, status, priority, startDate, endDate, assigneeId, parentTaskId } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Task title is required' }, { status: 400 })
    }

    // সর্বোচ্চ ক্রম সংখ্যা প্রাপ্ত করা হচ্ছে
    const maxOrder = await db.projectTask.aggregate({
      where: { projectId: id, parentTaskId: parentTaskId || null },
      _max: { order: true },
    })

    const task = await db.projectTask.create({
      data: {
        projectId: id,
        title,
        description: description || null,
        status: status || 'todo',
        priority: priority || 'medium',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        assigneeId: assigneeId || null,
        parentTaskId: parentTaskId || null,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate?.toISOString() ?? null,
        endDate: task.endDate?.toISOString() ?? null,
        progress: task.progress,
        order: task.order,
        assignee: task.assignee,
      },
    })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}