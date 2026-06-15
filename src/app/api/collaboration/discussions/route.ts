import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (status && status !== 'all') where.status = status
    if (category && category !== 'all') where.category = category
    if (search) where.title = { contains: search }

    const discussions = await db.discussion.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const data = discussions.map((d) => ({
      ...JSON.parse(JSON.stringify(d)),
      commentCount: d._count.comments,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { projectId, title, description, category, priority, assignedTo, dueDate } = body

    if (!projectId || !title) {
      return NextResponse.json({ success: false, error: 'Project and title are required' }, { status: 400 })
    }

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 400 })
    }

    const discussion = await db.discussion.create({
      data: {
        projectId,
        title,
        description: description || null,
        category: category || 'general',
        status: 'open',
        priority: priority || 'medium',
        createdById: user.id,
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        _count: { select: { comments: true } },
      },
    })

    await createAuditLog({ userId: user.id, action: 'CREATE', entity: 'Discussion', entityId: discussion.id })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(discussion)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create discussion' }, { status: 500 })
  }
}