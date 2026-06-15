import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { address: { contains: search } },
      ]
    }

    const projects = await db.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        progress: true,
        budget: true,
        startDate: true,
        endDate: true,
        address: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            members: true,
            tasks: true,
            documents: true,
            dailyNotes: true,
            invoices: true,
            payments: true,
            expenses: true,
          },
        },
        tasks: {
          select: { status: true },
        },
      },
    })

    const data = projects.map((p) => {
      const totalTasks = p.tasks.length
      const completedTasks = p.tasks.filter((t) => t.status === 'completed').length
      const inProgressTasks = p.tasks.filter((t) => t.status === 'in_progress').length
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
        progress: p.progress,
        budget: p.budget,
        startDate: p.startDate?.toISOString() ?? null,
        endDate: p.endDate?.toISOString() ?? null,
        address: p.address,
        description: p.description,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        memberCount: p._count.members,
        totalTasks,
        completedTasks,
        inProgressTasks,
        documentCount: p._count.documents,
        dailyNoteCount: p._count.dailyNotes,
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Projects list error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin', 'supervisor'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const body = await request.json()
    const { name, code, description, status, startDate, endDate, budget, address, clientId } = body

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Project name and code are required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await db.project.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Project code already exists' }, { status: 400 })
    }

    const project = await db.project.create({
      data: {
        name,
        code,
        description: description || null,
        status: status || 'planning',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget || 0,
        address: address || null,
        clientId: clientId || null,
      },
    })

    // Add creator as manager
    await db.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: 'manager',
      },
    })

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}