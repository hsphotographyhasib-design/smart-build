import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const budgets = await db.budget.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true, status: true } },
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        _count: { select: { lineItems: true, changeOrders: true, snapshots: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(budgets)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, retentionPercent = 10, lineItems = [] } = body

    // এই প্রজেক্টের জন্য ইতিমধ্যে বাজেট আছে কিনা যাচাই করা হচ্ছে
    const existing = await db.budget.findUnique({ where: { projectId } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Budget already exists for this project' }, { status: 400 })
    }

    const totalOriginal = lineItems.reduce((s: number, li: any) => s + (Number(li.originalBudget) || 0), 0)

    const budget = await db.budget.create({
      data: {
        projectId,
        originalValue: totalOriginal,
        revisedValue: totalOriginal,
        retentionPercent,
        createdById: user.id,
        lineItems: {
          create: lineItems.map((li: any) => ({
            costCodeId: li.costCodeId,
            originalBudget: Number(li.originalBudget) || 0,
            revisedBudget: Number(li.originalBudget) || 0,
            notes: li.notes || null,
          })),
        },
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        lineItems: { include: { costCode: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(budget)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}