'use client'

import { Fragment, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, ShieldAlert, ShieldCheck, FolderOpen, DollarSign, AlertTriangle } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtDate, statusColor, exportCsv, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell } from 'recharts'

const EMERALD = 'oklch(0.55 0.12 162)'
const AMBER = 'oklch(0.7 0.16 80)'
const ROSE = 'oklch(0.6 0.2 25)'
const SKY = 'oklch(0.62 0.1 195)'
const SLATE = 'oklch(0.55 0.02 250)'

const STATUS_COLOR_MAP: Record<string, string> = {
  Open: AMBER,
  Mitigated: SKY,
  Closed: EMERALD,
  Realized: ROSE,
}

function matrixCellColor(score: number) {
  if (score >= 15) return 'bg-rose-500/85 text-white border-rose-600/60'
  if (score >= 10) return 'bg-orange-500/85 text-white border-orange-600/60'
  if (score >= 5) return 'bg-amber-400/85 text-amber-950 border-amber-500/60'
  return 'bg-emerald-500/85 text-white border-emerald-600/60'
}

function scoreBadgeClass(score: number) {
  if (score >= 15) return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'
  if (score >= 9) return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
  return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
}

export function RisksView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const matrix = useMemo(() => {
    const m: number[][] = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0))
    if (!data) return m
    data.risks.forEach((r: any) => {
      const p = Math.max(1, Math.min(5, r.probability || 1))
      const i = Math.max(1, Math.min(5, r.impact || 1))
      m[i - 1][p - 1] += 1
    })
    return m
  }, [data])

  const scatterData = useMemo(() => {
    if (!data) return []
    return data.risks.map((r: any) => ({
      x: Math.max(1, Math.min(5, r.probability || 1)),
      y: Math.max(1, Math.min(5, r.impact || 1)),
      z: Math.max(50, r.responseCost || 0),
      name: r.code,
      status: r.status,
      project: r.project?.code,
      title: r.title,
      cost: r.responseCost || 0,
    }))
  }, [data])

  const rows = useMemo(() => {
    if (!data) return []
    return data.risks.filter((r: any) => {
      if (q && !`${r.code} ${r.title} ${r.project?.code} ${r.project?.name} ${r.owner ?? ''} ${r.category ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false
      if (status !== 'all' && r.status !== status) return false
      return true
    })
  }, [data, q, status])

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />
  void onNavigate

  const risks: any[] = data.risks
  const open = risks.filter(r => r.status === 'Open').length
  const high = risks.filter(r => r.score >= 15).length
  const mitigated = risks.filter(r => r.status === 'Mitigated').length
  const totalResp = risks.reduce((s, r) => s + (r.responseCost || 0), 0)

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        {[
          { l: 'Total Risks', v: risks.length, i: ShieldAlert, t: 'text-foreground' },
          { l: 'Open', v: open, i: FolderOpen, t: 'text-amber-600' },
          { l: 'High (≥15)', v: high, i: AlertTriangle, t: 'text-rose-600' },
          { l: 'Mitigated', v: mitigated, i: ShieldCheck, t: 'text-emerald-600' },
          { l: 'Response Cost', v: fmtMoney(totalResp), i: DollarSign, t: 'text-foreground' },
        ].map(s => (
          <Card key={s.l}><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">{s.l}</div>
                <div className={cn('mt-1 text-2xl font-bold tabular-nums', s.t)}>{s.v}</div>
              </div>
              <s.i className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent></Card>
        ))}
      </div>

      {/* Matrix + Scatter */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Risk Matrix (Probability × Impact)</CardTitle>
            <CardDescription className="text-xs">Count of risks in each P×I bucket · score = P×I</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1.5">
              {/* Top header row: corner + P labels */}
              <div />
              {[1, 2, 3, 4, 5].map(p => (
                <div key={p} className="text-center text-[10px] font-semibold text-muted-foreground pb-1">P{p}</div>
              ))}
              {/* Rows: I label + 5 cells, ordered from I=5 down to I=1 */}
              {[5, 4, 3, 2, 1].map(i => (
                <Fragment key={i}>
                  <div className="flex items-center pr-2 text-[10px] font-semibold text-muted-foreground">I{i}</div>
                  {[1, 2, 3, 4, 5].map(p => {
                    const count = matrix[i - 1][p - 1]
                    const score = p * i
                    return (
                      <div
                        key={p}
                        className={cn(
                          'flex aspect-square flex-col items-center justify-center rounded-md border text-xs font-bold shadow-sm transition-colors',
                          matrixCellColor(score),
                          count === 0 && 'opacity-40',
                        )}
                        title={`P${p} × I${i} = ${score} · ${count} risk(s)`}
                      >
                        <span className="tabular-nums leading-none">{count}</span>
                        <span className="text-[9px] font-medium opacity-75 leading-none mt-0.5">{score}</span>
                      </div>
                    )
                  })}
                </Fragment>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
              <span className="font-semibold">Severity:</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500/85 border border-emerald-600/60" />1–4 Low</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400/85 border border-amber-500/60" />5–9 Medium</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-500/85 border border-orange-600/60" />10–14 High</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-rose-500/85 border border-rose-600/60" />15–25 Critical</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Risk Bubble Map</CardTitle>
            <CardDescription className="text-xs">Each risk sized by response cost · colored by status</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 16, bottom: 20, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" dataKey="x" name="Probability" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} label={{ value: 'Probability', position: 'insideBottom', offset: -8, fontSize: 10 }} />
                  <YAxis type="number" dataKey="y" name="Impact" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} label={{ value: 'Impact', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <ZAxis type="number" dataKey="z" name="Response Cost" range={[60, 700]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="rounded-md border bg-popover px-2.5 py-1.5 text-[10px] shadow-md">
                          <div className="font-semibold">{d.name} · {d.project}</div>
                          <div className="text-muted-foreground truncate max-w-[200px]">{d.title}</div>
                          <div className="mt-0.5">P={d.x} · I={d.y} · Score {d.x * d.y}</div>
                          <div>Response Cost: <strong>{fmtMoney(d.cost)}</strong></div>
                        </div>
                      )
                    }}
                  />
                  <Scatter data={scatterData}>
                    {scatterData.map((d: any, idx: number) => (
                      <Cell key={idx} fill={STATUS_COLOR_MAP[d.status] || SLATE} fillOpacity={0.72} stroke={STATUS_COLOR_MAP[d.status] || SLATE} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center gap-3 px-2 pt-1 text-[10px] text-muted-foreground">
              {Object.entries(STATUS_COLOR_MAP).map(([k, c]) => (
                <span key={k} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{k}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Register Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm">Risk Register</CardTitle>
              <CardDescription className="text-xs">{rows.length} of {risks.length} risks</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search risks…" className="pl-8 h-9 w-56" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Mitigated">Mitigated</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Realized">Realized</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => exportCsv('risks')}><Download className="h-4 w-4" />Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[90px]">Code</TableHead>
                  <TableHead className="min-w-[220px]">Title</TableHead>
                  <TableHead className="w-[110px]">Project</TableHead>
                  <TableHead className="w-[110px]">Category</TableHead>
                  <TableHead className="w-[40px] text-center">P</TableHead>
                  <TableHead className="w-[40px] text-center">I</TableHead>
                  <TableHead className="w-[60px] text-center">Score</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[90px]">Strategy</TableHead>
                  <TableHead className="w-[120px]">Owner</TableHead>
                  <TableHead className="w-[100px] text-right">Response Cost</TableHead>
                  <TableHead className="w-[90px]">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 300).map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{r.code}</TableCell>
                    <TableCell><div className="truncate text-xs font-medium max-w-[260px]">{r.title}</div></TableCell>
                    <TableCell><span className="font-mono text-[10px] text-muted-foreground">{r.project?.code}</span></TableCell>
                    <TableCell><span className="text-[10px]">{r.category}</span></TableCell>
                    <TableCell className="text-center text-[11px] tabular-nums">{r.probability}</TableCell>
                    <TableCell className="text-center text-[11px] tabular-nums">{r.impact}</TableCell>
                    <TableCell className="text-center"><Badge variant="outline" className={cn('text-[10px] tabular-nums font-semibold', scoreBadgeClass(r.score))}>{r.score}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[9px] ${statusColor(r.status)}`}>{r.status}</Badge></TableCell>
                    <TableCell><span className="text-[10px]">{r.strategy ?? '—'}</span></TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{r.owner ?? '—'}</TableCell>
                    <TableCell className="text-right text-[11px] tabular-nums">{fmtMoney(r.responseCost)}</TableCell>
                    <TableCell className="text-[10px]">{fmtDate(r.dueDate)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={12} className="text-center text-xs text-muted-foreground py-8">No risks match the current filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
