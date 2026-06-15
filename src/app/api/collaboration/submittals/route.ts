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

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (status && status !== 'all') where.status = status
    if (category && category !== 'all') where.category = category

    const submittals = await db.submittal.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(submittals)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { projectId, title, specification, category, priority, dueDate, notes } = body

    if (!projectId || !title) {
      return NextResponse.json({ success: false, error: 'Project and title are required' }, { status: 400 })
    }

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 400 })
    }

    const count = await db.submittal.count({ where: { projectId } })
    const submittalNo = `SUB-${project.code}-${String(count + 1).padStart(3, '0')}`

    const submittal = await db.submittal.create({
      data: {
        projectId,
        submittalNo,
        title,
        specification: specification || null,
        category: category || 'architectural',
        priority: priority || 'medium',
        revision: '0',
        status: 'draft',
        submittedById: user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
      },
      include: { project: { select: { id: true, name: true, code: true } } },
    })

    await createAuditLog({ userId: user.id, action: 'CREATE', entity: 'Submittal', entityId: submittal.id })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(submittal)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create submittal' }, { status: 500 })
  }
}