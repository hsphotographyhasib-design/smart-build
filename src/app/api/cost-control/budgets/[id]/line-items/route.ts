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
    const budget = await db.budget.findUnique({ where: { id } })
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }

    const lineItems = await db.budgetLineItem.findMany({
      where: { budgetId: id },
      include: { costCode: { include: { parent: { include: { parent: true } } } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(lineItems)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ success: false, error: 'Can only add line items to draft budgets' }, { status: 400 })
    }

    const body = await request.json()
    const { costCodeId, originalBudget, notes } = body

    if (!costCodeId) {
      return NextResponse.json({ success: false, error: 'costCodeId is required' }, { status: 400 })
    }

    const lineItem = await db.budgetLineItem.create({
      data: {
        budgetId: id,
        costCodeId,
        originalBudget: Number(originalBudget) || 0,
        revisedBudget: Number(originalBudget) || 0,
        notes: notes || null,
      },
      include: { costCode: true },
    })

    // বাজেট আপডেট করা হচ্ছে totals
    const allItems = await db.budgetLineItem.findMany({ where: { budgetId: id } })
    const newTotal = allItems.reduce((s, li) => s + li.originalBudget, 0)
    await db.budget.update({
      where: { id },
      data: { originalValue: newTotal, revisedValue: newTotal },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(lineItem)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}