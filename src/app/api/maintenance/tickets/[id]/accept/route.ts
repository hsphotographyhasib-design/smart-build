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

interface AcceptBody {
  note?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body: AcceptBody = await request.json()

    const ticket = await db.maintenanceTicket.findUnique({
      where: { id },
      include: {
        assignedTechnician: true,
      },
    })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status !== 'assigned') {
      return NextResponse.json({ success: false, error: `Ticket must be in 'assigned' status to accept, current status: ${ticket.status}` }, { status: 400 })
    }

    // Verify authUser is the assigned technician
    if (!ticket.assignedTechnicianId || ticket.assignedTechnician?.userId !== authUser.id) {
      return NextResponse.json({ success: false, error: 'Only the assigned technician can accept this ticket' }, { status: 403 })
    }

    const now = new Date()

    // Generate WO number
    const year = now.getFullYear().toString()
    const lastWO = await db.maintenanceWorkOrder.findFirst({
      orderBy: { workOrderNo: 'desc' },
      select: { workOrderNo: true },
    })
    let seq = 1
    if (lastWO) {
      const parts = lastWO.workOrderNo.split('-')
      if (parts.length === 3 && parts[1] === year) {
        seq = parseInt(parts[2], 10) + 1
      }
    }
    const workOrderNo = `WO-${year}-${seq.toString().padStart(6, '0')}`

    // Calculate target completion date
    const targetDate = ticket.resolutionDeadline
      ? new Date(ticket.resolutionDeadline)
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [updatedTicket, workOrder] = await db.$transaction([
      // Update ticket status
      db.maintenanceTicket.update({
        where: { id },
        data: { status: 'accepted' },
      }),
      // Create work order
      db.maintenanceWorkOrder.create({
        data: {
          workOrderNo,
          ticketId: id,
          customerId: ticket.customerId || undefined,
          assignedTechnicianId: ticket.assignedTechnicianId,
          startDate: now,
          targetCompletionDate: targetDate,
          status: 'pending',
          createdById: authUser.id,
        },
      }),
    ])

    // Create timeline entries
    await db.maintenanceTimeline.create({
      data: {
        ticketId: id,
        action: 'accepted',
        description: `${authUser.name} accepted the job${body.note ? `: ${body.note}` : ''}`,
        performedById: authUser.id,
        metadata: JSON.stringify({ workOrderNo, performedBy: authUser.name }),
      },
    })

    await db.maintenanceTimeline.create({
      data: {
        ticketId: id,
        action: 'work_order_created',
        description: `Work order ${workOrderNo} created automatically`,
        performedById: authUser.id,
        metadata: JSON.stringify({ workOrderNo, workOrderId: workOrder.id }),
      },
    })

    // Update technician availability
    await db.technicianProfile.update({
      where: { id: ticket.assignedTechnicianId! },
      data: { availabilityStatus: 'busy' },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'ACCEPT',
      entity: 'MaintenanceTicket',
      entityId: id,
      newValues: { status: 'accepted', workOrderNo },
    })

    await emitMaintEvent('ticket:status-changed', {
      ticketId: id,
      ticketNo: ticket.ticketNo,
      status: 'accepted',
      performedBy: authUser.name,
    })

    await emitMaintEvent('ticket:accepted', {
      ticketId: id,
      ticketNo: ticket.ticketNo,
      technicianName: authUser.name,
    })

    await emitMaintEvent('work_order:created', {
      workOrderId: workOrder.id,
      workOrderNo,
      ticketId: id,
      ticketNo: ticket.ticketNo,
    })

    return NextResponse.json({
      success: true,
      data: {
        ticket: JSON.parse(JSON.stringify(updatedTicket)),
        workOrder: JSON.parse(JSON.stringify(workOrder)),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to accept ticket'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}