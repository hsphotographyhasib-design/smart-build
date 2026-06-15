import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { comments, stepId } = body

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        workflowInstance: {
          include: {
            workflow: { include: { steps: { orderBy: { sortOrder: 'asc' } } } },
          },
        },
      },
    })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (!['pending_review', 'under_review', 'pending_approval'].includes(invoice.status)) {
      return NextResponse.json({ success: false, error: `Cannot approve invoice in '${invoice.status}' status` }, { status: 400 })
    }

    if (!invoice.workflowInstance) {
      return NextResponse.json({ success: false, error: 'No workflow instance found for this invoice' }, { status: 400 })
    }

    const instance = invoice.workflowInstance
    const steps = instance.workflow.steps
    const currentStepIndex = steps.findIndex(s => s.id === (stepId || instance.currentStepId))

    if (currentStepIndex === -1) {
      return NextResponse.json({ success: false, error: 'Current step not found in workflow' }, { status: 400 })
    }

    const currentStep = steps[currentStepIndex]

    // Check permission: user role matches assigneeRole or is the assigned user
    if (currentStep.assigneeRole && currentStep.assigneeRole !== user.role) {
      return NextResponse.json({ success: false, error: 'You do not have permission to approve at this step' }, { status: 403 })
    }

    // Create approval action
    await db.invoiceApprovalAction.create({
      data: {
        instanceId: instance.id,
        stepId: currentStep.id,
        invoiceId: id,
        action: 'approved',
        userId: user.id,
        comments: comments || null,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      },
    })

    // Determine next step
    const nextStepIndex = currentStepIndex + 1
    const isLastStep = nextStepIndex >= steps.length

    if (isLastStep) {
      // Fully approved
      await db.invoiceWorkflowInstance.update({
        where: { id: instance.id },
        data: { status: 'approved', completedAt: new Date() },
      })

      const updated = await db.invoice.update({
        where: { id },
        data: {
          status: 'approved',
          approvedById: user.id,
          approvedAt: new Date(),
          paymentStatus: 'unpaid',
        },
        include: {
          project: { select: { id: true, name: true, code: true } },
          vendor: { select: { id: true, name: true } },
          submittedBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
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
        newValues: { status: 'approved' },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      })

      return NextResponse.json({ success: true, data: updated })
    } else {
      // Move to next step
      const nextStep = steps[nextStepIndex]
      const nextStatus = nextStep.stepType === 'approval' ? 'pending_approval' : 'under_review'

      await db.invoiceWorkflowInstance.update({
        where: { id: instance.id },
        data: { currentStepId: nextStep.id, status: 'in_progress' },
      })

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
    }
  } catch (error) {
    console.error('Invoice approve error:', error)
    return NextResponse.json({ success: false, error: 'Failed to approve invoice' }, { status: 500 })
  }
}