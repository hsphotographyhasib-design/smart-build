import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const scheduleType = searchParams.get('scheduleType')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (scheduleType) where.scheduleType = scheduleType
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { scheduleNo: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [schedules, total] = await Promise.all([
      db.schedule.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
          createdBy: { select: { id: true, name: true } },
          _count: {
            select: {
              activities: true,
              milestones: true,
              dependencies: true,
              delays: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.schedule.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(schedules)),
      total,
      page,
      limit,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch schedules'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, projectId, scheduleType, description, startDate, endDate } = body

    if (!name || !projectId) {
      return NextResponse.json({ success: false, error: 'Name and projectId are required' }, { status: 400 })
    }

    // প্রকল্প বিদ্যমান কিনা যাচাই করা হচ্ছে
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // স্বয়ংক্রিয়ভাবে সময়সূচি নম্বর তৈরি করা হচ্ছে: SCH-YYYY-NNNNNNN
    const year = new Date().getFullYear()
    const prefix = 'SCH'
    const count = await db.schedule.count({
      where: { scheduleNo: { startsWith: `${prefix}-${year}` } },
    })
    const scheduleNo = `${prefix}-${year}-${String(count + 1).padStart(7, '0')}`

    // তারিখ প্রদান করা হলে মোট সময়কাল গণনা করা হচ্ছে
    let totalDuration = 0
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      totalDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }

    const schedule = await db.schedule.create({
      data: {
        scheduleNo,
        name,
        projectId,
        scheduleType: scheduleType || 'master',
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        totalDuration,
        createdById: authUser.id,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'Schedule',
      entityId: schedule.id,
      newValues: { scheduleNo, name, projectId, scheduleType },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(schedule)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create schedule'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}