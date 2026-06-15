import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole, createAuditLog } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    if (!requireRole(user, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.purchaseRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Purchase request not found' }, { status: 404 })
    }

    if (existing.status === 'approved' || existing.status === 'rejected' || existing.status === 'ordered') {
      return NextResponse.json({ success: false, error: `Cannot approve a request that is already ${existing.status}` }, { status: 400 })
    }

    const updated = await db.purchaseRequest.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById: user.id,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        items: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'approve',
      entity: 'PurchaseRequest',
      entityId: id,
      newValues: { status: 'approved' },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to approve' }, { status: 500 })
  }
}
