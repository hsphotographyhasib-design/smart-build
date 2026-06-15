import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin','supervisor','hr_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id, taskId } = await params
    const body = await request.json()

    const task = await db.projectTask.findFirst({
      where: { id: taskId, projectId: id },
    })

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }

    const { title, description, status, priority, startDate, endDate, progress, assigneeId } = body

    const updated = await db.projectTask.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(progress !== undefined && { progress }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        status: updated.status,
        priority: updated.priority,
        startDate: updated.startDate?.toISOString() ?? null,
        endDate: updated.endDate?.toISOString() ?? null,
        progress: updated.progress,
        order: updated.order,
        assignee: updated.assignee,
      },
    })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin','supervisor'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id, taskId } = await params

    const task = await db.projectTask.findFirst({
      where: { id: taskId, projectId: id },
    })

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }

    // Delete subtasks first (cascade should handle this, but be explicit)
    await db.projectTask.deleteMany({ where: { parentTaskId: taskId } })
    await db.projectTask.delete({ where: { id: taskId } })

    return NextResponse.json({ success: true, data: { id: taskId } })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}