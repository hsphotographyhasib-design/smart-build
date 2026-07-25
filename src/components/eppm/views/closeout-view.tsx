'use client'

import { useMemo, useState } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  BookOpenCheck, CheckCircle2, Clock, Award, ShieldCheck,
  Search, Filter, FileText, MinusCircle, ThumbsUp,
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip,
} from 'recharts'
import { fmtDate, fmtMoney, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

const CHART = {
  emerald: 'oklch(0.55 0.12 162)',
  amber: 'oklch(0.7 0.16 80)',
  rose: 'oklch(0.6 0.2 25)',
  sky: 'oklch(0.62 0.1 195)',
  violet: 'oklch(0.65 0.18 305)',
  slate: 'oklch(0.55 0.02 250)',
}

type ItemState = 'Done' | 'Pending' | 'N/A'

interface ChecklistItem {
  name: string
  state: ItemState
  note?: string
}

interface CloseoutProject {
  code: string
  name: string
  manager: string
  completionPct: number
  targetDate: string
  items: ChecklistItem[]
}

const CHECKLIST_TEMPLATE: string[] = [
  'Final Accounts Settled',
  'Punch List Closed',
  'As-Built Drawings Submitted',
  'O&M Manuals Handed Over',
  'Retention Released',
  'Final Inspection Passed',
  'Permits Closed',
  'Warranties Activated',
  'Performance Certificate',
  'Insurance Closure',
  'Subcontractor Releases',
  'Client Acceptance',
]

function buildItems(pattern: ItemState[]): ChecklistItem[] {
  return CHECKLIST_TEMPLATE.map((name, i) => ({ name, state: pattern[i] ?? 'Pending' }))
}

const CLOSEOUT_PROJECTS: CloseoutProject[] = [
  {
    code: 'PRJ-001', name: 'Marina Heights Tower A', manager: 'S. Patel',
    completionPct: 92, targetDate: '2025-02-15',
    items: buildItems(['Done', 'Done', 'Done', 'Done', 'Pending', 'Done', 'Done', 'Done', 'Pending', 'Done', 'Pending', 'Pending']),
  },
  {
    code: 'PRJ-002', name: 'Central Logistics Hub', manager: 'R. Khan',
    completionPct: 78, targetDate: '2025-03-10',
    items: buildItems(['Pending', 'Pending', 'Done', 'Pending', 'Pending', 'Done', 'Pending', 'Done', 'Pending', 'Pending', 'Pending', 'Pending']),
  },
  {
    code: 'PRJ-004', name: 'Riverside Residential Block', manager: 'J. Müller',
    completionPct: 100, targetDate: '2025-01-20',
    items: buildItems(['Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done']),
  },
  {
    code: 'PRJ-003', name: 'Airport Terminal Expansion', manager: 'M. Chen',
    completionPct: 64, targetDate: '2025-04-30',
    items: buildItems(['Pending', 'Pending', 'Pending', 'Pending', 'N/A', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending']),
  },
]

type LessonCategory =
  | 'Technical'
  | 'Procurement'
  | 'Schedule'
  | 'Quality'
  | 'Safety'
  | 'Contract'

interface Lesson {
  id: string
  project: string
  category: LessonCategory
  title: string
  description: string
  action: string
  submittedBy: string
  date: string
  rating: number
}

const LESSONS: Lesson[] = [
  { id: 'LL-001', project: 'PRJ-001', category: 'Technical', title: 'Curtain wall interface sealing', description: 'Early mock-up revealed sealant adhesion failure at aluminium-to-concrete interface due to moisture.', action: 'Adopted primer pre-treatment; added 48h cure window to method statement.', submittedBy: 'S. Patel', date: '2025-01-12', rating: 18 },
  { id: 'LL-002', project: 'PRJ-002', category: 'Procurement', title: 'Long-lead switchgear sourcing', description: 'Switchgear lead time of 32 weeks caused 4-week schedule slip on main power scope.', action: 'Long-lead register now requires early commitment at 30% design stage.', submittedBy: 'A. Novak', date: '2025-01-09', rating: 24 },
  { id: 'LL-003', project: 'PRJ-003', category: 'Schedule', title: 'Concurrent MEP first-fix clashes', description: 'Mechanical and electrical first-fix clashed on 14% of floors due to uncoordinated drawings.', action: 'Introduced weekly BIM coordination freeze before each pour.', submittedBy: 'M. Chen', date: '2025-01-15', rating: 31 },
  { id: 'LL-004', project: 'PRJ-001', category: 'Quality', title: 'Tile lippage in wet areas', description: 'Inspection rejected 3 bathrooms due to lippage >1mm on large-format tiles.', action: 'Switched to levelling clip system; revised ITP to require 100% inspection.', submittedBy: 'L. Rossi', date: '2025-01-18', rating: 12 },
  { id: 'LL-005', project: 'PRJ-004', category: 'Safety', title: 'Edge protection on lift shafts', description: 'Near-miss: incomplete edge protection around lift shaft opening on L7.', action: 'Mandatory permit-to-open for shaft covers; daily TBT reinforcement.', submittedBy: 'L. Rossi', date: '2025-01-06', rating: 42 },
  { id: 'LL-006', project: 'PRJ-002', category: 'Contract', title: 'Variation order turnaround delay', description: 'Average VO approval took 21 days against contractual 10-day limit.', action: 'Implemented two-stage pre-agreement memo; client PM co-signs within 5 days.', submittedBy: 'A. Novak', date: '2025-01-20', rating: 19 },
  { id: 'LL-007', project: 'PRJ-003', category: 'Technical', title: 'HVAC duct pressure test failures', description: '12% of ductwork failed pressure test at medium pressure class.', action: 'Revised fabrication tolerance; introduced pre-test smoke test.', submittedBy: 'M. Chen', date: '2025-01-21', rating: 15 },
  { id: 'LL-008', project: 'PRJ-004', category: 'Procurement', title: 'Tile batch colour variation', description: 'Two batches of beige limestone showed visible colour shift after install.', action: 'Procurement now requires single-batch supply + reserve 10% stock.', submittedBy: 'J. Müller', date: '2025-01-08', rating: 22 },
  { id: 'LL-009', project: 'PRJ-001', category: 'Schedule', title: 'Façade panel delivery sequencing', description: 'Panels arrived out of sequence causing 6-day crane idle.', action: 'Delivery sequence now locked in JIT schedule; site marshalling plan updated.', submittedBy: 'S. Patel', date: '2025-01-14', rating: 17 },
  { id: 'LL-010', project: 'PRJ-003', category: 'Quality', title: 'Concrete cover below tolerance', description: 'Cover meter survey found 8% of columns with cover <30mm.', action: 'Introduced cover blocks QA register; pre-pour sign-off by QC.', submittedBy: 'R. Khan', date: '2025-01-11', rating: 26 },
  { id: 'LL-011', project: 'PRJ-002', category: 'Safety', title: 'Hot work permit compliance', description: 'Audit found 3 hot work activities without active permit.', action: 'Digital permit system enforced; spot fines for subcontractors.', submittedBy: 'L. Rossi', date: '2025-01-17', rating: 33 },
  { id: 'LL-012', project: 'PRJ-004', category: 'Contract', title: 'Subcontractor scope gaps', description: 'Gaps between MEP and fire-stopping subcontractor scopes discovered late.', action: 'Scope matrix now signed at subcontract award; gap clauses explicit.', submittedBy: 'J. Müller', date: '2025-01-13', rating: 14 },
]

const CATEGORY_COLOR: Record<LessonCategory, string> = {
  Technical: CHART.violet,
  Procurement: CHART.amber,
  Schedule: CHART.sky,
  Quality: CHART.emerald,
  Safety: CHART.rose,
  Contract: CHART.slate,
}

const CATEGORY_BADGE: Record<LessonCategory, string> = {
  Technical: 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900',
  Procurement: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Schedule: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Quality: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  Safety: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Contract: 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-900/50 dark:border-slate-800',
}

const ITEM_STATE_META: Record<ItemState, { icon: any; color: string; label: string }> = {
  Done: { icon: CheckCircle2, color: 'text-emerald-700', label: 'Done' },
  Pending: { icon: Clock, color: 'text-amber-700', label: 'Pending' },
  'N/A': { icon: MinusCircle, color: 'text-muted-foreground', label: 'N/A' },
}

type RetentionStatus = 'Held' | 'Partially Released' | 'Released'
type BondStatus = 'Active' | 'Released' | 'Forfeited'

interface RetentionRecord {
  project: string
  retentionPct: number
  retentionAmount: number
  releaseDate: string
  status: RetentionStatus
  warrantyPeriod: string
  warrantyUntil: string
  bondStatus: BondStatus
}

const RETENTION_RECORDS: RetentionRecord[] = [
  { project: 'PRJ-004', retentionPct: 5, retentionAmount: 620_000, releaseDate: '2026-01-12', status: 'Held', warrantyPeriod: '24 months', warrantyUntil: '2027-01-12', bondStatus: 'Active' },
  { project: 'PRJ-001', retentionPct: 5, retentionAmount: 1_240_000, releaseDate: '2025-02-20', status: 'Partially Released', warrantyPeriod: '24 months', warrantyUntil: '2027-02-15', bondStatus: 'Active' },
  { project: 'PRJ-003', retentionPct: 5, retentionAmount: 1_580_000, releaseDate: '2025-05-18', status: 'Held', warrantyPeriod: '24 months', warrantyUntil: '2027-05-18', bondStatus: 'Active' },
  { project: 'PRJ-002', retentionPct: 5, retentionAmount: 540_000, releaseDate: '2025-03-10', status: 'Held', warrantyPeriod: '12 months', warrantyUntil: '2026-03-10', bondStatus: 'Active' },
  { project: 'PRJ-004', retentionPct: 5, retentionAmount: 360_000, releaseDate: '2024-12-28', status: 'Released', warrantyPeriod: '24 months', warrantyUntil: '2026-12-28', bondStatus: 'Released' },
  { project: 'PRJ-001', retentionPct: 5, retentionAmount: 445_000, releaseDate: '2024-12-15', status: 'Released', warrantyPeriod: '12 months', warrantyUntil: '2025-12-15', bondStatus: 'Released' },
  { project: 'PRJ-003', retentionPct: 5, retentionAmount: 680_000, releaseDate: '2025-04-30', status: 'Partially Released', warrantyPeriod: '24 months', warrantyUntil: '2027-04-30', bondStatus: 'Active' },
  { project: 'PRJ-002', retentionPct: 5, retentionAmount: 280_000, releaseDate: '2025-06-10', status: 'Held', warrantyPeriod: '12 months', warrantyUntil: '2026-06-10', bondStatus: 'Active' },
  { project: 'PRJ-004', retentionPct: 5, retentionAmount: 180_000, releaseDate: '2024-11-30', status: 'Released', warrantyPeriod: '12 months', warrantyUntil: '2025-11-30', bondStatus: 'Released' },
  { project: 'PRJ-001', retentionPct: 5, retentionAmount: 320_000, releaseDate: '2025-07-01', status: 'Held', warrantyPeriod: '24 months', warrantyUntil: '2027-07-01', bondStatus: 'Active' },
]

const RETENTION_STATUS_BADGE: Record<RetentionStatus, string> = {
  Held: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  'Partially Released': 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Released: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
}

const BOND_STATUS_BADGE: Record<BondStatus, string> = {
  Active: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  Released: 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-900/50 dark:border-slate-800',
  Forfeited: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
}

interface KpiDef {
  label: string
  value: string | number
  hint?: string
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
            {kpi.hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{kpi.hint}</div>}
          </div>
          <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', kpi.tile)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CloseoutView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate

  // Lessons Learned filters
  const [lessonQuery, setLessonQuery] = useState('')
  const [lessonCategory, setLessonCategory] = useState('all')

  // Derived KPI values
  const projectsInCloseout = CLOSEOUT_PROJECTS.length
  const closeoutComplete = CLOSEOUT_PROJECTS.filter(p => p.completionPct === 100).length
  const pendingCerts = 7
  const retentionHeld = RETENTION_RECORDS
    .filter(r => r.status !== 'Released')
    .reduce((sum, r) => sum + r.retentionAmount, 0)
  const lessonsCaptured = LESSONS.length
  const avgCloseoutDays = 48

  const kpis: KpiDef[] = [
    { label: 'Projects in Closeout', value: projectsInCloseout, hint: 'active closeout phase', icon: BookOpenCheck, tile: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300', bar: 'bg-gradient-to-r from-slate-400 to-slate-500' },
    { label: 'Closeout Complete', value: closeoutComplete, hint: 'checklist 100%', icon: CheckCircle2, tile: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
    { label: 'Pending Certificates', value: pendingCerts, hint: 'awaiting issuance', icon: Award, tile: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700', bar: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    { label: 'Retention Held', value: fmtMoney(retentionHeld), hint: 'across active projects', icon: ShieldCheck, tile: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600', bar: 'bg-gradient-to-r from-violet-400 to-violet-600' },
    { label: 'Lessons Captured', value: lessonsCaptured, hint: 'across 6 categories', icon: BookOpenCheck, tile: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700', bar: 'bg-gradient-to-r from-sky-400 to-sky-600' },
    { label: 'Avg Closeout Days', value: `${avgCloseoutDays}d`, hint: 'from practical completion', icon: Clock, tile: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700', bar: 'bg-gradient-to-r from-rose-400 to-rose-600' },
  ]

  const filteredLessons = useMemo(() => {
    const query = lessonQuery.trim().toLowerCase()
    return LESSONS.filter(l => {
      if (lessonCategory !== 'all' && l.category !== lessonCategory) return false
      if (query) {
        const hay = `${l.id} ${l.project} ${l.title} ${l.description} ${l.submittedBy}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
  }, [lessonQuery, lessonCategory])

  const lessonsByCategory: any[] = useMemo(() => {
    const cats: LessonCategory[] = ['Technical', 'Procurement', 'Schedule', 'Quality', 'Safety', 'Contract']
    return cats.map(c => ({
      name: c,
      value: LESSONS.filter(l => l.category === c).length,
      fill: CATEGORY_COLOR[c],
    })).filter(x => x.value > 0)
  }, [])

  // Retention summary
  const totalRetentionHeld = RETENTION_RECORDS
    .filter(r => r.status === 'Held')
    .reduce((sum, r) => sum + r.retentionAmount, 0)
  const totalRetentionReleased = RETENTION_RECORDS
    .filter(r => r.status === 'Released')
    .reduce((sum, r) => sum + r.retentionAmount, 0)
  const activeWarranties = RETENTION_RECORDS.filter(r => r.bondStatus === 'Active').length

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <BookOpenCheck className="h-5 w-5 text-emerald-700" />
              Project Closeout &amp; Lessons Learned
            </h2>
            <p className="text-sm text-muted-foreground">
              Track closeout checklists, capture lessons learned, and manage retention and warranties.
            </p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map(k => <KpiCard key={k.label} kpi={k} />)}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-flow-col">
            <TabsTrigger value="checklist"><CheckCircle2 className="mr-2 h-4 w-4" /> Closeout Checklist</TabsTrigger>
            <TabsTrigger value="lessons"><BookOpenCheck className="mr-2 h-4 w-4" /> Lessons Learned</TabsTrigger>
            <TabsTrigger value="retention"><ShieldCheck className="mr-2 h-4 w-4" /> Retention &amp; Warranties</TabsTrigger>
          </TabsList>

          {/* Closeout Checklist */}
          <TabsContent value="checklist" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-2">
              {CLOSEOUT_PROJECTS.map(p => {
                const doneCount = p.items.filter(i => i.state === 'Done').length
                const naCount = p.items.filter(i => i.state === 'N/A').length
                const totalCount = p.items.length
                const effectiveTotal = totalCount - naCount
                const pct = effectiveTotal > 0 ? Math.round((doneCount / effectiveTotal) * 100) : 0
                return (
                  <Card key={p.code}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-sm">{p.name}</CardTitle>
                          <CardDescription className="text-xs">
                            <span className="font-mono">{p.code}</span> · PM: {p.manager} · Target: {fmtDate(p.targetDate)}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px]',
                            pct === 100
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
                              : pct >= 75
                                ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
                                : 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
                          )}
                        >
                          {pct}% complete
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={pct} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{doneCount}/{effectiveTotal}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-[320px] overflow-auto scroll-thin space-y-1 pr-1">
                        {p.items.map(item => {
                          const meta = ITEM_STATE_META[item.state]
                          const Icon = meta.icon
                          return (
                            <div
                              key={item.name}
                              className="flex items-start gap-2.5 rounded-md border px-2.5 py-1.5"
                            >
                              <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', meta.color)} />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium leading-tight">{item.name}</div>
                                {item.note && (
                                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.note}</div>
                                )}
                              </div>
                              <Badge variant="outline" className={cn('text-[9px] shrink-0',
                                item.state === 'Done' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
                                : item.state === 'Pending' ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
                                : 'text-muted-foreground bg-muted border-border',
                              )}>{item.state}</Badge>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Lessons Learned */}
          <TabsContent value="lessons" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle className="text-sm">Lessons Learned Register</CardTitle>
                      <CardDescription className="text-xs">{filteredLessons.length} of {lessonsCaptured} lessons shown</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={lessonQuery}
                          onChange={e => setLessonQuery(e.target.value)}
                          placeholder="Search lessons…"
                          className="h-9 w-full pl-8 sm:w-56"
                        />
                      </div>
                      <Select value={lessonCategory} onValueChange={setLessonCategory}>
                        <SelectTrigger className="h-9 w-full sm:w-44">
                          <Filter className="mr-2 h-3.5 w-3.5" />
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Procurement">Procurement</SelectItem>
                          <SelectItem value="Schedule">Schedule</SelectItem>
                          <SelectItem value="Quality">Quality</SelectItem>
                          <SelectItem value="Safety">Safety</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[560px] overflow-auto scroll-thin p-3 grid gap-2 sm:grid-cols-2">
                    {filteredLessons.length === 0 ? (
                      <div className="sm:col-span-2 py-10 text-center text-sm text-muted-foreground">
                        No lessons match the current filters.
                      </div>
                    ) : filteredLessons.map(l => (
                      <div key={l.id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">{l.id}</span>
                          <Badge variant="outline" className={cn('text-[9px]', CATEGORY_BADGE[l.category])}>{l.category}</Badge>
                        </div>
                        <div className="text-sm font-semibold leading-tight">{l.title}</div>
                        <div className="text-[11px] text-muted-foreground leading-relaxed">{l.description}</div>
                        <Separator />
                        <div className="text-[11px]">
                          <span className="font-medium text-foreground/80">Action taken: </span>
                          <span className="text-muted-foreground">{l.action}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                          <span>{l.submittedBy} · {fmtDate(l.date)} · <span className="font-mono">{l.project}</span></span>
                          <span className="inline-flex items-center gap-1 text-amber-700"><ThumbsUp className="h-3 w-3" />{l.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:max-h-[640px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lessons by Category</CardTitle>
                  <CardDescription className="text-xs">Distribution across {lessonsCaptured} captured lessons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lessonsByCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {lessonsByCategory.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid oklch(0.85 0.01 250)' }}
                          formatter={(v: any, n: any) => [`${v} lessons`, n]}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1.5">
                    {lessonsByCategory.map(c => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                          {c.name}
                        </span>
                        <span className="font-bold tabular-nums">{c.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Retention & Warranties */}
          <TabsContent value="retention" className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4 text-violet-600" /><span className="text-[11px] uppercase">Retention Held</span></div>
                <div className="mt-1 text-2xl font-bold">{fmtMoney(totalRetentionHeld)}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">across active projects</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-700" /><span className="text-[11px] uppercase">Retention Released</span></div>
                <div className="mt-1 text-2xl font-bold text-emerald-700">{fmtMoney(totalRetentionReleased)}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">closed projects</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4 text-sky-700" /><span className="text-[11px] uppercase">Active Warranties</span></div>
                <div className="mt-1 text-2xl font-bold text-sky-700">{activeWarranties}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">bonds currently active</div>
              </CardContent></Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Retention &amp; Warranty Register</CardTitle>
                    <CardDescription className="text-xs">{RETENTION_RECORDS.length} records across {projectsInCloseout} projects</CardDescription>
                  </div>
                  <Button size="sm" variant="outline"><FileText className="mr-1.5 h-3.5 w-3.5" />Export Register</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="w-24">Project</TableHead>
                        <TableHead className="w-24">Retention %</TableHead>
                        <TableHead className="w-32">Retention Amount</TableHead>
                        <TableHead className="w-28">Release Date</TableHead>
                        <TableHead className="w-32">Status</TableHead>
                        <TableHead className="w-28">Warranty Period</TableHead>
                        <TableHead className="w-28">Warranty Until</TableHead>
                        <TableHead className="w-28">Bond Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RETENTION_RECORDS.map((r, i) => (
                        <TableRow key={`${r.project}-${i}`} className="hover:bg-muted/40">
                          <TableCell className="font-mono text-xs">{r.project}</TableCell>
                          <TableCell className="text-xs tabular-nums">{r.retentionPct}%</TableCell>
                          <TableCell className="text-xs tabular-nums font-medium">{fmtMoney(r.retentionAmount, false)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{fmtDate(r.releaseDate)}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[10px]', RETENTION_STATUS_BADGE[r.status])}>{r.status}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.warrantyPeriod}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{fmtDate(r.warrantyUntil)}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[10px]', BOND_STATUS_BADGE[r.bondStatus])}>{r.bondStatus}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}
