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

    if (!requireRole(user, ['admin', 'store_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.resourceRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Resource request not found' }, { status: 404 })
    }

    if (['rejected', 'cancelled', 'assigned'].includes(existing.status)) {
      return NextResponse.json({ success: false, error: `Cannot reject a request that is already ${existing.status}` }, { status: 400 })
    }

    const body = await request.json()
    const notes = body.notes || null

    const result = await db.resourceRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        notes: notes || existing.notes,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'reject',
      entity: 'ResourceRequest',
      entityId: id,
      oldValues: { status: existing.status },
      newValues: { status: 'rejected' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}