import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const ticket = await db.maintenanceTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    const timeline = await db.maintenanceTimeline.findMany({
      where: { ticketId: id },
      include: { performedBy: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(timeline)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch timeline'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { action, description, metadata, updateTicketStatus } = body

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 })
    }

    const ticket = await db.maintenanceTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    const timeline = await db.maintenanceTimeline.create({
      data: {
        ticketId: id,
        action,
        description: description || null,
        metadata: metadata ? JSON.stringify(metadata) : '{}',
        performedById: authUser.id,
      },
      include: { performedBy: { select: { id: true, name: true, avatar: true } } },
    })

    // Optionally update ticket status
    if (updateTicketStatus && updateTicketStatus !== ticket.status) {
      const statusData: Record<string, unknown> = { status: updateTicketStatus }

      if (updateTicketStatus === 'closed') {
        statusData.closedById = authUser.id
        statusData.closedAt = new Date()
        if (ticket.actualResolutionMinutes === 0) {
          statusData.actualResolutionMinutes = Math.round((Date.now() - ticket.createdAt.getTime()) / 60000)
        }
      }

      if (updateTicketStatus === 'assigned' && ticket.actualResponseMinutes === 0) {
        statusData.actualResponseMinutes = Math.round((Date.now() - ticket.createdAt.getTime()) / 60000)
      }

      if (ticket.resolutionDeadline && new Date() > ticket.resolutionDeadline && updateTicketStatus !== 'closed') {
        statusData.slaBreached = true
      }

      await db.maintenanceTicket.update({
        where: { id },
        data: statusData as any,
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'MaintenanceTimeline',
      entityId: timeline.id,
      newValues: { ticketId: id, action },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(timeline)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create timeline entry'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}