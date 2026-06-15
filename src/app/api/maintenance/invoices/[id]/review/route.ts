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
  } catch { /* উপেক্ষা করা হচ্ছে */ }
}

interface Adjustments {
  labourCost?: number
  materialCost?: number
  transportCost?: number
  serviceCharges?: number
  tax?: number
  discount?: number
}

interface ReviewBody {
  action: 'approve' | 'reject'
  notes?: string
  adjustments?: Adjustments
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // ফাইন্যান্স ভূমিকা যাচাই করা হচ্ছে
    if (!requireRole(authUser, ['admin', 'manager', 'accountant'])) {
      return NextResponse.json({ success: false, error: 'Only admin, manager, or accountant can review invoices' }, { status: 403 })
    }

    const { id } = await params
    const body: ReviewBody = await request.json()
    const { action, notes, adjustments } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Valid action is required: approve or reject' }, { status: 400 })
    }

    const invoice = await db.maintenanceInvoice.findUnique({
      where: { id },
      include: { ticket: { select: { id: true, ticketNo: true } } },
    })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status !== 'draft') {
      return NextResponse.json({ success: false, error: `Invoice must be in 'draft' status to review, current status: ${invoice.status}` }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'sent' : 'draft'

    // আপডেট ডেটা তৈরি করা হচ্ছে
    const updateData: Record<string, unknown> = { status: newStatus, notes: notes || invoice.notes }

    if (adjustments) {
      if (adjustments.labourCost !== undefined) updateData.labourCost = adjustments.labourCost
      if (adjustments.materialCost !== undefined) updateData.materialCost = adjustments.materialCost
      if (adjustments.transportCost !== undefined) updateData.transportCost = adjustments.transportCost
      if (adjustments.serviceCharges !== undefined) updateData.serviceCharges = adjustments.serviceCharges
      if (adjustments.tax !== undefined) updateData.tax = adjustments.tax
      if (adjustments.discount !== undefined) updateData.discount = adjustments.discount

      // মোট পরিমাণ পুনরায় হিসাব করা হচ্ছে
      const lC = adjustments.labourCost !== undefined ? adjustments.labourCost : invoice.labourCost
      const mC = adjustments.materialCost !== undefined ? adjustments.materialCost : invoice.materialCost
      const tC = adjustments.transportCost !== undefined ? adjustments.transportCost : invoice.transportCost
      const sC = adjustments.serviceCharges !== undefined ? adjustments.serviceCharges : invoice.serviceCharges
      const tx = adjustments.tax !== undefined ? adjustments.tax : invoice.tax
      const dc = adjustments.discount !== undefined ? adjustments.discount : invoice.discount
      updateData.total = lC + mC + tC + sC + tx - dc
    }

    const updatedInvoice = await db.maintenanceInvoice.update({
      where: { id },
      data: updateData,
    })

    // সংযুক্ত টিকেটে টাইমলাইন এন্ট্রি তৈরি করা হচ্ছে
    if (invoice.ticketId) {
      await db.maintenanceTimeline.create({
        data: {
          ticketId: invoice.ticketId,
          action: action === 'approve' ? 'invoice_approved' : 'invoice_rejected',
          description: `Invoice ${invoice.invoiceNo} ${action === 'approve' ? 'approved and sent' : 'rejected'} by ${authUser.name}. ${adjustments ? 'Costs adjusted.' : ''}`,
          performedById: authUser.id,
          metadata: JSON.stringify({ invoiceNo: invoice.invoiceNo, action, adjustments, notes, total: updateData.total, performedBy: authUser.name }),
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: action === 'approve' ? 'INVOICE_APPROVE' : 'INVOICE_REJECT',
      entity: 'MaintenanceInvoice',
      entityId: id,
      newValues: { status: newStatus, adjustments, total: updateData.total },
    })

    await emitMaintEvent('invoice:reviewed', {
      invoiceId: id,
      invoiceNo: invoice.invoiceNo,
      status: newStatus,
      action,
      performedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedInvoice)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to review invoice'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}