import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const workflow = await db.invoiceWorkflow.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { instances: true } },
      },
    })

    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: workflow })
  } catch (error) {
    console.error('Workflow GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch workflow' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { name, description, invoiceType, isDefault, steps } = body

    const existing = await db.invoiceWorkflow.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 })
    }

    // ডিফল্ট হিসেবে সেট করলে, একই ধরনের বিদ্যমান ডিফল্টগুলো মুছে ফেলা হচ্ছে
    if (isDefault && invoiceType) {
      await db.invoiceWorkflow.updateMany({
        where: { invoiceType, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    // প্রদান করা হলে ধাপগুলো আপডেট করা হচ্ছে
    if (steps && Array.isArray(steps)) {
      await db.invoiceWorkflowStep.deleteMany({ where: { workflowId: id } })
      if (steps.length > 0) {
        await db.invoiceWorkflowStep.createMany({
          data: steps.map((step: any, index: number) => ({
            workflowId: id,
            stepType: String(step.stepType || 'approval'),
            sortOrder: Number(step.sortOrder ?? index),
            label: String(step.label || `Step ${index + 1}`),
            description: step.description ? String(step.description) : null,
            assigneeRole: step.assigneeRole ? String(step.assigneeRole) : null,
            assigneeUserId: step.assigneeUserId ? String(step.assigneeUserId) : null,
            conditionField: step.conditionField ? String(step.conditionField) : null,
            conditionValue: step.conditionValue ? String(step.conditionValue) : null,
            timeoutHours: Number(step.timeoutHours || 0),
            isParallel: Boolean(step.isParallel || false),
          })),
        })
      }
    }

    const updated = await db.invoiceWorkflow.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(invoiceType !== undefined ? { invoiceType } : {}),
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Workflow PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update workflow' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.invoiceWorkflow.findUnique({
      where: { id },
      include: { _count: { select: { instances: true } } },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 })
    }

    if (existing.isPublished) {
      return NextResponse.json({ success: false, error: 'Cannot delete a published workflow' }, { status: 400 })
    }

    if (existing._count.instances > 0) {
      return NextResponse.json({ success: false, error: 'Cannot delete workflow with existing instances' }, { status: 400 })
    }

    await db.invoiceWorkflow.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Workflow DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete workflow' }, { status: 500 })
  }
}