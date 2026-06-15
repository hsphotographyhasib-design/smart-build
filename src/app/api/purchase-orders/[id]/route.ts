import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const po = await db.purchaseOrder.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        supplier: { select: { id: true, name: true, code: true } },
        purchaseRequest: { select: { id: true, requestNo: true } },
        items: true,
      },
    })

    if (!po) {
      return NextResponse.json({ success: false, error: 'Purchase order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { supplierId, expectedDate, notes, status, items, tax } = body

    const existing = await db.purchaseOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Purchase order not found' }, { status: 404 })
    }

    // আইটেম বা ট্যাক্স পরিবর্তন হলে মোট পরিমাণ পুনরায় হিসাব করা হচ্ছে
    let subtotal = existing.subtotal
    let newItems: any[] | undefined = undefined

    if (items && Array.isArray(items)) {
      await db.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })
      subtotal = 0
      newItems = items.map((item: { materialId?: string; description: string; quantity: number; receivedQty?: number; unit: string; unitPrice: number }) => {
        const amount = item.quantity * item.unitPrice
        subtotal += amount
        return {
          materialId: item.materialId || null,
          description: item.description,
          quantity: item.quantity,
          receivedQty: item.receivedQty || 0,
          unit: item.unit,
          unitPrice: item.unitPrice,
          amount,
        }
      })
    }

    const taxAmount = tax !== undefined ? tax : existing.tax
    const total = subtotal + taxAmount

    const updated = await db.purchaseOrder.update({
      where: { id },
      data: {
        supplierId: supplierId || undefined,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        notes: notes !== undefined ? notes : undefined,
        status: status || undefined,
        subtotal,
        tax: taxAmount,
        total,
        ...(newItems && newItems.length > 0
          ? { items: { create: newItems } }
          : {}),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        supplier: { select: { id: true, name: true, code: true } },
        items: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'PurchaseOrder',
      entityId: id,
      oldValues: { status: existing.status, total: existing.total },
      newValues: { status: updated.status, total: updated.total },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.purchaseOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Purchase order not found' }, { status: 404 })
    }

    if (existing.status === 'fully_received' || existing.status === 'billed') {
      return NextResponse.json({ success: false, error: `Cannot delete a ${existing.status} purchase order` }, { status: 400 })
    }

    await db.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })
    await db.purchaseOrder.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'PurchaseOrder',
      entityId: id,
      oldValues: { orderNo: existing.orderNo },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
