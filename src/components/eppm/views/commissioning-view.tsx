'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  ClipboardCheck, FlaskConical, Award, FileCheck, Boxes, CheckCircle2, XCircle,
  Clock, Search, Filter, AlertTriangle, Wrench, Calendar, User, ShieldCheck,
} from 'lucide-react'
import { fmtDate, fmtMoney, fmtPct, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { FadeIn } from '../motion'
import { useDashboardData } from '@/components/eppm/use-data'

const CHART = {
  emerald: 'oklch(0.55 0.12 162)',
  amber: 'oklch(0.7 0.16 80)',
  rose: 'oklch(0.6 0.2 25)',
  sky: 'oklch(0.62 0.1 195)',
  violet: 'oklch(0.65 0.18 305)',
  slate: 'oklch(0.55 0.02 250)',
}

type SystemStatus = 'Pre-Commissioning' | 'Testing' | 'Passed' | 'Failed' | 'Handed Over'
type Discipline = 'Electrical' | 'Mechanical' | 'HVAC' | 'Plumbing' | 'Fire' | 'ELV'

interface ComSystem {
  id: string
  name: string
  project: string
  discipline: Discipline
  status: SystemStatus
  testDate: string | null
  testPct: number
  witnessedBy: string
}

const SYSTEMS: ComSystem[] = [
  { id: 'SYS-COM-001', name: 'MV Switchgear', project: 'PRJ-001', discipline: 'Electrical', status: 'Passed', testDate: '2025-01-22', testPct: 100, witnessedBy: 'K. Ali' },
  { id: 'SYS-COM-002', name: 'LV Distribution', project: 'PRJ-001', discipline: 'Electrical', status: 'Passed', testDate: '2025-01-20', testPct: 100, witnessedBy: 'K. Ali' },
  { id: 'SYS-COM-003', name: 'HV Cabling', project: 'PRJ-002', discipline: 'Electrical', status: 'Testing', testDate: '2025-01-23', testPct: 65, witnessedBy: 'R. Khan' },
  { id: 'SYS-COM-004', name: 'Chilled Water Pumps', project: 'PRJ-003', discipline: 'Mechanical', status: 'Passed', testDate: '2025-01-19', testPct: 100, witnessedBy: 'S. Patel' },
  { id: 'SYS-COM-005', name: 'AHU-01 Air Handling', project: 'PRJ-003', discipline: 'HVAC', status: 'Passed', testDate: '2025-01-18', testPct: 100, witnessedBy: 'M. Chen' },
  { id: 'SYS-COM-006', name: 'AHU-02 Air Handling', project: 'PRJ-003', discipline: 'HVAC', status: 'Failed', testDate: '2025-01-17', testPct: 45, witnessedBy: 'M. Chen' },
  { id: 'SYS-COM-007', name: 'FCU Network', project: 'PRJ-003', discipline: 'HVAC', status: 'Testing', testDate: '2025-01-22', testPct: 70, witnessedBy: 'M. Chen' },
  { id: 'SYS-COM-008', name: 'Domestic Water Riser', project: 'PRJ-002', discipline: 'Plumbing', status: 'Pre-Commissioning', testDate: null, testPct: 10, witnessedBy: 'J. Müller' },
  { id: 'SYS-COM-009', name: 'Drainage System', project: 'PRJ-002', discipline: 'Plumbing', status: 'Testing', testDate: '2025-01-21', testPct: 55, witnessedBy: 'J. Müller' },
  { id: 'SYS-COM-010', name: 'Sprinkler Network', project: 'PRJ-001', discipline: 'Fire', status: 'Passed', testDate: '2025-01-15', testPct: 100, witnessedBy: 'L. Rossi' },
  { id: 'SYS-COM-011', name: 'Fire Alarm Panel', project: 'PRJ-001', discipline: 'Fire', status: 'Testing', testDate: '2025-01-24', testPct: 80, witnessedBy: 'L. Rossi' },
  { id: 'SYS-COM-012', name: 'Smoke Extraction', project: 'PRJ-002', discipline: 'Fire', status: 'Pre-Commissioning', testDate: null, testPct: 5, witnessedBy: 'L. Rossi' },
  { id: 'SYS-COM-013', name: 'CCTV System', project: 'PRJ-004', discipline: 'ELV', status: 'Passed', testDate: '2025-01-14', testPct: 100, witnessedBy: 'A. Vega' },
  { id: 'SYS-COM-014', name: 'Access Control', project: 'PRJ-004', discipline: 'ELV', status: 'Handed Over', testDate: '2025-01-10', testPct: 100, witnessedBy: 'A. Vega' },
  { id: 'SYS-COM-015', name: 'BMS Integration', project: 'PRJ-003', discipline: 'ELV', status: 'Testing', testDate: '2025-01-23', testPct: 60, witnessedBy: 'A. Vega' },
  { id: 'SYS-COM-016', name: 'Public Address', project: 'PRJ-004', discipline: 'ELV', status: 'Passed', testDate: '2025-01-13', testPct: 100, witnessedBy: 'A. Vega' },
]

type TestType = 'Pre-Functional' | 'Functional' | 'Performance' | 'Integration' | 'SAT'
type TestResult = 'Pass' | 'Fail' | 'Pending'

interface TestRecord {
  id: string
  system: string
  discipline: Discipline
  type: TestType
  result: TestResult
  date: string
  inspector: string
  defects: number
  notes: string
}

const TESTS: TestRecord[] = [
  { id: 'TST-2401', system: 'MV Switchgear', discipline: 'Electrical', type: 'Functional', result: 'Pass', date: '2025-01-22', inspector: 'K. Ali', defects: 0, notes: 'All insulation resistance readings within specification.' },
  { id: 'TST-2402', system: 'HV Cabling', discipline: 'Electrical', type: 'Performance', result: 'Pending', date: '2025-01-23', inspector: 'R. Khan', defects: 0, notes: 'VLF withstand test scheduled for 24-Jan.' },
  { id: 'TST-2403', system: 'Chilled Water Pumps', discipline: 'Mechanical', type: 'Performance', result: 'Pass', date: '2025-01-19', inspector: 'S. Patel', defects: 0, notes: 'Flow rate 12% above design point; vibration nominal.' },
  { id: 'TST-2404', system: 'AHU-02 Air Handling', discipline: 'HVAC', type: 'Functional', result: 'Fail', date: '2025-01-17', inspector: 'M. Chen', defects: 4, notes: 'Vibration above threshold on drive-end bearing. Belt tension low.' },
  { id: 'TST-2405', system: 'FCU Network', discipline: 'HVAC', type: 'Integration', result: 'Pending', date: '2025-01-22', inspector: 'M. Chen', defects: 1, notes: 'BMS points pending mapping for 8 of 24 FCUs.' },
  { id: 'TST-2406', system: 'Drainage System', discipline: 'Plumbing', type: 'Pre-Functional', result: 'Fail', date: '2025-01-21', inspector: 'J. Müller', defects: 2, notes: 'Trap seal failure at stack C; reverse flow detected.' },
  { id: 'TST-2407', system: 'Sprinkler Network', discipline: 'Fire', type: 'Performance', result: 'Pass', date: '2025-01-15', inspector: 'L. Rossi', defects: 0, notes: 'Hydraulic test passed at 12 bar for 60 min, zero pressure drop.' },
  { id: 'TST-2408', system: 'Fire Alarm Panel', discipline: 'Fire', type: 'Integration', result: 'Pending', date: '2025-01-24', inspector: 'L. Rossi', defects: 0, notes: 'Cause-effect matrix under review with client representative.' },
  { id: 'TST-2409', system: 'CCTV System', discipline: 'ELV', type: 'SAT', result: 'Pass', date: '2025-01-14', inspector: 'A. Vega', defects: 0, notes: 'Image quality compliant; storage retention 31 days verified.' },
  { id: 'TST-2410', system: 'BMS Integration', discipline: 'ELV', type: 'Integration', result: 'Fail', date: '2025-01-23', inspector: 'A. Vega', defects: 3, notes: 'Modbus timeout on 6 devices; gateway requires firmware update.' },
]

type CertStatus = 'Draft' | 'Submitted' | 'Accepted' | 'Rejected' | 'Issued'

interface Certificate {
  no: string
  project: string
  group: string
  handoverDate: string
  status: CertStatus
  acceptedBy: string
  acceptanceDate: string | null
  retentionPct: number
  warrantyUntil: string
  handoverValue: number
}

const CERTS: Certificate[] = [
  { no: 'HCC-2025-014', project: 'PRJ-004', group: 'ELV Systems', handoverDate: '2025-01-12', status: 'Issued', acceptedBy: 'A. Vega', acceptanceDate: '2025-01-12', retentionPct: 5, warrantyUntil: '2027-01-12', handoverValue: 1_240_000 },
  { no: 'HCC-2025-013', project: 'PRJ-001', group: 'Fire Protection', handoverDate: '2025-01-15', status: 'Accepted', acceptedBy: 'L. Rossi', acceptanceDate: '2025-01-15', retentionPct: 5, warrantyUntil: '2027-01-15', handoverValue: 890_000 },
  { no: 'HCC-2025-012', project: 'PRJ-003', group: 'Mechanical Plant', handoverDate: '2025-01-18', status: 'Submitted', acceptedBy: '—', acceptanceDate: null, retentionPct: 5, warrantyUntil: '2027-01-18', handoverValue: 1_580_000 },
  { no: 'HCC-2025-011', project: 'PRJ-001', group: 'Electrical HV', handoverDate: '2025-01-20', status: 'Draft', acceptedBy: '—', acceptanceDate: null, retentionPct: 5, warrantyUntil: '2027-01-20', handoverValue: 1_120_000 },
  { no: 'HCC-2025-010', project: 'PRJ-002', group: 'Plumbing', handoverDate: '2025-01-10', status: 'Rejected', acceptedBy: '—', acceptanceDate: null, retentionPct: 5, warrantyUntil: '2027-01-10', handoverValue: 540_000 },
  { no: 'HCC-2025-009', project: 'PRJ-003', group: 'HVAC Systems', handoverDate: '2025-01-08', status: 'Accepted', acceptedBy: 'M. Chen', acceptanceDate: '2025-01-08', retentionPct: 5, warrantyUntil: '2027-01-08', handoverValue: 1_360_000 },
  { no: 'HCC-2025-008', project: 'PRJ-004', group: 'Security Systems', handoverDate: '2024-12-28', status: 'Issued', acceptedBy: 'A. Vega', acceptanceDate: '2024-12-28', retentionPct: 5, warrantyUntil: '2026-12-28', handoverValue: 720_000 },
  { no: 'HCC-2025-007', project: 'PRJ-002', group: 'ELV Network', handoverDate: '2024-12-20', status: 'Issued', acceptedBy: 'A. Vega', acceptanceDate: '2024-12-20', retentionPct: 5, warrantyUntil: '2026-12-20', handoverValue: 980_000 },
]

const SYSTEM_STATUS_BADGE: Record<SystemStatus, string> = {
  'Pre-Commissioning': 'text-muted-foreground bg-muted border-border',
  'Testing': 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  'Passed': 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  'Failed': 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  'Handed Over': 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900',
}

const TEST_RESULT_BADGE: Record<TestResult, string> = {
  Pass: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  Fail: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Pending: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
}

const TEST_TYPE_BADGE: Record<TestType, string> = {
  'Pre-Functional': 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-900/50 dark:border-slate-800',
  'Functional': 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  'Performance': 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900',
  'Integration': 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  'SAT': 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
}

const CERT_STATUS_BADGE: Record<CertStatus, string> = {
  Draft: 'text-muted-foreground bg-muted border-border',
  Submitted: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Accepted: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Rejected: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Issued: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
}

const DISCIPLINE_COLOR: Record<Discipline, string> = {
  Electrical: CHART.violet,
  Mechanical: CHART.amber,
  HVAC: CHART.sky,
  Plumbing: CHART.emerald,
  Fire: CHART.rose,
  ELV: CHART.slate,
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

export function CommissioningView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate
  const data = useDashboardData()

  // Project code → name lookup (from dashboard data)
  const projName = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of data?.projects ?? []) {
      map.set(p.code, p.name as string)
    }
    return (code: string) => map.get(code) ?? code
  }, [data])

  // Systems Register filters
  const [sysQuery, setSysQuery] = useState('')
  const [sysStatus, setSysStatus] = useState('all')
  const [sysDiscipline, setSysDiscipline] = useState('all')

  const filteredSystems = useMemo(() => {
    const q = sysQuery.trim().toLowerCase()
    return SYSTEMS.filter(s => {
      if (sysStatus !== 'all' && s.status !== sysStatus) return false
      if (sysDiscipline !== 'all' && s.discipline !== sysDiscipline) return false
      if (q) {
        const hay = `${s.id} ${s.name} ${s.project} ${s.discipline} ${s.witnessedBy}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [sysQuery, sysStatus, sysDiscipline])

  // Derived KPI values
  const totalSystems = SYSTEMS.length
  const testedPassed = SYSTEMS.filter(s => s.status === 'Passed' || s.status === 'Handed Over').length
  const failedTests = TESTS.filter(t => t.result === 'Fail').length
  const pendingCommissioning = SYSTEMS.filter(s => s.status === 'Pre-Commissioning').length
  const certsIssued = CERTS.filter(c => c.status === 'Issued').length
  const readyForHandover = SYSTEMS.filter(s => s.status === 'Passed').length

  const kpis: KpiDef[] = [
    { label: 'Total Systems', value: totalSystems, hint: 'across 4 projects', icon: Boxes, tile: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300', bar: 'bg-gradient-to-r from-slate-400 to-slate-500' },
    { label: 'Tested & Passed', value: testedPassed, hint: `${fmtPct((testedPassed / totalSystems) * 100)} of total`, icon: CheckCircle2, tile: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
    { label: 'Failed Tests', value: failedTests, hint: 'requires rectification', icon: XCircle, tile: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700', bar: 'bg-gradient-to-r from-rose-400 to-rose-600' },
    { label: 'Pending Commissioning', value: pendingCommissioning, hint: 'pre-commissioning stage', icon: Clock, tile: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700', bar: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    { label: 'Handover Certs Issued', value: certsIssued, hint: 'of 8 certificates', icon: Award, tile: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600', bar: 'bg-gradient-to-r from-violet-400 to-violet-600' },
    { label: 'Ready for Handover', value: readyForHandover, hint: 'awaiting certificate', icon: FileCheck, tile: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700', bar: 'bg-gradient-to-r from-sky-400 to-sky-600' },
  ]

  // Charts data
  const testsByDiscipline: any[] = useMemo(() => {
    const order: Discipline[] = ['Electrical', 'Mechanical', 'HVAC', 'Plumbing', 'Fire', 'ELV']
    return order.map(d => ({
      discipline: d,
      tests: TESTS.filter(t => t.discipline === d).length,
      fill: DISCIPLINE_COLOR[d],
    }))
  }, [])

  const resultDistribution: any[] = useMemo(() => {
    const pass = TESTS.filter(t => t.result === 'Pass').length
    const fail = TESTS.filter(t => t.result === 'Fail').length
    const pending = TESTS.filter(t => t.result === 'Pending').length
    return [
      { name: 'Pass', value: pass, fill: CHART.emerald },
      { name: 'Fail', value: fail, fill: CHART.rose },
      { name: 'Pending', value: pending, fill: CHART.amber },
    ]
  }, [])

  // Handover summary
  const totalHandoverValue = CERTS.reduce((sum, c) => sum + c.handoverValue, 0)
  const totalRetention = CERTS.reduce((sum, c) => sum + (c.handoverValue * c.retentionPct) / 100, 0)
  const issuedHandoverValue = CERTS.filter(c => c.status === 'Issued').reduce((sum, c) => sum + c.handoverValue, 0)

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <ClipboardCheck className="h-5 w-5 text-violet-600" />
              Commissioning &amp; Handover
            </h2>
            <p className="text-sm text-muted-foreground">
              System commissioning, testing, and handover certificates for projects approaching completion.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <ClipboardCheck className="mr-2 h-4 w-4" /> Export Register
            </Button>
            <Button size="sm">
              <FileCheck className="mr-2 h-4 w-4" /> New Certificate
            </Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map(k => <KpiCard key={k.label} kpi={k} />)}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="systems" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-flow-col">
            <TabsTrigger value="systems"><Boxes className="mr-2 h-4 w-4" /> Systems Register</TabsTrigger>
            <TabsTrigger value="tests"><FlaskConical className="mr-2 h-4 w-4" /> Test &amp; Inspection</TabsTrigger>
            <TabsTrigger value="certs"><Award className="mr-2 h-4 w-4" /> Handover Certificates</TabsTrigger>
          </TabsList>

          {/* Systems Register */}
          <TabsContent value="systems" className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-base">Commissioning Systems Register</CardTitle>
                    <CardDescription>{filteredSystems.length} of {totalSystems} systems shown</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={sysQuery}
                        onChange={e => setSysQuery(e.target.value)}
                        placeholder="Search systems…"
                        className="h-9 w-full pl-8 sm:w-56"
                      />
                    </div>
                    <Select value={sysStatus} onValueChange={setSysStatus}>
                      <SelectTrigger className="h-9 w-full sm:w-44">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="Pre-Commissioning">Pre-Commissioning</SelectItem>
                        <SelectItem value="Testing">Testing</SelectItem>
                        <SelectItem value="Passed">Passed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Handed Over">Handed Over</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sysDiscipline} onValueChange={setSysDiscipline}>
                      <SelectTrigger className="h-9 w-full sm:w-44">
                        <SelectValue placeholder="Discipline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All disciplines</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Mechanical">Mechanical</SelectItem>
                        <SelectItem value="HVAC">HVAC</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Fire">Fire</SelectItem>
                        <SelectItem value="ELV">ELV</SelectItem>
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
                        <TableHead className="w-28">System ID</TableHead>
                        <TableHead>System Name</TableHead>
                        <TableHead className="w-24">Project</TableHead>
                        <TableHead className="w-28">Discipline</TableHead>
                        <TableHead className="w-32">Status</TableHead>
                        <TableHead className="w-28">Test Date</TableHead>
                        <TableHead className="w-40">Test Progress</TableHead>
                        <TableHead className="w-32">Witnessed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSystems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                            No systems match the current filters.
                          </TableCell>
                        </TableRow>
                      ) : filteredSystems.map(s => (
                        <TableRow
                          key={s.id}
                          className={cn(
                            s.status === 'Failed' && 'bg-rose-50/60 dark:bg-rose-950/20',
                            s.status === 'Passed' && 'bg-emerald-50/40 dark:bg-emerald-950/15',
                            s.status === 'Handed Over' && 'bg-violet-50/40 dark:bg-violet-950/15',
                          )}
                        >
                          <TableCell className="font-mono text-xs">{s.id}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>
                            <div className="font-mono text-xs">{s.project}</div>
                            <div className="truncate text-[11px] text-muted-foreground">{projName(s.project)}</div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-xs">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: DISCIPLINE_COLOR[s.discipline] }}
                              />
                              {s.discipline}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('whitespace-nowrap text-[11px]', SYSTEM_STATUS_BADGE[s.status])}>
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{fmtDate(s.testDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={s.testPct} className="h-2 w-24" />
                              <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{s.testPct}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{s.witnessedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test & Inspection */}
          <TabsContent value="tests" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-5">
              {/* Bar chart */}
              <Card className="lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FlaskConical className="h-4 w-4 text-violet-600" /> Tests by Discipline
                  </CardTitle>
                  <CardDescription>Count of test records grouped by engineering discipline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={testsByDiscipline} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 250)" vertical={false} />
                        <XAxis dataKey="discipline" tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 250)" tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 250)" tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          cursor={{ fill: 'oklch(0.96 0.01 250)' }}
                          contentStyle={{ borderRadius: 8, border: '1px solid oklch(0.9 0.01 250)', fontSize: 12 }}
                        />
                        <Bar dataKey="tests" name="Tests" radius={[6, 6, 0, 0]} maxBarSize={56}>
                          {testsByDiscipline.map((d, i) => (
                            <Cell key={i} fill={d.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Donut */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" /> Pass / Fail / Pending
                  </CardTitle>
                  <CardDescription>Result distribution across {TESTS.length} test records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={resultDistribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {resultDistribution.map((d, i) => (
                            <Cell key={i} fill={d.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: '1px solid oklch(0.9 0.01 250)', fontSize: 12 }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          wrapperStyle={{ fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test record cards */}
            <div className="grid gap-3 md:grid-cols-2">
              {TESTS.map(t => (
                <Card
                  key={t.id}
                  className={cn(
                    'overflow-hidden pt-0',
                    t.result === 'Fail' && 'border-rose-200 dark:border-rose-900/60',
                    t.result === 'Pass' && 'border-emerald-200 dark:border-emerald-900/60',
                  )}
                >
                  <div
                    className={cn(
                      'h-1 w-full',
                      t.result === 'Pass' && 'bg-gradient-to-r from-emerald-400 to-emerald-600',
                      t.result === 'Fail' && 'bg-gradient-to-r from-rose-400 to-rose-600',
                      t.result === 'Pending' && 'bg-gradient-to-r from-amber-400 to-amber-600',
                    )}
                  />
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                          <Badge variant="outline" className={cn('text-[10px]', TEST_TYPE_BADGE[t.type])}>{t.type}</Badge>
                        </div>
                        <div className="mt-1 truncate font-semibold">{t.system}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: DISCIPLINE_COLOR[t.discipline] }}
                          />
                          {t.discipline}
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('shrink-0', TEST_RESULT_BADGE[t.result])}>
                        {t.result === 'Pass' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {t.result === 'Fail' && <XCircle className="mr-1 h-3 w-3" />}
                        {t.result === 'Pending' && <Clock className="mr-1 h-3 w-3" />}
                        {t.result}
                      </Badge>
                    </div>

                    <p className="line-clamp-2 text-xs text-muted-foreground">{t.notes}</p>

                    <Separator />

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{fmtDate(t.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{t.inspector}</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1.5',
                        t.defects > 0 ? 'font-medium text-rose-700 dark:text-rose-400' : 'text-muted-foreground',
                      )}>
                        <AlertTriangle className="h-3 w-3" />
                        <span>{t.defects} defect{t.defects === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Handover Certificates */}
          <TabsContent value="certs" className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Card className="overflow-hidden pt-0">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <CardContent className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Handover Value</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums">{fmtMoney(totalHandoverValue, false)}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">across {CERTS.length} certificates</div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden pt-0">
                <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-600" />
                <CardContent className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Retention Held</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums">{fmtMoney(totalRetention, false)}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">5% of total handover value</div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden pt-0">
                <div className="h-1 w-full bg-gradient-to-r from-violet-400 to-violet-600" />
                <CardContent className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Issued Value</div>
                  <div className="mt-1 text-2xl font-bold tabular-nums">{fmtMoney(issuedHandoverValue, false)}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{certsIssued} certificates formally issued</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-violet-600" /> Handover Certificates
                </CardTitle>
                <CardDescription>Tracking status of system-group handover certificates</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[560px] overflow-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="w-32">Certificate No</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>System Group</TableHead>
                        <TableHead className="w-28">Handover Date</TableHead>
                        <TableHead className="w-28">Status</TableHead>
                        <TableHead className="w-32">Accepted By</TableHead>
                        <TableHead className="w-28">Acceptance Date</TableHead>
                        <TableHead className="w-28">Handover Value</TableHead>
                        <TableHead className="w-24">Retention</TableHead>
                        <TableHead className="w-28">Warranty Until</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CERTS.map(c => (
                        <TableRow
                          key={c.no}
                          className={cn(
                            c.status === 'Issued' && 'bg-emerald-50/40 dark:bg-emerald-950/15',
                            c.status === 'Rejected' && 'bg-rose-50/50 dark:bg-rose-950/20',
                          )}
                        >
                          <TableCell className="font-mono text-xs">{c.no}</TableCell>
                          <TableCell>
                            <div className="font-mono text-xs">{c.project}</div>
                            <div className="truncate text-[11px] text-muted-foreground">{projName(c.project)}</div>
                          </TableCell>
                          <TableCell className="font-medium">{c.group}</TableCell>
                          <TableCell className="text-xs">{fmtDate(c.handoverDate)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('whitespace-nowrap text-[11px]', CERT_STATUS_BADGE[c.status])}>
                              {c.status === 'Issued' && <FileCheck className="mr-1 h-3 w-3" />}
                              {c.status === 'Rejected' && <XCircle className="mr-1 h-3 w-3" />}
                              {c.status === 'Accepted' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{c.acceptedBy}</TableCell>
                          <TableCell className="text-xs">{fmtDate(c.acceptanceDate)}</TableCell>
                          <TableCell className="text-xs tabular-nums">{fmtMoney(c.handoverValue, false)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-xs tabular-nums">
                              <Wrench className="h-3 w-3 text-muted-foreground" />
                              {c.retentionPct}%
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">{fmtDate(c.warrantyUntil)}</TableCell>
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
