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
    const budgetId = searchParams.get('budgetId')

    // সব বাজেট পাওয়া হচ্ছে with their line items for forecasting
    const whereClause: Record<string, unknown> = {}
    if (budgetId) whereClause.id = budgetId

    const budgets = await db.budget.findMany({
      where: whereClause,
      include: {
        project: { select: { id: true, name: true, code: true, status: true, progress: true } },
        budgetLineItem: {
          include: { costCode: { select: { id: true, code: true, name: true, level: true } } },
        },
      },
    })

    const forecastData = budgets.map(b => {
      const totalOriginal = b.budgetLineItem.reduce((s, li) => s + li.originalBudget, 0)
      const totalRevised = b.budgetLineItem.reduce((s, li) => s + li.revisedBudget, 0)
      const totalActual = b.budgetLineItem.reduce((s, li) => s + li.actualCost, 0)
      const totalCommitted = b.budgetLineItem.reduce((s, li) => s + li.committedCost, 0)
      const totalEAC = b.budgetLineItem.reduce((s, li) => s + li.estimatedAtCompletion, 0)
      const totalETC = b.budgetLineItem.reduce((s, li) => s + li.forecastToComplete, 0)
      const totalEarned = b.budgetLineItem.reduce((s, li) => s + li.earnedRevenue, 0)
      const totalBilled = b.budgetLineItem.reduce((s, li) => s + li.billedRevenue, 0)

      const budget = totalRevised || totalOriginal
      const cpi = budget > 0 && totalActual > 0 ? totalEarned / totalActual : 1
      const spi = budget > 0 && totalEarned > 0 ? totalEarned / budget : 1

      const costপার্থক্য = budget - totalActual
      const scheduleপার্থক্য = totalEarned - (budget * (b.project.progress / 100))
      const costপার্থক্যPercent = budget > 0 ? (costপার্থক্য / budget) * 100 : 0
      const scheduleপার্থক্যPercent = (budget * (b.project.progress / 100)) > 0
        ? (scheduleপার্থক্য / (budget * (b.project.progress / 100))) * 100
        : 0

      const atCompletionপার্থক্য = budget - totalEAC
      const toCompleteIndex = totalActual > 0 && totalETC > 0 ? (totalActual + totalETC) / budget : 1

      return {
        budgetId: b.id,
        projectId: b.project.id,
        projectName: b.project.name,
        projectCode: b.project.code,
        projectProgress: b.project.progress,
        budgetStatus: b.status,

        // বাজেট সমষ্টি
        originalBudget: totalOriginal,
        revisedBudget: totalRevised,
        actualCost: totalActual,
        committedCost: totalCommitted,
        earnedRevenue: totalEarned,
        billedRevenue: totalBilled,

        // পূর্বাভাস মেট্রিক্স
        estimateAtCompletion: totalEAC || (totalActual > 0 ? totalActual + totalETC : totalRevised),
        estimateToComplete: totalETC || Math.max(0, (totalRevised || totalOriginal) - totalActual),

        // Performance indices
        cpi: Math.round(cpi * 1000) / 1000,
        spi: Math.round(spi * 1000) / 1000,

        // পার্থক্যs
        costপার্থক্য,
        costপার্থক্যPercent: Math.round(costপার্থক্যPercent * 100) / 100,
        scheduleপার্থক্য,
        scheduleপার্থক্যPercent: Math.round(scheduleপার্থক্যPercent * 100) / 100,
        atCompletionপার্থক্য,
        toCompleteIndex: Math.round(toCompleteIndex * 1000) / 1000,

        // Line item breakdown
        lineItems: b.budgetLineItem.map(li => {
          const liBudget = li.revisedBudget || li.originalBudget
          const liCpi = li.actualCost > 0 && li.earnedRevenue > 0 ? li.earnedRevenue / li.actualCost : null
          const liEac = li.estimatedAtCompletion || (li.actualCost > 0 ? li.actualCost + (li.forecastToComplete || (liBudget - li.actualCost)) : liBudget)
          return {
            id: li.id,
            costCode: li.costCode,
            originalBudget: li.originalBudget,
            revisedBudget: li.revisedBudget,
            actualCost: li.actualCost,
            committedCost: li.committedCost,
            percentComplete: li.percentComplete,
            earnedRevenue: li.earnedRevenue,
            forecastToComplete: li.forecastToComplete,
            eac: liEac,
            cpi: liCpi ? Math.round(liCpi * 1000) / 1000 : null,
            variance: liBudget - li.actualCost,
          }
        }),
      }
    })

    // Project-level summary
    const summary = {
      totalProjects: budgets.length,
      totalOriginalBudget: budgets.reduce((s, b) => s + b.originalBudget, 0),
      totalRevisedBudget: budgets.reduce((s, b) => s + b.revisedBudget, 0),
      totalActualCost: budgets.reduce((s, b) => s + b.actualCost, 0),
      totalCommittedCost: budgets.reduce((s, b) => s + b.committedCost, 0),
      totalEarnedRevenue: budgets.reduce((s, b) => s + b.earnedRevenue, 0),
      totalEAC: budgets.reduce((s, b) => s + b.estimateAtCompletion, 0),
      totalETC: budgets.reduce((s, b) => s + b.estimateToComplete, 0),
      overallCPI: (() => {
        const totalActual = budgets.reduce((s, b) => s + b.actualCost, 0)
        const totalEarned = budgets.reduce((s, b) => s + b.earnedRevenue, 0)
        return totalActual > 0 ? Math.round((totalEarned / totalActual) * 1000) / 1000 : 1
      })(),
      overallSPI: (() => {
        const totalBudget = budgets.reduce((s, b) => s + b.revisedBudget, 0)
        const totalEarned = budgets.reduce((s, b) => s + b.earnedRevenue, 0)
        return totalBudget > 0 ? Math.round((totalEarned / totalBudget) * 1000) / 1000 : 1
      })(),
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        projects: forecastData,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}