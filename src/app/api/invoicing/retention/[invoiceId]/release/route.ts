import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { invoiceId } = await params
    const body = await request.json()
    const { amount, reference } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid release amount is required' }, { status: 400 })
    }

    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    const maxReleasable = invoice.retentionAmount - invoice.retentionReleased
    if (amount > maxReleasable) {
      return NextResponse.json({
        success: false,
        error: `Release amount exceeds available retention. Maximum releasable: ${maxReleasable}`,
      }, { status: 400 })
    }

    const newReleased = invoice.retentionReleased + amount

    const updated = await db.invoice.update({
      where: { id: invoiceId },
      data: { retentionReleased: newReleased },
      include: {
        project: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Invoice',
      entityId: invoiceId,
      oldValues: { retentionReleased: invoice.retentionReleased },
      newValues: { retentionReleased: newReleased, releaseReference: reference },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Retention release error:', error)
    return NextResponse.json({ success: false, error: 'Failed to release retention' }, { status: 500 })
  }
}