import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await db.project.findUnique({
    where: { id },
    include: {
      wbs: { orderBy: { code: 'asc' } },
      activities: { orderBy: { activityId: 'asc' }, include: { wbs: true, assignments: { include: { resource: true } } } },
      risks: true,
      baselines: true,
      changes: true,
      documents: true,
      reports: { orderBy: { reportDate: 'desc' }, take: 14 },
    },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Build dependency list
  const actIds = project.activities.map(a => a.id)
  const dependencies = await db.dependency.findMany({
    where: { OR: [{ predecessorId: { in: actIds } }, { successorId: { in: actIds } }] },
    include: { predecessor: true, successor: true },
  })

  // EVM calculation
  const totalBudget = project.budget
  const progressFrac = project.progress / 100
  const PV = totalBudget * Math.min(1, Math.max(0,
    (Date.now() - (project.startDate?.getTime() ?? Date.now())) /
    Math.max(1, (project.finishDate?.getTime() ?? Date.now()) - (project.startDate?.getTime() ?? Date.now()))
  ))
  const EV = totalBudget * progressFrac
  const AC = project.actualCost
  const CV = EV - AC
  const SV = EV - PV
  const SPI = PV > 0 ? EV / PV : 1
  const CPI = AC > 0 ? EV / AC : 1
  const EAC = CPI > 0 ? totalBudget / CPI : totalBudget
  const ETC = EAC - AC
  const VAC = totalBudget - EAC

  // Build WBS tree
  const wbsMap = new Map(project.wbs.map(w => [w.id, { ...w, children: [] as any[] }]))
  const wbsRoots: any[] = []
  for (const w of project.wbs) {
    const node = wbsMap.get(w.id)!
    if (w.parentId && wbsMap.has(w.parentId)) {
      wbsMap.get(w.parentId)!.children.push(node)
    } else {
      wbsRoots.push(node)
    }
  }

  // S-curve monthly for this project
  const months: { label: string; planned: number; earned: number; actual: number }[] = []
  if (project.startDate && project.finishDate) {
    const pStart = project.startDate.getTime()
    const pEnd = project.finishDate.getTime()
    const dur = Math.max(1, pEnd - pStart)
    const cur = new Date(pStart); cur.setUTCDate(1)
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const now = Date.now()
    while (cur.getTime() <= pEnd) {
      const label = cur.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' })
      const mEnd = new Date(cur); mEnd.setUTCMonth(mEnd.getUTCMonth() + 1); mEnd.setUTCDate(0)
      const span = Math.min(pEnd, mEnd.getTime()) - Math.max(pStart, cur.getTime())
      const ratio = Math.max(0, span / dur)
      const elapsedRatio = Math.min(1, Math.max(0, (Math.min(now, mEnd.getTime()) - pStart) / dur))
      months.push({
        label,
        planned: totalBudget * ratio,
        earned: totalBudget * Math.min(ratio, elapsedRatio + 0.05) * progressFrac * 1.05,
        actual: project.actualCost * ratio * (now < cur.getTime() ? 0 : 1),
      })
      cur.setUTCMonth(cur.getUTCMonth() + 1)
    }
  }

  // Resource histogram by day for lookahead window (next 8 weeks)
  const histogram: { date: string; units: number; type: string }[] = []
  const day = 86400000
  const start = Date.now()
  for (let i = 0; i < 56; i++) {
    const d = new Date(start + i * day)
    for (const a of project.activities) {
      if (!a.startDate || !a.finishDate) continue
      if (d.getTime() >= a.startDate.getTime() && d.getTime() <= a.finishDate.getTime() && a.progress < 100) {
        for (const asg of a.assignments) {
          histogram.push({ date: d.toISOString().slice(0, 10), units: asg.unitsPerDay, type: asg.resource.type })
        }
      }
    }
  }

  return NextResponse.json({
    project,
    wbsTree: wbsRoots,
    activities: project.activities.map(a => ({ ...a, project: undefined })),
    dependencies: dependencies.map(d => ({
      id: d.id, from: d.predecessor.activityId, to: d.successor.activityId,
      fromId: d.predecessorId, toId: d.successorId, type: d.type, lag: d.lag,
    })),
    evm: { PV, EV, AC, BAC: totalBudget, EAC, ETC, CV, SV, SPI, CPI, VAC, progress: project.progress },
    sCurve: months,
    resourceHistogram: histogram,
  })
}
