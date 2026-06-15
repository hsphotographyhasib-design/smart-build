import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const workflows = await db.invoiceWorkflow.findMany({
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { instances: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: workflows })
  } catch (error) {
    console.error('Workflow list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch workflows' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, description, invoiceType, isDefault, steps } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Workflow name is required' }, { status: 400 })
    }
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one workflow step is required' }, { status: 400 })
    }

    // If this is set as default, clear existing defaults for the same type
    if (isDefault && invoiceType) {
      await db.invoiceWorkflow.updateMany({
        where: { invoiceType, isDefault: true },
        data: { isDefault: false },
      })
    }

    const workflow = await db.invoiceWorkflow.create({
      data: {
        name,
        description: description || null,
        invoiceType: invoiceType || 'all',
        isDefault: isDefault || false,
        createdById: user.id,
        steps: {
          create: steps.map((step: any, index: number) => ({
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
        },
      },
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: workflow }, { status: 201 })
  } catch (error) {
    console.error('Workflow create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create workflow' }, { status: 500 })
  }
}