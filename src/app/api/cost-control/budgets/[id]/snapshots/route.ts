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
    const snapshots = await db.budgetSnapshot.findMany({
      where: { budgetId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(snapshots)) })
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
    const { name, snapshotType = 'custom' } = body

    // Capture current state of all line items
    const lineItems = await db.budgetLineItem.findMany({
      where: { budgetId: id },
      include: { costCode: { select: { id: true, code: true, name: true } } },
    })

    const totalBudget = lineItems.reduce((s, li) => s + li.revisedBudget, 0)
    const totalActual = lineItems.reduce((s, li) => s + li.actualCost, 0)
    const totalCommitted = lineItems.reduce((s, li) => s + li.committedCost, 0)
    const totalForecast = lineItems.reduce((s, li) => s + li.estimatedAtCompletion, 0)
    const totalEarned = lineItems.reduce((s, li) => s + li.earnedRevenue, 0)
    const totalBilled = lineItems.reduce((s, li) => s + li.billedRevenue, 0)

    const snapshotData = lineItems.map(li => ({
      costCodeId: li.costCodeId,
      costCode: li.costCode.code,
      costCodeName: li.costCode.name,
      originalBudget: li.originalBudget,
      revisedBudget: li.revisedBudget,
      committedCost: li.committedCost,
      actualCost: li.actualCost,
      forecastToComplete: li.forecastToComplete,
      estimatedAtCompletion: li.estimatedAtCompletion,
      percentComplete: li.percentComplete,
      earnedRevenue: li.earnedRevenue,
      billedRevenue: li.billedRevenue,
    }))

    const snapshot = await db.budgetSnapshot.create({
      data: {
        budgetId: id,
        name: name || `${snapshotType} snapshot - ${new Date().toLocaleDateString()}`,
        snapshotType,
        totalBudget,
        totalActual,
        totalCommitted,
        totalForecast,
        totalEarned,
        totalBilled,
        snapshotData: JSON.stringify(snapshotData),
        createdById: user.id,
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(snapshot)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}