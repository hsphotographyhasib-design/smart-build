import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { items: true, workflowInstance: true },
    })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (!['draft', 'returned', 'revision_requested'].includes(invoice.status)) {
      return NextResponse.json({ success: false, error: `Cannot submit invoice in '${invoice.status}' status` }, { status: 400 })
    }

    if (!invoice.items || invoice.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invoice must have at least one item' }, { status: 400 })
    }

    if (invoice.total <= 0) {
      return NextResponse.json({ success: false, error: 'Invoice total must be greater than zero' }, { status: 400 })
    }

    // ওয়ার্কফ্লো ইনস্ট্যান্স খুঁজে বের করা বা তৈরি করা হচ্ছে
    let instanceId = invoice.workflowInstance?.id

    if (!instanceId) {
      const workflow = await db.invoiceWorkflow.findFirst({
        where: {
          OR: [
            { invoiceType: invoice.type, isDefault: true, isPublished: true },
            { invoiceType: 'all', isDefault: true, isPublished: true },
          ],
        },
        orderBy: { invoiceType: 'desc' },
        include: { steps: { orderBy: { sortOrder: 'asc' } } },
      })

      if (workflow && workflow.steps.length > 0) {
        const instance = await db.invoiceWorkflowInstance.create({
          data: {
            invoiceId: id,
            workflowId: workflow.id,
            currentStepId: workflow.steps[0].id,
            status: 'in_progress',
            startedById: user.id,
          },
        })
        instanceId = instance.id
      }
    } else {
      // বিদ্যমান ইনস্ট্যান্স পুনরায় শুরু করা হচ্ছে
      await db.invoiceWorkflowInstance.update({
        where: { id: instanceId },
        data: { status: 'in_progress', completedAt: null },
      })
    }

    // জমা দেওয়া অ্যাকশন তৈরি করা হচ্ছে
    if (instanceId) {
      const instance = await db.invoiceWorkflowInstance.findUnique({
        where: { id: instanceId },
        include: { workflow: { include: { steps: { orderBy: { sortOrder: 'asc' } } } } },
      })
      if (instance && instance.workflow.steps.length > 0) {
        const firstStep = instance.workflow.steps[0]
        await db.invoiceApprovalAction.create({
          data: {
            instanceId,
            stepId: firstStep.id,
            invoiceId: id,
            action: 'submitted',
            userId: user.id,
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
          },
        })
      }
    }

    const updated = await db.invoice.update({
      where: { id },
      data: {
        status: 'pending_review',
        submittedById: user.id,
        submittedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        vendor: { select: { id: true, name: true } },
        submittedBy: { select: { id: true, name: true } },
        items: true,
        workflowInstance: {
          include: {
            workflow: { select: { id: true, name: true } },
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
      newValues: { status: 'pending_review' },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Invoice submit error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit invoice' }, { status: 500 })
  }
}