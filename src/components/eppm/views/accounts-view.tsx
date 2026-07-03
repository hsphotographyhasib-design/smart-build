'use client'

// Accounts — AR/AP invoicing with approval + payment workflow and aging.
// Recording a payment against an invoice writes the payment ledger entry.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, ReceiptText, CreditCard, CheckCircle2, Banknote, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

type InvStatus = 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Overdue'
interface Invoice {
  id: string; direction: 'AR' | 'AP'; party: string; project: string
  amountBnd: number; issued: string; due: string; status: InvStatus
}
interface Payment {
  id: string; invoiceId: string; party: string; amountBnd: number; date: string; method: 'Bank Transfer' | 'Cheque'
}

const TODAY = '2026-07-03'
const SEED_INVOICES: Invoice[] = [
  { id: 'INV-AR-0341', direction: 'AR', party: 'Public Works Department', project: 'Gov Complex AMC', amountBnd: 60000, issued: '2026-06-30', due: '2026-07-30', status: 'Submitted' },
  { id: 'INV-AR-0340', direction: 'AR', party: 'Baiduri Bank', project: 'HQ Tower AMC — Q2', amountBnd: 46500, issued: '2026-06-28', due: '2026-07-28', status: 'Approved' },
  { id: 'INV-AR-0338', direction: 'AR', party: 'Times Square Group', project: 'Progress Claim 14 — Mall Works', amountBnd: 182000, issued: '2026-05-31', due: '2026-06-30', status: 'Overdue' },
  { id: 'INV-AR-0335', direction: 'AR', party: 'Ministry of Education', project: 'Rimba School — Final Account', amountBnd: 94000, issued: '2026-05-15', due: '2026-06-14', status: 'Paid' },
  { id: 'INV-AP-1108', direction: 'AP', party: 'Sumbangsih Steel', project: 'PO-2199 — Rebar supply', amountBnd: 38400, issued: '2026-07-01', due: '2026-07-31', status: 'Submitted' },
  { id: 'INV-AP-1107', direction: 'AP', party: 'Delta Electric JV', project: 'PO-2204 — Cable & containment', amountBnd: 64200, issued: '2026-06-26', due: '2026-07-26', status: 'Approved' },
  { id: 'INV-AP-1104', direction: 'AP', party: 'BruScaff Services', project: 'PO-2210 — Scaffold hire', amountBnd: 6170, issued: '2026-06-20', due: '2026-06-27', status: 'Overdue' },
  { id: 'INV-AP-1101', direction: 'AP', party: 'Hanchi Distribution', project: 'PO-2206 — Waterproofing', amountBnd: 12400, issued: '2026-06-16', due: '2026-07-01', status: 'Paid' },
]

const SEED_PAYMENTS: Payment[] = [
  { id: 'PAY-0788', invoiceId: 'INV-AR-0335', party: 'Ministry of Education', amountBnd: 94000, date: '2026-06-12', method: 'Bank Transfer' },
  { id: 'PAY-0787', invoiceId: 'INV-AP-1101', party: 'Hanchi Distribution', amountBnd: 12400, date: '2026-06-30', method: 'Bank Transfer' },
  { id: 'PAY-0786', invoiceId: 'INV-AP-1095', party: 'CoolAir Contracting', amountBnd: 8900, date: '2026-06-18', method: 'Cheque' },
]

export type AccountsFocus = 'invoices' | 'payments'

export default function AccountsView({ focus = 'invoices' }: { onNavigate?: (v: View) => void; focus?: AccountsFocus }) {
  const [tab, setTab] = useState<string>(focus)
  const [invoices, setInvoices] = useState(SEED_INVOICES)
  const [payments, setPayments] = useState(SEED_PAYMENTS)
  const [paySeq, setPaySeq] = useState(789)
  const [dirFilter, setDirFilter] = useState<'All' | 'AR' | 'AP'>('All')
  const [search, setSearch] = useState('')

  useEffect(() => { setTab(focus) }, [focus])

  const approve = (id: string) => setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'Approved' } : i)))
  const recordPayment = (inv: Invoice) => {
    const payId = `PAY-0${paySeq}`
    setPaySeq((n) => n + 1)
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: 'Paid' } : i)))
    setPayments((prev) => [{ id: payId, invoiceId: inv.id, party: inv.party, amountBnd: inv.amountBnd, date: TODAY, method: 'Bank Transfer' }, ...prev])
  }

  const q = search.toLowerCase()
  const filtered = invoices.filter((i) =>
    (dirFilter === 'All' || i.direction === dirFilter) &&
    (!q || [i.id, i.party, i.project].join(' ').toLowerCase().includes(q)))

  const arOutstanding = invoices.filter((i) => i.direction === 'AR' && i.status !== 'Paid').reduce((a, i) => a + i.amountBnd, 0)
  const apOutstanding = invoices.filter((i) => i.direction === 'AP' && i.status !== 'Paid').reduce((a, i) => a + i.amountBnd, 0)
  const overdue = invoices.filter((i) => i.status === 'Overdue')

  const invColor = (s: InvStatus) =>
    s === 'Paid' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
    : s === 'Approved' ? 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900'
    : s === 'Overdue' ? 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'
    : s === 'Submitted' ? 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
    : 'text-muted-foreground bg-muted border-border'

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ReceiptText className="h-6 w-6 text-primary" /> Accounts</h1>
            <p className="text-sm text-muted-foreground">AR / AP invoicing, approvals and payment certificates</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'AR Outstanding', value: `BND ${(arOutstanding / 1000).toFixed(0)}k`, icon: TrendingUp, tone: 'text-emerald-600' },
            { label: 'AP Outstanding', value: `BND ${(apOutstanding / 1000).toFixed(0)}k`, icon: TrendingDown, tone: 'text-amber-600' },
            { label: 'Overdue Invoices', value: overdue.length, icon: AlertTriangle, tone: 'text-rose-600' },
            { label: 'Payments MTD', value: payments.filter((p) => p.date >= '2026-07-01').length, icon: Banknote, tone: 'text-sky-600' },
          ].map((k) => (
            <Card key={k.label}><CardContent className="flex items-center gap-3 p-4">
              <k.icon className={cn('h-8 w-8 shrink-0 rounded-lg bg-muted p-1.5', k.tone)} />
              <div><div className="text-xl font-bold leading-none">{k.value}</div><div className="mt-1 text-[11px] text-muted-foreground">{k.label}</div></div>
            </CardContent></Card>
          ))}
        </div>
      </FadeIn>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices"><ReceiptText className="mr-1.5 h-3.5 w-3.5" />Invoices</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="mr-1.5 h-3.5 w-3.5" />Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div><CardTitle className="text-base">Invoice Register</CardTitle><CardDescription>Receivables (AR) and payables (AP) with approval workflow</CardDescription></div>
              <Select value={dirFilter} onValueChange={(v) => setDirFilter(v as typeof dirFilter)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">AR + AP</SelectItem>
                  <SelectItem value="AR">AR — Receivables</SelectItem>
                  <SelectItem value="AP">AP — Payables</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Invoice</TableHead><TableHead>Party / Reference</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Due</TableHead>
                  <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Workflow</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                      <TableCell><div className="font-medium">{inv.party}</div><div className="text-xs text-muted-foreground">{inv.project}</div></TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={inv.direction === 'AR' ? 'border-emerald-200 text-emerald-600 dark:border-emerald-900 dark:text-emerald-400' : 'border-amber-200 text-amber-600 dark:border-amber-900 dark:text-amber-400'}>{inv.direction}</Badge>
                      </TableCell>
                      <TableCell className={cn('hidden text-xs md:table-cell', inv.status === 'Overdue' && 'font-semibold text-rose-600')}>{fmtDate(inv.due)}</TableCell>
                      <TableCell className="text-sm font-semibold">BND {(inv.amountBnd / 1000).toFixed(1)}k</TableCell>
                      <TableCell><Badge variant="outline" className={invColor(inv.status)}>{inv.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {inv.status === 'Submitted' && <Button size="sm" variant="outline" onClick={() => approve(inv.id)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Approve</Button>}
                          {(inv.status === 'Approved' || inv.status === 'Overdue') && (
                            <Button size="sm" onClick={() => recordPayment(inv)}><Banknote className="mr-1 h-3.5 w-3.5" />{inv.direction === 'AR' ? 'Record Receipt' : 'Pay'}</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Payment Ledger</CardTitle><CardDescription>Receipts and disbursements recorded against invoices</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Payment</TableHead><TableHead className="hidden sm:table-cell">Invoice</TableHead>
                  <TableHead>Party</TableHead><TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Method</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell className="hidden font-mono text-xs sm:table-cell">{p.invoiceId}</TableCell>
                      <TableCell className="text-sm font-medium">{p.party}</TableCell>
                      <TableCell className="text-sm font-semibold">BND {(p.amountBnd / 1000).toFixed(1)}k</TableCell>
                      <TableCell className="hidden text-xs sm:table-cell">{fmtDate(p.date)}</TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant="outline" className="font-normal">{p.method}</Badge></TableCell>
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
