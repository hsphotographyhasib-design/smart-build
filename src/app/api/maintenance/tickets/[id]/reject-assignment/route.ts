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

interface RejectAssignmentBody {
  reason: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body: RejectAssignmentBody = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json({ success: false, error: 'Reason is required' }, { status: 400 })
    }

    const ticket = await db.maintenanceTicket.findUnique({
      where: { id },
      include: { assignedTechnician: true },
    })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status !== 'assigned') {
      return NextResponse.json({ success: false, error: `Ticket must be in 'assigned' status to reject assignment, current status: ${ticket.status}` }, { status: 400 })
    }

    // Verify authUser is the assigned technician
    if (!ticket.assignedTechnicianId || ticket.assignedTechnician?.userId !== authUser.id) {
      return NextResponse.json({ success: false, error: 'Only the assigned technician can reject this assignment' }, { status: 403 })
    }

    const previousTechnicianId = ticket.assignedTechnicianId

    const updatedTicket = await db.maintenanceTicket.update({
      where: { id },
      data: {
        assignedTechnicianId: null,
        status: 'new',
      },
    })

    // Decrement technician active jobs
    if (previousTechnicianId) {
      await db.technicianProfile.update({
        where: { id: previousTechnicianId },
        data: { totalActiveJobs: { decrement: 1 } },
      })
    }

    await db.maintenanceTimeline.create({
      data: {
        ticketId: id,
        action: 'comment',
        description: `${authUser.name} rejected the assignment: ${reason}`,
        performedById: authUser.id,
        metadata: JSON.stringify({ action: 'reject_assignment', reason, previousTechnicianId, performedBy: authUser.name }),
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'REJECT_ASSIGNMENT',
      entity: 'MaintenanceTicket',
      entityId: id,
      newValues: { status: 'new', assignedTechnicianId: null },
    })

    await emitMaintEvent('ticket:unassigned', {
      ticketId: id,
      ticketNo: ticket.ticketNo,
      reason,
      performedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedTicket)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reject assignment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}