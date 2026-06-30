import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const port = req.nextUrl.searchParams.get('XTransformPort')
  void port
  const [portfolios, programs, projects, risks, activities, resources, changes, baselines] = await Promise.all([
    db.portfolio.findMany({ include: { programs: true, projects: true } }),
    db.program.findMany({ include: { projects: true } }),
    db.project.findMany({ orderBy: { code: 'asc' } }),
    db.risk.findMany({ include: { project: true } }),
    db.activity.findMany({ include: { project: true } }),
    db.resource.findMany(),
    db.changeOrder.findMany({ include: { project: true } }),
    db.baseline.findMany({ include: { project: true } }),
  ])

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
  const totalActual = projects.reduce((s, p) => s + p.actualCost, 0)
  const totalForecast = projects.reduce((s, p) => s + p.forecastCost, 0)
  const totalRevenue = projects.reduce((s, p) => s + p.revenue, 0)
  const totalCommitted = projects.reduce((s, p) => s + p.committedCost, 0)
  const avgProgress = projects.length ? projects.reduce((s, p) => s + p.progress, 0) / projects.length : 0
  const delayed = activities.filter(a => a.baselineFinish && a.finishDate && a.finishDate > a.baselineFinish && a.progress < 100)
  const critical = activities.filter(a => a.isCritical && a.progress < 100)
  const openRisks = risks.filter(r => r.status === 'Open')
  const highRisks = openRisks.filter(r => r.probability * r.impact >= 15)
  const avgFloat = critical.length ? critical.reduce((s, a) => s + a.totalFloat, 0) / critical.length : 0

  const health = {
    Green: projects.filter(p => p.health === 'Green').length,
    Yellow: projects.filter(p => p.health === 'Yellow').length,
    Red: projects.filter(p => p.health === 'Red').length,
  }

  // Cash flow S-curve (monthly buckets across the portfolio horizon)
  const startMs = Math.min(...projects.map(p => p.startDate?.getTime() ?? Date.now()))
  const endMs = Math.max(...projects.map(p => p.finishDate?.getTime() ?? Date.now()))
  const months: { label: string; planned: number; actual: number; forecast: number }[] = []
  const cur = new Date(startMs)
  cur.setUTCDate(1)
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthIdx = (label: string) => monthNames.indexOf(label.split(' ')[0])
  const startOfMonth = (d: Date) => { const x = new Date(d); x.setUTCDate(1); x.setUTCHours(0,0,0,0); return x }
  const endOfMonth = (d: Date) => { const x = startOfMonth(d); x.setUTCMonth(x.getUTCMonth() + 1); x.setUTCDate(0); return x }
  while (cur.getTime() <= endMs) {
    const label = cur.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' })
    months.push({ label, planned: 0, actual: 0, forecast: 0 })
    cur.setUTCMonth(cur.getUTCMonth() + 1)
  }
  for (const p of projects) {
    if (!p.startDate || !p.finishDate) continue
    const pStart = p.startDate.getTime()
    const pEnd = p.finishDate.getTime()
    const dur = Math.max(1, pEnd - pStart)
    const now = Date.now()
    const elapsedRatio = Math.min(1, Math.max(0, (now - pStart) / dur))
    months.forEach(m => {
      const yy = 2000 + parseInt(m.label.split("'")[1])
      const d = new Date(Date.UTC(yy, monthIdx(m.label), 15))
      if (d.getTime() >= pStart && d.getTime() <= pEnd) {
        const span = Math.min(pEnd, endOfMonth(d).getTime()) - Math.max(pStart, startOfMonth(d).getTime())
        const ratio = Math.max(0, span / dur)
        m.planned += p.budget * ratio
        m.forecast += p.forecastCost * ratio
        if (d.getTime() <= now) m.actual += p.actualCost * ratio * (elapsedRatio || 0.5) / Math.max(0.01, elapsedRatio)
      }
    })
  }

  const resByType: Record<string, number> = {}
  const resCount: Record<string, number> = {}
  for (const r of resources) {
    resByType[r.type] = (resByType[r.type] ?? 0) + r.maxUnits
    resCount[r.type] = (resCount[r.type] ?? 0) + 1
  }

  return NextResponse.json({
    kpis: {
      portfolios: portfolios.length,
      programs: programs.length,
      projects: projects.length,
      activities: activities.length,
      resources: resources.length,
      risks: risks.length,
      openRisks: openRisks.length,
      highRisks: highRisks.length,
      totalBudget,
      totalActual,
      totalForecast,
      totalRevenue,
      totalCommitted,
      grossProfit: totalRevenue - totalForecast,
      avgProgress,
      delayedActivities: delayed.length,
      criticalActivities: critical.length,
      avgFloat,
      pendingChanges: changes.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length,
    },
    health,
    portfolios,
    programs,
    projects,
    risks: risks.map(r => ({ ...r, score: r.probability * r.impact })),
    activities: activities.slice(0, 600),
    criticalActivities: critical,
    delayedActivities: delayed,
    cashFlow: months,
    resourceByType: resByType,
    resourceCount: resCount,
    changes,
    baselines,
  })
}
