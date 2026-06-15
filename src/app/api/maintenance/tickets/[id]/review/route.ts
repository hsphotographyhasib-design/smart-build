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
  } catch { /* ignore */ }
}

interface ReviewBody {
  action: 'approve' | 'reject' | 'request_info'
  note?: string
  priority?: string
  category?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body: ReviewBody = await request.json()
    const { action, note, priority, category } = body

    if (!action || !['approve', 'reject', 'request_info'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Valid action is required: approve, reject, or request_info' }, { status: 400 })
    }

    const ticket = await db.maintenanceTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status !== 'new') {
      return NextResponse.json({ success: false, error: `Ticket must be in 'new' status to review, current status: ${ticket.status}` }, { status: 400 })
    }

    let updatedTicket
    const now = new Date()

    if (action === 'approve') {
      const updateData: Record<string, unknown> = { status: 'under_review' }
      if (priority) updateData.priority = priority
      if (category) updateData.category = category

      updatedTicket = await db.maintenanceTicket.update({
        where: { id },
        data: updateData,
      })

      await db.maintenanceTimeline.create({
        data: {
          ticketId: id,
          action: 'under_review',
          description: `Ticket reviewed and approved by ${authUser.name}${note ? `: ${note}` : ''}`,
          performedById: authUser.id,
          metadata: JSON.stringify({ action: 'approve', note, priority, category, performedBy: authUser.name }),
        },
      })
    } else if (action === 'reject') {
      if (!note) {
        return NextResponse.json({ success: false, error: 'Reason (note) is required for rejection' }, { status: 400 })
      }

      updatedTicket = await db.maintenanceTicket.update({
        where: { id },
        data: {
          status: 'closed',
          closedById: authUser.id,
          closedAt: now,
        },
      })

      await db.maintenanceTimeline.create({
        data: {
          ticketId: id,
          action: 'closed',
          description: `Ticket rejected by ${authUser.name}: ${note}`,
          performedById: authUser.id,
          metadata: JSON.stringify({ action: 'reject', note, performedBy: authUser.name }),
        },
      })
    } else {
      // request_info — keep status unchanged
      if (!note) {
        return NextResponse.json({ success: false, error: 'Note is required when requesting more info' }, { status: 400 })
      }

      updatedTicket = ticket

      await db.maintenanceTimeline.create({
        data: {
          ticketId: id,
          action: 'comment',
          description: `${authUser.name} requested more information: ${note}`,
          performedById: authUser.id,
          metadata: JSON.stringify({ action: 'request_info', note, performedBy: authUser.name }),
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'REVIEW',
      entity: 'MaintenanceTicket',
      entityId: id,
      newValues: { action, status: updatedTicket.status },
    })

    await emitMaintEvent('ticket:status-changed', {
      ticketId: id,
      ticketNo: ticket.ticketNo,
      status: updatedTicket.status,
      action,
      performedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedTicket)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to review ticket'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}