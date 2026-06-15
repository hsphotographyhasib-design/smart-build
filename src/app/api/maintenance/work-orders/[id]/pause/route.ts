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

interface PauseBody {
  note: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body: PauseBody = await request.json()
    const { note } = body

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note is required when pausing work' }, { status: 400 })
    }

    const workOrder = await db.maintenanceWorkOrder.findUnique({
      where: { id },
      include: { ticket: { select: { id: true, ticketNo: true } } },
    })
    if (!workOrder) {
      return NextResponse.json({ success: false, error: 'Work order not found' }, { status: 404 })
    }

    if (workOrder.status !== 'in_progress') {
      return NextResponse.json({ success: false, error: `Work order must be in 'in_progress' status to pause, current status: ${workOrder.status}` }, { status: 400 })
    }

    // প্রমাণীকৃত ব্যবহারকারী নির্ধারিত টেকনিশিয়ান কিনা যাচাই করা হচ্ছে
    if (!workOrder.assignedTechnicianId) {
      return NextResponse.json({ success: false, error: 'No technician assigned to this work order' }, { status: 400 })
    }

    const technician = await db.technicianProfile.findUnique({ where: { id: workOrder.assignedTechnicianId } })
    if (!technician || technician.userId !== authUser.id) {
      return NextResponse.json({ success: false, error: 'Only the assigned technician can pause this work order' }, { status: 403 })
    }

    // ওয়ার্ক অর্ডারের স্ট্যাটাস in_progress থাকছে — শুধু টাইমলাইন এন্ট্রি যোগ করা হচ্ছে
    if (workOrder.ticket) {
      await db.maintenanceTimeline.create({
        data: {
          ticketId: workOrder.ticketId,
          action: 'comment',
          description: `${authUser.name} paused work: ${note}`,
          performedById: authUser.id,
          metadata: JSON.stringify({ workOrderNo: workOrder.workOrderNo, action: 'pause', note, performedBy: authUser.name }),
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'PAUSE',
      entity: 'MaintenanceWorkOrder',
      entityId: id,
      newValues: { note },
    })

    await emitMaintEvent('work_order:updated', {
      workOrderId: id,
      workOrderNo: workOrder.workOrderNo,
      status: 'in_progress',
      pauseNote: note,
      performedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: { workOrder: JSON.parse(JSON.stringify(workOrder)), message: 'Work paused' } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to pause work order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}