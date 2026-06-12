import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplierId')
    const projectId = searchParams.get('projectId')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (supplierId) where.supplierId = supplierId
    if (projectId) where.projectId = projectId

    const orders = await db.purchaseOrder.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        supplier: { select: { id: true, name: true, code: true } },
        purchaseRequest: { select: { id: true, requestNo: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = orders.map((po) => ({
      id: po.id,
      orderNo: po.orderNo,
      projectId: po.project.id,
      projectName: po.project.name,
      projectCode: po.project.code,
      supplierId: po.supplier.id,
      supplierName: po.supplier.name,
      supplierCode: po.supplier.code,
      purchaseRequestId: po.purchaseRequestId,
      purchaseRequestNo: po.purchaseRequest?.requestNo ?? null,
      status: po.status,
      orderDate: po.orderDate.toISOString(),
      expectedDate: po.expectedDate?.toISOString() ?? null,
      subtotal: po.subtotal,
      tax: po.tax,
      total: po.total,
      notes: po.notes,
      items: po.items,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
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
    const { projectId, supplierId, purchaseRequestId, orderDate, expectedDate, status, notes, items, tax } = body

    if (!projectId || !supplierId) {
      return NextResponse.json({ success: false, error: 'Project and supplier are required' }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one item is required' }, { status: 400 })
    }

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 400 })

    const supplier = await db.supplier.findUnique({ where: { id: supplierId } })
    if (!supplier) return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 400 })

    // Generate order number
    const count = await db.purchaseOrder.count()
    const orderNo = `PO-${String(count + 1).padStart(4, '0')}`

    // Calculate totals
    let subtotal = 0
    const orderItems = items.map((item: { materialId?: string; description: string; quantity: number; unit: string; unitPrice: number }) => {
      const amount = item.quantity * item.unitPrice
      subtotal += amount
      return {
        materialId: item.materialId || null,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount,
      }
    })

    const taxAmount = tax || 0
    const total = subtotal + taxAmount

    const order = await db.purchaseOrder.create({
      data: {
        projectId,
        supplierId,
        purchaseRequestId: purchaseRequestId || null,
        orderNo,
        status: status || 'draft',
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        subtotal,
        tax: taxAmount,
        total,
        notes: notes || null,
        items: { create: orderItems },
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        supplier: { select: { id: true, name: true, code: true } },
        purchaseRequest: { select: { id: true, requestNo: true } },
        items: true,
      },
    })

    // Mark linked purchase request as ordered
    if (purchaseRequestId) {
      await db.purchaseRequest.update({
        where: { id: purchaseRequestId },
        data: { status: 'ordered' },
      })
    }

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'PurchaseOrder',
      entityId: order.id,
      newValues: { orderNo: order.orderNo, total: order.total },
    })

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create purchase order' }, { status: 500 })
  }
}
