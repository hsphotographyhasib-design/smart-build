import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const workflow = await db.invoiceWorkflow.findUnique({ where: { id } })
    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 })
    }

    const steps = await db.invoiceWorkflowStep.count({ where: { workflowId: id } })
    if (steps === 0) {
      return NextResponse.json({ success: false, error: 'Cannot publish workflow without steps' }, { status: 400 })
    }

    const updated = await db.invoiceWorkflow.update({
      where: { id },
      data: { isPublished: true },
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Workflow publish error:', error)
    return NextResponse.json({ success: false, error: 'Failed to publish workflow' }, { status: 500 })
  }
}