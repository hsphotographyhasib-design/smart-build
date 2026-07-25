'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, FileEdit, Clock, CheckCircle2, XCircle, DollarSign, CalendarClock } from 'lucide-react'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtDate, statusColor, exportCsv, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'

const EMERALD = 'oklch(0.55 0.12 162)'
const AMBER = 'oklch(0.7 0.16 80)'
const ROSE = 'oklch(0.6 0.2 25)'
const VIOLET = 'oklch(0.65 0.18 305)'
const SLATE = 'oklch(0.55 0.02 250)'

const TYPE_COLORS = [EMERALD, AMBER, ROSE, VIOLET, SLATE]

export function ChangesView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const data = useDashboardData()
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')

  const changes: any[] = data?.changes ?? []

  const types = useMemo(() => Array.from(new Set(changes.map(c => c.type))), [changes])

  const costByType = useMemo(() => {
    const map = new Map<string, number>()
    changes.forEach(c => {
      map.set(c.type, (map.get(c.type) ?? 0) + (c.costImpact || 0))
    })
    return Array.from(map.entries()).map(([t, v]) => ({ type: t, cost: v }))
  }, [changes])

  const rows = useMemo(() => {
    return changes.filter(c => {
      if (q && !`${c.code} ${c.title} ${c.project?.code} ${c.project?.name}`.toLowerCase().includes(q.toLowerCase())) return false
      if (type !== 'all' && c.type !== type) return false
      if (status !== 'all' && c.status !== status) return false
      return true
    })
  }, [changes, q, type, status])

  const pending = useMemo(
    () => changes.filter(c => c.status === 'Submitted' || c.status === 'Under Review'),
    [changes],
  )

  if (!data) return <div className="h-64 animate-pulse bg-muted/40 rounded-xl" />
  void onNavigate

  const pendingCount = pending.length
  const approved = changes.filter(c => c.status === 'Approved').length
  const rejected = changes.filter(c => c.status === 'Rejected').length
  const totalCost = changes.reduce((s, c) => s + (c.costImpact || 0), 0)
  const totalTime = changes.reduce((s, c) => s + (c.timeImpact || 0), 0)

  const maxCost = Math.max(1, ...costByType.map(d => d.cost))

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
        {[
          { l: 'Total Changes', v: changes.length, i: FileEdit, t: 'text-foreground' },
          { l: 'Pending', v: pendingCount, i: Clock, t: 'text-amber-700' },
          { l: 'Approved', v: approved, i: CheckCircle2, t: 'text-emerald-700' },
          { l: 'Rejected', v: rejected, i: XCircle, t: 'text-rose-700' },
          { l: 'Cost Impact', v: fmtMoney(totalCost), i: DollarSign, t: 'text-foreground' },
          { l: 'Time Impact', v: `${totalTime}d`, i: CalendarClock, t: 'text-foreground' },
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

      {/* Bar chart + Pending approvals */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cost Impact by Type</CardTitle>
            <CardDescription className="text-xs">Aggregated cost impact per change type</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costByType} margin={{ top: 10, right: 16, bottom: 20, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmtMoney(v)} width={70} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    formatter={(v: number) => [fmtMoney(v, false), 'Cost Impact']}
                    contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]} maxBarSize={64}>
                    {costByType.map((_, idx) => (
                      <Cell key={idx} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending Approvals</CardTitle>
            <CardDescription className="text-xs">{pending.length} change(s) awaiting decision</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="max-h-[300px] overflow-auto scroll-thin pr-1">
              {pending.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No pending approvals.</div>
              ) : (
                <ol className="relative space-y-3 border-l border-muted pl-5">
                  {pending.map(c => (
                    <li key={c.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-background" />
                      <div className="rounded-lg border bg-card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold">{c.code} · {c.title}</div>
                            <div className="text-[10px] text-muted-foreground">{c.project?.code} · {c.type} · Raised {fmtDate(c.raisedDate)}</div>
                          </div>
                          <Badge variant="outline" className={`text-[9px] shrink-0 ${statusColor(c.status)}`}>{c.status}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px]">
                          <span className="text-muted-foreground">Cost: <strong className="text-foreground tabular-nums">{fmtMoney(c.costImpact)}</strong></span>
                          <span className="text-muted-foreground">Time: <strong className="text-foreground tabular-nums">{c.timeImpact}d</strong></span>
                        </div>
                        <div className="mt-2.5 flex gap-2">
                          <Button size="sm" className="h-7 gap-1 px-2.5 text-[11px]"><CheckCircle2 className="h-3 w-3" />Approve</Button>
                          <Button size="sm" variant="outline" className="h-7 gap-1 px-2.5 text-[11px]"><XCircle className="h-3 w-3" />Reject</Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Register Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm">Change Register</CardTitle>
              <CardDescription className="text-xs">{rows.length} of {changes.length} change orders</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search changes…" className="pl-8 h-9 w-52" />
              </div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Implemented">Implemented</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => exportCsv('changes')}><Download className="h-4 w-4" />Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead className="min-w-[240px]">Title</TableHead>
                  <TableHead className="w-[110px]">Project</TableHead>
                  <TableHead className="w-[110px]">Type</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[110px] text-right">Cost Impact</TableHead>
                  <TableHead className="w-[90px] text-right">Time (d)</TableHead>
                  <TableHead className="w-[100px]">Raised</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 300).map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{c.code}</TableCell>
                    <TableCell><div className="truncate text-xs font-medium max-w-[280px]">{c.title}</div></TableCell>
                    <TableCell><span className="font-mono text-[10px] text-muted-foreground">{c.project?.code}</span></TableCell>
                    <TableCell><span className="text-[10px]">{c.type}</span></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[9px] ${statusColor(c.status)}`}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right text-[11px] tabular-nums">{fmtMoney(c.costImpact)}</TableCell>
                    <TableCell className="text-right text-[11px] tabular-nums">{c.timeImpact}d</TableCell>
                    <TableCell className="text-[10px]">{fmtDate(c.raisedDate)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-8">No changes match the current filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
