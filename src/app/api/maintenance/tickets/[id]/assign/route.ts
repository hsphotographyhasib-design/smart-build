import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { technicianId, teamId } = body

    if (!technicianId) {
      return NextResponse.json({ success: false, error: 'Technician ID is required' }, { status: 400 })
    }

    const ticket = await db.maintenanceTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    const technician = await db.technicianProfile.findUnique({ where: { id: technicianId }, include: { user: { select: { name: true } } } })
    if (!technician) {
      return NextResponse.json({ success: false, error: 'Technician not found' }, { status: 404 })
    }

    if (technician.availabilityStatus !== 'available') {
      return NextResponse.json({ success: false, error: `Technician is ${technician.availabilityStatus}` }, { status: 400 })
    }

    // Check if technician has capacity
    if (technician.totalActiveJobs >= technician.maxJobsPerDay) {
      return NextResponse.json({ success: false, error: 'Technician has reached maximum jobs capacity' }, { status: 400 })
    }

    // Update ticket
    const updatedTicket = await db.maintenanceTicket.update({
      where: { id },
      data: {
        assignedTechnicianId: technicianId,
        assignedTeamId: teamId || null,
        status: 'assigned',
        actualResponseMinutes: ticket.actualResponseMinutes === 0
          ? Math.round((Date.now() - ticket.createdAt.getTime()) / 60000)
          : undefined,
      },
      include: {
        assignedTechnician: {
          select: { id: true, availabilityStatus: true, rating: true, user: { select: { name: true, phone: true } } },
        },
      },
    })

    // Update technician active jobs
    await db.technicianProfile.update({
      where: { id: technicianId },
      data: { totalActiveJobs: { increment: 1 } },
    })

    // Create timeline entry
    await db.maintenanceTimeline.create({
      data: {
        ticketId: id,
        action: 'assigned',
        description: `Assigned to ${technician.user?.name || 'technician'}`,
        performedById: authUser.id,
        metadata: JSON.stringify({ technicianId, technicianName: technician.user?.name }),
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'ASSIGN',
      entity: 'MaintenanceTicket',
      entityId: id,
      newValues: { assignedTechnicianId: technicianId, status: 'assigned' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedTicket)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to assign technician'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}