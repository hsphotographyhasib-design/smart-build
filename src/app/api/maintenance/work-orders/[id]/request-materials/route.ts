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

interface MaterialItem {
  name: string
  quantity: number
  unit: string
  estimatedCost?: number
}

interface RequestMaterialsBody {
  items: MaterialItem[]
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
    const body: RequestMaterialsBody = await request.json()
    const { items, note } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one item is required' }, { status: 400 })
    }

    const workOrder = await db.maintenanceWorkOrder.findUnique({
      where: { id },
      include: {
        ticket: { select: { id: true, ticketNo: true, status: true } },
        assignedTechnician: true,
      },
    })
    if (!workOrder) {
      return NextResponse.json({ success: false, error: 'Work order not found' }, { status: 404 })
    }

    if (workOrder.status !== 'in_progress') {
      return NextResponse.json({ success: false, error: `Work order must be in 'in_progress' status to request materials, current status: ${workOrder.status}` }, { status: 400 })
    }

    // Verify authUser is the assigned technician
    if (!workOrder.assignedTechnicianId || workOrder.assignedTechnician?.userId !== authUser.id) {
      return NextResponse.json({ success: false, error: 'Only the assigned technician can request materials' }, { status: 403 })
    }

    const now = new Date()

    // Generate request number
    const year = now.getFullYear().toString()
    const lastMR = await db.materialRequest.findFirst({
      orderBy: { requestNo: 'desc' },
      select: { requestNo: true },
    })
    let seq = 1
    if (lastMR) {
      const parts = lastMR.requestNo.split('-')
      if (parts.length === 3 && parts[1] === year) {
        seq = parseInt(parts[2], 10) + 1
      }
    }
    const requestNo = `MR-${year}-${seq.toString().padStart(6, '0')}`

    const totalCost = items.reduce((sum: number, item: MaterialItem) => {
      const itemCost = (item.estimatedCost || 0) * item.quantity
      return sum + itemCost
    }, 0)

    // Create material request with serialized items
    const serializedItems = items.map((item: MaterialItem) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      requestedQty: item.quantity,
      issuedQty: 0,
      estimatedCost: item.estimatedCost || 0,
      notes: '',
    }))

    const materialRequest = await db.materialRequest.create({
      data: {
        requestNo,
        workOrderId: id,
        ticketId: workOrder.ticketId,
        requestedById: authUser.id,
        items: JSON.stringify(serializedItems),
        totalCost,
        status: 'requested',
        notes: note || null,
      },
    })

    // If ticket is in_progress, set to pending_parts
    if (workOrder.ticket && workOrder.ticket.status === 'in_progress') {
      await db.maintenanceTicket.update({
        where: { id: workOrder.ticketId },
        data: { status: 'pending_parts' },
      })

      await emitMaintEvent('ticket:status-changed', {
        ticketId: workOrder.ticketId,
        ticketNo: workOrder.ticket.ticketNo,
        status: 'pending_parts',
        performedBy: authUser.name,
      })
    }

    // Create timeline entry on ticket
    if (workOrder.ticketId) {
      await db.maintenanceTimeline.create({
        data: {
          ticketId: workOrder.ticketId,
          action: 'material_request',
          description: `${authUser.name} requested ${items.length} material(s) (${requestNo}). Total: ₹${totalCost.toFixed(2)}`,
          performedById: authUser.id,
          metadata: JSON.stringify({ requestNo, requestId: materialRequest.id, items, totalCost, note, performedBy: authUser.name }),
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'REQUEST_MATERIALS',
      entity: 'MaterialRequest',
      entityId: materialRequest.id,
      newValues: { requestNo, totalCost, itemCount: items.length },
    })

    await emitMaintEvent('material:request_created', {
      requestId: materialRequest.id,
      requestNo,
      workOrderId: id,
      workOrderNo: workOrder.workOrderNo,
      ticketId: workOrder.ticketId,
      itemCount: items.length,
      totalCost,
      performedBy: authUser.name,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(materialRequest)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to request materials'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}