import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (projectId) where.projectId = projectId

    const items = await db.purchaseRequest.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        items: true,
        purchaseOrder: { select: { id: true, orderNo: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = items.map((pr) => ({
      id: pr.id,
      requestNo: pr.requestNo,
      projectId: pr.project.id,
      projectName: pr.project.name,
      projectCode: pr.project.code,
      status: pr.status,
      requiredBy: pr.requiredBy?.toISOString() ?? null,
      notes: pr.notes,
      createdById: pr.createdBy.id,
      createdByName: pr.createdBy.name,
      approvedById: pr.approvedById,
      approvedByName: pr.approvedBy?.name ?? null,
      items: pr.items,
      purchaseOrder: pr.purchaseOrder,
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
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
    const { projectId, requiredBy, notes, status, items } = body

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project is required' }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one item is required' }, { status: 400 })
    }

    // প্রজেক্ট বিদ্যমান কিনা যাচাই করা হচ্ছে
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 400 })
    }

    // রিকোয়েস্ট নম্বর তৈরি করা হচ্ছে
    const count = await db.purchaseRequest.count()
    const requestNo = `PR-${String(count + 1).padStart(4, '0')}`

    const purchaseRequest = await db.purchaseRequest.create({
      data: {
        projectId,
        requestNo,
        status: status || 'draft',
        requiredBy: requiredBy ? new Date(requiredBy) : null,
        notes: notes || null,
        createdById: user.id,
        items: {
          create: items.map((item: { materialId?: string; description: string; quantity: number; unit: string; estimatedPrice?: number }) => ({
            materialId: item.materialId || null,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimatedPrice: item.estimatedPrice || null,
          })),
        },
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'PurchaseRequest',
      entityId: purchaseRequest.id,
      newValues: { requestNo: purchaseRequest.requestNo, projectId, status: purchaseRequest.status },
    })

    return NextResponse.json({ success: true, data: purchaseRequest })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create purchase request' }, { status: 500 })
  }
}
