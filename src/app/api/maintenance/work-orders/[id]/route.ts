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

    const workOrder = await db.maintenanceWorkOrder.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            customer: { select: { id: true, name: true } },
            site: { select: { id: true, name: true, address: true } },
          },
        },
        customer: true,
        assignedTechnician: { select: { id: true, availabilityStatus: true, rating: true, user: { select: { name: true, phone: true, email: true } } } },
        createdBy: { select: { id: true, name: true } },
        materialRequests: { orderBy: { createdAt: 'desc' } },
        invoice: true,
      },
    })

    if (!workOrder) {
      return NextResponse.json({ success: false, error: 'Work order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(workOrder)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch work order'
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

    const existing = await db.maintenanceWorkOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Work order not found' }, { status: 404 })
    }

    const {
      status, assignedTechnicianId, assignedTeamId,
      startDate, targetCompletionDate, actualCompletionDate,
      labourHours, materialCost, serviceCost,
      serviceNotes, completionNotes, photos,
    } = body

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (assignedTechnicianId !== undefined) updateData.assignedTechnicianId = assignedTechnicianId || null
    if (assignedTeamId !== undefined) updateData.assignedTeamId = assignedTeamId || null
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (targetCompletionDate !== undefined) updateData.targetCompletionDate = targetCompletionDate ? new Date(targetCompletionDate) : null
    if (actualCompletionDate !== undefined) updateData.actualCompletionDate = actualCompletionDate ? new Date(actualCompletionDate) : null
    if (labourHours !== undefined) updateData.labourHours = labourHours
    if (materialCost !== undefined) updateData.materialCost = materialCost
    if (serviceCost !== undefined) updateData.serviceCost = serviceCost
    if (serviceNotes !== undefined) updateData.serviceNotes = serviceNotes
    if (completionNotes !== undefined) updateData.completionNotes = completionNotes
    if (photos !== undefined) updateData.photos = JSON.stringify(photos)

    // মোট পরিমাণ পুনরায় হিসাব করা হচ্ছে
    if (labourHours !== undefined || materialCost !== undefined || serviceCost !== undefined) {
      const lH = labourHours !== undefined ? labourHours : existing.labourHours
      const mC = materialCost !== undefined ? materialCost : existing.materialCost
      const sC = serviceCost !== undefined ? serviceCost : existing.serviceCost
      updateData.totalCost = (lH * 200) + mC + sC
    }

    // সমাপ্তি পরিচালনা করা হচ্ছে
    if (status === 'completed' && !existing.actualCompletionDate) {
      updateData.actualCompletionDate = new Date()
    }

    const workOrder = await db.maintenanceWorkOrder.update({
      where: { id },
      data: updateData as any,
      include: {
        ticket: { select: { id: true, ticketNo: true } },
      },
    })

    // ওয়ার্ক অর্ডার সম্পন্ন হলে টিকেটের খরচ আপডেট করা হচ্ছে
    if (status === 'completed' && existing.ticketId) {
      await db.maintenanceTicket.update({
        where: { id: existing.ticketId },
        data: {
          labourHours: workOrder.labourHours ?? 0,
          materialCost: workOrder.materialCost,
          serviceCost: workOrder.serviceCost,
          totalCost: workOrder.totalCost,
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'MaintenanceWorkOrder',
      entityId: id,
      newValues: { status: updateData.status || existing.status },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(workOrder)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update work order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}