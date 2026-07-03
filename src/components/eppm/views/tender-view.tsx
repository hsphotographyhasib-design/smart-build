'use client'

// Tender & Bid — packages, technical/commercial bid evaluation, award
// recommendation and vendor prequalification, in one shared-state workflow.
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Search, ClipboardList, Scale, Gavel, Handshake, CheckCircle2, XCircle,
  FileText, Send, Trophy, Star, Clock,
} from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

type PkgStatus = 'Draft' | 'Tendering' | 'Evaluation' | 'Recommended' | 'Awarded'
interface TenderPackage {
  id: string; title: string; project: string; estimateBnd: number
  issued: string; closing: string; status: PkgStatus; bids: number; awardedTo?: string
}
interface Bid {
  id: string; packageId: string; vendor: string; priceBnd: number
  technical: number; commercial: number; durationWks: number; compliant: boolean
}
type PrequalStatus = 'Pending' | 'Approved' | 'Rejected'
interface Vendor {
  id: string; name: string; trade: string; grade: string; yearsActive: number
  safetyScore: number; financialScore: number; status: PrequalStatus
}

const SEED_PACKAGES: TenderPackage[] = [
  { id: 'TP-2026-08', title: 'Earthworks & Piling — Muara Warehouse', project: 'Industrial Warehouse Facility', estimateBnd: 1450000, issued: '2026-06-05', closing: '2026-07-10', status: 'Tendering', bids: 3 },
  { id: 'TP-2026-07', title: 'M&E Package — Gadong Residences', project: 'Gadong Luxury Residences', estimateBnd: 2200000, issued: '2026-05-20', closing: '2026-06-25', status: 'Evaluation', bids: 4 },
  { id: 'TP-2026-06', title: 'Facade & Glazing — Gadong Residences', project: 'Gadong Luxury Residences', estimateBnd: 980000, issued: '2026-05-02', closing: '2026-06-08', status: 'Recommended', bids: 3 },
  { id: 'TP-2026-05', title: 'Roadworks Subcontract — Seria Phase 2', project: 'Seria Road & Drainage', estimateBnd: 760000, issued: '2026-04-10', closing: '2026-05-15', status: 'Awarded', bids: 5, awardedTo: 'Borneo Civil Works' },
  { id: 'TP-2026-09', title: 'Lift Installation — HQ Retrofit', project: 'Baiduri HQ Retrofit', estimateBnd: 540000, issued: '—', closing: '—', status: 'Draft', bids: 0 },
]

const SEED_BIDS: Bid[] = [
  { id: 'BID-071', packageId: 'TP-2026-07', vendor: 'BruMech Engineering', priceBnd: 2145000, technical: 86, commercial: 92, durationWks: 38, compliant: true },
  { id: 'BID-072', packageId: 'TP-2026-07', vendor: 'Delta Electric JV', priceBnd: 2010000, technical: 78, commercial: 96, durationWks: 42, compliant: true },
  { id: 'BID-073', packageId: 'TP-2026-07', vendor: 'Mega M&E Services', priceBnd: 2380000, technical: 90, commercial: 84, durationWks: 36, compliant: true },
  { id: 'BID-074', packageId: 'TP-2026-07', vendor: 'CoolAir Contracting', priceBnd: 1890000, technical: 61, commercial: 98, durationWks: 46, compliant: false },
  { id: 'BID-061', packageId: 'TP-2026-06', vendor: 'GlassTech Facades', priceBnd: 945000, technical: 88, commercial: 93, durationWks: 24, compliant: true },
  { id: 'BID-062', packageId: 'TP-2026-06', vendor: 'AluBuild Systems', priceBnd: 1010000, technical: 82, commercial: 88, durationWks: 26, compliant: true },
  { id: 'BID-063', packageId: 'TP-2026-06', vendor: 'Pacific Cladding', priceBnd: 899000, technical: 71, commercial: 95, durationWks: 30, compliant: true },
]

const SEED_VENDORS: Vendor[] = [
  { id: 'VND-114', name: 'BruMech Engineering', trade: 'Mechanical & Electrical', grade: 'Class A', yearsActive: 14, safetyScore: 92, financialScore: 88, status: 'Approved' },
  { id: 'VND-118', name: 'GlassTech Facades', trade: 'Facade & Glazing', grade: 'Class B', yearsActive: 9, safetyScore: 86, financialScore: 81, status: 'Approved' },
  { id: 'VND-121', name: 'Borneo Civil Works', trade: 'Civil & Roadworks', grade: 'Class A', yearsActive: 18, safetyScore: 90, financialScore: 93, status: 'Approved' },
  { id: 'VND-127', name: 'CoolAir Contracting', trade: 'HVAC', grade: 'Class C', yearsActive: 4, safetyScore: 68, financialScore: 61, status: 'Pending' },
  { id: 'VND-128', name: 'Sumbangsih Steel', trade: 'Steel Structure', grade: 'Class B', yearsActive: 7, safetyScore: 84, financialScore: 77, status: 'Pending' },
  { id: 'VND-119', name: 'QuickBuild Trading', trade: 'General Building', grade: 'Class D', yearsActive: 2, safetyScore: 52, financialScore: 44, status: 'Rejected' },
]

export type TenderFocus = 'tender-packages' | 'bid-comparison' | 'award-management' | 'vendor-prequal'
const FOCUS_TAB: Record<TenderFocus, string> = {
  'tender-packages': 'packages', 'bid-comparison': 'bids', 'award-management': 'awards', 'vendor-prequal': 'prequal',
}

const pkgColor = (s: PkgStatus) =>
  s === 'Awarded' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
  : s === 'Recommended' ? 'text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950/50 dark:border-teal-900'
  : s === 'Evaluation' ? 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900'
  : s === 'Tendering' ? 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900'
  : 'text-muted-foreground bg-muted border-border'

export default function TenderView({ focus = 'tender-packages' }: { onNavigate?: (v: View) => void; focus?: TenderFocus }) {
  const [tab, setTab] = useState(FOCUS_TAB[focus])
  const [packages, setPackages] = useState(SEED_PACKAGES)
  const [vendors, setVendors] = useState(SEED_VENDORS)
  const [evalPkg, setEvalPkg] = useState('TP-2026-07')
  const [search, setSearch] = useState('')

  useEffect(() => { setTab(FOCUS_TAB[focus]) }, [focus])

  const q = search.toLowerCase()
  const filteredPkgs = packages.filter((p) => !q || [p.id, p.title, p.project].join(' ').toLowerCase().includes(q))
  const bids = SEED_BIDS.filter((b) => b.packageId === evalPkg)
  const scored = useMemo(() =>
    bids
      .map((b) => ({ ...b, total: Math.round(b.technical * 0.6 + b.commercial * 0.4) }))
      .sort((a, b) => (b.compliant ? b.total : -1) - (a.compliant ? a.total : -1)),
    [bids])

  const advancePkg = (id: string) =>
    setPackages((prev) => prev.map((p) => {
      if (p.id !== id) return p
      const next: Record<PkgStatus, PkgStatus> = { Draft: 'Tendering', Tendering: 'Evaluation', Evaluation: 'Recommended', Recommended: 'Awarded', Awarded: 'Awarded' }
      const status = next[p.status]
      const winner = status === 'Awarded' ? SEED_BIDS.filter((b) => b.packageId === id && b.compliant).sort((a, b) => (b.technical * 0.6 + b.commercial * 0.4) - (a.technical * 0.6 + a.commercial * 0.4))[0]?.vendor : p.awardedTo
      return { ...p, status, awardedTo: winner }
    }))

  const setVendorStatus = (id: string, status: PrequalStatus) =>
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)))

  const pkgAction: Record<PkgStatus, string | null> = { Draft: 'Issue Tender', Tendering: 'Close & Evaluate', Evaluation: 'Recommend', Recommended: 'Award', Awarded: null }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Gavel className="h-6 w-6 text-primary" /> Tender & Bid Management</h1>
            <p className="text-sm text-muted-foreground">Packages → tendering → evaluation → recommendation → award</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search packages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Active Packages', value: packages.filter((p) => p.status !== 'Awarded').length, icon: ClipboardList, tone: 'text-sky-600' },
            { label: 'In Evaluation', value: packages.filter((p) => p.status === 'Evaluation').length, icon: Scale, tone: 'text-violet-600' },
            { label: 'Awarded YTD', value: packages.filter((p) => p.status === 'Awarded').length, icon: Trophy, tone: 'text-emerald-600' },
            { label: 'Approved Vendors', value: vendors.filter((v) => v.status === 'Approved').length, icon: Handshake, tone: 'text-amber-600' },
          ].map((k) => (
            <Card key={k.label}><CardContent className="flex items-center gap-3 p-4">
              <k.icon className={cn('h-8 w-8 shrink-0 rounded-lg bg-muted p-1.5', k.tone)} />
              <div><div className="text-xl font-bold leading-none">{k.value}</div><div className="mt-1 text-[11px] text-muted-foreground">{k.label}</div></div>
            </CardContent></Card>
          ))}
        </div>
      </FadeIn>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="packages"><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Tender Packages</TabsTrigger>
          <TabsTrigger value="bids"><Scale className="mr-1.5 h-3.5 w-3.5" />Bid Comparison</TabsTrigger>
          <TabsTrigger value="awards"><Trophy className="mr-1.5 h-3.5 w-3.5" />Award Management</TabsTrigger>
          <TabsTrigger value="prequal"><Handshake className="mr-1.5 h-3.5 w-3.5" />Prequalification</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Tender Packages</CardTitle><CardDescription>Scope packages moving through the tender lifecycle</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Package</TableHead><TableHead>Scope / Project</TableHead>
                  <TableHead className="hidden sm:table-cell">Estimate</TableHead>
                  <TableHead className="hidden md:table-cell">Closing</TableHead>
                  <TableHead>Bids</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Workflow</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredPkgs.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell><div className="font-medium">{p.title}</div><div className="text-xs text-muted-foreground">{p.project}</div></TableCell>
                      <TableCell className="hidden text-sm sm:table-cell">BND {(p.estimateBnd / 1000).toFixed(0)}k</TableCell>
                      <TableCell className="hidden text-xs md:table-cell">{p.closing === '—' ? '—' : fmtDate(p.closing)}</TableCell>
                      <TableCell className="text-sm font-semibold">{p.bids}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={pkgColor(p.status)}>{p.status}</Badge>
                        {p.awardedTo && <div className="mt-1 text-[10px] text-muted-foreground">→ {p.awardedTo}</div>}
                      </TableCell>
                      <TableCell className="text-right">
                        {pkgAction[p.status] && (
                          <Button size="sm" variant={p.status === 'Recommended' ? 'default' : 'outline'} onClick={() => advancePkg(p.id)}>
                            {p.status === 'Draft' && <Send className="mr-1 h-3.5 w-3.5" />}
                            {p.status === 'Recommended' && <Trophy className="mr-1 h-3.5 w-3.5" />}
                            {pkgAction[p.status]}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bids">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><CardTitle className="text-base">Bid Comparison</CardTitle><CardDescription>Weighted evaluation — technical 60% · commercial 40%</CardDescription></div>
                <div className="flex gap-1.5">
                  {packages.filter((p) => SEED_BIDS.some((b) => b.packageId === p.id)).map((p) => (
                    <Button key={p.id} size="sm" variant={evalPkg === p.id ? 'default' : 'outline'} onClick={() => setEvalPkg(p.id)}>{p.id}</Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Rank</TableHead><TableHead>Vendor</TableHead><TableHead>Price</TableHead>
                  <TableHead className="hidden sm:table-cell">Duration</TableHead>
                  <TableHead className="hidden md:table-cell">Technical (60%)</TableHead>
                  <TableHead className="hidden md:table-cell">Commercial (40%)</TableHead>
                  <TableHead>Score</TableHead><TableHead>Compliance</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {scored.map((b, i) => (
                    <TableRow key={b.id} className={cn(i === 0 && b.compliant && 'bg-emerald-50/50 dark:bg-emerald-950/20')}>
                      <TableCell className="font-bold">{b.compliant ? `#${i + 1}` : '—'}{i === 0 && b.compliant && <Star className="ml-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />}</TableCell>
                      <TableCell className="font-medium">{b.vendor}</TableCell>
                      <TableCell className="text-sm">BND {(b.priceBnd / 1000).toFixed(0)}k</TableCell>
                      <TableCell className="hidden text-sm sm:table-cell">{b.durationWks} wks</TableCell>
                      <TableCell className="hidden md:table-cell"><div className="flex items-center gap-2"><Progress value={b.technical} className="h-1.5 w-20" /><span className="text-xs">{b.technical}</span></div></TableCell>
                      <TableCell className="hidden md:table-cell"><div className="flex items-center gap-2"><Progress value={b.commercial} className="h-1.5 w-20" /><span className="text-xs">{b.commercial}</span></div></TableCell>
                      <TableCell className="text-sm font-bold">{b.total}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={b.compliant ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400' : 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'}>
                          {b.compliant ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Award Management</CardTitle><CardDescription>Recommendations pending approval and awarded contracts</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {packages.filter((p) => p.status === 'Recommended' || p.status === 'Awarded').map((p) => {
                const winner = SEED_BIDS.filter((b) => b.packageId === p.id && b.compliant).sort((a, b) => (b.technical * 0.6 + b.commercial * 0.4) - (a.technical * 0.6 + a.commercial * 0.4))[0]
                return (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                    <div>
                      <div className="font-medium">{p.title} <span className="font-mono text-xs text-muted-foreground">({p.id})</span></div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {p.status === 'Awarded'
                          ? <>Awarded to <span className="font-semibold text-foreground">{p.awardedTo}</span></>
                          : winner
                            ? <>Recommended: <span className="font-semibold text-foreground">{winner.vendor}</span> · BND {(winner.priceBnd / 1000).toFixed(0)}k</>
                            : 'Awaiting evaluation'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={pkgColor(p.status)}>{p.status}</Badge>
                      {p.status === 'Recommended' && (
                        <Button size="sm" onClick={() => advancePkg(p.id)}><Trophy className="mr-1 h-3.5 w-3.5" />Approve Award</Button>
                      )}
                      {p.status === 'Awarded' && (
                        <Button size="sm" variant="outline"><FileText className="mr-1 h-3.5 w-3.5" />Letter of Award</Button>
                      )}
                    </div>
                  </div>
                )
              })}
              {packages.every((p) => p.status !== 'Recommended' && p.status !== 'Awarded') && (
                <p className="py-8 text-center text-sm text-muted-foreground">No recommendations or awards yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prequal">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Vendor Prequalification</CardTitle><CardDescription>Contractor registration, grading and approval</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Vendor</TableHead><TableHead>Trade</TableHead>
                  <TableHead className="hidden sm:table-cell">Grade</TableHead>
                  <TableHead className="hidden md:table-cell">Experience</TableHead>
                  <TableHead className="hidden lg:table-cell">Safety</TableHead>
                  <TableHead className="hidden lg:table-cell">Financial</TableHead>
                  <TableHead>Status</TableHead><TableHead className="text-right">Decision</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {vendors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell><div className="font-medium">{v.name}</div><div className="font-mono text-xs text-muted-foreground">{v.id}</div></TableCell>
                      <TableCell className="text-sm">{v.trade}</TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="font-normal">{v.grade}</Badge></TableCell>
                      <TableCell className="hidden text-sm md:table-cell"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{v.yearsActive} yrs</span></TableCell>
                      <TableCell className="hidden lg:table-cell"><div className="flex items-center gap-2"><Progress value={v.safetyScore} className="h-1.5 w-16" /><span className="text-xs">{v.safetyScore}</span></div></TableCell>
                      <TableCell className="hidden lg:table-cell"><div className="flex items-center gap-2"><Progress value={v.financialScore} className="h-1.5 w-16" /><span className="text-xs">{v.financialScore}</span></div></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          v.status === 'Approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : v.status === 'Rejected' ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
                          : 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                        }>{v.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {v.status === 'Pending' && (
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" onClick={() => setVendorStatus(v.id, 'Approved')}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Approve</Button>
                            <Button size="sm" variant="ghost" onClick={() => setVendorStatus(v.id, 'Rejected')}><XCircle className="h-3.5 w-3.5" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
