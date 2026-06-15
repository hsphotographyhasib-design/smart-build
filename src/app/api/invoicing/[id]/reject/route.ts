import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { reason, comments } = body

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Rejection reason is required' }, { status: 400 })
    }

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        workflowInstance: {
          include: { workflow: { include: { steps: { orderBy: { sortOrder: 'asc' } } } } },
        },
      },
    })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (!['pending_review', 'under_review', 'pending_approval'].includes(invoice.status)) {
      return NextResponse.json({ success: false, error: `Cannot reject invoice in '${invoice.status}' status` }, { status: 400 })
    }

    // প্রত্যাখ্যান অ্যাকশন তৈরি করা হচ্ছে
    if (invoice.workflowInstance) {
      const currentStep = invoice.workflowInstance.workflow.steps.find(
        s => s.id === invoice.workflowInstance!.currentStepId
      )
      if (currentStep) {
        await db.invoiceApprovalAction.create({
          data: {
            instanceId: invoice.workflowInstance.id,
            stepId: currentStep.id,
            invoiceId: id,
            action: 'rejected',
            userId: user.id,
            comments: `${reason}${comments ? '\n' + comments : ''}`,
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
          },
        })
      }

      // ওয়ার্কফ্লো ইনস্ট্যান্স সম্পন্ন করা হচ্ছে
      await db.invoiceWorkflowInstance.update({
        where: { id: invoice.workflowInstance.id },
        data: { status: 'rejected', completedAt: new Date() },
      })
    }

    const updated = await db.invoice.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true } },
        submittedBy: { select: { id: true, name: true } },
        items: true,
        workflowInstance: {
          include: {
            workflow: { select: { id: true, name: true } },
            actions: {
              include: {
                user: { select: { id: true, name: true } },
                step: { select: { id: true, label: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Invoice',
      entityId: id,
      oldValues: { status: invoice.status },
      newValues: { status: 'rejected', rejectionReason: reason },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Invoice reject error:', error)
    return NextResponse.json({ success: false, error: 'Failed to reject invoice' }, { status: 500 })
  }
}