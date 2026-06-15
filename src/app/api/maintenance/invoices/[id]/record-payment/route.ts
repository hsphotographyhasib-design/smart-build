import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog, requireRole } from '@/lib/auth'

const MAINT_SOCKET_PORT = 3095

async function emitMaintEvent(event: string, data: Record<string, unknown>, rooms?: string[]) {
  try {
    await fetch(`http://localhost:${MAINT_SOCKET_PORT}/api/emit/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    })
    if (rooms) {
      for (const room of rooms) {
        await fetch(`http://localhost:${MAINT_SOCKET_PORT}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room, event, data }),
        })
      }
    }
  } catch { /* ignore */ }
}

interface RecordPaymentBody {
  amount: number
  method: string
  reference?: string
  date?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Finance role check
    if (!requireRole(authUser, ['admin', 'manager', 'accountant'])) {
      return NextResponse.json({ success: false, error: 'Only admin, manager, or accountant can record payments' }, { status: 403 })
    }

    const { id } = await params
    const body: RecordPaymentBody = await request.json()
    const { amount, method, reference, date } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid payment amount is required' }, { status: 400 })
    }
    if (!method) {
      return NextResponse.json({ success: false, error: 'Payment method is required' }, { status: 400 })
    }

    const invoice = await db.maintenanceInvoice.findUnique({
      where: { id },
      include: {
        ticket: { select: { id: true, ticketNo: true, status: true, createdAt: true } },
        workOrder: { select: { id: true, status: true } },
      },
    })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'cancelled') {
      return NextResponse.json({ success: false, error: 'Cannot record payment on a cancelled invoice' }, { status: 400 })
    }

    const newPaidAmount = invoice.paidAmount + amount
    const isFullyPaid = newPaidAmount >= invoice.total
    const newStatus = isFullyPaid ? 'paid' : invoice.status

    const updatedInvoice = await db.maintenanceInvoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    })

    let ticketClosed = false

    // If fully paid, close linked ticket and WO
    if (isFullyPaid) {
      const now = new Date()

      // Close linked ticket
      if (invoice.ticketId && invoice.ticket && invoice.ticket.status !== 'closed') {
        const actualResolutionMinutes = Math.round((now.getTime() - invoice.ticket.createdAt.getTime()) / 60000)

        await db.maintenanceTicket.update({
          where: { id: invoice.ticketId },
          data: {
            status: 'closed',
            closedById: authUser.id,
            closedAt: now,
            actualResolutionMinutes,
          },
        })

        await db.maintenanceTimeline.create({
          data: {
            ticketId: invoice.ticketId,
            action: 'closed',
            description: `Ticket closed automatically after full payment of invoice ${invoice.invoiceNo}`,
            performedById: authUser.id,
            metadata: JSON.stringify({ reason: 'payment_received', invoiceNo: invoice.invoiceNo, amount, performedBy: authUser.name }),
          },
        })

        ticketClosed = true
      }

      // Close linked WO if not already completed
      if (invoice.workOrderId && invoice.workOrder && invoice.workOrder.status !== 'completed') {
        await db.maintenanceWorkOrder.update({
          where: { id: invoice.workOrderId },
          data: { status: 'completed', actualCompletionDate: now },
        })
      }
    }

    // Create timeline entry on linked ticket
    if (invoice.ticketId) {
      await db.maintenanceTimeline.create({
        data: {
          ticketId: invoice.ticketId,
          action: 'payment_received',
          description: `Payment of ₹${amount.toFixed(2)} received via ${method}${reference ? ` (Ref: ${reference})` : ''}${date ? ` on ${date}` : ''}. ${isFullyPaid ? 'Invoice fully paid.' : `Balance: ₹${(invoice.total - newPaidAmount).toFixed(2)}`}`,
          performedById: authUser.id,
          metadata: JSON.stringify({ invoiceNo: invoice.invoiceNo, amount, method, reference, date, newPaidAmount, total: invoice.total, isFullyPaid, performedBy: authUser.name }),
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'RECORD_PAYMENT',
      entity: 'MaintenanceInvoice',
      entityId: id,
      newValues: { amount, method, paidAmount: newPaidAmount, status: newStatus },
    })

    await emitMaintEvent('payment:received', {
      invoiceId: id,
      invoiceNo: invoice.invoiceNo,
      amount,
      method,
      newPaidAmount,
      total: invoice.total,
      isFullyPaid,
      performedBy: authUser.name,
    })

    if (ticketClosed && invoice.ticket) {
      await emitMaintEvent('ticket:closed', {
        ticketId: invoice.ticketId,
        ticketNo: invoice.ticket.ticketNo,
        reason: 'payment_received',
        performedBy: authUser.name,
      })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedInvoice)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record payment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}