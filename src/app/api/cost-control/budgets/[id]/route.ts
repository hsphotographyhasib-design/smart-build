import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const budget = await db.budget.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true, status: true } },
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        lineItems: {
          include: { costCode: { include: { parent: { include: { parent: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
        changeOrders: {
          include: { lineItemUpdates: true },
          orderBy: { createdAt: 'desc' },
        },
        snapshots: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(budget)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { retentionPercent, status } = body

    const budget = await db.budget.findUnique({ where: { id } })
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (retentionPercent !== undefined) updateData.retentionPercent = retentionPercent
    if (status !== undefined) {
      if (status === 'approved' && budget.status === 'draft') {
        updateData.approvedById = user.id
        updateData.approvedAt = new Date()
      }
      if (status === 'locked') {
        updateData.approvedChanges = budget.pendingChanges
        updateData.pendingChanges = 0
      }
      updateData.status = status
    }

    const updated = await db.budget.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const budget = await db.budget.findUnique({ where: { id } })
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }
    if (budget.status !== 'draft') {
      return NextResponse.json({ success: false, error: 'Only draft budgets can be deleted' }, { status: 400 })
    }

    await db.budget.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}