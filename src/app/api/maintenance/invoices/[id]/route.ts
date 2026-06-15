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

    const invoice = await db.maintenanceInvoice.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, address: true, gstNo: true } },
        ticket: {
          select: { id: true, ticketNo: true, subject: true, category: true, site: { select: { name: true, address: true } } },
        },
        workOrder: { select: { id: true, workOrderNo: true, serviceNotes: true, completionNotes: true } },
        issuedBy: { select: { id: true, name: true } },
      },
    })

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(invoice)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch invoice'
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

    const existing = await db.maintenanceInvoice.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    const {
      labourCost, materialCost, transportCost,
      serviceCharges, tax, discount, status, paidAmount, notes,
    } = body

    const updateData: Record<string, unknown> = {}
    if (labourCost !== undefined) updateData.labourCost = labourCost
    if (materialCost !== undefined) updateData.materialCost = materialCost
    if (transportCost !== undefined) updateData.transportCost = transportCost
    if (serviceCharges !== undefined) updateData.serviceCharges = serviceCharges
    if (tax !== undefined) updateData.tax = tax
    if (discount !== undefined) updateData.discount = discount
    if (status !== undefined) updateData.status = status
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount
    if (notes !== undefined) updateData.notes = notes

    // খরচের ক্ষেত্র পরিবর্তন হলে মোট পরিমাণ পুনরায় হিসাব করা হচ্ছে
    if (labourCost !== undefined || materialCost !== undefined || transportCost !== undefined || serviceCharges !== undefined || tax !== undefined || discount !== undefined) {
      const lC = labourCost !== undefined ? labourCost : existing.labourCost
      const mC = materialCost !== undefined ? materialCost : existing.materialCost
      const tC = transportCost !== undefined ? transportCost : existing.transportCost
      const sC = serviceCharges !== undefined ? serviceCharges : existing.serviceCharges
      const tx = tax !== undefined ? tax : existing.tax
      const dc = discount !== undefined ? discount : existing.discount
      updateData.total = lC + mC + tC + sC + tx - dc
    }

    const invoice = await db.maintenanceInvoice.update({
      where: { id },
      data: updateData as any,
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'MaintenanceInvoice',
      entityId: id,
      newValues: { status: updateData.status || existing.status, total: updateData.total || existing.total },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(invoice)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update invoice'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}