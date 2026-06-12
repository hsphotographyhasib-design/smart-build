import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemId } = await params
    const budget = await db.budget.findUnique({ where: { id } })
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }

    const lineItem = await db.budgetLineItem.findUnique({ where: { id: itemId, budgetId: id } })
    if (!lineItem) {
      return NextResponse.json({ success: false, error: 'Line item not found' }, { status: 404 })
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    const numericFields = ['originalBudget', 'revisedBudget', 'committedCost', 'actualCost', 'forecastToComplete', 'estimatedAtCompletion', 'percentComplete', 'earnedRevenue', 'billedRevenue']
    for (const field of numericFields) {
      if (body[field] !== undefined) {
        updateData[field] = Number(body[field])
      }
    }
    if (body.notes !== undefined) updateData.notes = body.notes

    const updated = await db.budgetLineItem.update({
      where: { id: itemId },
      data: updateData,
      include: { costCode: true },
    })

    // Recalculate budget totals
    const allItems = await db.budgetLineItem.findMany({ where: { budgetId: id } })
    const newOriginal = allItems.reduce((s, li) => s + li.originalBudget, 0)
    const newRevised = allItems.reduce((s, li) => s + li.revisedBudget, 0)
    await db.budget.update({
      where: { id },
      data: { originalValue: newOriginal, revisedValue: newRevised },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemId } = await params
    const budget = await db.budget.findUnique({ where: { id } })
    if (!budget || budget.status !== 'draft') {
      return NextResponse.json({ success: false, error: 'Cannot delete line items from non-draft budget' }, { status: 400 })
    }

    const lineItem = await db.budgetLineItem.findUnique({ where: { id: itemId, budgetId: id } })
    if (!lineItem) {
      return NextResponse.json({ success: false, error: 'Line item not found' }, { status: 404 })
    }

    await db.budgetLineItem.delete({ where: { id: itemId } })

    // Recalculate budget totals
    const allItems = await db.budgetLineItem.findMany({ where: { budgetId: id } })
    const newTotal = allItems.reduce((s, li) => s + li.originalBudget, 0)
    await db.budget.update({
      where: { id },
      data: { originalValue: newTotal, revisedValue: newTotal },
    })

    return NextResponse.json({ success: true, data: { id: itemId } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}