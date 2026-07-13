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
import {
  Gavel, Clock, CheckCircle2, DollarSign, CalendarDays,
  Search, Download, TrendingUp, ChevronRight,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { useDashboardData } from '../use-data'
import { fmtMoney, fmtDate, exportCsv, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

const CAT_COLORS = [
  'oklch(0.6 0.2 25)',
  'oklch(0.7 0.16 80)',
  'oklch(0.62 0.1 195)',
  'oklch(0.65 0.18 305)',
  'oklch(0.55 0.12 162)',
  'oklch(0.55 0.02 250)',
]

const STATUS_COLOR: Record<string, string> = {
  Approved:         'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900',
  'Under Review':   'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900',
  Submitted:        'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900',
  Rejected:         'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900',
  Withdrawn:        'text-slate-500 bg-muted border-border',
}
const DISPUTE_STATUS: Record<string, string> = {
  Active:    'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50',
  Resolved:  'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50',
  Settled:   'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50',
  Escalated: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50',
  Withdrawn: 'text-slate-500 bg-muted border-border',
}
const FORUM_COLOR: Record<string, string> = {
  DRB:          'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50',
  Adjudication: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50',
  Arbitration:  'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50',
  Mediation:    'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50',
  Negotiation:  'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50',
}

interface Dispute {
  id: string; project: string; relatedClaim: string; claimValue: number
  forum: string; status: string; panelMembers: string[]
  raisedDate: string; hearingDate?: string; resolvedDate?: string
  outcome?: string; notes: string
}

const DISPUTES: Dispute[] = [
  { id: 'DRB-001', project: 'PRJ-SOLAR-100MW', relatedClaim: 'CLM-001 Module tariff surcharge claim', claimValue: 3400000, forum: 'DRB', status: 'Active', panelMembers: ['Dr. A. Kiran (Chair)', 'R. Thompson', 'H. Al-Mansoori'], raisedDate: '2025-11-15', hearingDate: '2026-03-10', notes: 'Claimant argues unforeseen tariff constitutes force majeure under Clause 19. Respondent disputes materiality threshold.' },
  { id: 'DRB-002', project: 'PRJ-METRO-TUN', relatedClaim: 'EOT-001 Geotech delay - boulder zone', claimValue: 6800000, forum: 'Adjudication', status: 'Active', panelMembers: ['Prof. M. Shea (Adjudicator)'], raisedDate: '2025-12-01', hearingDate: '2026-02-20', notes: 'Contractor claims 45-day EOT and associated prolongation costs. Employer disputes critical path impact.' },
  { id: 'ARB-001', project: 'PRJ-TWR-NORTH', relatedClaim: 'CO-004 Added sky-garden level', claimValue: 2850000, forum: 'Arbitration', status: 'Settled', panelMembers: ['Sir J. Blackwood (Sole Arbitrator)'], raisedDate: '2025-08-10', resolvedDate: '2025-12-15', outcome: 'Settled at 2.1M including 12-day EOT. Costs split equally.', notes: 'Parties reached settlement at preliminary hearing stage avoiding full arbitration proceedings.' },
  { id: 'MED-001', project: 'PRJ-BRIDGE-RIV', relatedClaim: 'EOT-003 Pier scour remediation', claimValue: 720000, forum: 'Mediation', status: 'Resolved', panelMembers: ['Ms. P. Connolly (Mediator)'], raisedDate: '2025-09-22', resolvedDate: '2025-11-08', outcome: 'Full award of 720K + 25-day EOT. Cost award in favour of contractor.', notes: 'Both parties agreed to mediator recommendation within 2 sessions.' },
  { id: 'NEG-001', project: 'PRJ-WTP-NEW', relatedClaim: 'CO-006 Membrane capacity increase', claimValue: 1450000, forum: 'Negotiation', status: 'Active', panelMembers: ['Project Directors (both parties)', 'Independent Quantity Surveyor'], raisedDate: '2026-01-05', hearingDate: '2026-04-20', notes: 'Variation scope and quantum under negotiation. Engineer has issued interim valuation at 980K pending agreement.' },
  { id: 'DRB-003', project: 'PRJ-METRO-STA-A', relatedClaim: 'EOT-004 Temporary works redesign', claimValue: 1100000, forum: 'DRB', status: 'Withdrawn', panelMembers: ['Dr. A. Kiran (Chair)', 'R. Thompson', 'H. Al-Mansoori'], raisedDate: '2025-10-18', resolvedDate: '2025-12-01', outcome: 'Contractor withdrew referral after Engineer granted partial EOT of 18 days.', notes: 'Partial agreement reached at conciliation stage. Remaining cost claim abandoned.' },
]

function KpiCard({ label, value, icon: Icon, accentClass, sub }: {
  label: string; value: string | number; icon: React.ElementType
  accentClass: string; sub?: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className={cn('h-1 w-full bg-gradient-to-r', accentClass)} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
            {sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>}
          </div>
          <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br', accentClass)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ClaimsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  void onNavigate
  const data = useDashboardData()
  const [eotQ, setEotQ] = useState('')
  const [eotStatus, setEotStatus] = useState('all')
  const [claimQ, setClaimQ] = useState('')
  const [claimStatus, setClaimStatus] = useState('all')
  const [dispQ, setDispQ] = useState('')
  const [dispForum, setDispForum] = useState('all')
  const [dispStatus, setDispStatus] = useState('all')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)

  const allChanges: any[] = useMemo(() => data?.changes ?? [], [data])
  const eotRows = useMemo(() => allChanges.filter(c => c.type === 'EOT' || c.type === 'Delay Notice'), [allChanges])
  const claimRows = useMemo(() => allChanges.filter(c => c.type === 'Claim'), [allChanges])

  const SYNTH_EOT: any[] = useMemo(() => [
    { id: 's1', code: 'EOT-004', title: 'Temporary works redesign delay', project: { code: 'PRJ-METRO-STA-A' }, type: 'EOT', status: 'Approved', timeImpact: 18, costImpact: 0, raisedDate: '2025-10-05', cause: 'Design Change', criticalPath: true },
    { id: 's2', code: 'EOT-005', title: 'Concrete supply shortage - ready-mix plant failure', project: { code: 'PRJ-HOSP-300' }, type: 'EOT', status: 'Under Review', timeImpact: 10, costImpact: 0, raisedDate: '2025-12-10', cause: 'Supply Chain', criticalPath: false },
    { id: 's3', code: 'DN-001', title: 'Authority approval delay - EPA permit', project: { code: 'PRJ-WTP-NEW' }, type: 'Delay Notice', status: 'Submitted', timeImpact: 22, costImpact: 0, raisedDate: '2026-01-18', cause: 'Regulatory', criticalPath: true },
    { id: 's4', code: 'EOT-006', title: 'Wet weather exceedance Q1 2026', project: { code: 'PRJ-SOLAR-100MW' }, type: 'EOT', status: 'Rejected', timeImpact: 8, costImpact: 0, raisedDate: '2026-02-01', cause: 'Weather', criticalPath: false },
  ], [])

  const SYNTH_CLAIMS: any[] = useMemo(() => [
    { id: 'sc1', code: 'CLM-002', title: 'Prolongation cost - extended preliminaries', project: { code: 'PRJ-METRO-TUN' }, type: 'Claim', status: 'Submitted', timeImpact: 0, costImpact: 2150000, raisedDate: '2025-12-20', category: 'Prolongation' },
    { id: 'sc2', code: 'CLM-003', title: 'Loss and expense - disruption to concrete works', project: { code: 'PRJ-TWR-NORTH' }, type: 'Claim', status: 'Under Review', timeImpact: 0, costImpact: 980000, raisedDate: '2025-11-08', category: 'Disruption' },
    { id: 'sc3', code: 'CLM-004', title: 'Additional site establishment costs', project: { code: 'PRJ-BRIDGE-RIV' }, type: 'Claim', status: 'Approved', timeImpact: 0, costImpact: 720000, raisedDate: '2025-09-15', category: 'Prolongation' },
    { id: 'sc4', code: 'CLM-005', title: 'Escalation of steel prices - unforeseen', project: { code: 'PRJ-MALL-EXP' }, type: 'Claim', status: 'Rejected', timeImpact: 0, costImpact: 540000, raisedDate: '2026-01-30', category: 'Escalation' },
  ], [])

  const allEot: any[] = useMemo(() => {
    const dbIds = new Set(eotRows.map((r: any) => r.code))
    const extra = SYNTH_EOT.filter(r => !dbIds.has(r.code))
    return [...eotRows.map((r: any) => ({ ...r, cause: r.type === 'Delay Notice' ? 'Delay Notice' : 'Geotech/Site', criticalPath: true })), ...extra]
  }, [eotRows, SYNTH_EOT])

  const allClaims: any[] = useMemo(() => {
    const dbIds = new Set(claimRows.map((r: any) => r.code))
    const extra = SYNTH_CLAIMS.filter(r => !dbIds.has(r.code))
    return [...claimRows.map((r: any) => ({ ...r, category: 'Commercial' })), ...extra]
  }, [claimRows, SYNTH_CLAIMS])

  const eotApproved = useMemo(() => allEot.filter(e => e.status === 'Approved'), [allEot])
  const eotPending  = useMemo(() => allEot.filter(e => e.status === 'Submitted' || e.status === 'Under Review'), [allEot])
  const daysApproved = useMemo(() => eotApproved.reduce((s: number, e: any) => s + (e.timeImpact || 0), 0), [eotApproved])
  const daysPending  = useMemo(() => eotPending.reduce((s: number, e: any) => s + (e.timeImpact || 0), 0), [eotPending])
  const claimsApproved     = useMemo(() => allClaims.filter(c => c.status === 'Approved'), [allClaims])
  const totalClaimValue    = useMemo(() => allClaims.reduce((s: number, c: any) => s + (c.costImpact || 0), 0), [allClaims])
  const approvedClaimValue = useMemo(() => claimsApproved.reduce((s: number, c: any) => s + (c.costImpact || 0), 0), [claimsApproved])
  const activeDisputes     = useMemo(() => DISPUTES.filter(d => d.status === 'Active' || d.status === 'Escalated'), [])
  const totalDisputeValue  = DISPUTES.reduce((s, d) => s + d.claimValue, 0)

  const filteredEot = useMemo(() => allEot.filter(e => {
    if (eotQ && !`${e.code} ${e.title}`.toLowerCase().includes(eotQ.toLowerCase())) return false
    if (eotStatus !== 'all' && e.status !== eotStatus) return false
    return true
  }), [allEot, eotQ, eotStatus])

  const filteredClaims = useMemo(() => allClaims.filter(c => {
    if (claimQ && !`${c.code} ${c.title}`.toLowerCase().includes(claimQ.toLowerCase())) return false
    if (claimStatus !== 'all' && c.status !== claimStatus) return false
    return true
  }), [allClaims, claimQ, claimStatus])

  const filteredDisputes = useMemo(() => DISPUTES.filter(d => {
    if (dispQ && !`${d.id} ${d.relatedClaim}`.toLowerCase().includes(dispQ.toLowerCase())) return false
    if (dispForum !== 'all' && d.forum !== dispForum) return false
    if (dispStatus !== 'all' && d.status !== dispStatus) return false
    return true
  }), [dispQ, dispForum, dispStatus])

  const claimsByCategory = useMemo(() => {
    const map = new Map<string, number>()
    allClaims.forEach((c: any) => map.set(c.category ?? 'Other', (map.get(c.category ?? 'Other') ?? 0) + (c.costImpact || 0)))
    return Array.from(map, ([name, value]) => ({ name, value }))
  }, [allClaims])

  const claimsStatusDist = useMemo(() => {
    const map = new Map<string, number>()
    allClaims.forEach((c: any) => map.set(c.status, (map.get(c.status) ?? 0) + 1))
    return Array.from(map, ([name, value]) => ({ name, value }))
  }, [allClaims])

  const eotByCause = useMemo(() => {
    const map = new Map<string, number>()
    allEot.forEach((e: any) => map.set(e.cause ?? 'Other', (map.get(e.cause ?? 'Other') ?? 0) + (e.timeImpact || 0)))
    return Array.from(map, ([cause, days]) => ({ cause, days }))
  }, [allEot])

  if (!data) return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />

  return (
    <FadeIn>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Gavel className="h-5 w-5 text-amber-700" /> Claims &amp; Disputes
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">Extensions of Time, Commercial Claims &amp; Dispute Resolution</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => exportCsv('claims')}>
            <Download className="h-3.5 w-3.5" /> Export Claims CSV
          </Button>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="EOT Requests"    value={allEot.length}               icon={CalendarDays} accentClass="from-sky-500 to-sky-600"       sub={`${eotApproved.length} approved`} />
          <KpiCard label="Days Approved"   value={`${daysApproved}d`}          icon={CheckCircle2} accentClass="from-emerald-500 to-emerald-600" sub="Calendar days granted" />
          <KpiCard label="Days Pending"    value={`${daysPending}d`}           icon={Clock}        accentClass="from-amber-500 to-amber-600"    sub={`${eotPending.length} pending`} />
          <KpiCard label="Total Claims"    value={fmtMoney(totalClaimValue)}   icon={DollarSign}   accentClass="from-violet-500 to-violet-600"  sub={`${allClaims.length} lodged`} />
          <KpiCard label="Claims Approved" value={fmtMoney(approvedClaimValue)} icon={TrendingUp}  accentClass="from-emerald-600 to-teal-600"   sub={`${claimsApproved.length} approved`} />
          <KpiCard label="Active Disputes" value={activeDisputes.length}       icon={Gavel}        accentClass="from-rose-500 to-rose-600"      sub={`${DISPUTES.length} total referred`} />
        </div>

        <Tabs defaultValue="eot">
          <TabsList className="h-9">
            <TabsTrigger value="eot"      className="text-xs">Extensions of Time</TabsTrigger>
            <TabsTrigger value="claims"   className="text-xs">Commercial Claims</TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs">Disputes &amp; DRB</TabsTrigger>
          </TabsList>

          <TabsContent value="eot" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm">EOT Register</CardTitle>
                      <CardDescription className="text-xs">{filteredEot.length} of {allEot.length} requests</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input value={eotQ} onChange={e => setEotQ(e.target.value)} placeholder="Search..." className="h-8 pl-8 text-xs w-44" />
                      </div>
                      <Select value={eotStatus} onValueChange={setEotStatus}>
                        <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Under Review">Under Review</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[480px] overflow-auto scroll-thin">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Code</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Title</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Project</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Type</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px] text-right">Days</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Cause</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">CP</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Raised</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEot.length === 0 ? (
                          <TableRow><TableCell colSpan={9} className="py-8 text-center text-xs text-muted-foreground">No results.</TableCell></TableRow>
                        ) : filteredEot.map((e: any) => (
                          <TableRow key={e.id} className={cn(e.status === 'Rejected' && 'bg-rose-50/40 dark:bg-rose-950/20', e.status === 'Approved' && 'bg-emerald-50/40 dark:bg-emerald-950/20')}>
                            <TableCell className="font-mono text-[11px]">{e.code}</TableCell>
                            <TableCell className="max-w-[180px] text-[11px]"><div className="truncate" title={e.title}>{e.title}</div></TableCell>
                            <TableCell className="text-[11px]"><Badge variant="outline" className="text-[9px]">{e.project?.code ?? e.project}</Badge></TableCell>
                            <TableCell className="text-[11px]">{e.type}</TableCell>
                            <TableCell className="text-right text-[11px] font-bold tabular-nums">{e.timeImpact > 0 ? <span className="text-amber-700">{e.timeImpact}d</span> : <span className="text-muted-foreground">-</span>}</TableCell>
                            <TableCell className="text-[11px] text-muted-foreground">{e.cause ?? '-'}</TableCell>
                            <TableCell className="text-[11px]">{e.criticalPath ? <span className="font-semibold text-rose-700">CP</span> : <span className="text-muted-foreground">-</span>}</TableCell>
                            <TableCell className="text-[11px] text-muted-foreground">{fmtDate(e.raisedDate)}</TableCell>
                            <TableCell><Badge variant="outline" className={cn('text-[9px]', STATUS_COLOR[e.status] ?? '')}>{e.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Days by Delay Cause</CardTitle><CardDescription className="text-xs">Cumulative EOT days per cause</CardDescription></CardHeader>
                  <CardContent className="p-2">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={eotByCause} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="cause" type="category" tick={{ fontSize: 10 }} width={84} />
                          <Tooltip formatter={(v: number) => [`${v}d`, 'Days']} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                          <Bar dataKey="days" radius={[0, 4, 4, 0]} maxBarSize={24}>{eotByCause.map((_: any, i: number) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">EOT Summary</div>
                    {[
                      { label: 'Total Requested', value: `${allEot.reduce((s: number, e: any) => s + (e.timeImpact || 0), 0)}d`, color: 'text-foreground' },
                      { label: 'Days Approved',   value: `${daysApproved}d`,  color: 'text-emerald-700' },
                      { label: 'Days Pending',    value: `${daysPending}d`,   color: 'text-amber-700' },
                      { label: 'Critical Path',   value: `${allEot.filter((e: any) => e.criticalPath).length} requests`, color: 'text-rose-700' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className={cn('font-bold tabular-nums', s.color)}>{s.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="claims" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><CardTitle className="text-sm">Commercial Claims Register</CardTitle><CardDescription className="text-xs">{filteredClaims.length} of {allClaims.length} claims</CardDescription></div>
                    <div className="flex gap-2">
                      <div className="relative"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" /><Input value={claimQ} onChange={e => setClaimQ(e.target.value)} placeholder="Search..." className="h-8 pl-8 text-xs w-44" /></div>
                      <Select value={claimStatus} onValueChange={setClaimStatus}>
                        <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Under Review">Under Review</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[440px] overflow-auto scroll-thin">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Code</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Title</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Project</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Category</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px] text-right">Value</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Raised</TableHead>
                          <TableHead className="sticky top-0 bg-background text-[11px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClaims.length === 0 ? (
                          <TableRow><TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">No results.</TableCell></TableRow>
                        ) : filteredClaims.map((c: any) => (
                          <TableRow key={c.id} className={cn(c.status === 'Rejected' && 'bg-rose-50/40 dark:bg-rose-950/20', c.status === 'Approved' && 'bg-emerald-50/40 dark:bg-emerald-950/20')}>
                            <TableCell className="font-mono text-[11px]">{c.code}</TableCell>
                            <TableCell className="max-w-[200px] text-[11px]"><div className="truncate" title={c.title}>{c.title}</div></TableCell>
                            <TableCell className="text-[11px]"><Badge variant="outline" className="text-[9px]">{c.project?.code ?? c.project}</Badge></TableCell>
                            <TableCell className="text-[11px] text-muted-foreground">{c.category ?? 'Commercial'}</TableCell>
                            <TableCell className="text-right text-[11px] font-bold tabular-nums">{c.costImpact > 0 ? <span className="text-violet-600">{fmtMoney(c.costImpact)}</span> : <span className="text-muted-foreground">-</span>}</TableCell>
                            <TableCell className="text-[11px] text-muted-foreground">{fmtDate(c.raisedDate)}</TableCell>
                            <TableCell><Badge variant="outline" className={cn('text-[9px]', STATUS_COLOR[c.status] ?? '')}>{c.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Claims by Category</CardTitle><CardDescription className="text-xs">Total value per claim type</CardDescription></CardHeader>
                  <CardContent className="p-2">
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={claimsByCategory} margin={{ top: 4, right: 8, bottom: 24, left: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={44} interval={0} />
                          <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => fmtMoney(v)} width={56} />
                          <Tooltip formatter={(v: number) => [fmtMoney(v, false), 'Value']} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>{claimsByCategory.map((_: any, i: number) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Status Distribution</CardTitle></CardHeader>
                  <CardContent className="p-2">
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={claimsStatusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={64} paddingAngle={3}>
                            {claimsStatusDist.map((_: any, i: number) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                          </Pie>
                          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Claims Summary</div>
                    {[
                      { label: 'Total Lodged',   value: fmtMoney(totalClaimValue),    color: 'text-foreground' },
                      { label: 'Approved Value', value: fmtMoney(approvedClaimValue), color: 'text-emerald-700' },
                      { label: 'Pending Review', value: `${allClaims.filter((c: any) => c.status === 'Submitted' || c.status === 'Under Review').length} claims`, color: 'text-amber-700' },
                      { label: 'Recovery Rate',  value: totalClaimValue > 0 ? `${((approvedClaimValue / totalClaimValue) * 100).toFixed(0)}%` : '-', color: 'text-sky-700' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className={cn('font-bold tabular-nums', s.color)}>{s.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="relative"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" /><Input value={dispQ} onChange={e => setDispQ(e.target.value)} placeholder="Search disputes..." className="h-8 pl-8 text-xs w-52" /></div>
              <Select value={dispForum} onValueChange={setDispForum}>
                <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="All forums" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All forums</SelectItem>
                  <SelectItem value="DRB">DRB</SelectItem>
                  <SelectItem value="Adjudication">Adjudication</SelectItem>
                  <SelectItem value="Arbitration">Arbitration</SelectItem>
                  <SelectItem value="Mediation">Mediation</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dispStatus} onValueChange={setDispStatus}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Settled">Settled</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="Escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="h-8 px-3 text-xs">{filteredDisputes.length} of {DISPUTES.length} disputes</Badge>
            </div>

            <div className={cn('grid gap-4', selectedDispute ? 'lg:grid-cols-2' : 'grid-cols-1')}>
              <div className="space-y-3">
                {filteredDisputes.length === 0 ? (
                  <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No disputes match your filters.</CardContent></Card>
                ) : filteredDisputes.map(d => (
                  <Card key={d.id}
                    className={cn('cursor-pointer transition-all hover:border-primary/40 hover:shadow-md',
                      selectedDispute?.id === d.id ? 'border-primary ring-1 ring-primary/30' : '',
                      d.status === 'Active' ? 'border-l-4 border-l-amber-500' : '',
                      d.status === 'Escalated' ? 'border-l-4 border-l-rose-500' : '',
                      (d.status === 'Resolved' || d.status === 'Settled') ? 'border-l-4 border-l-emerald-500 opacity-80' : '',
                    )}
                    onClick={() => setSelectedDispute(prev => prev?.id === d.id ? null : d)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] font-bold">{d.id}</span>
                            <Badge variant="outline" className={cn('text-[9px]', FORUM_COLOR[d.forum] ?? '')}>{d.forum}</Badge>
                            <Badge variant="outline" className={cn('text-[9px]', DISPUTE_STATUS[d.status] ?? '')}>{d.status}</Badge>
                          </div>
                          <div className="mt-1 truncate text-xs font-medium" title={d.relatedClaim}>{d.relatedClaim}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{d.project}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-bold tabular-nums text-violet-600">{fmtMoney(d.claimValue)}</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">In dispute</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                        <span>Raised: <strong className="text-foreground">{fmtDate(d.raisedDate)}</strong></span>
                        {d.hearingDate && <span>Hearing: <strong className="text-amber-700">{fmtDate(d.hearingDate)}</strong></span>}
                        {d.resolvedDate && <span>Resolved: <strong className="text-emerald-700">{fmtDate(d.resolvedDate)}</strong></span>}
                        <span className="col-span-2">Panel: <strong className="text-foreground">{d.panelMembers[0]}{d.panelMembers.length > 1 ? ` +${d.panelMembers.length - 1} more` : ''}</strong></span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="line-clamp-1 text-[10px] text-muted-foreground">{d.notes}</p>
                        <ChevronRight className={cn('h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform', selectedDispute?.id === d.id ? 'rotate-90' : '')} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedDispute && (
                <Card className="sticky top-4 self-start border-primary/30">
                  <CardHeader className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-sm"><Gavel className="h-4 w-4 text-amber-700" /> {selectedDispute.id}</CardTitle>
                        <CardDescription className="mt-0.5 text-xs">{selectedDispute.forum} proceeding</CardDescription>
                      </div>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className={cn('text-[9px]', FORUM_COLOR[selectedDispute.forum] ?? '')}>{selectedDispute.forum}</Badge>
                        <Badge variant="outline" className={cn('text-[9px]', DISPUTE_STATUS[selectedDispute.status] ?? '')}>{selectedDispute.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4">
                    <div><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Claim in Dispute</div><div className="text-xs font-medium">{selectedDispute.relatedClaim}</div><div className="text-[11px] text-muted-foreground">{selectedDispute.project}</div></div>
                    <div className="rounded-lg border bg-muted/30 p-3"><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Claim Value</div><div className="mt-1 text-2xl font-bold tabular-nums text-violet-600">{fmtMoney(selectedDispute.claimValue, false)}</div></div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Panel Members</div>
                      {selectedDispute.panelMembers.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-400">{m[0]}</div>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Key Dates</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md border p-2"><div className="text-[9px] text-muted-foreground">Raised</div><div className="font-semibold">{fmtDate(selectedDispute.raisedDate)}</div></div>
                        {selectedDispute.hearingDate && <div className="rounded-md border border-amber-200 bg-amber-50/50 p-2 dark:bg-amber-950/20"><div className="text-[9px] text-muted-foreground">Hearing</div><div className="font-semibold text-amber-700 dark:text-amber-400">{fmtDate(selectedDispute.hearingDate)}</div></div>}
                        {selectedDispute.resolvedDate && <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-2 dark:bg-emerald-950/20"><div className="text-[9px] text-muted-foreground">Resolved</div><div className="font-semibold text-emerald-700 dark:text-emerald-400">{fmtDate(selectedDispute.resolvedDate)}</div></div>}
                      </div>
                    </div>
                    {selectedDispute.outcome && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:bg-emerald-950/20">
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Outcome</div>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300">{selectedDispute.outcome}</p>
                      </div>
                    )}
                    <div><div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</div><p className="text-[11px] leading-relaxed text-muted-foreground">{selectedDispute.notes}</p></div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Portfolio Dispute Summary</div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  {[
                    { label: 'Total Referred',      value: DISPUTES.length,                                                                 color: 'text-foreground' },
                    { label: 'Active / Escalated',  value: activeDisputes.length,                                                            color: 'text-amber-700' },
                    { label: 'Settled / Resolved',  value: DISPUTES.filter(d => d.status === 'Settled' || d.status === 'Resolved').length,  color: 'text-emerald-700' },
                    { label: 'Value in Dispute',    value: fmtMoney(totalDisputeValue),                                                     color: 'text-violet-600' },
                    { label: 'Avg Resolution',      value: '48d',                                                                           color: 'text-sky-700' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className={cn('text-xl font-bold tabular-nums', s.color)}>{s.value}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}
