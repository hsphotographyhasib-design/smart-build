import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { targetUserId, comments } = body

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'targetUserId is required' }, { status: 400 })
    }

    const targetUser = await db.user.findUnique({ where: { id: targetUserId } })
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Target user not found' }, { status: 404 })
    }

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { workflowInstance: true },
    })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (!['pending_review', 'under_review', 'pending_approval'].includes(invoice.status)) {
      return NextResponse.json({ success: false, error: `Cannot delegate invoice in '${invoice.status}' status` }, { status: 400 })
    }

    if (!invoice.workflowInstance) {
      return NextResponse.json({ success: false, error: 'No workflow instance found' }, { status: 400 })
    }

    const currentStepId = invoice.workflowInstance.currentStepId

    // Create delegation action
    const commentText = comments
      ? `Delegated to ${targetUser.name}: ${comments}`
      : `Delegated to ${targetUser.name}`

    await db.invoiceApprovalAction.create({
      data: {
        instanceId: invoice.workflowInstance.id,
        stepId: currentStepId || '',
        invoiceId: id,
        action: 'delegated',
        userId: user.id,
        comments: commentText,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      },
    })

    const updated = await db.invoice.findUnique({
      where: { id },
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
      newValues: { status: invoice.status, delegatedTo: targetUser.name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Invoice delegate error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delegate invoice' }, { status: 500 })
  }
}