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

    const project = await db.project.findUnique({
      where: { id },
      include: {
        tasks: { select: { id: true, title: true, status: true, priority: true, startDate: true, endDate: true, progress: true } },
        milestones: { select: { id: true, name: true, status: true, dueDate: true } },
        invoices: { select: { id: true, invoiceNo: true, total: true, paidAmount: true, status: true, type: true, issueDate: true } },
        payments: { select: { id: true, amount: true, status: true, date: true } },
        expenses: { select: { id: true, amount: true, category: true, date: true, description: true } },
        purchaseOrders: { select: { id: true, orderNo: true, total: true, status: true, supplierId: true } },
        resourceAssignments: { select: { id: true, status: true, startDate: true, endDate: true, crewId: true } },
        productivityLogs: { select: { id: true, date: true, outputQuantity: true, unit: true, notes: true } },
        dailyNotes: { select: { id: true, date: true, labourCount: true, workDone: true, issues: true } },
        projectBudget: {
          include: { lineItems: { select: { id: true, originalBudget: true, revisedBudget: true, actualCost: true, committedCost: true, costCode: { select: { name: true } } } } },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const now = new Date()

    // ===== বাজেট বনাম প্রকৃত =====
    const budget = project.projectBudget
    const lineItems = budget?.lineItems || []
    const totalBudget = lineItems.reduce((s, li) => s + li.originalBudget, 0) || project.budget
    const totalRevised = lineItems.reduce((s, li) => s + li.revisedBudget, 0) || 0
    const totalActual = lineItems.reduce((s, li) => s + li.actualCost, 0)
    const totalCommitted = lineItems.reduce((s, li) => s + li.committedCost, 0)

    const budgetVsActual = {
      totalBudget: Math.round(totalBudget),
      revisedBudget: Math.round(totalRevised),
      totalActual: Math.round(totalActual),
      totalCommitted: Math.round(totalCommitted),
      variance: Math.round(totalBudget - totalActual),
      variancePercent: totalBudget > 0 ? Math.round(((totalBudget - totalActual) / totalBudget) * 100) : 0,
      burnRate: totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0,
      etCompletion: totalActual > 0 && totalBudget > 0
        ? Math.round((totalBudget / (totalActual / Math.max(1, project.progress || 1))) - (totalBudget / totalActual) * 0 + 100)
        : 0,
    }

    // ===== বিভাগ অনুযায়ী খরচ বিশ্লেষণ =====
    const costByCategory: Record<string, number> = {}
    for (const exp of project.expenses) {
      const cat = exp.category || 'Uncategorized'
      costByCategory[cat] = (costByCategory[cat] || 0) + exp.amount
    }
    const costBreakdown = Object.entries(costByCategory)
      .map(([category, amount]) => ({ category, amount: Math.round(amount) }))
      .sort((a, b) => b.amount - a.amount)

    // কস্ট কোড অনুযায়ী বাজেট
    const budgetByCode = lineItems.map(li => ({
      code: li.costCode?.name || 'Uncategorized',
      budget: Math.round(li.originalBudget),
      actual: Math.round(li.actualCost),
      variance: Math.round(li.originalBudget - li.actualCost),
    })).sort((a, b) => b.budget - a.budget)

    // ===== সময়সূচি কর্মক্ষমতা =====
    const completedTasks = project.tasks.filter(t => t.status === 'completed')
    const overdueTasks = project.tasks.filter(t =>
      t.status !== 'completed' && t.status !== 'cancelled' && t.endDate && new Date(t.endDate) < now
    )
    const inProgressTasks = project.tasks.filter(t => t.status === 'in_progress')
    const overdueMilestones = project.milestones.filter(m =>
      m.status !== 'completed' && m.dueDate && new Date(m.dueDate) < now
    )

    // সময়মতো সমাপ্তির হার
    const totalDone = completedTasks.length
    const onTimeDone = completedTasks.filter(t => t.endDate && t.startDate && new Date(t.endDate) <= now).length
    const onTimeRate = totalDone > 0 ? Math.round((onTimeDone / totalDone) * 100) : 100

    const timelinePerformance = {
      totalTasks: project.tasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      overdueTasks: overdueTasks.length,
      totalMilestones: project.milestones.length,
      completedMilestones: project.milestones.filter(m => m.status === 'completed').length,
      overdueMilestones: overdueMilestones.length,
      onTimeCompletionRate: onTimeRate,
      daysSinceStart: project.startDate ? Math.floor((now.getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      daysRemaining: project.endDate ? Math.max(0, Math.floor((new Date(project.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
    }

    // ===== সম্পদ ব্যবহার =====
    const activeAssignments = project.resourceAssignments.filter(ra => ra.status === 'active')
    const resourceUtilization = {
      totalAssignments: project.resourceAssignments.length,
      activeAssignments: activeAssignments.length,
      utilizationRate: project.resourceAssignments.length > 0
        ? Math.round((activeAssignments.length / project.resourceAssignments.length) * 100)
        : 0,
      avgDailyLabour: project.dailyNotes.length > 0
        ? Math.round(project.dailyNotes.reduce((s, dn) => s + dn.labourCount, 0) / project.dailyNotes.length)
        : 0,
    }

    // ===== আর্থিক স্বাস্থ্য =====
    const salesInvoices = project.invoices.filter(i => i.type === 'sales')
    const totalInvoiced = salesInvoices.reduce((s, i) => s + i.total, 0)
    const totalCollected = salesInvoices.reduce((s, i) => s + i.paidAmount, 0)
    const totalProjectExpenses = project.expenses.reduce((s, e) => s + e.amount, 0)
    const purchaseOrderTotal = project.purchaseOrders.reduce((s, po) => s + po.total, 0)

    const grossProfit = totalInvoiced - totalProjectExpenses
    const margin = totalInvoiced > 0 ? Math.round((grossProfit / totalInvoiced) * 100) : 0

    // আর্থিক স্বাস্থ্য স্কোর (০-১০০)
    let healthScore = 50
    if (margin > 20) healthScore += 15
    else if (margin > 10) healthScore += 10
    else if (margin > 0) healthScore += 5
    else healthScore -= 15

    if (budgetVsActual.variancePercent > 10) healthScore += 10
    else if (budgetVsActual.variancePercent > 0) healthScore += 5
    else if (budgetVsActual.variancePercent < -10) healthScore -= 15

    if (timelinePerformance.onTimeCompletionRate > 80) healthScore += 10
    else if (timelinePerformance.onTimeCompletionRate < 50) healthScore -= 10

    if (totalCollected / (totalInvoiced || 1) > 0.8) healthScore += 5

    healthScore = Math.max(0, Math.min(100, healthScore))

    const financialHealth = {
      totalInvoiced: Math.round(totalInvoiced),
      totalCollected: Math.round(totalCollected),
      totalExpenses: Math.round(totalProjectExpenses),
      purchaseOrderTotal: Math.round(purchaseOrderTotal),
      grossProfit: Math.round(grossProfit),
      margin,
      collectionRate: totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0,
      outstandingReceivables: Math.round(totalInvoiced - totalCollected),
      healthScore,
      healthLabel: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'At Risk',
    }

    // ===== ঝুঁকি সূচক =====
    const risks: { type: string; severity: string; description: string; value: number }[] = []
    if (budgetVsActual.burnRate > 90) risks.push({ type: 'budget', severity: 'critical', description: 'Budget burn rate exceeds 90%', value: budgetVsActual.burnRate })
    else if (budgetVsActual.burnRate > 75) risks.push({ type: 'budget', severity: 'warning', description: 'Budget burn rate above 75%', value: budgetVsActual.burnRate })
    if (overdueTasks.length > 5) risks.push({ type: 'schedule', severity: 'critical', description: `${overdueTasks.length} overdue tasks`, value: overdueTasks.length })
    else if (overdueTasks.length > 0) risks.push({ type: 'schedule', severity: 'warning', description: `${overdueTasks.length} overdue task(s)`, value: overdueTasks.length })
    if (overdueMilestones.length > 0) risks.push({ type: 'milestone', severity: 'critical', description: `${overdueMilestones.length} overdue milestone(s)`, value: overdueMilestones.length })
    if (margin < 0) risks.push({ type: 'financial', severity: 'critical', description: `Project running at ${margin}% margin`, value: margin })
    else if (margin < 10) risks.push({ type: 'financial', severity: 'warning', description: `Low margin at ${margin}%`, value: margin })
    if (financialHealth.collectionRate < 60) risks.push({ type: 'collection', severity: 'warning', description: `Collection rate at ${financialHealth.collectionRate}%`, value: financialHealth.collectionRate })

    return NextResponse.json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          code: project.code,
          status: project.status,
          progress: project.progress,
          startDate: project.startDate,
          endDate: project.endDate,
        },
        budgetVsActual,
        costBreakdown,
        budgetByCode,
        timelinePerformance,
        resourceUtilization,
        financialHealth,
        risks,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}