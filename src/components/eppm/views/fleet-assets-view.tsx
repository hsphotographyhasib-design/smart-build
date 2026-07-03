'use client'

// Fleet & Assets — vehicle fleet (roadtax/insurance/fuel) and the QR-coded
// enterprise asset register with service tracking.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Truck, Boxes, QrCode, Fuel, AlertTriangle, Wrench, CheckCircle2, Archive } from 'lucide-react'
import { fmtDate, type View } from '@/lib/eppm'
import { cn } from '@/lib/utils'
import { FadeIn } from '../motion'

interface Vehicle {
  id: string; plate: string; model: string; type: string; driver: string
  roadTax: string; insurance: string; fuelMtd: number; kmMtd: number
  status: 'In Service' | 'Workshop' | 'Idle'
}
interface Asset {
  id: string; qr: string; name: string; category: string; site: string
  purchased: string; valueBnd: number; condition: 'Good' | 'Fair' | 'Poor'
  nextService: string; status: 'Active' | 'Retired'
}

const TODAY = new Date('2026-07-03T00:00:00Z')
const isPast = (iso: string) => new Date(iso + 'T00:00:00Z') < TODAY
const soon = (iso: string, days = 45) => {
  const d = new Date(iso + 'T00:00:00Z')
  return d >= TODAY && (d.getTime() - TODAY.getTime()) / 86400000 <= days
}

const SEED_VEHICLES: Vehicle[] = [
  { id: 'VH-01', plate: 'BAG 1275', model: 'Toyota Hilux 2.8', type: 'Pickup', driver: 'Rahim Bakar', roadTax: '2026-11-30', insurance: '2026-11-30', fuelMtd: 182, kmMtd: 1420, status: 'In Service' },
  { id: 'VH-02', plate: 'BAG 3348', model: 'Isuzu NPR Crane Truck', type: 'Crane Truck', driver: 'Pool', roadTax: '2026-08-15', insurance: '2026-08-15', fuelMtd: 431, kmMtd: 980, status: 'In Service' },
  { id: 'VH-03', plate: 'KB 8821', model: 'Mitsubishi Fuso Tipper', type: 'Tipper', driver: 'Pool', roadTax: '2026-07-20', insurance: '2026-07-31', fuelMtd: 596, kmMtd: 1730, status: 'In Service' },
  { id: 'VH-04', plate: 'BAG 5512', model: 'Toyota Hiace Van', type: 'Crew Van', driver: 'Azlan Rahman', roadTax: '2026-06-30', insurance: '2026-09-30', fuelMtd: 204, kmMtd: 1610, status: 'In Service' },
  { id: 'VH-05', plate: 'BAG 7793', model: 'JCB 3CX Backhoe', type: 'Plant', driver: '—', roadTax: '2027-01-31', insurance: '2027-01-31', fuelMtd: 322, kmMtd: 0, status: 'Workshop' },
  { id: 'VH-06', plate: 'BAG 2216', model: 'Nissan Navara', type: 'Pickup', driver: 'Pool', roadTax: '2026-12-31', insurance: '2026-12-31', fuelMtd: 96, kmMtd: 640, status: 'Idle' },
]

const SEED_ASSETS: Asset[] = [
  { id: 'AST-1001', qr: 'QR-CH-GC-01', name: 'Chiller 1 — 450RT', category: 'HVAC Plant', site: 'Gov Complex', purchased: '2019-03-15', valueBnd: 380000, condition: 'Good', nextService: '2026-09-28', status: 'Active' },
  { id: 'AST-1002', qr: 'QR-CH-GC-02', name: 'Chiller 2 — 450RT', category: 'HVAC Plant', site: 'Gov Complex', purchased: '2019-03-15', valueBnd: 380000, condition: 'Fair', nextService: '2026-06-28', status: 'Active' },
  { id: 'AST-1044', qr: 'QR-GEN-BB-01', name: 'Standby Generator 800kVA', category: 'Power', site: 'Baiduri HQ Tower', purchased: '2020-08-02', valueBnd: 210000, condition: 'Good', nextService: '2026-08-05', status: 'Active' },
  { id: 'AST-1078', qr: 'QR-LIFT-BB-02', name: 'Passenger Lift 2 — 1600kg', category: 'Vertical Transport', site: 'Baiduri HQ Tower', purchased: '2017-11-20', valueBnd: 165000, condition: 'Fair', nextService: '2026-07-15', status: 'Active' },
  { id: 'AST-1102', qr: 'QR-FP-TS-01', name: 'Fire Pump Set — Electric + Diesel', category: 'Fire Protection', site: 'Times Square Mall', purchased: '2018-05-30', valueBnd: 96000, condition: 'Good', nextService: '2026-08-01', status: 'Active' },
  { id: 'AST-1130', qr: 'QR-TWCR-GR-01', name: 'Tower Crane — Potain MC 175', category: 'Construction Plant', site: 'Gadong Residences', purchased: '2015-02-14', valueBnd: 540000, condition: 'Poor', nextService: '2026-07-01', status: 'Active' },
  { id: 'AST-0967', qr: 'QR-COMP-OLD-3', name: 'Air Compressor 185cfm', category: 'Construction Plant', site: 'Yard', purchased: '2012-06-01', valueBnd: 28000, condition: 'Poor', nextService: '—', status: 'Retired' },
]

export type FleetFocus = 'vehicles' | 'assets'

export default function FleetAssetsView({ focus = 'vehicles' }: { onNavigate?: (v: View) => void; focus?: FleetFocus }) {
  const [tab, setTab] = useState<string>(focus)
  const [vehicles, setVehicles] = useState(SEED_VEHICLES)
  const [assets, setAssets] = useState(SEED_ASSETS)
  const [search, setSearch] = useState('')

  useEffect(() => { setTab(focus) }, [focus])

  const q = search.toLowerCase()
  const fVehicles = vehicles.filter((v) => !q || [v.plate, v.model, v.driver, v.type].join(' ').toLowerCase().includes(q))
  const fAssets = assets.filter((a) => !q || [a.id, a.qr, a.name, a.site, a.category].join(' ').toLowerCase().includes(q))

  const expiringDocs = vehicles.filter((v) => isPast(v.roadTax) || soon(v.roadTax) || isPast(v.insurance) || soon(v.insurance)).length
  const serviceDue = assets.filter((a) => a.status === 'Active' && a.nextService !== '—' && isPast(a.nextService)).length

  const toggleWorkshop = (id: string) =>
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status: v.status === 'Workshop' ? 'In Service' : 'Workshop' } : v)))
  const markServiced = (id: string) =>
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, nextService: '2026-10-03', condition: a.condition === 'Poor' ? 'Fair' : a.condition } : a)))
  const retireAsset = (id: string) =>
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Retired' } : a)))

  const docBadge = (iso: string) => (
    <span className={cn('text-xs', isPast(iso) ? 'font-semibold text-rose-600' : soon(iso) ? 'font-semibold text-amber-600' : 'text-muted-foreground')}>
      {fmtDate(iso)}{isPast(iso) ? ' · expired' : soon(iso) ? ' · soon' : ''}
    </span>
  )

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Boxes className="h-6 w-6 text-primary" /> Fleet & Asset Management</h1>
            <p className="text-sm text-muted-foreground">Vehicle fleet, plant and the QR-coded asset register</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search plate, asset, QR..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Fleet Vehicles', value: vehicles.length, icon: Truck, tone: 'text-sky-600' },
            { label: 'Docs Expiring', value: expiringDocs, icon: AlertTriangle, tone: 'text-amber-600' },
            { label: 'Registered Assets', value: assets.filter((a) => a.status === 'Active').length, icon: QrCode, tone: 'text-violet-600' },
            { label: 'Service Overdue', value: serviceDue, icon: Wrench, tone: 'text-rose-600' },
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
          <TabsTrigger value="vehicles"><Truck className="mr-1.5 h-3.5 w-3.5" />Vehicles</TabsTrigger>
          <TabsTrigger value="assets"><QrCode className="mr-1.5 h-3.5 w-3.5" />Asset Register</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Vehicle Fleet</CardTitle><CardDescription>Road tax, insurance and month-to-date fuel & mileage</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Vehicle</TableHead><TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Driver</TableHead>
                  <TableHead>Road Tax</TableHead><TableHead className="hidden lg:table-cell">Insurance</TableHead>
                  <TableHead className="hidden sm:table-cell">Fuel MTD</TableHead>
                  <TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {fVehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell><div className="font-medium">{v.plate}</div><div className="text-xs text-muted-foreground">{v.model}</div></TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="font-normal">{v.type}</Badge></TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{v.driver}</TableCell>
                      <TableCell>{docBadge(v.roadTax)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{docBadge(v.insurance)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="flex items-center gap-1 text-xs"><Fuel className="h-3 w-3 text-muted-foreground" />{v.fuelMtd} L · {v.kmMtd} km</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          v.status === 'In Service' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : v.status === 'Workshop' ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'border-border bg-muted text-muted-foreground'
                        }>{v.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => toggleWorkshop(v.id)}>
                          <Wrench className="mr-1 h-3.5 w-3.5" />{v.status === 'Workshop' ? 'Return to Service' : 'Send to Workshop'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">QR Asset Register</CardTitle><CardDescription>Every asset carries a QR tag scannable from the field</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Asset</TableHead><TableHead className="hidden sm:table-cell">QR Tag</TableHead>
                  <TableHead className="hidden md:table-cell">Category / Site</TableHead>
                  <TableHead className="hidden lg:table-cell">Value</TableHead>
                  <TableHead>Condition</TableHead><TableHead>Next Service</TableHead>
                  <TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {fAssets.map((a) => (
                    <TableRow key={a.id} className={cn(a.status === 'Retired' && 'opacity-50')}>
                      <TableCell><div className="font-medium">{a.name}</div><div className="font-mono text-xs text-muted-foreground">{a.id}</div></TableCell>
                      <TableCell className="hidden sm:table-cell"><span className="flex items-center gap-1 font-mono text-xs"><QrCode className="h-3.5 w-3.5 text-muted-foreground" />{a.qr}</span></TableCell>
                      <TableCell className="hidden md:table-cell"><div className="text-sm">{a.category}</div><div className="text-xs text-muted-foreground">{a.site}</div></TableCell>
                      <TableCell className="hidden text-sm lg:table-cell">BND {(a.valueBnd / 1000).toFixed(0)}k</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          a.condition === 'Good' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : a.condition === 'Fair' ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400'
                        }>{a.condition}</Badge>
                      </TableCell>
                      <TableCell className={cn('text-xs', a.nextService !== '—' && isPast(a.nextService) && a.status === 'Active' && 'font-semibold text-rose-600')}>
                        {a.nextService === '—' ? '—' : fmtDate(a.nextService)}
                      </TableCell>
                      <TableCell><Badge variant="outline" className={a.status === 'Active' ? 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400' : 'border-border bg-muted text-muted-foreground'}>{a.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        {a.status === 'Active' && (
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => markServiced(a.id)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Serviced</Button>
                            <Button size="sm" variant="ghost" title="Retire asset" onClick={() => retireAsset(a.id)}><Archive className="h-3.5 w-3.5" /></Button>
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
