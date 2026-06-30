import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length) return ''
  const cols = columns ?? Object.keys(rows[0])
  const header = cols.join(',')
  const body = rows.map(r => cols.map(c => csvEscape(r[c])).join(',')).join('\n')
  return header + '\n' + body
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'projects'
  const projectId = req.nextUrl.searchParams.get('projectId')

  let rows: Record<string, unknown>[] = []
  let filename = type

  if (type === 'projects') {
    const projects = await db.project.findMany({ orderBy: { code: 'asc' } })
    rows = projects.map(p => ({
      code: p.code, name: p.name, status: p.status, health: p.health, category: p.category,
      priority: p.priority, progress: p.progress, budget: p.budget, actualCost: p.actualCost,
      committedCost: p.committedCost, forecastCost: p.forecastCost, revenue: p.revenue,
      startDate: p.startDate?.toISOString().slice(0,10), finishDate: p.finishDate?.toISOString().slice(0,10),
      client: p.client, location: p.location, managerId: p.managerId,
    }))
    filename = 'projects'
  } else if (type === 'activities') {
    const where = projectId ? { projectId } : {}
    const acts = await db.activity.findMany({ where, orderBy: { activityId: 'asc' }, include: { project: true }, take: 2000 })
    rows = acts.map(a => ({
      activityId: a.activityId, name: a.name, project: a.project.code, type: a.type,
      status: a.status, duration: a.duration, remainingDur: a.remainingDur, progress: a.progress,
      startDate: a.startDate?.toISOString().slice(0,10), finishDate: a.finishDate?.toISOString().slice(0,10),
      totalFloat: a.totalFloat, isCritical: a.isCritical, responsible: a.responsible, cost: a.cost, actualCost: a.actualCost,
    }))
    filename = projectId ? `activities-${projectId}` : 'activities'
  } else if (type === 'risks') {
    const risks = await db.risk.findMany({ include: { project: true }, orderBy: { code: 'asc' } })
    rows = risks.map(r => ({
      code: r.code, title: r.title, project: r.project.code, category: r.category,
      probability: r.probability, impact: r.impact, score: r.probability * r.impact,
      status: r.status, strategy: r.strategy, mitigation: r.mitigation, owner: r.owner,
      responseCost: r.responseCost, raisedDate: r.raisedDate.toISOString().slice(0,10),
    }))
    filename = 'risks'
  } else if (type === 'resources') {
    const res = await db.resource.findMany({ orderBy: { type: 'asc' } })
    rows = res.map(r => ({
      code: r.code, name: r.name, type: r.type, role: r.role, unit: r.unit,
      rate: r.rate, maxUnits: r.maxUnits, department: r.department, status: r.status,
    }))
    filename = 'resources'
  } else if (type === 'changes') {
    const ch = await db.changeOrder.findMany({ include: { project: true }, orderBy: { raisedDate: 'desc' } })
    rows = ch.map(c => ({
      code: c.code, title: c.title, project: c.project.code, type: c.type, status: c.status,
      costImpact: c.costImpact, timeImpact: c.timeImpact, raisedDate: c.raisedDate.toISOString().slice(0,10),
    }))
    filename = 'changes'
  }

  const csv = toCsv(rows)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
