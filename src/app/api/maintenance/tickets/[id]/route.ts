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

    const ticket = await db.maintenanceTicket.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        site: { select: { id: true, name: true, code: true, address: true, contactPerson: true, contactPhone: true } },
        equipment: { select: { id: true, name: true, code: true, qrCode: true } },
        project: { select: { id: true, name: true, code: true } },
        assignedTechnician: {
          select: { id: true, availabilityStatus: true, rating: true, specializations: true, user: { select: { id: true, name: true, phone: true, email: true, avatar: true } } },
        },
        createdBy: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
        timeline: { include: { performedBy: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: 'asc' } },
        materialRequests: { orderBy: { createdAt: 'desc' } },
        workOrder: { include: { assignedTechnician: { select: { id: true, user: { select: { name: true } } } } } },
        serviceRating: true,
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(ticket)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch ticket'
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

    const existing = await db.maintenanceTicket.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    const {
      type, category, priority, subject, description,
      customerId, siteId, building, floor, room, equipmentId, projectId,
      contactPerson, contactPhone, location,
      preferredVisitDate, preferredVisitTime,
      photos, videos, documents,
      labourHours, materialCost, serviceCost, transportCost,
      customerApproved, customerSignature, customerRating, customerFeedback,
      status,
    } = body

    const updateData: Record<string, unknown> = {}
    if (type !== undefined) updateData.type = type
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (subject !== undefined) updateData.subject = subject
    if (description !== undefined) updateData.description = description
    if (customerId !== undefined) updateData.customerId = customerId || null
    if (siteId !== undefined) updateData.siteId = siteId || null
    if (building !== undefined) updateData.building = building || null
    if (floor !== undefined) updateData.floor = floor || null
    if (room !== undefined) updateData.room = room || null
    if (equipmentId !== undefined) updateData.equipmentId = equipmentId || null
    if (projectId !== undefined) updateData.projectId = projectId || null
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson || null
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone || null
    if (location !== undefined) updateData.location = location || null
    if (preferredVisitDate !== undefined) updateData.preferredVisitDate = preferredVisitDate ? new Date(preferredVisitDate) : null
    if (preferredVisitTime !== undefined) updateData.preferredVisitTime = preferredVisitTime || null
    if (photos !== undefined) updateData.photos = JSON.stringify(photos)
    if (videos !== undefined) updateData.videos = JSON.stringify(videos)
    if (documents !== undefined) updateData.documents = JSON.stringify(documents)
    if (labourHours !== undefined) updateData.labourHours = labourHours
    if (materialCost !== undefined) updateData.materialCost = materialCost
    if (serviceCost !== undefined) updateData.serviceCost = serviceCost
    if (transportCost !== undefined) updateData.transportCost = transportCost
    if (customerApproved !== undefined) {
      updateData.customerApproved = customerApproved
      updateData.customerApprovedAt = customerApproved ? new Date() : null
    }
    if (customerSignature !== undefined) updateData.customerSignature = customerSignature
    if (customerRating !== undefined) updateData.customerRating = customerRating
    if (customerFeedback !== undefined) updateData.customerFeedback = customerFeedback

    // স্ট্যাটাস ট্রানজিশন পরিচালনা করা হচ্ছে
    if (status !== undefined && status !== existing.status) {
      updateData.status = status

      // প্রথম অ্যাসাইনমেন্টে রেসপন্স টাইম হিসাব করা হচ্ছে
      if (status === 'assigned' && !existing.assignedTechnicianId && existing.actualResponseMinutes === 0) {
        const responseMs = Date.now() - existing.createdAt.getTime()
        updateData.actualResponseMinutes = Math.round(responseMs / 60000)
      }

      // ক্লোজ তথ্য সেট করা হচ্ছে
      if (status === 'closed') {
        updateData.closedById = authUser.id
        updateData.closedAt = new Date()
        // রেজোলিউশন টাইম হিসাব করা হচ্ছে
        if (existing.actualResolutionMinutes === 0) {
          const resolutionMs = Date.now() - existing.createdAt.getTime()
          updateData.actualResolutionMinutes = Math.round(resolutionMs / 60000)
        }
      }

      // SLA লঙ্ঘন যাচাই করা হচ্ছে
      if (existing.resolutionDeadline && new Date() > existing.resolutionDeadline && status !== 'closed') {
        updateData.slaBreached = true
      }

      // স্ট্যাটাস পরিবর্তনের জন্য টাইমলাইন এন্ট্রি তৈরি করা হচ্ছে
      await db.maintenanceTimeline.create({
        data: {
          ticketId: id,
          action: status,
          description: `Status changed from ${existing.status} to ${status}`,
          performedById: authUser.id,
        },
      })
    }

    // মোট খরচ হিসাব করা হচ্ছে
    if (labourHours !== undefined || materialCost !== undefined || serviceCost !== undefined || transportCost !== undefined) {
      const lH = labourHours !== undefined ? labourHours : existing.labourHours
      const mC = materialCost !== undefined ? materialCost : existing.materialCost
      const sC = serviceCost !== undefined ? serviceCost : existing.serviceCost
      const tC = transportCost !== undefined ? transportCost : existing.transportCost
      updateData.totalCost = (lH * 200) + mC + sC + tC
    }

    const ticket = await db.maintenanceTicket.update({
      where: { id },
      data: updateData as any,
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'MaintenanceTicket',
      entityId: id,
      newValues: { status: updateData.status || existing.status },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(ticket)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update ticket'
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

    const existing = await db.maintenanceTicket.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    if (existing.status === 'closed') {
      return NextResponse.json({ success: false, error: 'Ticket is already closed' }, { status: 400 })
    }

    const ticket = await db.maintenanceTicket.update({
      where: { id },
      data: {
        status: 'closed',
        closedById: authUser.id,
        closedAt: new Date(),
      },
    })

    await db.maintenanceTimeline.create({
      data: {
        ticketId: id,
        action: 'closed',
        description: 'Ticket soft-deleted (closed)',
        performedById: authUser.id,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'MaintenanceTicket',
      entityId: id,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(ticket)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete ticket'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}