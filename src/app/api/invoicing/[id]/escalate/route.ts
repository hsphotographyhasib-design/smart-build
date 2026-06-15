import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { comments } = body

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
      return NextResponse.json({ success: false, error: `Cannot escalate invoice in '${invoice.status}' status` }, { status: 400 })
    }

    if (!invoice.workflowInstance) {
      return NextResponse.json({ success: false, error: 'No workflow instance found' }, { status: 400 })
    }

    const steps = invoice.workflowInstance.workflow.steps
    const currentStepIndex = steps.findIndex(s => s.id === invoice.workflowInstance!.currentStepId)
    if (currentStepIndex === -1) {
      return NextResponse.json({ success: false, error: 'Current step not found' }, { status: 400 })
    }

    const nextStepIndex = currentStepIndex + 1
    if (nextStepIndex >= steps.length) {
      return NextResponse.json({ success: false, error: 'Already at the last step, cannot escalate' }, { status: 400 })
    }

    const currentStep = steps[currentStepIndex]
    const nextStep = steps[nextStepIndex]

    // বর্তমান ধাপে এসকালেটেড অ্যাকশন তৈরি করা হচ্ছে
    await db.invoiceApprovalAction.create({
      data: {
        instanceId: invoice.workflowInstance.id,
        stepId: currentStep.id,
        invoiceId: id,
        action: 'escalated',
        userId: user.id,
        comments: comments || null,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      },
    })

    // পরবর্তী ধাপে অগ্রসর করা হচ্ছে
    await db.invoiceWorkflowInstance.update({
      where: { id: invoice.workflowInstance.id },
      data: { currentStepId: nextStep.id },
    })

    const nextStatus = nextStep.stepType === 'approval' ? 'pending_approval' : 'under_review'
    const updated = await db.invoice.update({
      where: { id },
      data: { status: nextStatus },
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
      newValues: { status: nextStatus },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Invoice escalate error:', error)
    return NextResponse.json({ success: false, error: 'Failed to escalate invoice' }, { status: 500 })
  }
}