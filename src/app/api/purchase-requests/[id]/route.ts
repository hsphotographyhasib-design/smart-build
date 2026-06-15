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

    const pr = await db.purchaseRequest.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        items: true,
        purchaseOrder: { select: { id: true, orderNo: true, status: true } },
      },
    })

    if (!pr) {
      return NextResponse.json({ success: false, error: 'Purchase request not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
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
    const { projectId, requiredBy, notes, status, items } = body

    const existing = await db.purchaseRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Purchase request not found' }, { status: 404 })
    }

    // আইটেম প্রদান করা হলে, পুরনো মুছে নতুন তৈরি করা হচ্ছে
    if (items && Array.isArray(items)) {
      await db.purchaseRequestItem.deleteMany({ where: { purchaseRequestId: id } })
    }

    const updated = await db.purchaseRequest.update({
      where: { id },
      data: {
        projectId: projectId || undefined,
        requiredBy: requiredBy ? new Date(requiredBy) : null,
        notes: notes !== undefined ? notes : undefined,
        status: status || undefined,
        ...(items && Array.isArray(items) && items.length > 0
          ? {
              items: {
                create: items.map((item: { materialId?: string; description: string; quantity: number; unit: string; estimatedPrice?: number }) => ({
                  materialId: item.materialId || null,
                  description: item.description,
                  quantity: item.quantity,
                  unit: item.unit,
                  estimatedPrice: item.estimatedPrice || null,
                })),
              },
            }
          : {}),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'PurchaseRequest',
      entityId: id,
      oldValues: { status: existing.status, notes: existing.notes },
      newValues: { status: updated.status, notes: updated.notes },
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

    const existing = await db.purchaseRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Purchase request not found' }, { status: 404 })
    }

    if (existing.status === 'approved' || existing.status === 'ordered') {
      return NextResponse.json({ success: false, error: 'Cannot delete approved or ordered purchase request' }, { status: 400 })
    }

    await db.purchaseRequestItem.deleteMany({ where: { purchaseRequestId: id } })
    await db.purchaseRequest.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'PurchaseRequest',
      entityId: id,
      oldValues: { requestNo: existing.requestNo },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
