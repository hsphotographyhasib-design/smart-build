import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole, createAuditLog } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin', 'hr_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.leaveRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Leave request not found' }, { status: 404 })
    }

    if (existing.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Only pending requests can be approved' }, { status: 400 })
    }

    const leaveRequest = await db.leaveRequest.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById: user.id,
      },
      include: {
        employee: { select: { name: true, empCode: true } },
        approvedBy: { select: { name: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'LeaveRequest',
      entityId: id,
      oldValues: existing,
      newValues: leaveRequest,
    })

    return NextResponse.json({ success: true, data: leaveRequest })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve leave request'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}