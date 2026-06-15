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

interface CloseBody {
  note?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Only admin or manager can close
    if (!requireRole(authUser, ['admin', 'manager'])) {
      return NextResponse.json({ success: false, error: 'Only admin or manager can close tickets' }, { status: 403 })
    }

    const { id } = await params
    const body: CloseBody = await request.json()

    const ticket = await db.maintenanceTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status === 'closed') {
      return NextResponse.json({ success: false, error: 'Ticket is already closed' }, { status: 400 })
    }

    const now = new Date()
    const actualResolutionMinutes = Math.round((now.getTime() - ticket.createdAt.getTime()) / 60000)

    const updatedTicket = await db.maintenanceTicket.update({
      where: { id },
      data: {
        status: 'closed',
        closedById: authUser.id,
        closedAt: now,
        actualResolutionMinutes,
      },
    })

    await db.maintenanceTimeline.create({
      data: {
        ticketId: id,
        action: 'closed',
        description: `${authUser.name} closed the ticket. Resolution time: ${actualResolutionMinutes} minutes${body.note ? `. Note: ${body.note}` : ''}`,
        performedById: authUser.id,
        metadata: JSON.stringify({ action: 'close', note: body.note, actualResolutionMinutes, performedBy: authUser.name }),
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CLOSE',
      entity: 'MaintenanceTicket',
      entityId: id,
      newValues: { status: 'closed', actualResolutionMinutes },
    })

    await emitMaintEvent('ticket:closed', {
      ticketId: id,
      ticketNo: ticket.ticketNo,
      actualResolutionMinutes,
      performedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedTicket)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to close ticket'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}