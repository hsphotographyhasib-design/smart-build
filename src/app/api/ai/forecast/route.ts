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
    const type = searchParams.get('type') || 'all'

    const result: Record<string, unknown> = {}

    // ===== LABOUR FORECASTING =====
    if (type === 'all' || type === 'labour') {
      // Attendance history - last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const attendanceRecords = await db.attendance.findMany({
        where: { date: { gte: sixMonthsAgo } },
        select: { date: true, labourId: true, hoursWorked: true, overtime: true, projectId: true, status: true },
      })

      // Group by month
      const monthlyLabour: Record<string, { month: string; totalWorkers: number; totalHours: number; avgHoursPerWorker: number }> = {}
      for (const att of attendanceRecords) {
        const monthKey = att.date.toISOString().slice(0, 7)
        if (!monthlyLabour[monthKey]) {
          monthlyLabour[monthKey] = { month: monthKey, totalWorkers: 0, totalHours: 0, avgHoursPerWorker: 0 }
        }
        if (att.status === 'present') {
          monthlyLabour[monthKey].totalHours += att.hoursWorked + (att.overtime || 0)
          monthlyLabour[monthKey].totalWorkers += 1
        }
      }

      for (const key of Object.keys(monthlyLabour)) {
        monthlyLabour[key].avgHoursPerWorker = monthlyLabour[key].totalWorkers > 0
          ? Math.round(monthlyLabour[key].totalHours / monthlyLabour[key].totalWorkers)
          : 0
      }

      const labourData = Object.values(monthlyLabour).sort((a, b) => a.month.localeCompare(b.month))

      // Calculate forecast for next 3 months
      const avgMonthlyWorkers = labourData.length > 0
        ? Math.round(labourData.reduce((s, m) => s + m.totalWorkers, 0) / labourData.length / 30) // divide by ~30 days
        : 0

      const activeProjects = await db.project.count({ where: { status: { in: ['active', 'on_hold'] } } })
      const plannedProjects = await db.project.count({ where: { status: 'planning' } })

      const labourForecast = labourData.length >= 2
        ? labourData.slice(-2).map((m, i) => ({
            month: m.month,
            predicted: Math.round(m.totalWorkers / 30 * (1 + (i * 0.05))),
            lower: Math.round(m.totalWorkers / 30 * 0.85),
            upper: Math.round(m.totalWorkers / 30 * 1.15),
          }))
        : []

      // Add 3 forecast months
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      for (let i = 1; i <= 3; i++) {
        const forecastDate = new Date(lastMonth)
        forecastDate.setMonth(forecastDate.getMonth() + i)
        const monthKey = forecastDate.toISOString().slice(0, 7)
        const base = avgMonthlyWorkers * (1 + activeProjects * 0.02)
        labourForecast.push({
          month: monthKey,
          predicted: Math.round(base * (1 + i * 0.05)),
          lower: Math.round(base * 0.85),
          upper: Math.round(base * 1.15),
        })
      }

      result.labour = {
        historical: labourData,
        forecast: labourForecast,
        currentWorkforce: avgMonthlyWorkers,
        activeProjects,
        plannedProjects,
        confidence: labourData.length >= 3 ? 0.78 : 0.55,
        recommendations: [
          ...(activeProjects > 5 ? ['Consider cross-training workers for multi-project flexibility'] : []),
          ...(plannedProjects > 2 ? [`${plannedProjects} projects in planning phase may require ${Math.round(plannedProjects * avgMonthlyWorkers * 0.3)} additional workers in next 2-3 months`] : []),
          avgMonthlyWorkers > 0 ? [`Current average workforce: ${avgMonthlyWorkers} workers/month across active projects`] : [],
        ],
      }
    }

    // ===== RESOURCE OPTIMIZATION =====
    if (type === 'all' || type === 'resources') {
      const resourceAssignments = await db.resourceAssignment.findMany({
        include: {
          project: { select: { id: true, name: true, status: true } },
          crew: { select: { id: true, name: true } },
        },
      })

      const crewData = await db.crew.findMany({
        include: {
          members: { include: { labour: { select: { name: true, isActive: true } } } },
        },
      })

      const crews = crewData.map(c => ({
        id: c.id,
        name: c.name,
        memberCount: c.members.length,
        activeMembers: c.members.filter(m => m.labour.isActive).length,
        assignments: resourceAssignments.filter(ra => ra.crewId === c.id).length,
        utilization: c.members.length > 0
          ? Math.min(100, Math.round((resourceAssignments.filter(ra => ra.crewId === c.id).length / c.members.length) * 100))
          : 0,
      }))

      const underUtilized = crews.filter(c => c.utilization < 40)
      const overUtilized = crews.filter(c => c.utilization > 90)

      result.resources = {
        crews: JSON.parse(JSON.stringify(crews)),
        underUtilized: underUtilized.map(c => ({ id: c.id, name: c.name, utilization: c.utilization, memberCount: c.memberCount })),
        overUtilized: overUtilized.map(c => ({ id: c.id, name: c.name, utilization: c.utilization, memberCount: c.memberCount })),
        totalAssignments: resourceAssignments.length,
        recommendations: [
          ...(underUtilized.length > 0 ? [`${underUtilized.length} crew(s) are under 40% utilization: ${underUtilized.map(c => c.name).join(', ')}. Consider reassigning to active projects.`] : []),
          ...(overUtilized.length > 0 ? [`${overUtilized.length} crew(s) are over 90% utilization: ${overUtilized.map(c => c.name).join(', ')}. Risk of burnout — consider adding resources.`] : []),
        ],
        confidence: 0.82,
      }
    }

    // ===== COST FORECASTING =====
    if (type === 'all' || type === 'cost') {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const expenses = await db.expense.findMany({
        where: { date: { gte: sixMonthsAgo } },
        select: { date: true, amount: true, category: true, projectId: true },
      })

      const invoices = await db.invoice.findMany({
        where: { issueDate: { gte: sixMonthsAgo } },
        select: { issueDate: true, total: true, status: true, projectId: true, type: true },
      })

      const budgets = await db.budget.findMany({
        where: { status: 'approved' },
        include: {
          project: { select: { id: true, name: true, status: true, budget: true } },
          lineItems: { select: { originalBudget: true, actualCost: true, committedCost: true, costCode: { select: { name: true } } } },
        },
      })

      // Monthly cost aggregation
      const monthlyCosts: Record<string, { month: string; expenses: number; invoiced: number }> = {}
      for (const exp of expenses) {
        const mk = exp.date.toISOString().slice(0, 7)
        if (!monthlyCosts[mk]) monthlyCosts[mk] = { month: mk, expenses: 0, invoiced: 0 }
        monthlyCosts[mk].expenses += exp.amount
      }
      for (const inv of invoices) {
        const mk = inv.issueDate.toISOString().slice(0, 7)
        if (!monthlyCosts[mk]) monthlyCosts[mk] = { month: mk, expenses: 0, invoiced: 0 }
        if (inv.type === 'sales') monthlyCosts[mk].invoiced += inv.total
        else monthlyCosts[mk].expenses += inv.total
      }

      const costTrend = Object.values(monthlyCosts).sort((a, b) => a.month.localeCompare(b.month))

      // Budget health
      const budgetHealth = budgets.map(b => {
        const totalBudget = b.lineItems.reduce((s, li) => s + li.originalBudget, 0) || b.originalValue
        const totalActual = b.lineItems.reduce((s, li) => s + li.actualCost, 0)
        const totalCommitted = b.lineItems.reduce((s, li) => s + li.committedCost, 0)
        const burnRate = totalBudget > 0 ? totalActual / totalBudget : 0
        return {
          projectId: b.project.id,
          projectName: b.project.name,
          totalBudget,
          totalActual,
          totalCommitted,
          variance: totalBudget - totalActual,
          burnRate: Math.round(burnRate * 100),
          atRisk: burnRate > 0.85,
        }
      })

      // Cost anomaly detection
      const anomalies: { category: string; currentMonth: number; avgMonth: number; deviation: number; severity: string }[] = []
      if (costTrend.length >= 3) {
        const latest = costTrend[costTrend.length - 1]
        const prevMonths = costTrend.slice(-4, -1)
        const avgExpense = prevMonths.reduce((s, m) => s + m.expenses, 0) / prevMonths.length
        if (avgExpense > 0) {
          const deviation = (latest.expenses - avgExpense) / avgExpense
          if (Math.abs(deviation) > 0.2) {
            anomalies.push({
              category: 'Overall Expenses',
              currentMonth: latest.expenses,
              avgMonth: Math.round(avgExpense),
              deviation: Math.round(deviation * 100),
              severity: deviation > 0.3 ? 'critical' : deviation > 0.2 ? 'warning' : 'info',
            })
          }
        }
      }

      // 3-month cost forecast
      const costForecast = costTrend.length >= 2
        ? costTrend.slice(-3).map((m, i) => ({
            month: m.month,
            predicted: Math.round(m.expenses * (1 + (i - 1) * 0.02)),
            lower: Math.round(m.expenses * 0.9),
            upper: Math.round(m.expenses * 1.1),
          }))
        : []

      const lastCostMonth = new Date()
      lastCostMonth.setMonth(lastCostMonth.getMonth() - 1)
      const recentAvg = costTrend.length > 0
        ? costTrend.slice(-3).reduce((s, m) => s + m.expenses, 0) / Math.min(3, costTrend.length)
        : 0
      for (let i = 1; i <= 3; i++) {
        const fd = new Date(lastCostMonth)
        fd.setMonth(fd.getMonth() + i)
        costForecast.push({
          month: fd.toISOString().slice(0, 7),
          predicted: Math.round(recentAvg * (1 + i * 0.03)),
          lower: Math.round(recentAvg * 0.88),
          upper: Math.round(recentAvg * 1.12),
        })
      }

      result.cost = {
        trend: costTrend,
        forecast: costForecast,
        budgetHealth: budgetHealth,
        anomalies,
        confidence: costTrend.length >= 4 ? 0.81 : 0.6,
        recommendations: [
          ...(anomalies.length > 0 ? anomalies.map(a => `Cost anomaly detected in ${a.category}: ${a.deviation > 0 ? '+' : ''}${a.deviation}% deviation from average`) : []),
          ...budgetHealth.filter(b => b.atRisk).map(b => `${b.projectName} at ${b.burnRate}% budget utilization — review immediately`),
        ],
      }
    }

    // ===== SCHEDULE RISK =====
    if (type === 'all' || type === 'schedule') {
      const now = new Date()

      const atRiskTasks = await db.projectTask.findMany({
        where: {
          status: { in: ['todo', 'in_progress'] },
          endDate: { lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
        },
        include: {
          project: { select: { id: true, name: true, code: true, status: true } },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { endDate: 'asc' },
        take: 20,
      })

      const overdueTasks = await db.projectTask.findMany({
        where: {
          status: { in: ['todo', 'in_progress'] },
          endDate: { lt: now },
        },
        include: {
          project: { select: { id: true, name: true, code: true } },
        },
        take: 20,
      })

      const overdueMilestones = await db.projectMilestone.findMany({
        where: {
          status: { in: ['pending', 'in_progress'] },
          dueDate: { lt: now },
        },
        include: {
          project: { select: { id: true, name: true } },
        },
        take: 10,
      })

      const upcomingMilestones = await db.projectMilestone.findMany({
        where: {
          status: { in: ['pending', 'in_progress'] },
          dueDate: { gte: now },
          dueDate: { lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
        },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      })

      const scheduleRisk = JSON.parse(JSON.stringify({
        atRiskTasks,
        overdueTasks,
        overdueMilestones,
        upcomingMilestones,
      }))

      result.schedule = {
        ...scheduleRisk,
        totalOverdue: overdueTasks.length + overdueMilestones.length,
        totalAtRisk: atRiskTasks.length,
        riskLevel: overdueTasks.length > 10 ? 'critical' : overdueTasks.length > 5 ? 'warning' : 'info',
        confidence: 0.92,
        recommendations: [
          ...(overdueTasks.length > 0 ? [`${overdueTasks.length} task(s) are overdue. Prioritize re-assignment or scope adjustment.`] : []),
          ...(overdueMilestones.length > 0 ? [`${overdueMilestones.length} milestone(s) are overdue: ${overdueMilestones.map(m => m.name).join(', ')}.`] : []),
          ...(atRiskTasks.length > 5 ? [`${atRiskTasks.length} tasks due within 14 days — review resource allocation.`] : []),
        ],
      }
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}