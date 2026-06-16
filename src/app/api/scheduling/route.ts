import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // where ধারা তৈরি করা হচ্ছে
    const taskWhere: Record<string, unknown> = {}
    if (status && status !== 'all') {
      taskWhere.status = status
    }
    if (priority && priority !== 'all') {
      taskWhere.priority = priority
    }

    const projectWhere: Record<string, unknown> = {}
    if (projectId && projectId !== 'all') {
      projectWhere.id = projectId
    }

    // সমস্ত প্রকল্প তাদের কাজসহ আনা হচ্ছে
    const projects = await db.project.findMany({
      where: projectWhere,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        progress: true,
        startDate: true,
        endDate: true,
        projectTask: {
          where: taskWhere,
          orderBy: [{ order: 'asc' }, { startDate: 'asc' }],
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true,
            progress: true,
            parentTaskId: true,
            order: true,
            assignee: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    })

    const data = projects.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      status: p.status,
      progress: p.progress,
      startDate: p.startDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
      tasks: p.projectTask.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        startDate: t.startDate?.toISOString() ?? null,
        endDate: t.endDate?.toISOString() ?? null,
        progress: t.progress,
        parentTaskId: t.parentTaskId,
        order: t.order,
        assignee: t.assignee,
      })),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Scheduling data error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}