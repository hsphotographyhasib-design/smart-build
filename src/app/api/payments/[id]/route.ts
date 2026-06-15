import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        invoice: { select: { id: true, invoiceNo: true } },
      },
    })

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error('Payment GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch payment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { amount, method, reference, date, notes, status } = body

    const existing = await db.payment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
    }

    const updated = await db.payment.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : existing.amount,
        method: method || existing.method,
        reference: reference !== undefined ? reference : existing.reference,
        date: date ? new Date(date) : existing.date,
        notes: notes !== undefined ? notes : existing.notes,
        status: status || existing.status,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        invoice: { select: { id: true, invoiceNo: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Payment',
      entityId: id,
      oldValues: { amount: existing.amount },
      newValues: { amount: updated.amount },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Payment PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.payment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
    }

    await db.payment.delete({ where: { id } })

    // Recalculate invoice paid amount
    if (existing.invoiceId) {
      const invoice = await db.invoice.findUnique({ where: { id: existing.invoiceId } })
      if (invoice) {
        const remainingPayments = await db.payment.findMany({
          where: { invoiceId: existing.invoiceId, status: 'completed' },
          select: { amount: true },
        })
        const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0)
        const newStatus = totalPaid >= invoice.total ? 'paid' : totalPaid > 0 ? 'partial' : 'sent'
        await db.invoice.update({
          where: { id: existing.invoiceId },
          data: { paidAmount: totalPaid, status: newStatus },
        })
      }
    }

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'Payment',
      entityId: id,
      oldValues: { paymentNo: existing.paymentNo },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Payment DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete payment' }, { status: 500 })
  }
}