import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const assignedTechnicianId = searchParams.get('assignedTechnicianId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId
    if (assignedTechnicianId) where.assignedTechnicianId = assignedTechnicianId
    if (search) {
      where.OR = [
        { workOrderNo: { contains: search } },
        { serviceNotes: { contains: search } },
      ]
    }

    const [workOrders, total] = await Promise.all([
      db.maintenanceWorkOrder.findMany({
        where,
        include: {
          ticket: { select: { id: true, ticketNo: true, subject: true, category: true, priority: true, status: true } },
          customer: { select: { id: true, name: true } },
          assignedTechnician: { select: { id: true, user: { select: { name: true, phone: true } }, availabilityStatus: true } },
          createdBy: { select: { id: true, name: true } },
          materialRequests: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.maintenanceWorkOrder.count({ where }),
    ])

    const data = workOrders.map((wo) => JSON.parse(JSON.stringify(wo)))

    return NextResponse.json({ success: true, data, total, page, limit })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch work orders'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { ticketId, assignedTechnicianId, assignedTeamId, startDate, targetCompletionDate, serviceNotes } = body

    if (!ticketId) {
      return NextResponse.json({ success: false, error: 'Ticket ID is required' }, { status: 400 })
    }

    // Check if work order already exists for this ticket
    const existingWO = await db.maintenanceWorkOrder.findUnique({ where: { ticketId } })
    if (existingWO) {
      return NextResponse.json({ success: false, error: 'Work order already exists for this ticket' }, { status: 400 })
    }

    const ticket = await db.maintenanceTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    // Auto-generate work order number
    const year = new Date().getFullYear()
    const prefix = 'WO'
    const count = await db.maintenanceWorkOrder.count({
      where: { workOrderNo: { startsWith: `${prefix}-${year}` } },
    })
    const workOrderNo = `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`

    const workOrder = await db.maintenanceWorkOrder.create({
      data: {
        workOrderNo,
        ticketId,
        customerId: ticket.customerId,
        assignedTechnicianId: assignedTechnicianId || null,
        assignedTeamId: assignedTeamId || null,
        startDate: startDate ? new Date(startDate) : null,
        targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
        serviceNotes: serviceNotes || null,
        createdById: authUser.id,
      },
      include: {
        ticket: { select: { ticketNo: true, subject: true } },
      },
    })

    // Update ticket status to in_progress if not already
    if (ticket.status === 'assigned' || ticket.status === 'accepted') {
      await db.maintenanceTicket.update({
        where: { id: ticketId },
        data: { status: 'in_progress' },
      })
      await db.maintenanceTimeline.create({
        data: {
          ticketId,
          action: 'in_progress',
          description: `Work order ${workOrderNo} created, status moved to in_progress`,
          performedById: authUser.id,
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'MaintenanceWorkOrder',
      entityId: workOrder.id,
      newValues: { workOrderNo, ticketId },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(workOrder)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create work order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}