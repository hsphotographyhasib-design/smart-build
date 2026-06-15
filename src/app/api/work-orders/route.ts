import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const subContractorId = searchParams.get('subContractorId')
    const projectId = searchParams.get('projectId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (subContractorId) where.subContractorId = subContractorId
    if (projectId) where.projectId = projectId

    const items = await db.workOrder.findMany({
      where,
      include: {
        subContractor: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = items.map((wo) => ({
      id: wo.id,
      orderNo: wo.orderNo,
      description: wo.description,
      totalAmount: wo.totalAmount,
      retentionPercent: wo.retentionPercent,
      status: wo.status,
      startDate: wo.startDate?.toISOString() ?? null,
      endDate: wo.endDate?.toISOString() ?? null,
      subContractor: wo.subContractor,
      project: wo.project,
      createdAt: wo.createdAt.toISOString(),
      updatedAt: wo.updatedAt.toISOString(),
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
    const { subContractorId, projectId, description, totalAmount, retentionPercent, startDate, endDate } = body

    if (!subContractorId || !projectId || !totalAmount) {
      return NextResponse.json({ success: false, error: 'Sub-contractor, project, and amount are required' }, { status: 400 })
    }

    // Generate order number
    const count = await db.workOrder.count()
    const orderNo = `WO-${String(count + 1).padStart(4, '0')}`

    const item = await db.workOrder.create({
      data: {
        orderNo,
        subContractorId,
        projectId,
        description: description || '',
        totalAmount: parseFloat(totalAmount),
        retentionPercent: parseFloat(retentionPercent) || 10,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'WorkOrder',
      entityId: item.id,
      newValues: { orderNo, totalAmount: item.totalAmount },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create' }, { status: 500 })
  }
}