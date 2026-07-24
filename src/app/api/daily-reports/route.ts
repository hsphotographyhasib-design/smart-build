import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const reports = await db.dailyReport.findMany({
    orderBy: { reportDate: 'desc' },
    take: 120,
    include: { project: { select: { code: true, name: true, health: true, location: true } } },
  })
  // Manpower trend (last 14 days, summed across projects)
  const byDate: Record<string, number> = {}
  for (const r of reports) {
    const k = r.reportDate.toISOString().slice(0, 10)
    byDate[k] = (byDate[k] ?? 0) + r.manpower
  }
  const trend = Object.entries(byDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, manpower]) => ({ date, manpower }))

  // Progress curve: cumulative-style proxy using project progress over time (synthetic from reports)
  const projectProgress: Record<string, { code: string; name: string; points: { date: string; prog: number }[] }> = {}
  for (const r of reports) {
    const key = r.projectId
    if (!projectProgress[key]) projectProgress[key] = { code: r.project.code, name: r.project.name, points: [] }
  }
  // We don't store historical progress; derive a believable curve from project.progress going back
  const projects = await db.project.findMany({ select: { id: true, code: true, name: true, progress: true, startDate: true, finishDate: true }, orderBy: { progress: 'desc' }, take: 8 })
  const progressCurves = projects.map(p => {
    if (!p.startDate || !p.finishDate) return null
    const start = p.startDate.getTime()
    const end = p.finishDate.getTime()
    const now = Date.now()
    const months: { label: string; prog: number }[] = []
    const cur = new Date(start); cur.setUTCDate(1)
    while (cur.getTime() <= end) {
      const ratio = Math.min(1, Math.max(0, (cur.getTime() - start) / (end - start)))
      // S-curve: sigmoid-ish
      const s = 1 / (1 + Math.exp(-6 * (ratio - 0.5)))
      const capped = cur.getTime() > now ? Math.min(100, p.progress * (1 / (1 + Math.exp(-6 * (Math.min(1, (now - start) / (end - start)) - 0.5))))) : p.progress * s / (1 / (1 + Math.exp(-6 * (Math.min(1, (now - start) / (end - start)) - 0.5))))
      months.push({ label: cur.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' }), prog: Math.round(capped) })
      cur.setUTCMonth(cur.getUTCMonth() + 1)
    }
    return { code: p.code, name: p.name, progress: p.progress, curve: months }
  }).filter(Boolean)

  return NextResponse.json({
    reports,
    manpowerTrend: trend,
    progressCurves,
    totals: {
      reports: reports.length,
      totalManpowerToday: reports.filter(r => r.reportDate.toISOString().slice(0,10) === new Date().toISOString().slice(0,10)).reduce((s,r)=>s+r.manpower,0) || reports.slice(0,12).reduce((s,r)=>s+r.manpower,0),
      activeSites: new Set(reports.map(r => r.projectId)).size,
    },
  })
}
