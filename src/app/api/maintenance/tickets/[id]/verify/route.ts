import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

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

interface VerifyBody {
  action: 'approve' | 'reject' | 'rework'
  rating?: number
  feedback?: string
  signature?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body: VerifyBody = await request.json()
    const { action, rating, feedback, signature } = body

    if (!action || !['approve', 'reject', 'rework'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Valid action is required: approve, reject, or rework' }, { status: 400 })
    }

    const ticket = await db.maintenanceTicket.findUnique({
      where: { id },
      include: { workOrder: true },
    })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status !== 'pending_customer' && ticket.status !== 'customer_verification') {
      return NextResponse.json({ success: false, error: `Ticket must be in 'pending_customer' or 'customer_verification' status to verify, current status: ${ticket.status}` }, { status: 400 })
    }

    const now = new Date()

    if (action === 'approve') {
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 })
      }

      const updatedTicket = await db.maintenanceTicket.update({
        where: { id },
        data: {
          customerApproved: true,
          customerApprovedAt: now,
          customerRating: rating || null,
          customerFeedback: feedback || null,
          customerSignature: signature || null,
          status: 'completed',
        },
      })

      // সংযুক্ত ইনভয়েস আপডেট করা হচ্ছে: ফাইন্যান্স রিভিউয়ের জন্য ড্রাফট রাখা হচ্ছে (স্ট্যাটাস পরিবর্তন নেই)
      await db.maintenanceTimeline.create({
        data: {
          ticketId: id,
          action: 'customer_verification',
          description: `Customer approved the work. Rating: ${rating || 'N/A'}${feedback ? `. Feedback: ${feedback}` : ''}`,
          performedById: authUser.id,
          metadata: JSON.stringify({ action: 'approve', rating, feedback, performedBy: authUser.name }),
        },
      })

      await createAuditLog({
        userId: authUser.id,
        action: 'CUSTOMER_APPROVE',
        entity: 'MaintenanceTicket',
        entityId: id,
        newValues: { status: 'completed', customerApproved: true, customerRating: rating },
      })

      await emitMaintEvent('ticket:customer_approved', {
        ticketId: id,
        ticketNo: ticket.ticketNo,
        rating,
        feedback,
        performedBy: authUser.name,
      })

      return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedTicket)) })
    }

    // প্রত্যাখ্যান বা পুনর্কাজ
    const updatedTicket = await db.maintenanceTicket.update({
      where: { id },
      data: { status: 'in_progress' },
    })

    // সংযুক্ত ওয়ার্ক অর্ডার সম্পন্ন হলে, আবার in_progress-এ সেট করা হচ্ছে
    if (ticket.workOrder && ticket.workOrder.status === 'completed') {
      await db.maintenanceWorkOrder.update({
        where: { id: ticket.workOrder.id },
        data: { status: 'in_progress', actualCompletionDate: null },
      })
    }

    await db.maintenanceTimeline.create({
      data: {
        ticketId: id,
        action: 'comment',
        description: `Customer ${action === 'rework' ? 'requested rework' : 'rejected'} the work${feedback ? `: ${feedback}` : ''}`,
        performedById: authUser.id,
        metadata: JSON.stringify({ action, feedback, performedBy: authUser.name }),
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: action === 'rework' ? 'CUSTOMER_REWORK' : 'CUSTOMER_REJECT',
      entity: 'MaintenanceTicket',
      entityId: id,
      newValues: { status: 'in_progress', action },
    })

    await emitMaintEvent('ticket:status-changed', {
      ticketId: id,
      ticketNo: ticket.ticketNo,
      status: 'in_progress',
      action,
      performedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedTicket)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify ticket'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}