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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { budgetId: id }
    if (status && status !== 'all') {
      where.status = status
    }

    const changeOrders = await db.budgetChangeOrder.findMany({
      where,
      include: {
        lineItemUpdates: { include: { budgetLineItem: { include: { costCode: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(changeOrders)) })
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

    const body = await request.json()
    const { title, description, reason, lineItemUpdates = [] } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    // Generate BCO number
    const coCount = await db.budgetChangeOrder.count({ where: { budgetId: id } })
    const bcoNo = `BCO-${budget.projectId.slice(-4).toUpperCase()}-${String(coCount + 1).padStart(3, '0')}`

    const totalChange = lineItemUpdates.reduce((s: number, li: any) => s + (Number(li.changeAmount) || 0), 0)

    const changeOrder = await db.budgetChangeOrder.create({
      data: {
        budgetId: id,
        bcoNo,
        title,
        description: description || null,
        reason: reason || null,
        originalBudget: budget.revisedValue,
        changeAmount: totalChange,
        newBudget: budget.revisedValue + totalChange,
        submittedById: user.id,
        lineItemUpdates: {
          create: lineItemUpdates.map((li: any) => ({
            budgetLineItemId: li.budgetLineItemId,
            previousAmount: Number(li.previousAmount) || 0,
            newAmount: Number(li.newAmount) || 0,
            changeAmount: Number(li.changeAmount) || 0,
          })),
        },
      },
      include: { lineItemUpdates: true },
    })

    // Update pending changes on budget
    await db.budget.update({
      where: { id },
      data: { pendingChanges: { increment: totalChange } },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(changeOrder)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}