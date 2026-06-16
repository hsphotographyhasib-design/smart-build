import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Counts
    const [totalBudgets, approvedBudgets, pendingChangeOrders] = await Promise.all([
      db.budget.count(),
      db.budget.count({ where: { status: 'approved' } }),
      db.budgetChangeOrder.count({ where: { status: { in: ['draft', 'submitted', 'reviewed'] } } }),
    ])

    const valueAgg = await db.budget.aggregate({
      _sum: { originalValue: true, revisedValue: true },
    })

    // Budget vs Actual comparison per project
    const budgetsWithData = await db.budget.findMany({
      include: {
        project: { select: { id: true, name: true, code: true } },
        budgetLineItem: {
          select: {
            originalBudget: true,
            revisedBudget: true,
            actualCost: true,
            committedCost: true,
            costCode: { select: { id: true, name: true, level: true, parentId: true } },
          },
        },
      },
    })

    const budgetVsActual = budgetsWithData.map(b => {
      const totalOriginal = b.budgetLineItem.reduce((s, li) => s + li.originalBudget, 0)
      const totalActual = b.budgetLineItem.reduce((s, li) => s + li.actualCost, 0)
      const totalCommitted = b.budgetLineItem.reduce((s, li) => s + li.committedCost, 0)
      return {
        projectId: b.project.id,
        projectName: b.project.name,
        projectCode: b.project.code,
        budgetAmount: totalOriginal || b.originalValue,
        actualAmount: totalActual,
        committedAmount: totalCommitted,
        variance: (totalOriginal || b.originalValue) - totalActual,
        status: b.status,
      }
    })

    // Cost code distribution (top-level only)
    const topCostCodes = await db.costCode.findMany({
      where: { level: 1, isActive: true },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: {
                  include: { budgetItems: { select: { originalBudget: true, actualCost: true } } },
                },
                budgetItems: { select: { originalBudget: true, actualCost: true } },
              },
              budgetItems: { select: { originalBudget: true, actualCost: true } },
            },
            budgetItems: { select: { originalBudget: true, actualCost: true } },
          },
          budgetItems: { select: { originalBudget: true, actualCost: true } },
        },
        budgetItems: { select: { originalBudget: true, actualCost: true } },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const costCodeDistribution = topCostCodes.map(cc => {
      const collectBudget = (codes: typeof topCostCodes): number =>
        codes.reduce((sum, c) => {
          const self = c.budgetItems.reduce((s, bi) => s + bi.originalBudget, 0)
          return sum + self + collectBudget(c.children as unknown as typeof topCostCodes)
        }, 0)
      const total = cc.budgetItems.reduce((s, bi) => s + bi.originalBudget, 0) +
        collectBudget(cc.children as unknown as typeof topCostCodes)
      return { name: cc.name, code: cc.code, value: total, id: cc.id }
    }).filter(c => c.value > 0)

    // Recent change orders
    const recentCOs = await db.budgetChangeOrder.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        budget: { include: { project: { select: { id: true, name: true, code: true } } } },
      },
    })

    // Monthly budget trends (last 6 months from snapshots)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const snapshots = await db.budgetSnapshot.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'asc' },
      include: { budget: { include: { project: { select: { name: true } } } } },
    })

    const monthlyTrends: Record<string, { month: string; budget: number; actual: number; committed: number; forecast: number }[]> = {}
    for (const snap of snapshots) {
      const monthKey = snap.createdAt.toISOString().slice(0, 7)
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = []
      }
      monthlyTrends[monthKey].push({
        month: monthKey,
        budget: snap.totalBudget,
        actual: snap.totalActual,
        committed: snap.totalCommitted,
        forecast: snap.totalForecast,
      })
    }

    // Aggregate monthly trends
    const trendData = Object.entries(monthlyTrends).map(([month, items]) => ({
      month,
      budget: items.reduce((s, i) => s + i.budget, 0),
      actual: items.reduce((s, i) => s + i.actual, 0),
      committed: items.reduce((s, i) => s + i.committed, 0),
      forecast: items.reduce((s, i) => s + i.forecast, 0),
    }))

    // Budget status overview
    const statusCounts = await db.budget.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          totalBudgets,
          approvedBudgets,
          totalOriginalValue: valueAgg._sum.originalValue || 0,
          totalRevisedValue: valueAgg._sum.revisedValue || 0,
          pendingChangeOrders,
        },
        budgetVsActual,
        costCodeDistribution,
        recentChangeOrders: JSON.parse(JSON.stringify(recentCOs)),
        monthlyTrends: trendData,
        statusOverview: statusCounts.map(s => ({ status: s.status, count: s._count.status })),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}