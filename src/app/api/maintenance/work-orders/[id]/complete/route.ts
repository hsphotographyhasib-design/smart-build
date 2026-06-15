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

interface UsedMaterial {
  name: string
  quantity: number
  unit: string
  cost: number
}

interface CompleteBody {
  completionNotes: string
  labourHours: number
  photos?: string[]
  usedMaterials?: UsedMaterial[]
  serviceNotes?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body: CompleteBody = await request.json()
    const { completionNotes, labourHours, photos, usedMaterials, serviceNotes } = body

    if (!completionNotes) {
      return NextResponse.json({ success: false, error: 'Completion notes are required' }, { status: 400 })
    }
    if (labourHours === undefined || labourHours < 0) {
      return NextResponse.json({ success: false, error: 'Valid labour hours are required' }, { status: 400 })
    }

    const workOrder = await db.maintenanceWorkOrder.findUnique({
      where: { id },
      include: {
        ticket: true,
        assignedTechnician: true,
      },
    })
    if (!workOrder) {
      return NextResponse.json({ success: false, error: 'Work order not found' }, { status: 404 })
    }

    if (workOrder.status !== 'in_progress') {
      return NextResponse.json({ success: false, error: `Work order must be in 'in_progress' status to complete, current status: ${workOrder.status}` }, { status: 400 })
    }

    // Verify authUser is the assigned technician
    if (!workOrder.assignedTechnicianId || workOrder.assignedTechnician?.userId !== authUser.id) {
      return NextResponse.json({ success: false, error: 'Only the assigned technician can complete this work order' }, { status: 403 })
    }

    const now = new Date()
    const labourCost = labourHours * 200
    const materialsCost = usedMaterials ? usedMaterials.reduce((sum: number, m: UsedMaterial) => sum + (m.cost * m.quantity), 0) : 0
    const materialCostTotal = workOrder.materialCost + materialsCost

    // Generate invoice number
    const year = now.getFullYear().toString()
    const lastInvoice = await db.maintenanceInvoice.findFirst({
      orderBy: { invoiceNo: 'desc' },
      select: { invoiceNo: true },
    })
    let seq = 1
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNo.split('-')
      if (parts.length === 3 && parts[1] === year) {
        seq = parseInt(parts[2], 10) + 1
      }
    }
    const invoiceNo = `MIV-${year}-${seq.toString().padStart(6, '0')}`

    const invoiceTotal = labourCost + materialsCost + (workOrder.ticket.transportCost || 0) + (workOrder.ticket.serviceCost || 0)

    // Execute transaction
    const [updatedWO, updatedTicket, invoice] = await db.$transaction([
      // 1. Complete work order
      db.maintenanceWorkOrder.update({
        where: { id },
        data: {
          status: 'completed',
          actualCompletionDate: now,
          labourHours,
          materialCost: materialCostTotal,
          serviceCost: workOrder.ticket.serviceCost || 0,
          totalCost: labourCost + materialCostTotal + (workOrder.ticket.serviceCost || 0),
          completionNotes,
          serviceNotes: serviceNotes || null,
          photos: photos ? JSON.stringify(photos) : undefined,
        },
      }),
      // 2. Update ticket costs and status
      db.maintenanceTicket.update({
        where: { id: workOrder.ticketId },
        data: {
          labourHours,
          materialCost: workOrder.ticket.materialCost + materialsCost,
          serviceCost: workOrder.ticket.serviceCost || 0,
          totalCost: labourCost * 200 + (workOrder.ticket.materialCost + materialsCost) + (workOrder.ticket.serviceCost || 0) + (workOrder.ticket.transportCost || 0),
          status: 'pending_customer',
        },
      }),
      // 3. Auto-generate invoice
      db.maintenanceInvoice.create({
        data: {
          invoiceNo,
          ticketId: workOrder.ticketId,
          workOrderId: id,
          customerId: workOrder.ticket.customerId || workOrder.customerId || '',
          labourCost,
          materialCost: materialsCost,
          transportCost: workOrder.ticket.transportCost || 0,
          serviceCharges: workOrder.ticket.serviceCost || 0,
          tax: 0,
          discount: 0,
          total: invoiceTotal,
          status: 'draft',
          issuedById: authUser.id,
        },
      }),
    ])

    // Create timeline entries
    await db.maintenanceTimeline.create({
      data: {
        ticketId: workOrder.ticketId,
        action: 'completed',
        description: `${authUser.name} completed the work. Labour: ${labourHours}h, Materials: ₹${materialsCost.toFixed(2)}`,
        performedById: authUser.id,
        metadata: JSON.stringify({ workOrderNo: workOrder.workOrderNo, labourHours, materialsCost, performedBy: authUser.name }),
      },
    })

    await db.maintenanceTimeline.create({
      data: {
        ticketId: workOrder.ticketId,
        action: 'pending_customer',
        description: `Invoice ${invoiceNo} generated. Awaiting customer verification.`,
        performedById: authUser.id,
        metadata: JSON.stringify({ invoiceNo, invoiceId: invoice.id, total: invoiceTotal }),
      },
    })

    // Update technician stats
    if (workOrder.assignedTechnicianId) {
      await db.technicianProfile.update({
        where: { id: workOrder.assignedTechnicianId },
        data: {
          totalCompletedJobs: { increment: 1 },
          totalActiveJobs: { decrement: 1 },
          availabilityStatus: 'available',
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'COMPLETE',
      entity: 'MaintenanceWorkOrder',
      entityId: id,
      newValues: { status: 'completed', labourHours, materialCost: materialCostTotal },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'GENERATE',
      entity: 'MaintenanceInvoice',
      entityId: invoice.id,
      newValues: { invoiceNo, total: invoiceTotal, status: 'draft' },
    })

    await emitMaintEvent('work_order:completed', {
      workOrderId: id,
      workOrderNo: workOrder.workOrderNo,
      ticketId: workOrder.ticketId,
      performedBy: authUser.name,
    })

    await emitMaintEvent('ticket:status-changed', {
      ticketId: workOrder.ticketId,
      ticketNo: workOrder.ticket.ticketNo,
      status: 'pending_customer',
      performedBy: authUser.name,
    })

    await emitMaintEvent('invoice:generated', {
      invoiceId: invoice.id,
      invoiceNo,
      ticketId: workOrder.ticketId,
      total: invoiceTotal,
    })

    return NextResponse.json({
      success: true,
      data: {
        workOrder: JSON.parse(JSON.stringify(updatedWO)),
        ticket: JSON.parse(JSON.stringify(updatedTicket)),
        invoice: JSON.parse(JSON.stringify(invoice)),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to complete work order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}