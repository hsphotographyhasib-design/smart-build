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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const workOrder = await db.maintenanceWorkOrder.findUnique({
      where: { id },
      include: { ticket: { select: { id: true, ticketNo: true, status: true } } },
    })
    if (!workOrder) {
      return NextResponse.json({ success: false, error: 'Work order not found' }, { status: 404 })
    }

    if (workOrder.status !== 'pending') {
      return NextResponse.json({ success: false, error: `Work order must be in 'pending' status to start, current status: ${workOrder.status}` }, { status: 400 })
    }

    // প্রমাণীকৃত ব্যবহারকারী নির্ধারিত টেকনিশিয়ান কিনা যাচাই করা হচ্ছে
    if (!workOrder.assignedTechnicianId) {
      return NextResponse.json({ success: false, error: 'No technician assigned to this work order' }, { status: 400 })
    }

    const technician = await db.technicianProfile.findUnique({ where: { id: workOrder.assignedTechnicianId } })
    if (!technician || technician.userId !== authUser.id) {
      return NextResponse.json({ success: false, error: 'Only the assigned technician can start this work order' }, { status: 403 })
    }

    const now = new Date()
    const updatedWO = !workOrder.startDate
      ? await db.maintenanceWorkOrder.update({
          where: { id },
          data: { status: 'in_progress', startDate: now },
        })
      : await db.maintenanceWorkOrder.update({
          where: { id },
          data: { status: 'in_progress' },
        })

    // সংযুক্ত টিকেটের স্ট্যাটাস আপডেট করা হচ্ছে
    if (workOrder.ticket) {
      await db.maintenanceTicket.update({
        where: { id: workOrder.ticketId },
        data: { status: 'in_progress' },
      })

      await db.maintenanceTimeline.create({
        data: {
          ticketId: workOrder.ticketId,
          action: 'in_progress',
          description: `${authUser.name} started work on the job`,
          performedById: authUser.id,
          metadata: JSON.stringify({ workOrderNo: workOrder.workOrderNo, performedBy: authUser.name }),
        },
      })

      await emitMaintEvent('ticket:status-changed', {
        ticketId: workOrder.ticketId,
        ticketNo: workOrder.ticket.ticketNo,
        status: 'in_progress',
        performedBy: authUser.name,
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'START',
      entity: 'MaintenanceWorkOrder',
      entityId: id,
      newValues: { status: 'in_progress' },
    })

    await emitMaintEvent('work_order:updated', {
      workOrderId: id,
      workOrderNo: workOrder.workOrderNo,
      status: 'in_progress',
      performedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedWO)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to start work order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}