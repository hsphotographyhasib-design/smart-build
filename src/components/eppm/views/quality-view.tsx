'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, ClipboardCheck, CheckCircle2, XCircle, AlertOctagon, ListChecks, FileQuestion, ShieldAlert } from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { FadeIn } from '../motion'

const CHART = {
  emerald: 'oklch(0.55 0.12 162)',
  amber: 'oklch(0.7 0.16 80)',
  rose: 'oklch(0.6 0.2 25)',
  sky: 'oklch(0.62 0.1 195)',
  violet: 'oklch(0.65 0.18 305)',
  slate: 'oklch(0.55 0.02 250)',
}

type InspStatus = 'Passed' | 'Failed' | 'Pending' | 'Re-Inspect'
interface Inspection {
  id: string
  project: string
  area: string
  trade: string
  inspector: string
  date: string
  status: InspStatus
  score: number
}

const INSPECTIONS: Inspection[] = [
  { id: 'INS-2401', project: 'PRJ-001', area: 'Level 3 – Slab', trade: 'Concrete', inspector: 'S. Patel', date: '2025-01-22', status: 'Passed', score: 96 },
  { id: 'INS-2402', project: 'PRJ-002', area: 'Grid F – Steel', trade: 'Structural', inspector: 'M. Chen', date: '2025-01-21', status: 'Failed', score: 58 },
  { id: 'INS-2403', project: 'PRJ-003', area: 'MEP Risers', trade: 'Electrical', inspector: 'K. Ali', date: '2025-01-20', status: 'Passed', score: 92 },
  { id: 'INS-2404', project: 'PRJ-001', area: 'Façade N', trade: 'Envelope', inspector: 'S. Patel', date: '2025-01-19', status: 'Re-Inspect', score: 74 },
  { id: 'INS-2405', project: 'PRJ-004', area: 'Lift Shaft 2', trade: 'MEP', inspector: 'J. Müller', date: '2025-01-18', status: 'Pending', score: 0 },
  { id: 'INS-2406', project: 'PRJ-002', area: 'Basement Waterproofing', trade: 'Civil', inspector: 'R. Khan', date: '2025-01-17', status: 'Passed', score: 88 },
  { id: 'INS-2407', project: 'PRJ-003', area: 'Roof Slab', trade: 'Waterproofing', inspector: 'K. Ali', date: '2025-01-16', status: 'Failed', score: 62 },
  { id: 'INS-2408', project: 'PRJ-001', area: 'Level 2 – Columns', trade: 'Concrete', inspector: 'S. Patel', date: '2025-01-15', status: 'Passed', score: 94 },
  { id: 'INS-2409', project: 'PRJ-004', area: 'Lobby Fit-out', trade: 'Finishes', inspector: 'J. Müller', date: '2025-01-14', status: 'Re-Inspect', score: 71 },
  { id: 'INS-2410', project: 'PRJ-002', area: 'Curtain Wall', trade: 'Envelope', inspector: 'M. Chen', date: '2025-01-12', status: 'Passed', score: 90 },
  { id: 'INS-2411', project: 'PRJ-003', area: 'Plant Room', trade: 'Mechanical', inspector: 'K. Ali', date: '2025-01-11', status: 'Pending', score: 0 },
  { id: 'INS-2412', project: 'PRJ-001', area: 'Stair Core B', trade: 'Structural', inspector: 'L. Rossi', date: '2025-01-10', status: 'Passed', score: 97 },
  { id: 'INS-2413', project: 'PRJ-004', area: 'Pool Deck', trade: 'Waterproofing', inspector: 'J. Müller', date: '2025-01-09', status: 'Failed', score: 55 },
  { id: 'INS-2414', project: 'PRJ-002', area: 'Level 5 – Slab', trade: 'Concrete', inspector: 'M. Chen', date: '2025-01-08', status: 'Passed', score: 91 },
  { id: 'INS-2415', project: 'PRJ-003', area: 'Switchgear Room', trade: 'Electrical', inspector: 'K. Ali', date: '2025-01-07', status: 'Re-Inspect', score: 78 },
  { id: 'INS-2416', project: 'PRJ-001', area: 'Basement Carpark', trade: 'Civil', inspector: 'S. Patel', date: '2025-01-06', status: 'Passed', score: 89 },
]

type NCRSeverity = 'Critical' | 'Major' | 'Minor'
type NCRStatus = 'Open' | 'Investigating' | 'Resolved' | 'Closed'
interface NCR {
  code: string
  title: string
  project: string
  severity: NCRSeverity
  status: NCRStatus
  raised: string
  responsible: string
  desc: string
}

const NCRS: NCR[] = [
  { code: 'NCR-018', title: 'Reinforcement cover不足', project: 'PRJ-002', severity: 'Critical', status: 'Investigating', raised: '2025-01-21', responsible: 'M. Chen', desc: 'Cover to main rebar at Grid F measured 25mm vs specified 40mm. Affects 8 columns on Level 2.' },
  { code: 'NCR-017', title: 'Concrete cube 28-day strength below spec', project: 'PRJ-001', severity: 'Major', status: 'Open', raised: '2025-01-19', responsible: 'S. Patel', desc: 'Cube set C-312 achieved 28 MPa vs required 35 MPa. Pour on Level 3 suspended.' },
  { code: 'NCR-016', title: 'Weld seam porosity in steel members', project: 'PRJ-002', severity: 'Major', status: 'Investigating', raised: '2025-01-17', responsible: 'R. Khan', desc: 'Ultrasonic testing identified porosity in 4 of 12 primary beam welds at Grid F.' },
  { code: 'NCR-015', title: 'Missing firestop at penetration', project: 'PRJ-003', severity: 'Major', status: 'Resolved', raised: '2025-01-15', responsible: 'K. Ali', desc: 'Cable penetrations through 2-hour fire-rated wall lacking firestop seals. Rework issued.' },
  { code: 'NCR-014', title: 'Tile lippage exceeds tolerance', project: 'PRJ-004', severity: 'Minor', status: 'Closed', raised: '2025-01-12', responsible: 'J. Müller', desc: 'Lippage at tile joints in lobby measured 1.8mm vs 1.0mm max. Affected area re-laid.' },
  { code: 'NCR-013', title: 'Paint finish colour mismatch', project: 'PRJ-001', severity: 'Minor', status: 'Open', raised: '2025-01-11', responsible: 'S. Patel', desc: 'Wall paint on Level 2 north wing varies from approved sample. Repainting scheduled.' },
  { code: 'NCR-012', title: 'HVAC duct leakage above threshold', project: 'PRJ-003', severity: 'Major', status: 'Investigating', raised: '2025-01-10', responsible: 'K. Ali', desc: 'Duct pressure test on riser B recorded 8% leakage vs 3% specification.' },
  { code: 'NCR-011', title: 'Waterproofing membrane pinholes', project: 'PRJ-004', severity: 'Critical', status: 'Open', raised: '2025-01-08', responsible: 'J. Müller', desc: 'Holiday survey of pool deck membrane revealed 23 pinholes over 40m² area.' },
  { code: 'NCR-010', title: 'Door frame plumb out of tolerance', project: 'PRJ-002', severity: 'Minor', status: 'Closed', raised: '2025-01-05', responsible: 'M. Chen', desc: 'Door frames at Units 4-6 out of plumb by 6mm. Frames re-set and re-checked.' },
  { code: 'NCR-009', title: 'Switchgear busbar alignment', project: 'PRJ-003', severity: 'Minor', status: 'Resolved', raised: '2025-01-03', responsible: 'K. Ali', desc: 'Busbar alignment at main switchgear outside 1mm tolerance. Shimmed to spec.' },
]

type PunchStatus = 'Open' | 'In Progress' | 'Closed'
type Priority = 'High' | 'Med' | 'Low'
interface Punch {
  id: string
  desc: string
  project: string
  trade: string
  status: PunchStatus
  assigned: string
  priority: Priority
  due: string
}

const PUNCHES: Punch[] = [
  { id: 'P-101', desc: 'Touch-up paint at column capitals, L2', project: 'PRJ-001', trade: 'Finishes', status: 'Open', assigned: 'S. Patel', priority: 'Med', due: '2025-01-28' },
  { id: 'P-102', desc: 'Replace 3 cracked floor tiles, lobby', project: 'PRJ-004', trade: 'Finishes', status: 'In Progress', assigned: 'J. Müller', priority: 'High', due: '2025-01-26' },
  { id: 'P-103', desc: 'Install missing door closer, Unit 4', project: 'PRJ-002', trade: 'Joinery', status: 'Open', assigned: 'M. Chen', priority: 'Low', due: '2025-02-02' },
  { id: 'P-104', desc: 'Seal gaps around duct penetrations, riser B', project: 'PRJ-003', trade: 'Mechanical', status: 'In Progress', assigned: 'K. Ali', priority: 'High', due: '2025-01-25' },
  { id: 'P-105', desc: 'Clean glazing at curtain wall, N elevation', project: 'PRJ-001', trade: 'Envelope', status: 'Open', assigned: 'S. Patel', priority: 'Low', due: '2025-02-05' },
  { id: 'P-106', desc: 'Adjust door hardware, stair core B', project: 'PRJ-001', trade: 'Joinery', status: 'Closed', assigned: 'L. Rossi', priority: 'Med', due: '2025-01-18' },
  { id: 'P-107', desc: 'Re-torque bolted connections, Grid F', project: 'PRJ-002', trade: 'Structural', status: 'Open', assigned: 'R. Khan', priority: 'High', due: '2025-01-24' },
  { id: 'P-108', desc: 'Label electrical circuits, plant room', project: 'PRJ-003', trade: 'Electrical', status: 'In Progress', assigned: 'K. Ali', priority: 'Med', due: '2025-01-30' },
  { id: 'P-109', desc: 'Apply intumescent coating, steel beams L3', project: 'PRJ-001', trade: 'Fireproofing', status: 'Open', assigned: 'S. Patel', priority: 'High', due: '2025-01-27' },
  { id: 'P-110', desc: 'Re-level floor screed, bathroom 5A', project: 'PRJ-004', trade: 'Finishes', status: 'Closed', assigned: 'J. Müller', priority: 'Med', due: '2025-01-15' },
  { id: 'P-111', desc: 'Install signage at exits, all levels', project: 'PRJ-002', trade: 'Signage', status: 'Open', assigned: 'M. Chen', priority: 'Low', due: '2025-02-08' },
  { id: 'P-112', desc: 'Calibrate BMS sensors, HVAC', project: 'PRJ-003', trade: 'Mechanical', status: 'In Progress', assigned: 'K. Ali', priority: 'Med', due: '2025-02-01' },
]

const INSPECTION_STATUS_CLASS: Record<InspStatus, string> = {
  Passed: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  Failed: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Pending: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  'Re-Inspect': 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900',
}

const NCR_SEVERITY_CLASS: Record<NCRSeverity, string> = {
  Critical: 'border-rose-500',
  Major: 'border-amber-500',
  Minor: 'border-sky-500',
}

const NCR_SEVERITY_BADGE: Record<NCRSeverity, string> = {
  Critical: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Major: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Minor: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
}

const NCR_STATUS_BADGE: Record<NCRStatus, string> = {
  Open: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Investigating: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Resolved: 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900',
  Closed: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
}

const PUNCH_STATUS_BADGE: Record<PunchStatus, string> = {
  Open: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  'In Progress': 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Closed: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
}

const PRIORITY_BADGE: Record<Priority, string> = {
  High: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Med: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Low: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
}

interface KpiDef {
  label: string
  value: string | number
  icon: any
  tile: string
  bar: string
}

function KpiCard({ kpi }: { kpi: KpiDef }) {
  const Icon = kpi.icon
  return (
    <Card className="overflow-hidden pt-0">
      <div className={cn('h-1 w-full', kpi.bar)} />
      <CardContent className="p-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{kpi.label}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{kpi.value}</div>
          </div>
          <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', kpi.tile)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QualityView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate
  const [tab, setTab] = useState('inspections')

  // Inspection filters
  const [iq, setIq] = useState('')
  const [iStatus, setIStatus] = useState('all')

  // NCR filters
  const [nq, setNq] = useState('')
  const [nSev, setNSev] = useState('all')

  // Punch filters
  const [pq, setPq] = useState('')
  const [pStatus, setPStatus] = useState('all')

  const kpis: KpiDef[] = [
    { label: 'Total Inspections', value: INSPECTIONS.length, icon: ClipboardCheck, tile: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300', bar: 'bg-gradient-to-r from-slate-400 to-slate-500' },
    { label: 'Passed', value: INSPECTIONS.filter(i => i.status === 'Passed').length, icon: CheckCircle2, tile: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
    { label: 'Failed', value: INSPECTIONS.filter(i => i.status === 'Failed').length, icon: XCircle, tile: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600', bar: 'bg-gradient-to-r from-rose-400 to-rose-600' },
    { label: 'Open NCRs', value: NCRS.filter(n => n.status === 'Open' || n.status === 'Investigating').length, icon: AlertOctagon, tile: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600', bar: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    { label: 'Open Punch Items', value: PUNCHES.filter(p => p.status !== 'Closed').length, icon: ListChecks, tile: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600', bar: 'bg-gradient-to-r from-violet-400 to-violet-600' },
    { label: 'RFI Open', value: 7, icon: FileQuestion, tile: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600', bar: 'bg-gradient-to-r from-sky-400 to-sky-600' },
  ]

  const filteredInspections = useMemo(() => {
    return INSPECTIONS.filter(i => {
      if (iq && !`${i.id} ${i.project} ${i.area} ${i.trade} ${i.inspector}`.toLowerCase().includes(iq.toLowerCase())) return false
      if (iStatus !== 'all' && i.status !== iStatus) return false
      return true
    })
  }, [iq, iStatus])

  const filteredNcrs = useMemo(() => {
    return NCRS.filter(n => {
      if (nq && !`${n.code} ${n.title} ${n.project} ${n.responsible} ${n.desc}`.toLowerCase().includes(nq.toLowerCase())) return false
      if (nSev !== 'all' && n.severity !== nSev) return false
      return true
    })
  }, [nq, nSev])

  const filteredPunches = useMemo(() => {
    return PUNCHES.filter(p => {
      if (pq && !`${p.id} ${p.desc} ${p.project} ${p.trade} ${p.assigned}`.toLowerCase().includes(pq.toLowerCase())) return false
      if (pStatus !== 'all' && p.status !== pStatus) return false
      return true
    })
  }, [pq, pStatus])

  const ncrBySeverity: any[] = [
    { name: 'Critical', count: NCRS.filter(n => n.severity === 'Critical').length, fill: CHART.rose },
    { name: 'Major', count: NCRS.filter(n => n.severity === 'Major').length, fill: CHART.amber },
    { name: 'Minor', count: NCRS.filter(n => n.severity === 'Minor').length, fill: CHART.sky },
  ]

  const punchByStatus: any[] = [
    { name: 'Open', value: PUNCHES.filter(p => p.status === 'Open').length, fill: CHART.amber },
    { name: 'In Progress', value: PUNCHES.filter(p => p.status === 'In Progress').length, fill: CHART.sky },
    { name: 'Closed', value: PUNCHES.filter(p => p.status === 'Closed').length, fill: CHART.emerald },
  ]

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map(k => <KpiCard key={k.label} kpi={k} />)}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="ncrs">NCRs (Non-Conformance)</TabsTrigger>
            <TabsTrigger value="punch">Punch List</TabsTrigger>
          </TabsList>

          {/* Inspections tab */}
          <TabsContent value="inspections" className="mt-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-sm">Inspection Register</CardTitle>
                    <CardDescription className="text-xs">{filteredInspections.length} of {INSPECTIONS.length} inspections</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={iq} onChange={e => setIq(e.target.value)} placeholder="Search inspections…" className="pl-8 h-9 w-56" />
                    </div>
                    <Select value={iStatus} onValueChange={setIStatus}>
                      <SelectTrigger className="h-9 w-40"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Passed">Passed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Re-Inspect">Re-Inspect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-[100px]">Inspection ID</TableHead>
                        <TableHead className="w-[90px]">Project</TableHead>
                        <TableHead className="min-w-[200px]">Area / Trade</TableHead>
                        <TableHead className="w-[120px]">Inspector</TableHead>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead className="w-[110px]">Status</TableHead>
                        <TableHead className="w-[80px] text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInspections.map(i => (
                        <TableRow key={i.id} className={cn('hover:bg-muted/40', i.status === 'Failed' && 'bg-rose-50/60 dark:bg-rose-950/20')}>
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{i.id}</TableCell>
                          <TableCell className="font-mono text-[10px]">{i.project}</TableCell>
                          <TableCell>
                            <div className="text-xs font-medium truncate max-w-[260px]">{i.area}</div>
                            <div className="text-[10px] text-muted-foreground">{i.trade}</div>
                          </TableCell>
                          <TableCell className="text-[11px]">{i.inspector}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{fmtDate(i.date)}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[9px]', INSPECTION_STATUS_CLASS[i.status])}>{i.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            {i.score > 0 ? (
                              <span className={cn('text-xs font-bold tabular-nums', i.score >= 85 ? 'text-emerald-600' : i.score >= 70 ? 'text-amber-600' : 'text-rose-600')}>{i.score}%</span>
                            ) : <span className="text-[10px] text-muted-foreground">—</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredInspections.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-10">No inspections match filters</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NCRs tab */}
          <TabsContent value="ncrs" className="mt-3 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-sm">Non-Conformance Reports</CardTitle>
                      <CardDescription className="text-xs">{filteredNcrs.length} of {NCRS.length} NCRs</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={nq} onChange={e => setNq(e.target.value)} placeholder="Search NCRs…" className="pl-8 h-9 w-52" />
                      </div>
                      <Select value={nSev} onValueChange={setNSev}>
                        <SelectTrigger className="h-9 w-36"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Severity</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="Major">Major</SelectItem>
                          <SelectItem value="Minor">Minor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[560px] overflow-auto scroll-thin space-y-2 pr-1">
                    {filteredNcrs.map(n => (
                      <div key={n.code} className={cn('rounded-lg border-l-4 border-y border-r p-3', NCR_SEVERITY_CLASS[n.severity])}>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] text-muted-foreground">{n.code}</span>
                              <Badge variant="outline" className={cn('text-[9px]', NCR_SEVERITY_BADGE[n.severity])}>{n.severity}</Badge>
                              <Badge variant="outline" className={cn('text-[9px]', NCR_STATUS_BADGE[n.status])}>{n.status}</Badge>
                              <span className="font-mono text-[10px] text-muted-foreground">{n.project}</span>
                            </div>
                            <div className="text-xs font-semibold mt-1">{n.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</div>
                          </div>
                          <div className="text-right shrink-0 sm:text-right">
                            <div className="text-[10px] text-muted-foreground">Raised</div>
                            <div className="text-[11px] font-medium">{fmtDate(n.raised)}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 mt-2 border-t">
                          <div className="text-[10px] text-muted-foreground">Responsible: <span className="text-foreground font-medium">{n.responsible}</span></div>
                        </div>
                      </div>
                    ))}
                    {filteredNcrs.length === 0 && (
                      <div className="text-center text-xs text-muted-foreground py-10">No NCRs match filters</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">NCRs by Severity</CardTitle>
                  <CardDescription className="text-xs">Distribution across all NCRs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={ncrBySeverity} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" width={28} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} cursor={{ fill: 'oklch(0.55 0.02 250 / 0.08)' }} />
                      <Bar dataKey="count" name="NCRs" radius={[4, 4, 0, 0]}>
                        {ncrBySeverity.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    {ncrBySeverity.map(s => (
                      <div key={s.name} className="rounded-md border p-2">
                        <div className="text-lg font-bold tabular-nums" style={{ color: s.fill }}>{s.count}</div>
                        <div className="text-[10px] text-muted-foreground">{s.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Punch List tab */}
          <TabsContent value="punch" className="mt-3 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-sm">Punch List</CardTitle>
                      <CardDescription className="text-xs">{filteredPunches.length} of {PUNCHES.length} punch items</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={pq} onChange={e => setPq(e.target.value)} placeholder="Search punch items…" className="pl-8 h-9 w-52" />
                      </div>
                      <Select value={pStatus} onValueChange={setPStatus}>
                        <SelectTrigger className="h-9 w-36"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[560px] overflow-auto scroll-thin">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="w-[70px]">Item ID</TableHead>
                          <TableHead className="min-w-[220px]">Description</TableHead>
                          <TableHead className="w-[80px]">Project</TableHead>
                          <TableHead className="w-[110px]">Trade</TableHead>
                          <TableHead className="w-[110px]">Status</TableHead>
                          <TableHead className="w-[120px]">Assigned To</TableHead>
                          <TableHead className="w-[80px]">Priority</TableHead>
                          <TableHead className="w-[100px]">Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPunches.map(p => (
                          <TableRow key={p.id} className="hover:bg-muted/40">
                            <TableCell className="font-mono text-[10px] text-muted-foreground">{p.id}</TableCell>
                            <TableCell><div className="text-xs font-medium truncate max-w-[260px]">{p.desc}</div></TableCell>
                            <TableCell className="font-mono text-[10px]">{p.project}</TableCell>
                            <TableCell className="text-[10px]">{p.trade}</TableCell>
                            <TableCell><Badge variant="outline" className={cn('text-[9px]', PUNCH_STATUS_BADGE[p.status])}>{p.status}</Badge></TableCell>
                            <TableCell className="text-[11px]">{p.assigned}</TableCell>
                            <TableCell><Badge variant="outline" className={cn('text-[9px]', PRIORITY_BADGE[p.priority])}>{p.priority}</Badge></TableCell>
                            <TableCell className="text-[10px] text-muted-foreground">{fmtDate(p.due)}</TableCell>
                          </TableRow>
                        ))}
                        {filteredPunches.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-10">No punch items match filters</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Punch Status Distribution</CardTitle>
                  <CardDescription className="text-xs">Open · In Progress · Closed</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={punchByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {punchByStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      {/* Legend rendered manually below for compactness */}
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px]">
                    {punchByStatus.map(s => (
                      <span key={s.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className="font-semibold tabular-nums">{s.value}</span>
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-[11px]">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-muted-foreground">Closure rate:</span>
                    <span className="font-semibold tabular-nums">
                      {Math.round((PUNCHES.filter(p => p.status === 'Closed').length / PUNCHES.length) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}
