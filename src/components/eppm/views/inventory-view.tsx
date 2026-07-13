'use client'

// Inventory — stock levels with reorder alerts, warehouse utilisation, and a
// movements ledger. Issue/receive actions adjust on-hand quantities live.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Search, Package, Warehouse, PackageCheck, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, DollarSign } from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

interface StockItem {
  id: string; name: string; category: string; warehouse: string; uom: string
  onHand: number; reorderPoint: number; unitCostBnd: number
}
interface Movement {
  id: string; date: string; item: string; type: 'Issue' | 'Receipt' | 'Transfer' | 'Return'
  qty: number; from: string; to: string; ref: string
}

const SEED_STOCK: StockItem[] = [
  { id: 'MAT-0101', name: 'Portland Cement 50kg', category: 'Civil', warehouse: 'Main Yard', uom: 'bag', onHand: 640, reorderPoint: 400, unitCostBnd: 9.8 },
  { id: 'MAT-0117', name: 'Rebar Y16 — 12m', category: 'Civil', warehouse: 'Main Yard', uom: 'pc', onHand: 210, reorderPoint: 300, unitCostBnd: 28.5 },
  { id: 'MAT-0230', name: 'Copper Cable 4C x 16mm²', category: 'Electrical', warehouse: 'M&E Store', uom: 'm', onHand: 1850, reorderPoint: 1000, unitCostBnd: 6.2 },
  { id: 'MAT-0244', name: 'LED Panel Light 600x600', category: 'Electrical', warehouse: 'M&E Store', uom: 'pc', onHand: 46, reorderPoint: 60, unitCostBnd: 42 },
  { id: 'MAT-0312', name: 'R-410A Refrigerant 11.3kg', category: 'HVAC', warehouse: 'M&E Store', uom: 'cyl', onHand: 14, reorderPoint: 8, unitCostBnd: 185 },
  { id: 'MAT-0355', name: 'uPVC Pipe 100mm — 5.8m', category: 'Plumbing', warehouse: 'Main Yard', uom: 'pc', onHand: 96, reorderPoint: 50, unitCostBnd: 18.4 },
  { id: 'MAT-0410', name: 'Sprinkler Head 68°C', category: 'Fire Protection', warehouse: 'M&E Store', uom: 'pc', onHand: 12, reorderPoint: 40, unitCostBnd: 8.9 },
  { id: 'MAT-0428', name: 'Hanchi Waterproof Membrane 20L', category: 'Waterproofing', warehouse: 'Main Yard', uom: 'pail', onHand: 58, reorderPoint: 30, unitCostBnd: 96 },
]

const WAREHOUSES = [
  { id: 'WH-01', name: 'Main Yard — Kilanas', keeper: 'Rahim Bakar', bins: 240, used: 186, valueBnd: 412000 },
  { id: 'WH-02', name: 'M&E Store — Gadong', keeper: 'Hafiz Omar', bins: 120, used: 97, valueBnd: 268000 },
  { id: 'WH-03', name: 'Site Store — Muara', keeper: 'Site Clerk', bins: 60, used: 22, valueBnd: 54000 },
]

const SEED_MOVES: Movement[] = [
  { id: 'MV-3121', date: '2026-07-02', item: 'Portland Cement 50kg', type: 'Issue', qty: 80, from: 'Main Yard', to: 'Gadong Residences', ref: 'MR-0871' },
  { id: 'MV-3120', date: '2026-07-02', item: 'Copper Cable 4C x 16mm²', type: 'Issue', qty: 250, from: 'M&E Store', to: 'Baiduri HQ Retrofit', ref: 'MR-0870' },
  { id: 'MV-3119', date: '2026-07-01', item: 'Rebar Y16 — 12m', type: 'Receipt', qty: 150, from: 'Sumbangsih Steel', to: 'Main Yard', ref: 'GRN-2044' },
  { id: 'MV-3117', date: '2026-06-30', item: 'LED Panel Light 600x600', type: 'Transfer', qty: 20, from: 'M&E Store', to: 'Site Store — Muara', ref: 'TR-0142' },
  { id: 'MV-3115', date: '2026-06-28', item: 'uPVC Pipe 100mm — 5.8m', type: 'Return', qty: 12, from: 'Seria Road Works', to: 'Main Yard', ref: 'RT-0087' },
]

export type InventoryFocus = 'stock' | 'warehouses' | 'stock-movements'
const FOCUS_TAB: Record<InventoryFocus, string> = { stock: 'stock', warehouses: 'warehouses', 'stock-movements': 'movements' }

export default function InventoryView({ focus = 'stock' }: { onNavigate?: (v: View) => void; focus?: InventoryFocus }) {
  const [tab, setTab] = useState(FOCUS_TAB[focus])
  const [stock, setStock] = useState(SEED_STOCK)
  const [moves, setMoves] = useState(SEED_MOVES)
  const [seq, setSeq] = useState(3122)
  const [search, setSearch] = useState('')

  useEffect(() => { setTab(FOCUS_TAB[focus]) }, [focus])

  const q = search.toLowerCase()
  const fStock = stock.filter((s) => !q || [s.id, s.name, s.category, s.warehouse].join(' ').toLowerCase().includes(q))
  const lowStock = stock.filter((s) => s.onHand < s.reorderPoint)
  const stockValue = stock.reduce((a, s) => a + s.onHand * s.unitCostBnd, 0)

  const move = (item: StockItem, type: 'Issue' | 'Receipt') => {
    const qty = type === 'Issue' ? Math.min(25, item.onHand) : 100
    if (type === 'Issue' && qty === 0) return
    setStock((prev) => prev.map((s) => (s.id === item.id ? { ...s, onHand: s.onHand + (type === 'Receipt' ? qty : -qty) } : s)))
    setMoves((prev) => [{
      id: `MV-${seq}`, date: '2026-07-03', item: item.name, type, qty,
      from: type === 'Issue' ? item.warehouse : 'Supplier', to: type === 'Issue' ? 'Site' : item.warehouse,
      ref: type === 'Issue' ? `MR-${seq}` : `GRN-${seq}`,
    }, ...prev])
    setSeq((n) => n + 1)
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Inventory Management</h1>
            <p className="text-sm text-muted-foreground">Stock control across warehouses and project sites</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Stock Lines', value: stock.length, icon: Package, tone: 'text-sky-700' },
            { label: 'Below Reorder Point', value: lowStock.length, icon: AlertTriangle, tone: 'text-rose-700' },
            { label: 'Warehouses', value: WAREHOUSES.length, icon: Warehouse, tone: 'text-violet-600' },
            { label: 'Stock Value', value: `BND ${(stockValue / 1000).toFixed(0)}k`, icon: DollarSign, tone: 'text-emerald-700' },
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
          <TabsTrigger value="stock"><Package className="mr-1.5 h-3.5 w-3.5" />Stock
            {lowStock.length > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">{lowStock.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="warehouses"><Warehouse className="mr-1.5 h-3.5 w-3.5" />Warehouses</TabsTrigger>
          <TabsTrigger value="movements"><PackageCheck className="mr-1.5 h-3.5 w-3.5" />Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Stock Levels</CardTitle><CardDescription>On-hand vs reorder point — issue to site or receive from suppliers</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Material</TableHead><TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Warehouse</TableHead>
                  <TableHead>On Hand</TableHead><TableHead className="hidden lg:table-cell">Reorder Pt</TableHead>
                  <TableHead className="hidden lg:table-cell">Value</TableHead>
                  <TableHead>Level</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {fStock.map((s) => {
                    const low = s.onHand < s.reorderPoint
                    const pct = Math.min(100, Math.round((s.onHand / (s.reorderPoint * 2)) * 100))
                    return (
                      <TableRow key={s.id}>
                        <TableCell><div className="font-medium">{s.name}</div><div className="font-mono text-xs text-muted-foreground">{s.id}</div></TableCell>
                        <TableCell className="hidden md:table-cell"><Badge variant="outline" className="font-normal">{s.category}</Badge></TableCell>
                        <TableCell className="hidden text-sm sm:table-cell">{s.warehouse}</TableCell>
                        <TableCell className={cn('font-semibold', low && 'text-rose-700')}>{s.onHand} {s.uom}</TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{s.reorderPoint} {s.uom}</TableCell>
                        <TableCell className="hidden text-sm lg:table-cell">BND {(s.onHand * s.unitCostBnd / 1000).toFixed(1)}k</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className={cn('h-1.5 w-16', low && '[&>div]:bg-rose-500')} />
                            {low && <Badge variant="outline" className="border-rose-200 bg-rose-50 text-[10px] text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400">Low</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" disabled={s.onHand === 0} onClick={() => move(s, 'Issue')}><ArrowUpFromLine className="mr-1 h-3.5 w-3.5" />Issue</Button>
                            <Button size="sm" variant={low ? 'default' : 'outline'} onClick={() => move(s, 'Receipt')}><ArrowDownToLine className="mr-1 h-3.5 w-3.5" />Receive</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <div className="grid gap-4 md:grid-cols-3">
            {WAREHOUSES.map((w) => {
              const pct = Math.round((w.used / w.bins) * 100)
              return (
                <Card key={w.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base"><Warehouse className="h-4 w-4 text-primary" />{w.name}</CardTitle>
                    <CardDescription>{w.id} · Storekeeper: {w.keeper}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Bin utilisation</span><span>{w.used}/{w.bins} ({pct}%)</span></div>
                      <Progress value={pct} className={cn('h-2', pct > 85 && '[&>div]:bg-amber-500')} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Stock value</span>
                      <span className="font-semibold">BND {(w.valueBnd / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stock.filter((s) => s.warehouse.startsWith(w.name.split(' — ')[0])).length} stock lines held here
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Stock Movements</CardTitle><CardDescription>Issues, receipts, transfers and returns ledger</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Ref</TableHead><TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Material</TableHead><TableHead>Type</TableHead><TableHead>Qty</TableHead>
                  <TableHead className="hidden md:table-cell">From → To</TableHead>
                  <TableHead className="hidden lg:table-cell">Document</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {moves.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.id}</TableCell>
                      <TableCell className="hidden text-xs sm:table-cell">{fmtDate(m.date)}</TableCell>
                      <TableCell className="text-sm font-medium">{m.item}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          m.type === 'Receipt' || m.type === 'Return' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : m.type === 'Transfer' ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400'
                          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                        }>{m.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm font-semibold">{m.qty}</TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{m.from} → {m.to}</TableCell>
                      <TableCell className="hidden font-mono text-xs lg:table-cell">{m.ref}</TableCell>
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
