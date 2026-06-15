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

    if (!requireRole(user, ['admin', 'accountant'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.payroll.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Payroll record not found' }, { status: 404 })
    }

    if (existing.status === 'paid') {
      return NextResponse.json({ success: false, error: 'Payroll already marked as paid' }, { status: 400 })
    }

    const payroll = await db.payroll.update({
      where: { id },
      data: {
        status: 'paid',
        paidDate: new Date(),
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'Payroll',
      entityId: id,
      oldValues: existing,
      newValues: payroll,
    })

    return NextResponse.json({ success: true, data: payroll })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark payroll as paid'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}