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

    const technician = await db.technicianProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, isActive: true } },
        employee: { select: { id: true, empCode: true, department: true, designation: true, joinDate: true } },
        tickets: {
          where: { status: { not: 'closed' } },
          include: {
            customer: { select: { name: true } },
            site: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        pmSchedules: { where: { isActive: true }, orderBy: { nextVisitDate: 'asc' } },
        serviceRatings: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })

    if (!technician) {
      return NextResponse.json({ success: false, error: 'Technician not found' }, { status: 404 })
    }

    const data = {
      ...JSON.parse(JSON.stringify(technician)),
      activeJobs: technician.tickets.length,
      activePMSchedules: technician.pmSchedules.length,
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch technician'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const existing = await db.technicianProfile.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Technician not found' }, { status: 404 })
    }

    const { specializations, certifications, availabilityStatus, maxJobsPerDay, latitude, longitude, currentLocation } = body

    const updateData: Record<string, unknown> = {}
    if (specializations !== undefined) updateData.specializations = JSON.stringify(specializations)
    if (certifications !== undefined) updateData.certifications = JSON.stringify(certifications)
    if (availabilityStatus !== undefined) updateData.availabilityStatus = availabilityStatus
    if (maxJobsPerDay !== undefined) updateData.maxJobsPerDay = maxJobsPerDay
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude
    if (currentLocation !== undefined) updateData.currentLocation = currentLocation

    const technician = await db.technicianProfile.update({
      where: { id },
      data: updateData as any,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'TechnicianProfile',
      entityId: id,
      newValues: updateData,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(technician)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update technician'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.technicianProfile.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Technician not found' }, { status: 404 })
    }

    // Check for active jobs
    const activeJobs = await db.maintenanceTicket.count({
      where: { assignedTechnicianId: id, status: { notIn: ['closed', 'completed'] } },
    })
    if (activeJobs > 0) {
      return NextResponse.json({ success: false, error: 'Cannot delete technician with active jobs' }, { status: 400 })
    }

    await db.technicianProfile.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'TechnicianProfile',
      entityId: id,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete technician'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}