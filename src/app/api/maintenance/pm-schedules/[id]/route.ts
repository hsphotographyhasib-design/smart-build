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

    const schedule = await db.pMSchedule.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        site: { select: { id: true, name: true, code: true, address: true } },
        assignedTechnician: { select: { id: true, availabilityStatus: true, rating: true, user: { select: { name: true, phone: true, email: true } } } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    if (!schedule) {
      return NextResponse.json({ success: false, error: 'PM schedule not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(schedule)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch PM schedule'
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

    const existing = await db.pMSchedule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'PM schedule not found' }, { status: 404 })
    }

    const {
      customerId, siteId, equipmentId, assetId,
      scheduleType, frequencyMonths,
      assignedTechnicianId, description,
      lastVisitDate, nextVisitDate,
      visitCount, totalVisits, isActive, autoGenerateWorkOrder,
    } = body

    const updateData: Record<string, unknown> = {}
    if (customerId !== undefined) updateData.customerId = customerId || null
    if (siteId !== undefined) updateData.siteId = siteId || null
    if (equipmentId !== undefined) updateData.equipmentId = equipmentId || null
    if (assetId !== undefined) updateData.assetId = assetId || null
    if (scheduleType !== undefined) updateData.scheduleType = scheduleType
    if (frequencyMonths !== undefined) updateData.frequencyMonths = frequencyMonths
    if (assignedTechnicianId !== undefined) updateData.assignedTechnicianId = assignedTechnicianId || null
    if (description !== undefined) updateData.description = description
    if (lastVisitDate !== undefined) updateData.lastVisitDate = lastVisitDate ? new Date(lastVisitDate) : null
    if (nextVisitDate !== undefined) updateData.nextVisitDate = nextVisitDate ? new Date(nextVisitDate) : null
    if (visitCount !== undefined) updateData.visitCount = visitCount
    if (totalVisits !== undefined) updateData.totalVisits = totalVisits
    if (isActive !== undefined) updateData.isActive = isActive
    if (autoGenerateWorkOrder !== undefined) updateData.autoGenerateWorkOrder = autoGenerateWorkOrder

    const schedule = await db.pMSchedule.update({
      where: { id },
      data: updateData as any,
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'PMSchedule',
      entityId: id,
      newValues: updateData,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(schedule)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update PM schedule'
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

    const existing = await db.pMSchedule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'PM schedule not found' }, { status: 404 })
    }

    await db.pMSchedule.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'PMSchedule',
      entityId: id,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete PM schedule'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}