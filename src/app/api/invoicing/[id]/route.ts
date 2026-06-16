import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true, email: true, phone: true } },
        purchaseOrder: { select: { id: true, orderNo: true, notes: true } },
        workOrder: { select: { id: true, orderNo: true, description: true } },
        costCode: { select: { id: true, code: true, name: true } },
        submittedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        invoiceItem: true,
        payment: { orderBy: { date: 'desc' } },
        workflowInstance: {
          include: {
            workflow: {
              include: {
                steps: { orderBy: { sortOrder: 'asc' } },
              },
            },
            actions: {
              include: {
                user: { select: { id: true, name: true } },
                step: { select: { id: true, label: true, stepType: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        approvalActions: {
          include: {
            user: { select: { id: true, name: true } },
            step: { select: { id: true, label: true, stepType: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        documents: {
          include: { uploadedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          where: { parentId: null },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            replies: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    console.error('Invoice detail GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.invoice.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (!['draft', 'returned', 'revision_requested'].includes(existing.status)) {
      return NextResponse.json({ success: false, error: `Cannot update invoice in '${existing.status}' status` }, { status: 400 })
    }

    const body = await request.json()
    const {
      type, clientId, issueDate, dueDate, vendorId, vendorName, vendorType,
      purchaseOrderId, workOrderId, costCodeId, contractNo, referenceNo, currency,
      taxRate, retentionPercent, notes, items,
      originalContractValue, previousClaimsTotal, certifiedAmount,
      workCompletedPercent, workCompletedValue, balanceRemaining,
      periodStartDate, periodEndDate,
    } = body

    // আইটেম প্রদান করা হলে পুনরায় হিসাব করা হচ্ছে
    let subtotal = existing.subtotal
    let tax = existing.tax
    let total = existing.total
    let retentionAmount = existing.retentionAmount
    let outstandingAmount = existing.outstandingAmount

    if (items && Array.isArray(items) && items.length > 0) {
      subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0)
      const taxRateVal = taxRate ?? existing.taxRate
      tax = subtotal * (taxRateVal / 100)
      total = subtotal + tax
      const retentionPercentVal = retentionPercent ?? existing.retentionPercent
      retentionAmount = total * (retentionPercentVal / 100)
      outstandingAmount = total - retentionAmount - existing.paidAmount
    }

    // আইটেম প্রদান করা হলে প্রতিস্থাপন করা হচ্ছে
    if (items && Array.isArray(items)) {
      await db.invoiceItem.deleteMany({ where: { invoiceId: id } })
      if (items.length > 0) {
        await db.invoiceItem.createMany({
          data: items.map((item: any) => ({
            invoiceId: id,
            description: String(item.description),
            quantity: Number(item.quantity),
            unit: String(item.unit || 'unit'),
            unitPrice: Number(item.unitPrice),
            amount: Number(item.quantity) * Number(item.unitPrice),
            boqItemId: item.boqItemId ? String(item.boqItemId) : null,
          })),
        })
      }
    }

    const updated = await db.invoice.update({
      where: { id },
      data: {
        ...(type !== undefined ? { type } : {}),
        ...(clientId !== undefined ? { clientId: clientId || null } : {}),
        ...(issueDate ? { issueDate: new Date(issueDate) } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(vendorId !== undefined ? { vendorId: vendorId || null } : {}),
        ...(vendorName !== undefined ? { vendorName: vendorName || null } : {}),
        ...(vendorType !== undefined ? { vendorType: vendorType || null } : {}),
        ...(purchaseOrderId !== undefined ? { purchaseOrderId: purchaseOrderId || null } : {}),
        ...(workOrderId !== undefined ? { workOrderId: workOrderId || null } : {}),
        ...(costCodeId !== undefined ? { costCodeId: costCodeId || null } : {}),
        ...(contractNo !== undefined ? { contractNo: contractNo || null } : {}),
        ...(referenceNo !== undefined ? { referenceNo: referenceNo || null } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(taxRate !== undefined ? { taxRate } : {}),
        ...(retentionPercent !== undefined ? { retentionPercent } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
        subtotal,
        tax,
        total,
        retentionAmount,
        outstandingAmount,
        // অগ্রগতি বিলিং
        ...(originalContractValue !== undefined ? { originalContractValue } : {}),
        ...(previousClaimsTotal !== undefined ? { previousClaimsTotal } : {}),
        ...(certifiedAmount !== undefined ? { certifiedAmount } : {}),
        ...(workCompletedPercent !== undefined ? { workCompletedPercent } : {}),
        ...(workCompletedValue !== undefined ? { workCompletedValue } : {}),
        ...(balanceRemaining !== undefined ? { balanceRemaining } : {}),
        ...(periodStartDate !== undefined ? { periodStartDate: periodStartDate ? new Date(periodStartDate) : null } : {}),
        ...(periodEndDate !== undefined ? { periodEndDate: periodEndDate ? new Date(periodEndDate) : null } : {}),
      },
      include: {
        invoiceItem: true,
        project: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Invoice',
      entityId: id,
      oldValues: { total: existing.total, status: existing.status },
      newValues: { total: updated.total, status: updated.status },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Invoice PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const existing = await db.invoice.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (existing.status !== 'draft') {
      return NextResponse.json({ success: false, error: 'Only draft invoices can be cancelled' }, { status: 400 })
    }

    const cancelled = await db.invoice.update({
      where: { id },
      data: { status: 'cancelled' },
      select: { id: true, invoiceNo: true, status: true },
    })

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'Invoice',
      entityId: id,
      oldValues: { invoiceNo: existing.invoiceNo, status: existing.status },
      newValues: { status: 'cancelled' },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: cancelled })
  } catch (error) {
    console.error('Invoice DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to cancel invoice' }, { status: 500 })
  }
}