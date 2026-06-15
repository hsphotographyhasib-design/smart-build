import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const resourceType = searchParams.get('resourceType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (resourceType && resourceType !== 'all') where.resourceType = resourceType
    if (startDate || endDate) {
      const dateFilter: Record<string, unknown> = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
      where.date = dateFilter
    }

    const logs = await db.productivityLog.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(logs)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      projectId,
      date,
      resourceType,
      resourceId,
      crewId,
      resourceName,
      task,
      outputUnit,
      outputQty,
      hoursWorked,
      cost,
      quality,
      notes,
    } = body

    if (!projectId) return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 })
    if (!date) return NextResponse.json({ success: false, error: 'date is required' }, { status: 400 })
    if (!resourceType) return NextResponse.json({ success: false, error: 'resourceType is required' }, { status: 400 })

    const result = await db.productivityLog.create({
      data: {
        projectId,
        date: new Date(date),
        resourceType,
        resourceId: resourceId || null,
        crewId: crewId || null,
        resourceName: resourceName || null,
        task: task || null,
        outputUnit: outputUnit || null,
        outputQty: outputQty || 0,
        hoursWorked: hoursWorked || 0,
        cost: cost || 0,
        quality: quality || null,
        notes: notes || null,
        createdById: user.id,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'ProductivityLog',
      entityId: result.id,
      newValues: { projectId, resourceType, date, outputQty: result.outputQty, cost: result.cost },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}