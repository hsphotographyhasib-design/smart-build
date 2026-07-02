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
import { Separator } from '@/components/ui/separator'
import {
  FileSignature, CheckCircle2, XCircle, Clock, ArrowRight, Mail,
  Search, Filter, Send, AlertTriangle, FileText,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { fmtDate, type View } from '@/lib/eppm'
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

type SubmittalType =
  | 'Shop Drawing'
  | 'Material Sample'
  | 'Technical Proposal'
  | 'Method Statement'
  | 'Mock-up'

type SubmittalStatus =
  | 'Draft'
  | 'Submitted'
  | 'In Review'
  | 'Approved'
  | 'Approved as Noted'
  | 'Revise & Resubmit'
  | 'Rejected'

type Discipline =
  | 'Architectural'
  | 'Structural'
  | 'Mechanical'
  | 'Electrical'
  | 'Plumbing'
  | 'Civil'

interface Submittal {
  no: string
  title: string
  project: string
  type: SubmittalType
  discipline: Discipline
  status: SubmittalStatus
  submittedDate: string | null
  dueDate: string
  reviewer: string
  overdue?: boolean
}

const SUBMITTALS: Submittal[] = [
  { no: 'SUB-001', title: 'Curtain Wall Shop Drawings – Tower A', project: 'PRJ-001', type: 'Shop Drawing', discipline: 'Architectural', status: 'Approved', submittedDate: '2025-01-08', dueDate: '2025-01-22', reviewer: 'S. Patel' },
  { no: 'SUB-002', title: 'HVAC Chiller Selection – Trane', project: 'PRJ-003', type: 'Technical Proposal', discipline: 'Mechanical', status: 'In Review', submittedDate: '2025-01-15', dueDate: '2025-01-29', reviewer: 'M. Chen' },
  { no: 'SUB-003', title: 'Switchgear Shop Drawings', project: 'PRJ-002', type: 'Shop Drawing', discipline: 'Electrical', status: 'Approved as Noted', submittedDate: '2025-01-10', dueDate: '2025-01-24', reviewer: 'K. Ali' },
  { no: 'SUB-004', title: 'Ceramic Tile Samples – Lobby', project: 'PRJ-004', type: 'Material Sample', discipline: 'Architectural', status: 'Revise & Resubmit', submittedDate: '2025-01-12', dueDate: '2025-01-26', reviewer: 'L. Rossi' },
  { no: 'SUB-005', title: 'Structural Steel Connection Details', project: 'PRJ-002', type: 'Shop Drawing', discipline: 'Structural', status: 'In Review', submittedDate: '2025-01-18', dueDate: '2025-01-25', reviewer: 'R. Khan', overdue: true },
  { no: 'SUB-006', title: 'Lift Installation Method Statement', project: 'PRJ-004', type: 'Method Statement', discipline: 'Mechanical', status: 'Submitted', submittedDate: '2025-01-22', dueDate: '2025-02-05', reviewer: 'J. Müller' },
  { no: 'SUB-007', title: 'Bathroom Mock-up – Level 12', project: 'PRJ-001', type: 'Mock-up', discipline: 'Architectural', status: 'Approved', submittedDate: '2025-01-05', dueDate: '2025-01-19', reviewer: 'S. Patel' },
  { no: 'SUB-008', title: 'Domestic Water Piping Layout', project: 'PRJ-002', type: 'Shop Drawing', discipline: 'Plumbing', status: 'Rejected', submittedDate: '2025-01-14', dueDate: '2025-01-28', reviewer: 'J. Müller' },
  { no: 'SUB-009', title: 'Façade Stone Sample – Beige Limestone', project: 'PRJ-001', type: 'Material Sample', discipline: 'Architectural', status: 'Approved', submittedDate: '2025-01-09', dueDate: '2025-01-23', reviewer: 'S. Patel' },
  { no: 'SUB-010', title: 'Fire Pump Set Technical Proposal', project: 'PRJ-003', type: 'Technical Proposal', discipline: 'Mechanical', status: 'In Review', submittedDate: '2025-01-19', dueDate: '2025-02-02', reviewer: 'L. Rossi' },
  { no: 'SUB-011', title: 'Earthing & Lightning Protection', project: 'PRJ-002', type: 'Shop Drawing', discipline: 'Electrical', status: 'Approved as Noted', submittedDate: '2025-01-11', dueDate: '2025-01-25', reviewer: 'K. Ali' },
  { no: 'SUB-012', title: 'Conc. Pour Sequence – Core Wall', project: 'PRJ-001', type: 'Method Statement', discipline: 'Civil', status: 'Approved', submittedDate: '2025-01-06', dueDate: '2025-01-20', reviewer: 'R. Khan' },
  { no: 'SUB-013', title: 'BMS Architecture Proposal', project: 'PRJ-003', type: 'Technical Proposal', discipline: 'Electrical', status: 'Draft', submittedDate: null, dueDate: '2025-02-08', reviewer: 'A. Vega' },
  { no: 'SUB-014', title: 'Reception Desk Mock-up', project: 'PRJ-004', type: 'Mock-up', discipline: 'Architectural', status: 'Revise & Resubmit', submittedDate: '2025-01-13', dueDate: '2025-01-27', reviewer: 'J. Müller' },
  { no: 'SUB-015', title: 'Stormwater Drainage Shop Drawing', project: 'PRJ-002', type: 'Shop Drawing', discipline: 'Plumbing', status: 'In Review', submittedDate: '2025-01-20', dueDate: '2025-01-27', reviewer: 'J. Müller', overdue: true },
  { no: 'SUB-016', title: 'Paint Colour Samples – Interior', project: 'PRJ-001', type: 'Material Sample', discipline: 'Architectural', status: 'Submitted', submittedDate: '2025-01-23', dueDate: '2025-02-06', reviewer: 'S. Patel' },
]

const STATUS_BADGE: Record<SubmittalStatus, string> = {
  Draft: 'text-muted-foreground bg-muted border-border',
  Submitted: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  'In Review': 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Approved: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  'Approved as Noted': 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  'Revise & Resubmit': 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Rejected: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
}

const TYPE_BADGE: Record<SubmittalType, string> = {
  'Shop Drawing': 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  'Material Sample': 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  'Technical Proposal': 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900',
  'Method Statement': 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  'Mock-up': 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-900/50 dark:border-slate-800',
}

interface ApprovalStage {
  stage: string
  reviewer: string
  date: string | null
  decision: 'Pending' | 'Approved' | 'Approved as Noted' | 'Revise & Resubmit' | 'Rejected' | 'Completed'
  comments: string
}

interface SubmittalChain {
  no: string
  title: string
  project: string
  type: SubmittalType
  status: SubmittalStatus
  currentStage: number
  stages: ApprovalStage[]
  cycleDays: { stage: string; days: number }[]
}

const CHAINS: SubmittalChain[] = [
  {
    no: 'SUB-001', title: 'Curtain Wall Shop Drawings – Tower A', project: 'PRJ-001', type: 'Shop Drawing',
    status: 'Approved', currentStage: 5,
    stages: [
      { stage: 'Prepared', reviewer: 'S. Patel', date: '2025-01-06', decision: 'Completed', comments: 'Drawings compiled per RIBA Stage 4 issue.' },
      { stage: 'Submitted', reviewer: 'A. Novak', date: '2025-01-08', decision: 'Completed', comments: 'Transmitted to lead consultant via CDE.' },
      { stage: 'Consultant Review', reviewer: 'D. Foster (Architect)', date: '2025-01-18', decision: 'Approved as Noted', comments: '8 minor annotation comments on glazing joints.' },
      { stage: 'Client Review', reviewer: 'T. Hayes (Client)', date: '2025-01-21', decision: 'Approved', comments: 'No further comments; release for fabrication.' },
      { stage: 'Approved', reviewer: 'System', date: '2025-01-22', decision: 'Approved', comments: 'Status closed — Approved for Construction.' },
    ],
    cycleDays: [
      { stage: 'Prepared', days: 2 },
      { stage: 'Submitted', days: 2 },
      { stage: 'Consultant', days: 10 },
      { stage: 'Client', days: 3 },
      { stage: 'Closed', days: 1 },
    ],
  },
  {
    no: 'SUB-002', title: 'HVAC Chiller Selection – Trane', project: 'PRJ-003', type: 'Technical Proposal',
    status: 'In Review', currentStage: 2,
    stages: [
      { stage: 'Prepared', reviewer: 'M. Chen', date: '2025-01-12', decision: 'Completed', comments: 'Three options evaluated; Trane RTHD recommended.' },
      { stage: 'Submitted', reviewer: 'A. Novak', date: '2025-01-15', decision: 'Completed', comments: 'Submitted with TCO analysis附件.' },
      { stage: 'Consultant Review', reviewer: 'P. Nair (MEP)', date: null, decision: 'Pending', comments: 'Awaiting MEP consultant sign-off; query raised on part-load efficiency.' },
      { stage: 'Client Review', reviewer: 'T. Hayes (Client)', date: null, decision: 'Pending', comments: '' },
      { stage: 'Approved', reviewer: 'System', date: null, decision: 'Pending', comments: '' },
    ],
    cycleDays: [
      { stage: 'Prepared', days: 3 },
      { stage: 'Submitted', days: 1 },
      { stage: 'Consultant', days: 8 },
      { stage: 'Client', days: 0 },
      { stage: 'Closed', days: 0 },
    ],
  },
  {
    no: 'SUB-004', title: 'Ceramic Tile Samples – Lobby', project: 'PRJ-004', type: 'Material Sample',
    status: 'Revise & Resubmit', currentStage: 4,
    stages: [
      { stage: 'Prepared', reviewer: 'L. Rossi', date: '2025-01-09', decision: 'Completed', comments: 'Three tile sizes sampled with finish swatches.' },
      { stage: 'Submitted', reviewer: 'A. Novak', date: '2025-01-12', decision: 'Completed', comments: 'Physical samples dispatched to client.' },
      { stage: 'Consultant Review', reviewer: 'D. Foster (Architect)', date: '2025-01-17', decision: 'Revise & Resubmit', comments: 'Gloss finish rejected; matte finish required for slip resistance.' },
      { stage: 'Client Review', reviewer: 'T. Hayes (Client)', date: '2025-01-19', decision: 'Revise & Resubmit', comments: 'Confirmed consultant comment; resubmit by 02-Feb.' },
      { stage: 'Approved', reviewer: 'System', date: null, decision: 'Pending', comments: '' },
    ],
    cycleDays: [
      { stage: 'Prepared', days: 3 },
      { stage: 'Submitted', days: 1 },
      { stage: 'Consultant', days: 5 },
      { stage: 'Client', days: 2 },
      { stage: 'Closed', days: 0 },
    ],
  },
  {
    no: 'SUB-008', title: 'Domestic Water Piping Layout', project: 'PRJ-002', type: 'Shop Drawing',
    status: 'Rejected', currentStage: 4,
    stages: [
      { stage: 'Prepared', reviewer: 'J. Müller', date: '2025-01-10', decision: 'Completed', comments: 'Layout issued per plumbing design intent.' },
      { stage: 'Submitted', reviewer: 'A. Novak', date: '2025-01-14', decision: 'Completed', comments: 'Submitted to plumbing consultant.' },
      { stage: 'Consultant Review', reviewer: 'P. Nair (MEP)', date: '2025-01-21', decision: 'Rejected', comments: 'Riser routing conflicts with structural beam at L7; full re-routing required.' },
      { stage: 'Client Review', reviewer: 'T. Hayes (Client)', date: '2025-01-23', decision: 'Rejected', comments: 'Endorsed consultant rejection.' },
      { stage: 'Approved', reviewer: 'System', date: null, decision: 'Pending', comments: 'New submission required.' },
    ],
    cycleDays: [
      { stage: 'Prepared', days: 4 },
      { stage: 'Submitted', days: 1 },
      { stage: 'Consultant', days: 7 },
      { stage: 'Client', days: 2 },
      { stage: 'Closed', days: 0 },
    ],
  },
]

type TransmittalStatus = 'Sent' | 'Acknowledged' | 'Returned'

interface Transmittal {
  no: string
  date: string
  from: string
  to: string
  subject: string
  docs: number
  status: TransmittalStatus
  ackDate: string | null
}

const TRANSMITTALS: Transmittal[] = [
  { no: 'TRN-2025-031', date: '2025-01-22', from: 'A. Novak', to: 'D. Foster (Architect)', subject: 'Curtain Wall Rev C drawings', docs: 12, status: 'Acknowledged', ackDate: '2025-01-23' },
  { no: 'TRN-2025-030', date: '2025-01-21', from: 'M. Chen', to: 'P. Nair (MEP)', subject: 'HVAC chiller technical proposal', docs: 4, status: 'Sent', ackDate: null },
  { no: 'TRN-2025-029', date: '2025-01-20', from: 'K. Ali', to: 'P. Nair (MEP)', subject: 'Switchgear shop drawings Rev B', docs: 8, status: 'Acknowledged', ackDate: '2025-01-22' },
  { no: 'TRN-2025-028', date: '2025-01-19', from: 'L. Rossi', to: 'T. Hayes (Client)', subject: 'Tile samples – physical dispatch', docs: 3, status: 'Returned', ackDate: '2025-01-22' },
  { no: 'TRN-2025-027', date: '2025-01-18', from: 'R. Khan', to: 'D. Foster (Architect)', subject: 'Concrete pour sequence Tower B', docs: 2, status: 'Acknowledged', ackDate: '2025-01-19' },
  { no: 'TRN-2025-026', date: '2025-01-17', from: 'S. Patel', to: 'D. Foster (Architect)', subject: 'Reception mock-up photos', docs: 6, status: 'Acknowledged', ackDate: '2025-01-18' },
  { no: 'TRN-2025-025', date: '2025-01-16', from: 'J. Müller', to: 'P. Nair (MEP)', subject: 'Stormwater drainage layout', docs: 5, status: 'Sent', ackDate: null },
  { no: 'TRN-2025-024', date: '2025-01-15', from: 'A. Novak', to: 'T. Hayes (Client)', subject: 'Monthly submittal register', docs: 1, status: 'Acknowledged', ackDate: '2025-01-16' },
  { no: 'TRN-2025-023', date: '2025-01-14', from: 'K. Ali', to: 'P. Nair (MEP)', subject: 'Earthing & lightning protection', docs: 7, status: 'Returned', ackDate: '2025-01-18' },
  { no: 'TRN-2025-022', date: '2025-01-12', from: 'L. Rossi', to: 'D. Foster (Architect)', subject: 'Façade stone sample dispatch', docs: 4, status: 'Acknowledged', ackDate: '2025-01-13' },
]

const TRANS_STATUS_BADGE: Record<TransmittalStatus, string> = {
  Sent: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Acknowledged: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  Returned: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
}

const STAGE_DECISION_BADGE: Record<ApprovalStage['decision'], string> = {
  Pending: 'text-muted-foreground bg-muted border-border',
  Completed: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Approved: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  'Approved as Noted': 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  'Revise & Resubmit': 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Rejected: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
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

export function SubmittalsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate

  // Register filters
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Approval Chain selection
  const [selectedChain, setSelectedChain] = useState(0)

  // Derived KPI values
  const totalSubmittals = SUBMITTALS.length
  const pendingReview = SUBMITTALS.filter(s => s.status === 'Submitted' || s.status === 'In Review').length
  const approved = SUBMITTALS.filter(s => s.status === 'Approved' || s.status === 'Approved as Noted').length
  const rejectedRevise = SUBMITTALS.filter(s => s.status === 'Rejected' || s.status === 'Revise & Resubmit').length
  const overdueCount = SUBMITTALS.filter(s => s.overdue).length
  const avgReviewDays = 6.4

  const kpis: KpiDef[] = [
    { label: 'Total Submittals', value: totalSubmittals, hint: 'across 4 projects', icon: FileSignature, tile: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300', bar: 'bg-gradient-to-r from-slate-400 to-slate-500' },
    { label: 'Pending Review', value: pendingReview, hint: 'submitted / in review', icon: Clock, tile: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600', bar: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    { label: 'Approved', value: approved, hint: 'incl. approved as noted', icon: CheckCircle2, tile: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
    { label: 'Rejected / Revise', value: rejectedRevise, hint: 'requires resubmission', icon: XCircle, tile: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600', bar: 'bg-gradient-to-r from-rose-400 to-rose-600' },
    { label: 'Overdue', value: overdueCount, hint: 'review SLA exceeded', icon: AlertTriangle, tile: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600', bar: 'bg-gradient-to-r from-rose-400 to-amber-500' },
    { label: 'Avg Review Days', value: `${avgReviewDays}d`, hint: 'rolling 90-day mean', icon: Mail, tile: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600', bar: 'bg-gradient-to-r from-violet-400 to-violet-600' },
  ]

  const filteredSubmittals = useMemo(() => {
    const query = q.trim().toLowerCase()
    return SUBMITTALS.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (query) {
        const hay = `${s.no} ${s.title} ${s.project} ${s.discipline} ${s.reviewer}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
  }, [q, statusFilter, typeFilter])

  const chain = CHAINS[selectedChain]

  // Transmittal summary
  const totalDocsTransmitted = TRANSMITTALS.reduce((sum, t) => sum + t.docs, 0)
  const acknowledgedCount = TRANSMITTALS.filter(t => t.status === 'Acknowledged').length
  const returnedCount = TRANSMITTALS.filter(t => t.status === 'Returned').length

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <FileSignature className="h-5 w-5 text-violet-600" />
              Submittals &amp; Approvals
            </h2>
            <p className="text-sm text-muted-foreground">
              Track formal submittals through multi-stage approval chains and transmittals.
            </p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map(k => <KpiCard key={k.label} kpi={k} />)}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-flow-col">
            <TabsTrigger value="register"><FileText className="mr-2 h-4 w-4" /> Submittal Register</TabsTrigger>
            <TabsTrigger value="chain"><ArrowRight className="mr-2 h-4 w-4" /> Approval Chain</TabsTrigger>
            <TabsTrigger value="transmittals"><Mail className="mr-2 h-4 w-4" /> Transmittals</TabsTrigger>
          </TabsList>

          {/* Submittal Register */}
          <TabsContent value="register" className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-base">Submittal Register</CardTitle>
                    <CardDescription>{filteredSubmittals.length} of {totalSubmittals} submittals shown</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search submittals…"
                        className="h-9 w-full pl-8 sm:w-56"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-9 w-full sm:w-44">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Approved as Noted">Approved as Noted</SelectItem>
                        <SelectItem value="Revise & Resubmit">Revise &amp; Resubmit</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-9 w-full sm:w-44">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="Shop Drawing">Shop Drawing</SelectItem>
                        <SelectItem value="Material Sample">Material Sample</SelectItem>
                        <SelectItem value="Technical Proposal">Technical Proposal</SelectItem>
                        <SelectItem value="Method Statement">Method Statement</SelectItem>
                        <SelectItem value="Mock-up">Mock-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="w-24">Submittal No</TableHead>
                        <TableHead className="min-w-[240px]">Title</TableHead>
                        <TableHead className="w-24">Project</TableHead>
                        <TableHead className="w-32">Type</TableHead>
                        <TableHead className="w-28">Discipline</TableHead>
                        <TableHead className="w-32">Status</TableHead>
                        <TableHead className="w-28">Submitted</TableHead>
                        <TableHead className="w-28">Due Date</TableHead>
                        <TableHead className="w-32">Current Reviewer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmittals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                            No submittals match the current filters.
                          </TableCell>
                        </TableRow>
                      ) : filteredSubmittals.map(s => {
                        const isRejected = s.status === 'Rejected' || s.status === 'Revise & Resubmit'
                        const isApproved = s.status === 'Approved' || s.status === 'Approved as Noted'
                        return (
                          <TableRow
                            key={s.no}
                            className={cn(
                              'hover:bg-muted/40',
                              isRejected && 'bg-rose-50/60 dark:bg-rose-950/20',
                              isApproved && 'bg-emerald-50/40 dark:bg-emerald-950/15',
                            )}
                          >
                            <TableCell className="font-mono text-xs">{s.no}</TableCell>
                            <TableCell className="font-medium text-sm">{s.title}</TableCell>
                            <TableCell className="font-mono text-xs">{s.project}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('whitespace-nowrap text-[10px]', TYPE_BADGE[s.type])}>{s.type}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{s.discipline}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('whitespace-nowrap text-[10px]', STATUS_BADGE[s.status])}>{s.status}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{fmtDate(s.submittedDate)}</TableCell>
                            <TableCell className={cn('text-xs', s.overdue ? 'text-rose-600 font-semibold' : 'text-muted-foreground')}>
                              {fmtDate(s.dueDate)}
                              {s.overdue && <span className="ml-1 text-[9px] uppercase">overdue</span>}
                            </TableCell>
                            <TableCell className="text-xs">{s.reviewer}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approval Chain */}
          <TabsContent value="chain" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
              {/* Submittal selector */}
              <Card className="lg:max-h-[640px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Select Submittal</CardTitle>
                  <CardDescription className="text-xs">{CHAINS.length} submittals with active chains</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[560px] overflow-auto scroll-thin px-3 pb-3 space-y-2">
                    {CHAINS.map((c, i) => {
                      const active = i === selectedChain
                      return (
                        <button
                          key={c.no}
                          onClick={() => setSelectedChain(i)}
                          className={cn(
                            'w-full text-left rounded-lg border p-3 transition-colors',
                            active
                              ? 'border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/40'
                              : 'border-border bg-card hover:bg-muted/40',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground">{c.no}</span>
                            <Badge variant="outline" className={cn('text-[9px]', STATUS_BADGE[c.status])}>{c.status}</Badge>
                          </div>
                          <div className="mt-1 text-xs font-medium leading-tight line-clamp-2">{c.title}</div>
                          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-mono">{c.project}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <span>{c.type}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-[10px]">
                            {c.stages.map((st, idx) => {
                              const done = idx < c.currentStage
                              const isCurrent = idx === c.currentStage && st.decision === 'Pending'
                              return (
                                <div
                                  key={st.stage}
                                  className={cn(
                                    'h-1.5 flex-1 rounded-full',
                                    done ? 'bg-emerald-400' : isCurrent ? 'bg-amber-400' : 'bg-muted',
                                  )}
                                />
                              )
                            })}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Chain detail */}
              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-sm">{chain.title}</CardTitle>
                        <CardDescription className="text-xs">
                          <span className="font-mono">{chain.no}</span> · {chain.project} · {chain.type}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px]', STATUS_BADGE[chain.status])}>{chain.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-6">
                      {/* Vertical line */}
                      <div className="absolute left-[10px] top-1 bottom-1 w-px bg-border" />
                      <div className="space-y-4">
                        {chain.stages.map((st, idx) => {
                          const done = idx < chain.currentStage
                          const isCurrent = idx === chain.currentStage && st.decision === 'Pending'
                          const isFuture = idx > chain.currentStage
                          return (
                            <div key={st.stage} className="relative">
                              <div
                                className={cn(
                                  'absolute -left-6 top-0 grid h-5 w-5 place-items-center rounded-full border-2 bg-card',
                                  done && 'border-emerald-500 bg-emerald-500 text-white',
                                  isCurrent && 'border-amber-500 bg-amber-500 text-white',
                                  isFuture && 'border-border bg-card text-muted-foreground',
                                )}
                              >
                                {done ? <CheckCircle2 className="h-3 w-3" /> : isCurrent ? <Clock className="h-2.5 w-2.5" /> : null}
                              </div>
                              <div className="rounded-lg border p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="text-sm font-semibold">{st.stage}</div>
                                  <Badge variant="outline" className={cn('text-[9px]', STAGE_DECISION_BADGE[st.decision])}>{st.decision}</Badge>
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                  <span><span className="text-foreground/70">Reviewer:</span> {st.reviewer}</span>
                                  <span><span className="text-foreground/70">Date:</span> {st.date ? fmtDate(st.date) : '—'}</span>
                                </div>
                                {st.comments && (
                                  <div className="mt-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
                                    “{st.comments}”
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cycle Time by Stage</CardTitle>
                    <CardDescription className="text-xs">Average days spent at each approval stage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chain.cycleDays} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.005 250)" />
                          <XAxis dataKey="stage" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'oklch(0.85 0.01 250)' }} />
                          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip
                            cursor={{ fill: 'oklch(0.96 0.01 250)' }}
                            contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid oklch(0.85 0.01 250)' }}
                            formatter={(v: any) => [`${v} days`, 'Cycle time']}
                          />
                          <Bar dataKey="days" radius={[4, 4, 0, 0]} fill={CHART.violet} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Transmittals */}
          <TabsContent value="transmittals" className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span className="text-[11px] uppercase">Transmittals</span></div>
                <div className="mt-1 text-2xl font-bold">{TRANSMITTALS.length}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /><span className="text-[11px] uppercase">Docs Transmitted</span></div>
                <div className="mt-1 text-2xl font-bold">{totalDocsTransmitted}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="text-[11px] uppercase">Acknowledged</span></div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">{acknowledgedCount}</div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground"><XCircle className="h-4 w-4 text-rose-600" /><span className="text-[11px] uppercase">Returned</span></div>
                <div className="mt-1 text-2xl font-bold text-rose-600">{returnedCount}</div>
              </CardContent></Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Transmittal Register</CardTitle>
                    <CardDescription className="text-xs">{TRANSMITTALS.length} transmittals issued</CardDescription>
                  </div>
                  <Button size="sm" variant="outline"><Send className="mr-1.5 h-3.5 w-3.5" />New Transmittal</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="w-32">Transmittal No</TableHead>
                        <TableHead className="w-28">Date</TableHead>
                        <TableHead className="w-32">From</TableHead>
                        <TableHead className="w-44">To</TableHead>
                        <TableHead className="min-w-[240px]">Subject</TableHead>
                        <TableHead className="w-24">Docs</TableHead>
                        <TableHead className="w-28">Status</TableHead>
                        <TableHead className="w-28">Acknowledged</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {TRANSMITTALS.map(t => (
                        <TableRow key={t.no} className="hover:bg-muted/40">
                          <TableCell className="font-mono text-xs">{t.no}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{fmtDate(t.date)}</TableCell>
                          <TableCell className="text-xs">{t.from}</TableCell>
                          <TableCell className="text-xs">{t.to}</TableCell>
                          <TableCell className="text-sm font-medium">{t.subject}</TableCell>
                          <TableCell className="text-xs tabular-nums">{t.docs}</TableCell>
                          <TableCell><Badge variant="outline" className={cn('text-[10px]', TRANS_STATUS_BADGE[t.status])}>{t.status}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{fmtDate(t.ackDate)}</TableCell>
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
