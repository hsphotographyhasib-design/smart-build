import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    // ===== মূল কর্মক্ষমতা সূচক =====
    const [
      activeProjects,
      completedProjects,
      totalProjects,
      totalInvoices,
      totalPayments,
      totalExpenses,
      overdueTasks,
      overdueMilestones,
      totalAssignments,
      activeAssignments,
    ] = await Promise.all([
      db.project.count({ where: { status: 'active' } }),
      db.project.count({ where: { status: 'completed' } }),
      db.project.count(),
      db.invoice.count({ where: { type: 'sales' } }),
      db.payment.count({ where: { status: 'completed' } }),
      db.expense.count(),
      db.projectTask.count({ where: { status: { in: ['todo', 'in_progress'] }, endDate: { lt: now } } }),
      db.projectMilestone.count({ where: { status: { in: ['pending', 'in_progress'] }, dueDate: { lt: now } } }),
      db.resourceAssignment.count(),
      db.resourceAssignment.count({ where: { status: 'active' } }),
    ])

    // পরিশোধিত চালান থেকে আয়
    const revenueAgg = await db.invoice.aggregate({
      _sum: { total: true, paidAmount: true },
      where: { type: 'sales' },
    })

    // মোট ব্যয়
    const expenseAgg = await db.expense.aggregate({
      _sum: { amount: true },
    })

    const totalRevenue = revenueAgg._sum.total || 0
    const collectedRevenue = revenueAgg._sum.paidAmount || 0
    const totalExpenses = expenseAgg._sum.amount || 0
    const netProfit = totalRevenue - totalExpenses

    // সক্রিয় প্রকল্পের বাজেট সমষ্টি
    const activeBudgetAgg = await db.project.aggregate({
      _sum: { budget: true },
      where: { status: 'active' },
    })

    // সম্পদ ব্যবহার
    const resourceUtilization = totalAssignments > 0 ? Math.round((activeAssignments / totalAssignments) * 100) : 0

    // গড় প্রকল্প মার্জিন
    const projectsWithBudgets = await db.project.findMany({
      where: { status: { in: ['active', 'completed'] } },
      select: { id: true, budget: true, invoices: { select: { total: true, type: true } }, expenses: { select: { amount: true } } },
    })

    let totalMargin = 0
    let marginCount = 0
    for (const p of projectsWithBudgets) {
      const revenue = p.invoices.filter(i => i.type === 'sales').reduce((s, i) => s + i.total, 0)
      const costs = p.expenses.reduce((s, e) => s + e.amount, 0)
      if (revenue > 0) {
        totalMargin += ((revenue - costs) / revenue) * 100
        marginCount++
      }
    }
    const avgMargin = marginCount > 0 ? Math.round(totalMargin / marginCount) : 0

    // ===== মাসিক প্রবণতা (গত ১২ মাস) =====
    const monthlyInvoices = await db.invoice.findMany({
      where: { type: 'sales', issueDate: { gte: twelveMonthsAgo } },
      select: { issueDate: true, total: true },
    })

    const monthlyExpenses = await db.expense.findMany({
      where: { date: { gte: twelveMonthsAgo } },
      select: { date: true, amount: true },
    })

    const monthlyPayments = await db.payment.findMany({
      where: { status: 'completed', date: { gte: twelveMonthsAgo } },
      select: { date: true, amount: true },
    })

    const monthlyMap: Record<string, { month: string; revenue: number; expenses: number; profit: number; collected: number }> = {}

    for (const inv of monthlyInvoices) {
      const mk = inv.issueDate.toISOString().slice(0, 7)
      if (!monthlyMap[mk]) monthlyMap[mk] = { month: mk, revenue: 0, expenses: 0, profit: 0, collected: 0 }
      monthlyMap[mk].revenue += inv.total
    }

    for (const exp of monthlyExpenses) {
      const mk = exp.date.toISOString().slice(0, 7)
      if (!monthlyMap[mk]) monthlyMap[mk] = { month: mk, revenue: 0, expenses: 0, profit: 0, collected: 0 }
      monthlyMap[mk].expenses += exp.amount
    }

    for (const pay of monthlyPayments) {
      const mk = pay.date.toISOString().slice(0, 7)
      if (!monthlyMap[mk]) monthlyMap[mk] = { month: mk, revenue: 0, expenses: 0, profit: 0, collected: 0 }
      monthlyMap[mk].collected += pay.amount
    }

    const monthlyTrends = Object.values(monthlyMap).map(m => ({
      ...m,
      profit: m.revenue - m.expenses,
    })).sort((a, b) => a.month.localeCompare(b.month))

    // ===== আয় অনুযায়ী শীর্ষ প্রকল্পসমূহ =====
    const topProjects = await db.project.findMany({
      where: { status: { in: ['active', 'completed'] } },
      select: {
        id: true, name: true, code: true, status: true, budget: true, progress: true,
        invoices: { select: { total: true, type: true, paidAmount: true } },
        expenses: { select: { amount: true } },
      },
      take: 10,
    })

    const topProjectsByRevenue = topProjects
      .map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
        revenue: p.invoices.filter(i => i.type === 'sales').reduce((s, i) => s + i.total, 0),
        collected: p.invoices.filter(i => i.type === 'sales').reduce((s, i) => s + i.paidAmount, 0),
        expenses: p.expenses.reduce((s, e) => s + e.amount, 0),
        profit: p.invoices.filter(i => i.type === 'sales').reduce((s, i) => s + i.total, 0) - p.expenses.reduce((s, e) => s + e.amount, 0),
        budget: p.budget,
        progress: p.progress,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // ===== বিভাগ বিশ্লেষণ =====
    const expenseBreakdown = await db.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    })

    // ===== বাজেট স্বাস্থ্য =====
    const budgets = await db.budget.findMany({
      where: { status: 'approved' },
      include: {
        project: { select: { id: true, name: true, status: true } },
        lineItems: { select: { originalBudget: true, actualCost: true } },
      },
    })

    const budgetHealth = budgets.map(b => {
      const totalBudget = b.lineItems.reduce((s, li) => s + li.originalBudget, 0) || b.originalValue
      const totalActual = b.lineItems.reduce((s, li) => s + li.actualCost, 0)
      return {
        projectName: b.project.name,
        projectId: b.project.id,
        totalBudget,
        totalActual,
        variance: totalBudget - totalActual,
        variancePercent: totalBudget > 0 ? Math.round(((totalBudget - totalActual) / totalBudget) * 100) : 0,
        isOverBudget: totalActual > totalBudget,
      }
    })

    const overBudgetCount = budgetHealth.filter(b => b.isOverBudget).length
    const underBudgetCount = budgetHealth.filter(b => !b.isOverBudget && b.variancePercent > 10).length

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalRevenue: Math.round(totalRevenue),
          collectedRevenue: Math.round(collectedRevenue),
          totalExpenses: Math.round(totalExpenses),
          netProfit: Math.round(netProfit),
          activeProjects,
          completedProjects,
          totalProjects,
          completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
          resourceUtilization,
          avgMargin,
          overdueTasks,
          overdueMilestones,
          totalOverdue: overdueTasks + overdueMilestones,
          overBudgetCount,
          underBudgetCount,
          activeBudgetTotal: activeBudgetAgg._sum.budget || 0,
        },
        monthlyTrends,
        topProjectsByRevenue: JSON.parse(JSON.stringify(topProjectsByRevenue)),
        expenseBreakdown: expenseBreakdown.map(e => ({
          category: e.category,
          total: e._sum.amount || 0,
          count: e._count,
        })),
        budgetHealth,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}