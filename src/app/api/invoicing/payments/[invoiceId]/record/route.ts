import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { invoiceId } = await params
    const body = await request.json()
    const { amount, method, reference, bankReference, chequeNumber } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid payment amount is required' }, { status: 400 })
    }
    if (!method) {
      return NextResponse.json({ success: false, error: 'Payment method is required' }, { status: 400 })
    }

    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status !== 'approved' && invoice.status !== 'partial_paid' && invoice.status !== 'payment_pending') {
      return NextResponse.json({ success: false, error: `Cannot record payment for invoice in '${invoice.status}' status` }, { status: 400 })
    }

    // Generate payment number
    const count = await db.payment.count()
    const paymentNo = `PAY-${String(count + 1).padStart(6, '0')}`

    // Build notes from extra fields
    let notes = ''
    if (bankReference) notes += `Bank Ref: ${bankReference}; `
    if (chequeNumber) notes += `Cheque #: ${chequeNumber}`

    // Create payment
    const payment = await db.payment.create({
      data: {
        projectId: invoice.projectId,
        invoiceId,
        paymentNo,
        amount,
        method,
        status: 'completed',
        reference: reference || null,
        date: new Date(),
        receivedBy: user.id,
        notes: notes.trim() || null,
      },
    })

    // Update invoice payment fields
    const newPaidAmount = invoice.paidAmount + amount
    const newOutstandingAmount = invoice.total - newPaidAmount
    let newPaymentStatus = invoice.paymentStatus
    if (newPaidAmount >= invoice.total) {
      newPaymentStatus = 'paid'
    } else if (newPaidAmount > 0) {
      newPaymentStatus = 'partial'
    }

    let newStatus = invoice.status
    if (newPaymentStatus === 'paid') {
      newStatus = 'paid'
    } else if (newPaymentStatus === 'partial') {
      newStatus = 'partial_paid'
    }

    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        outstandingAmount: Math.max(0, newOutstandingAmount),
        paymentStatus: newPaymentStatus,
        status: newStatus,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true } },
        payments: { orderBy: { date: 'desc' } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'Payment',
      entityId: payment.id,
      newValues: { paymentNo, amount, invoiceId, method },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: { invoice: updatedInvoice, payment } })
  } catch (error) {
    console.error('Payment record error:', error)
    return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 })
  }
}