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

    const materialRequest = await db.materialRequest.findUnique({
      where: { id },
      include: {
        workOrder: { select: { id: true, workOrderNo: true, status: true } },
        ticket: { select: { id: true, ticketNo: true, subject: true, status: true } },
        requestedBy: { select: { id: true, name: true, phone: true } },
        supervisorApprovedBy: { select: { id: true, name: true } },
        issuedBy: { select: { id: true, name: true } },
      },
    })

    if (!materialRequest) {
      return NextResponse.json({ success: false, error: 'Material request not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(materialRequest)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch material request'
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

    const existing = await db.materialRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Material request not found' }, { status: 404 })
    }

    const { status, items, totalCost, notes } = body
    const updateData: Record<string, unknown> = {}

    if (items !== undefined) updateData.items = JSON.stringify(items)
    if (totalCost !== undefined) updateData.totalCost = totalCost
    if (notes !== undefined) updateData.notes = notes

    // অনুমোদন ওয়ার্কফ্লো পরিচালনা করা হচ্ছে
    if (status !== undefined && status !== existing.status) {
      updateData.status = status

      if (status === 'supervisor_approved') {
        updateData.supervisorApprovedById = authUser.id
        updateData.supervisorApprovedAt = new Date()
      }

      if (status === 'store_approved') {
        updateData.supervisorApprovedById = authUser.id
        updateData.supervisorApprovedAt = new Date()
      }

      if (status === 'issued') {
        updateData.issuedById = authUser.id
        updateData.issuedAt = new Date()
      }

      if (status === 'rejected') {
        updateData.supervisorApprovedById = authUser.id
        updateData.supervisorApprovedAt = new Date()
      }
    }

    const materialRequest = await db.materialRequest.update({
      where: { id },
      data: updateData as any,
      include: {
        requestedBy: { select: { name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'MaterialRequest',
      entityId: id,
      newValues: { status: updateData.status || existing.status },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(materialRequest)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update material request'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}