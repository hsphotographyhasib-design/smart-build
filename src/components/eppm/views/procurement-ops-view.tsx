'use client'

// Procurement Operations — the purchase-to-receipt chain:
// PR (approve) → PO (issue → acknowledge → deliver) → GRN, plus supplier master.
// Approving a PR creates its PO; receiving a PO writes a GRN. Shared state.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, ClipboardList, ShoppingCart, Handshake, PackageCheck, CheckCircle2, XCircle, Star, Send, Truck } from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

type PrStatus = 'Pending Approval' | 'Approved' | 'Rejected'
interface PurchaseRequest {
  id: string; title: string; project: string; requestor: string; needBy: string
  amountBnd: number; status: PrStatus; poId?: string
}
type PoStatus = 'Issued' | 'Acknowledged' | 'Delivered' | 'Closed'
interface PurchaseOrder {
  id: string; prId: string; supplier: string; title: string; amountBnd: number
  issued: string; eta: string; status: PoStatus; grnId?: string
}
interface Grn {
  id: string; poId: string; supplier: string; received: string; items: string; result: 'Accepted' | 'Partial' | 'Rejected'
}
interface Supplier {
  id: string; name: string; category: string; rating: number; onTimePct: number
  openPos: number; spendYtdBnd: number
}

const SEED_PRS: PurchaseRequest[] = [
  { id: 'PR-0912', title: 'Rebar Y16 & Y20 — 24 t', project: 'Gadong Residences', requestor: 'Lim Wei Ming', needBy: '2026-07-15', amountBnd: 41800, status: 'Pending Approval' },
  { id: 'PR-0911', title: 'Sprinkler heads & valves restock', project: 'Maintenance Stores', requestor: 'Siti Aminah', needBy: '2026-07-12', amountBnd: 6300, status: 'Pending Approval' },
  { id: 'PR-0910', title: 'Scaffold hire — 3 months extension', project: 'Muara Warehouse', requestor: 'Jane Smith', needBy: '2026-07-08', amountBnd: 18500, status: 'Approved', poId: 'PO-2210' },
  { id: 'PR-0908', title: 'Office IT equipment refresh', project: 'Head Office', requestor: 'Admin', needBy: '2026-07-30', amountBnd: 9400, status: 'Rejected' },
]

const SEED_POS: PurchaseOrder[] = [
  { id: 'PO-2210', prId: 'PR-0910', supplier: 'BruScaff Services', title: 'Scaffold hire — 3 months extension', amountBnd: 18500, issued: '2026-06-28', eta: '2026-07-05', status: 'Acknowledged' },
  { id: 'PO-2208', prId: 'PR-0905', supplier: 'Sumbangsih Steel', title: 'Structural steel — warehouse portal frames', amountBnd: 226000, issued: '2026-06-20', eta: '2026-07-18', status: 'Issued' },
  { id: 'PO-2206', prId: 'PR-0902', supplier: 'Hanchi Distribution', title: 'Waterproofing membrane & sealants', amountBnd: 12400, issued: '2026-06-15', eta: '2026-06-30', status: 'Delivered', grnId: 'GRN-2043' },
  { id: 'PO-2204', prId: 'PR-0899', supplier: 'Delta Electric JV', title: 'Cable & containment — Level 5-8', amountBnd: 64200, issued: '2026-06-08', eta: '2026-06-25', status: 'Closed', grnId: 'GRN-2040' },
]

const SEED_GRNS: Grn[] = [
  { id: 'GRN-2044', poId: 'PO-2199', supplier: 'Sumbangsih Steel', received: '2026-07-01', items: 'Rebar Y16 — 150 pcs', result: 'Accepted' },
  { id: 'GRN-2043', poId: 'PO-2206', supplier: 'Hanchi Distribution', received: '2026-06-30', items: 'Membrane 40 pails, sealant 120 tubes', result: 'Accepted' },
  { id: 'GRN-2041', poId: 'PO-2203', supplier: 'CoolAir Contracting', received: '2026-06-24', items: 'AHU filters — 2 of 6 cartons damaged', result: 'Partial' },
  { id: 'GRN-2040', poId: 'PO-2204', supplier: 'Delta Electric JV', received: '2026-06-24', items: 'Cable drums & trunking, complete', result: 'Accepted' },
]

const SEED_SUPPLIERS: Supplier[] = [
  { id: 'SUP-021', name: 'Sumbangsih Steel', category: 'Steel & Rebar', rating: 4.6, onTimePct: 94, openPos: 2, spendYtdBnd: 486000 },
  { id: 'SUP-014', name: 'Hanchi Distribution', category: 'Waterproofing & Chemicals', rating: 4.8, onTimePct: 98, openPos: 0, spendYtdBnd: 74000 },
  { id: 'SUP-032', name: 'Delta Electric JV', category: 'Electrical', rating: 4.3, onTimePct: 88, openPos: 1, spendYtdBnd: 212000 },
  { id: 'SUP-008', name: 'BruScaff Services', category: 'Scaffolding & Access', rating: 4.1, onTimePct: 85, openPos: 1, spendYtdBnd: 63000 },
  { id: 'SUP-027', name: 'CoolAir Contracting', category: 'HVAC', rating: 3.4, onTimePct: 71, openPos: 0, spendYtdBnd: 39000 },
]

export type ProcureFocus = 'purchase-requests' | 'purchase-orders' | 'suppliers' | 'goods-receipt'
const FOCUS_TAB: Record<ProcureFocus, string> = {
  'purchase-requests': 'prs', 'purchase-orders': 'pos', suppliers: 'suppliers', 'goods-receipt': 'grns',
}

export default function ProcurementOpsView({ focus = 'purchase-requests' }: { onNavigate?: (v: View) => void; focus?: ProcureFocus }) {
  const [tab, setTab] = useState(FOCUS_TAB[focus])
  const [prs, setPrs] = useState(SEED_PRS)
  const [pos, setPos] = useState(SEED_POS)
  const [grns, setGrns] = useState(SEED_GRNS)
  const [poSeq, setPoSeq] = useState(2211)
  const [grnSeq, setGrnSeq] = useState(2045)
  const [search, setSearch] = useState('')

  useEffect(() => { setTab(FOCUS_TAB[focus]) }, [focus])

  const approvePr = (pr: PurchaseRequest) => {
    const poId = `PO-${poSeq}`
    setPoSeq((n) => n + 1)
    setPrs((prev) => prev.map((p) => (p.id === pr.id ? { ...p, status: 'Approved', poId } : p)))
    setPos((prev) => [{ id: poId, prId: pr.id, supplier: 'To be assigned', title: pr.title, amountBnd: pr.amountBnd, issued: '2026-07-03', eta: pr.needBy, status: 'Issued' }, ...prev])
  }
  const rejectPr = (id: string) => setPrs((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)))

  const advancePo = (po: PurchaseOrder) => {
    if (po.status === 'Issued') {
      setPos((prev) => prev.map((p) => (p.id === po.id ? { ...p, status: 'Acknowledged' } : p)))
    } else if (po.status === 'Acknowledged') {
      const grnId = `GRN-${grnSeq}`
      setGrnSeq((n) => n + 1)
      setPos((prev) => prev.map((p) => (p.id === po.id ? { ...p, status: 'Delivered', grnId } : p)))
      setGrns((prev) => [{ id: grnId, poId: po.id, supplier: po.supplier, received: '2026-07-03', items: po.title, result: 'Accepted' }, ...prev])
    } else if (po.status === 'Delivered') {
      setPos((prev) => prev.map((p) => (p.id === po.id ? { ...p, status: 'Closed' } : p)))
    }
  }

  const q = search.toLowerCase()
  const pendingPrs = prs.filter((p) => p.status === 'Pending Approval')

  const prColor = (s: PrStatus) =>
    s === 'Approved' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
    : s === 'Rejected' ? 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'
    : 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
  const poColor = (s: PoStatus) =>
    s === 'Closed' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
    : s === 'Delivered' ? 'text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950/50 dark:border-teal-900'
    : s === 'Acknowledged' ? 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900'
    : 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/50 dark:border-violet-900'
  const poAction: Record<PoStatus, { label: string; icon: typeof Send } | null> = {
    Issued: { label: 'Acknowledge', icon: CheckCircle2 },
    Acknowledged: { label: 'Receive (GRN)', icon: Truck },
    Delivered: { label: 'Close PO', icon: PackageCheck },
    Closed: null,
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-primary" /> Procurement Operations</h1>
            <p className="text-sm text-muted-foreground">Purchase request → approval → purchase order → goods receipt</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search PRs, POs, suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Pending Approvals', value: pendingPrs.length, icon: ClipboardList, tone: 'text-amber-600' },
            { label: 'Open POs', value: pos.filter((p) => p.status !== 'Closed').length, icon: ShoppingCart, tone: 'text-sky-600' },
            { label: 'GRNs This Month', value: grns.filter((g) => g.received >= '2026-07-01').length, icon: PackageCheck, tone: 'text-emerald-600' },
            { label: 'Active Suppliers', value: SEED_SUPPLIERS.length, icon: Handshake, tone: 'text-violet-600' },
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
          <TabsTrigger value="prs"><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Purchase Requests
            {pendingPrs.length > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{pendingPrs.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="pos"><ShoppingCart className="mr-1.5 h-3.5 w-3.5" />Purchase Orders</TabsTrigger>
          <TabsTrigger value="grns"><PackageCheck className="mr-1.5 h-3.5 w-3.5" />Goods Receipt</TabsTrigger>
          <TabsTrigger value="suppliers"><Handshake className="mr-1.5 h-3.5 w-3.5" />Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="prs">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Purchase Requests</CardTitle><CardDescription>Approving a PR raises its purchase order automatically</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>PR</TableHead><TableHead>Request</TableHead>
                  <TableHead className="hidden md:table-cell">Requestor</TableHead>
                  <TableHead className="hidden sm:table-cell">Need By</TableHead>
                  <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Approval</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {prs.filter((p) => !q || [p.id, p.title, p.project, p.requestor].join(' ').toLowerCase().includes(q)).map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell className="font-mono text-xs">{pr.id}</TableCell>
                      <TableCell><div className="font-medium">{pr.title}</div><div className="text-xs text-muted-foreground">{pr.project}</div></TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{pr.requestor}</TableCell>
                      <TableCell className="hidden text-xs sm:table-cell">{fmtDate(pr.needBy)}</TableCell>
                      <TableCell className="text-sm font-semibold">BND {(pr.amountBnd / 1000).toFixed(1)}k</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={prColor(pr.status)}>{pr.status}</Badge>
                        {pr.poId && <div className="mt-1 font-mono text-[10px] text-muted-foreground">→ {pr.poId}</div>}
                      </TableCell>
                      <TableCell className="text-right">
                        {pr.status === 'Pending Approval' && (
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" onClick={() => approvePr(pr)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Approve → PO</Button>
                            <Button size="sm" variant="ghost" onClick={() => rejectPr(pr.id)}><XCircle className="h-3.5 w-3.5" /></Button>
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

        <TabsContent value="pos">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Purchase Orders</CardTitle><CardDescription>Issue → acknowledge → deliver (writes a GRN) → close</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>PO</TableHead><TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Supplier</TableHead>
                  <TableHead className="hidden sm:table-cell">ETA</TableHead>
                  <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Workflow</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {pos.filter((p) => !q || [p.id, p.title, p.supplier].join(' ').toLowerCase().includes(q)).map((po) => {
                    const action = poAction[po.status]
                    return (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono text-xs">{po.id}<div className="text-[10px] text-muted-foreground">from {po.prId}</div></TableCell>
                        <TableCell className="text-sm font-medium">{po.title}</TableCell>
                        <TableCell className="hidden text-sm md:table-cell">{po.supplier}</TableCell>
                        <TableCell className="hidden text-xs sm:table-cell">{fmtDate(po.eta)}</TableCell>
                        <TableCell className="text-sm font-semibold">BND {(po.amountBnd / 1000).toFixed(1)}k</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={poColor(po.status)}>{po.status}</Badge>
                          {po.grnId && <div className="mt-1 font-mono text-[10px] text-muted-foreground">→ {po.grnId}</div>}
                        </TableCell>
                        <TableCell className="text-right">
                          {action && <Button size="sm" variant={po.status === 'Acknowledged' ? 'default' : 'outline'} onClick={() => advancePo(po)}><action.icon className="mr-1 h-3.5 w-3.5" />{action.label}</Button>}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grns">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Goods Receipt Notes</CardTitle><CardDescription>Deliveries inspected and booked into stores</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>GRN</TableHead><TableHead className="hidden sm:table-cell">PO</TableHead>
                  <TableHead>Supplier</TableHead><TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead className="hidden sm:table-cell">Received</TableHead><TableHead>Result</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {grns.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-mono text-xs">{g.id}</TableCell>
                      <TableCell className="hidden font-mono text-xs sm:table-cell">{g.poId}</TableCell>
                      <TableCell className="text-sm font-medium">{g.supplier}</TableCell>
                      <TableCell className="hidden max-w-[280px] truncate text-xs text-muted-foreground md:table-cell">{g.items}</TableCell>
                      <TableCell className="hidden text-xs sm:table-cell">{fmtDate(g.received)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          g.result === 'Accepted' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : g.result === 'Partial' ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
                        }>{g.result}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Supplier Master</CardTitle><CardDescription>Ratings, delivery performance and YTD spend</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Supplier</TableHead><TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead><TableHead className="hidden sm:table-cell">On-Time %</TableHead>
                  <TableHead className="hidden md:table-cell">Open POs</TableHead><TableHead>Spend YTD</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {SEED_SUPPLIERS.filter((s) => !q || [s.name, s.category].join(' ').toLowerCase().includes(q)).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell><div className="font-medium">{s.name}</div><div className="font-mono text-xs text-muted-foreground">{s.id}</div></TableCell>
                      <TableCell className="text-sm">{s.category}</TableCell>
                      <TableCell><span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{s.rating}</span></TableCell>
                      <TableCell className={cn('hidden text-sm font-semibold sm:table-cell', s.onTimePct >= 90 ? 'text-emerald-600' : s.onTimePct >= 80 ? 'text-amber-600' : 'text-rose-600')}>{s.onTimePct}%</TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{s.openPos}</TableCell>
                      <TableCell className="text-sm font-semibold">BND {(s.spendYtdBnd / 1000).toFixed(0)}k</TableCell>
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
