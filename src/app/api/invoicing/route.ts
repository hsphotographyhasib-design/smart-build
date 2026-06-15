import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const projectId = searchParams.get('projectId')
    const vendorId = searchParams.get('vendorId')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const paymentStatus = searchParams.get('paymentStatus')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (type) where.type = type
    if (projectId) where.projectId = projectId
    if (vendorId) where.vendorId = vendorId
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { vendorName: { contains: search } },
        { contractNo: { contains: search } },
        { referenceNo: { contains: search } },
      ]
    }
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, unknown> = {}
      if (dateFrom) dateFilter.gte = new Date(dateFrom)
      if (dateTo) dateFilter.lte = new Date(dateTo)
      where.issueDate = dateFilter
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
          vendor: { select: { id: true, name: true } },
          submittedBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
          items: true,
          workflowInstance: {
            include: {
              workflow: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Invoicing list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      projectId, type, clientId, issueDate, dueDate, vendorId, vendorName, vendorType,
      purchaseOrderId, workOrderId, costCodeId, contractNo, referenceNo, currency,
      taxRate, retentionPercent, notes, items,
      // অগ্রগতি বিলিং ক্ষেত্র
      originalContractValue, previousClaimsTotal, certifiedAmount,
      workCompletedPercent, workCompletedValue, balanceRemaining,
      periodStartDate, periodEndDate,
    } = body

    if (!projectId || !issueDate) {
      return NextResponse.json({ success: false, error: 'projectId and issueDate are required' }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one invoice item is required' }, { status: 400 })
    }

    // ইনভয়েস নম্বর তৈরি করা হচ্ছে: INV-YYYY-NNNNNN
    const year = new Date(issueDate).getFullYear()
    const yearPrefix = `INV-${year}-`
    const countThisYear = await db.invoice.count({
      where: { invoiceNo: { startsWith: yearPrefix } },
    })
    const invoiceNo = `${yearPrefix}${String(countThisYear + 1).padStart(6, '0')}`

    // পরিমাণ হিসাব করা হচ্ছে
    const subtotal = items.reduce((sum: number, item: Record<string, number>) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)
    const taxRateVal = taxRate || 0
    const tax = subtotal * (taxRateVal / 100)
    const total = subtotal + tax
    const retentionPercentVal = retentionPercent || 0
    const retentionAmount = total * (retentionPercentVal / 100)
    const outstandingAmount = total - retentionAmount

    const invoiceItems = items.map((item: any) => ({
      description: String(item.description),
      quantity: Number(item.quantity),
      unit: String(item.unit || 'unit'),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.quantity) * Number(item.unitPrice),
      boqItemId: item.boqItemId ? String(item.boqItemId) : null,
    }))

    // এই ইনভয়েস ধরনের জন্য ডিফল্ট ওয়ার্কফ্লো খুঁজে বের করা হচ্ছে
    let workflowId: string | undefined
    if (type) {
      const defaultWorkflow = await db.invoiceWorkflow.findFirst({
        where: { invoiceType: type, isDefault: true, isPublished: true },
        select: { id: true },
      })
      if (!defaultWorkflow) {
        const fallbackWorkflow = await db.invoiceWorkflow.findFirst({
          where: { invoiceType: 'all', isDefault: true, isPublished: true },
          select: { id: true },
        })
        if (fallbackWorkflow) workflowId = fallbackWorkflow.id
      } else {
        workflowId = defaultWorkflow.id
      }
    }

    const created = await db.invoice.create({
      data: {
        projectId,
        invoiceNo,
        type: type || 'client_invoice',
        clientId: clientId || null,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        vendorId: vendorId || null,
        vendorName: vendorName || null,
        vendorType: vendorType || null,
        purchaseOrderId: purchaseOrderId || null,
        workOrderId: workOrderId || null,
        costCodeId: costCodeId || null,
        contractNo: contractNo || null,
        referenceNo: referenceNo || null,
        currency: currency || 'SGD',
        taxRate: taxRateVal,
        retentionPercent: retentionPercentVal,
        notes: notes || null,
        subtotal,
        tax,
        total,
        retentionAmount,
        outstandingAmount,
        // অগ্রগতি বিলিং
        originalContractValue: originalContractValue || 0,
        previousClaimsTotal: previousClaimsTotal || 0,
        certifiedAmount: certifiedAmount || 0,
        workCompletedPercent: workCompletedPercent || 0,
        workCompletedValue: workCompletedValue || 0,
        balanceRemaining: balanceRemaining || 0,
        periodStartDate: periodStartDate ? new Date(periodStartDate) : null,
        periodEndDate: periodEndDate ? new Date(periodEndDate) : null,
        items: { create: invoiceItems },
        ...(workflowId ? {
          workflowInstance: {
            create: {
              workflowId,
              status: 'pending',
              startedById: user.id,
            },
          },
        } : {}),
      },
      include: {
        items: true,
        project: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true } },
        workflowInstance: { include: { workflow: { select: { id: true, name: true } } } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'Invoice',
      entityId: created.id,
      newValues: { invoiceNo: created.invoiceNo, total: created.total, type: created.type },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('Invoicing create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create invoice' }, { status: 500 })
  }
}