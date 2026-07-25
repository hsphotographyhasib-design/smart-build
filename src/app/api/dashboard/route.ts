import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { isSuperAdminRole } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Super Admin — redirect handled by client, but provide platform KPIs
  if (isSuperAdminRole(user.role)) {
    return NextResponse.json({
      mode: 'platform',
      kpis: { portfolios: 0, programs: 0, projects: 0, activities: 0, resources: 0, risks: 0, openRisks: 0, highRisks: 0, totalBudget: 0, totalActual: 0, totalForecast: 0, totalRevenue: 0, totalCommitted: 0, grossProfit: 0, avgProgress: 0, delayedActivities: 0, criticalActivities: 0, avgFloat: 0, pendingChanges: 0 },
      health: { Green: 0, Yellow: 0, Red: 0 },
      portfolios: [], programs: [], projects: [], risks: [], activities: [],
      criticalActivities: [], delayedActivities: [],
      cashFlow: [], resourceByType: {}, resourceCount: {},
      changes: [], baselines: [],
    })
  }

  // Tenant user
  const tenantId = user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'No tenant context' }, { status: 403 })

  const [portfolioCount, projectCount, projects, resources, risks, activities, changes] =
    await Promise.all([
      db.portfolio.count({ where: { tenantId } }),
      db.project.count({ where: { tenantId } }),
      db.project.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 50,
        select: { id: true, code: true, name: true, status: true, health: true, category: true, priority: true, budget: true, actualCost: true, committedCost: true, forecastCost: true, revenue: true, progress: true, startDate: true, finishDate: true, baselineStart: true, baselineFinish: true, portfolioId: true, programId: true, managerId: true, client: true, location: true },
      }),
      db.resource.findMany({ where: { tenantId }, take: 20, select: { id: true, code: true, name: true, type: true, rate: true, status: true, calendar: true, unit: true, maxUnits: true } }),
      db.risk.findMany({ where: { tenantId }, orderBy: { raisedDate: 'desc' }, take: 20,
        select: { id: true, code: true, title: true, projectId: true, category: true, probability: true, impact: true, score: true, status: true, strategy: true, mitigation: true, owner: true, responseCost: true, raisedDate: true, dueDate: true },
      }),
      db.activity.findMany({ where: { tenantId }, take: 20, select: { id: true, activityId: true, name: true, projectId: true, wbsId: true, type: true, status: true, duration: true, remainingDur: true, progress: true, startDate: true, finishDate: true, baselineStart: true, baselineFinish: true, totalFloat: true, freeFloat: true, isCritical: true, responsible: true, cost: true, actualCost: true, tenantId: true } }),
      db.changeOrder.findMany({ where: { tenantId }, take: 10, select: { id: true, code: true, title: true, type: true, status: true, costImpact: true, timeImpact: true, raisedDate: true, projectId: true } }),
    ])

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)
  const totalActual = projects.reduce((s, p) => s + (p.actualCost || 0), 0)
  const totalCommitted = projects.reduce((s, p) => s + (p.committedCost || 0), 0)
  const totalForecast = projects.reduce((s, p) => s + (p.forecastCost || 0), 0)
  const totalRevenue = projects.reduce((s, p) => s + (p.revenue || 0), 0)
  const avgProgress = projects.length ? projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length : 0

  const health: Record<string, number> = { Green: 0, Yellow: 0, Red: 0 }
  const statusDist: Record<string, number> = {}
  for (const p of projects) {
    health[p.health] = (health[p.health] || 0) + 1
  }

  const openRisks = risks.filter(r => r.status === 'Open').length
  const highRisks = risks.filter(r => r.score >= 15).length
  const criticalActivities = activities.filter(a => a.isCritical).length
  const delayedActivities = activities.filter(a => a.status === 'In Progress' && a.progress > 0 && a.progress < 50).length
  const pendingChanges = changes.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length

  const resourceByType: Record<string, number> = {}
  for (const r of resources) resourceByType[r.type] = (resourceByType[r.type] || 0) + 1

  // Get portfolio/program data
  const portfolios = await db.portfolio.findMany({ where: { tenantId }, select: { id: true, code: true, name: true, status: true, health: true, budget: true, managerId: true } })
  const programs = await db.program.findMany({ where: { tenantId }, select: { id: true, code: true, name: true, status: true, health: true, budget: true, portfolioId: true, managerId: true } })

  return NextResponse.json({
    mode: 'tenant',
    kpis: {
      portfolios: portfolioCount, programs: programs.length, projects: projectCount,
      activities: activities.length, resources: resources.length,
      risks: risks.length, openRisks, highRisks,
      totalBudget, totalActual, totalForecast, totalRevenue, totalCommitted,
      grossProfit: totalRevenue - totalActual, avgProgress: Math.round(avgProgress),
      delayedActivities, criticalActivities,
      avgFloat: activities.length ? Math.round(activities.reduce((s, a) => s + a.totalFloat, 0) / activities.length) : 0,
      pendingChanges,
    },
    health,
    portfolios,
    programs,
    projects,
    risks,
    activities,
    criticalActivities: activities.filter(a => a.isCritical),
    delayedActivities: activities.filter(a => a.status === 'In Progress' && a.progress > 0 && a.progress < 50),
    cashFlow: [],
    resourceByType,
    resourceCount: resourceByType,
    changes,
    baselines: [],
  })
}
