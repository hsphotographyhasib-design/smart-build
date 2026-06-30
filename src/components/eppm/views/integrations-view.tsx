'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Plug, CheckCircle2, AlertTriangle, XCircle, Clock, Activity, RefreshCw, Settings, ArrowRight, Zap, Database, Cloud, Webhook, KeyRound } from 'lucide-react'
import { type View, fmtNum } from '@/lib/eppm'
import { FadeIn } from '../motion'
import { cn } from '@/lib/utils'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const CHART = { emerald: 'oklch(0.55 0.12 162)', amber: 'oklch(0.7 0.16 80)', rose: 'oklch(0.6 0.2 25)', sky: 'oklch(0.62 0.1 195)', violet: 'oklch(0.65 0.18 305)', slate: 'oklch(0.55 0.02 250)' }

interface Integration {
  id: string
  name: string
  category: string
  description: string
  status: 'connected' | 'syncing' | 'error' | 'disconnected'
  lastSync: string
  syncInterval: string
  recordsSynced: number
  health: number
  icon: any
  color: string
  endpoint: string
  enabled: boolean
}

const INTEGRATIONS: Integration[] = [
  { id: '1', name: 'Maintenance Management (CMMS)', category: 'Operations', description: 'Work orders, asset maintenance, equipment downtime', status: 'connected', lastSync: '2 min ago', syncInterval: '5 min', recordsSynced: 12480, health: 98, icon: Settings, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', endpoint: 'https://api.smartbuild.io/cmms/v2', enabled: true },
  { id: '2', name: 'Tender Management', category: 'Pre-construction', description: 'Bid management, tender evaluation, contract awards', status: 'connected', lastSync: '8 min ago', syncInterval: '15 min', recordsSynced: 3420, health: 95, icon: Database, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40', endpoint: 'https://tenders.smartbuild.io/api', enabled: true },
  { id: '3', name: 'Finance & Accounting', category: 'Finance', description: 'GL postings, AP/AR, cost ledger, invoice matching', status: 'connected', lastSync: '1 min ago', syncInterval: '2 min', recordsSynced: 89200, health: 99, icon: Database, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', endpoint: 'https://erp.smartbuild.io/finance', enabled: true },
  { id: '4', name: 'HR & Payroll', category: 'People', description: 'Employee master, payroll, time attendance, leave', status: 'syncing', lastSync: 'syncing now', syncInterval: '10 min', recordsSynced: 1860, health: 87, icon: Activity, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', endpoint: 'https://hr.smartbuild.io/payroll', enabled: true },
  { id: '5', name: 'Inventory & Warehousing', category: 'Supply Chain', description: 'Stock levels, material reservations, warehouse transfers', status: 'connected', lastSync: '3 min ago', syncInterval: '5 min', recordsSynced: 24310, health: 96, icon: Database, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', endpoint: 'https://wms.smartbuild.io/inventory', enabled: true },
  { id: '6', name: 'Procurement & Purchasing', category: 'Supply Chain', description: 'PO creation, supplier master, GRN matching', status: 'connected', lastSync: '5 min ago', syncInterval: '5 min', recordsSynced: 8740, health: 94, icon: Database, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', endpoint: 'https://procure.smartbuild.io/po', enabled: true },
  { id: '7', name: 'CRM & Customer Portal', category: 'Clients', description: 'Customer master, project portal access, satisfaction surveys', status: 'error', lastSync: '45 min ago', syncInterval: '15 min', recordsSynced: 420, health: 42, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40', endpoint: 'https://crm.smartbuild.io/v3', enabled: true },
  { id: '8', name: 'Google Maps & Geolocation', category: 'External', description: 'Site locations, asset tracking, route optimisation', status: 'connected', lastSync: '12 min ago', syncInterval: '30 min', recordsSynced: 156, health: 100, icon: Cloud, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40', endpoint: 'https://maps.googleapis.com', enabled: true },
  { id: '9', name: 'WhatsApp Business API', category: 'Communication', description: 'Site notifications, alert broadcasts, field updates', status: 'connected', lastSync: '1 min ago', syncInterval: '1 min', recordsSynced: 3840, health: 97, icon: Webhook, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', endpoint: 'https://api.whatsapp.com/business', enabled: true },
  { id: '10', name: 'Email & SMTP Gateway', category: 'Communication', description: 'Transactional emails, report distribution, approvals', status: 'connected', lastSync: '30 sec ago', syncInterval: '1 min', recordsSynced: 12450, health: 99, icon: Webhook, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', endpoint: 'smtp://mail.smartbuild.io', enabled: true },
  { id: '11', name: 'QR Code Management', category: 'Operations', description: 'Asset QR tagging, scan-to-inspect, equipment identification', status: 'connected', lastSync: '4 min ago', syncInterval: '10 min', recordsSynced: 680, health: 93, icon: KeyRound, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40', endpoint: 'https://qr.smartbuild.io/api', enabled: true },
  { id: '12', name: 'Technician Portal', category: 'Field', description: 'Mobile field app, work order execution, status updates', status: 'disconnected', lastSync: '3 hours ago', syncInterval: '5 min', recordsSynced: 0, health: 0, icon: XCircle, color: 'text-muted-foreground bg-muted/50', endpoint: 'https://field.smartbuild.io/tech', enabled: false },
]

const SYNC_ACTIVITY = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`, syncs: Math.round(20 + Math.sin(i / 3) * 15 + Math.random() * 10), errors: i > 18 ? Math.round(Math.random() * 3) : 0,
}))

export function IntegrationsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  void onNavigate

  const connected = integrations.filter(i => i.status === 'connected').length
  const syncing = integrations.filter(i => i.status === 'syncing').length
  const error = integrations.filter(i => i.status === 'error').length
  const disconnected = integrations.filter(i => i.status === 'disconnected').length
  const totalRecords = integrations.reduce((s, i) => s + i.recordsSynced, 0)
  const avgHealth = Math.round(integrations.filter(i => i.enabled).reduce((s, i) => s + i.health, 0) / integrations.filter(i => i.enabled).length)

  const toggle = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled, status: !i.enabled ? 'syncing' : 'disconnected' } : i))
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      connected: 'border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
      syncing: 'border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-950/40',
      error: 'border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/40',
      disconnected: 'border-muted text-muted-foreground bg-muted/50',
    }
    return map[s] || map.disconnected
  }

  return (
    <FadeIn>
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[
            { l: 'Total Connectors', v: integrations.length, i: Plug, t: 'text-foreground', bg: 'bg-muted/50 text-muted-foreground' },
            { l: 'Connected', v: connected, i: CheckCircle2, t: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
            { l: 'Syncing', v: syncing, i: RefreshCw, t: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' },
            { l: 'Errors', v: error, i: AlertTriangle, t: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' },
            { l: 'Avg Health', v: `${avgHealth}%`, i: Activity, t: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' },
            { l: 'Records Synced', v: fmtNum(totalRecords), i: Database, t: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600' },
          ].map(s => (
            <Card key={s.l} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
              <CardContent className="p-4 flex items-center justify-between">
                <div><div className="text-[11px] uppercase text-muted-foreground">{s.l}</div><div className={cn('mt-1 text-xl font-bold tabular-nums', s.t)}>{s.v}</div></div>
                <div className={cn('grid h-9 w-9 place-items-center rounded-lg', s.bg)}><s.i className="h-[18px] w-[18px]" /></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="connectors">
          <TabsList>
            <TabsTrigger value="connectors">Connectors</TabsTrigger>
            <TabsTrigger value="activity">Sync Activity</TabsTrigger>
            <TabsTrigger value="errors">Error Log</TabsTrigger>
          </TabsList>

          {/* Connectors grid */}
          <TabsContent value="connectors" className="mt-3">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map(int => {
                const Icon = int.icon
                return (
                  <Card key={int.id} className={cn('relative overflow-hidden hover:shadow-md transition-shadow', int.status === 'error' && 'border-rose-200', !int.enabled && 'opacity-60')}>
                    <div className={cn('absolute inset-x-0 top-0 h-0.5', int.status === 'connected' ? 'bg-emerald-500' : int.status === 'syncing' ? 'bg-amber-500' : int.status === 'error' ? 'bg-rose-500' : 'bg-muted')} />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn('grid h-9 w-9 place-items-center rounded-lg shrink-0', int.color)}><Icon className="h-4.5 w-4.5" /></div>
                          <div className="min-w-0">
                            <CardTitle className="text-xs leading-tight">{int.name}</CardTitle>
                            <CardDescription className="text-[10px]">{int.category}</CardDescription>
                          </div>
                        </div>
                        <Switch checked={int.enabled} onCheckedChange={() => toggle(int.id)} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{int.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={cn('text-[9px]', statusBadge(int.status))}>
                          {int.status === 'syncing' && <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" />}
                          {int.status === 'connected' && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                          {int.status === 'error' && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                          {int.status}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">{int.lastSync}</span>
                      </div>
                      {int.enabled && (
                        <div>
                          <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5"><span>Health</span><span className={cn('font-medium', int.health >= 90 ? 'text-emerald-600' : int.health >= 70 ? 'text-amber-600' : 'text-rose-600')}>{int.health}%</span></div>
                          <Progress value={int.health} className="h-1" />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1 border-t">
                        <span>{fmtNum(int.recordsSynced)} records</span>
                        <span>every {int.syncInterval}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Sync Activity */}
          <TabsContent value="activity" className="mt-3">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">24-Hour Sync Activity</CardTitle><CardDescription className="text-xs">Synchronisation events & errors per hour</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={SYNC_ACTIVITY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gSync" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.sky} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART.sky} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART.rose} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART.rose} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="hour" tick={{ fontSize: 9 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 9 }} className="text-muted-foreground" width={32} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Area type="monotone" dataKey="syncs" name="Syncs" stroke={CHART.sky} fill="url(#gSync)" strokeWidth={2} />
                      <Area type="monotone" dataKey="errors" name="Errors" stroke={CHART.rose} fill="url(#gErr)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-primary/5 to-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2"><Zap className="h-4 w-4 text-amber-500" /><span className="text-sm font-semibold">Integration Status</span></div>
                    <div className="text-3xl font-bold text-emerald-600">{connected + syncing}/{integrations.length}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">connectors operational</div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]"><span className="text-muted-foreground">Uptime (30d)</span><span className="font-medium text-emerald-600">99.7%</span></div>
                      <div className="flex items-center justify-between text-[10px]"><span className="text-muted-foreground">Avg latency</span><span className="font-medium">142ms</span></div>
                      <div className="flex items-center justify-between text-[10px]"><span className="text-muted-foreground">Data transferred (24h)</span><span className="font-medium">2.4 GB</span></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
                  <CardContent className="space-y-1.5">
                    {Object.entries(integrations.reduce((acc, i) => { acc[i.category] = (acc[i.category] ?? 0) + 1; return acc }, {} as Record<string, number>)).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{cat}</span>
                        <Badge variant="secondary" className="text-[9px]">{count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Error Log */}
          <TabsContent value="errors" className="mt-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Integration Error Log</CardTitle><CardDescription className="text-xs">Recent sync failures & alerts</CardDescription></CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[420px] px-4 pb-3">
                  <div className="space-y-2 pt-2">
                    {[
                      { time: '14:42', integration: 'CRM & Customer Portal', error: 'Authentication failed: API token expired', severity: 'high', code: 'AUTH_401' },
                      { time: '14:38', integration: 'CRM & Customer Portal', error: 'Connection timeout after 30s', severity: 'high', code: 'TIMEOUT' },
                      { time: '13:15', integration: 'HR & Payroll', error: 'Rate limit exceeded (429) — retrying with backoff', severity: 'medium', code: 'RATE_429' },
                      { time: '12:50', integration: 'Technician Portal', error: 'Endpoint unreachable — service marked disconnected', severity: 'high', code: 'UNREACHABLE' },
                      { time: '11:30', integration: 'WhatsApp Business API', error: 'Webhook delivery delayed (2.3s) — within threshold', severity: 'low', code: 'LATENCY' },
                      { time: '10:05', integration: 'Google Maps & Geolocation', error: 'Quota warning: 82% of daily limit used', severity: 'low', code: 'QUOTA' },
                      { time: '09:20', integration: 'Inventory & Warehousing', error: 'Schema mismatch on field `warehouse_code` — auto-migrated', severity: 'medium', code: 'SCHEMA' },
                      { time: '08:15', integration: 'Finance & Accounting', error: 'Duplicate GL entry detected — skipped record #4892', severity: 'medium', code: 'DUPLICATE' },
                    ].map((e, i) => (
                      <div key={i} className={cn('flex items-start gap-3 rounded-lg border p-3', e.severity === 'high' ? 'border-rose-200 bg-rose-50/30 dark:bg-rose-950/10' : e.severity === 'medium' ? 'border-amber-200 bg-amber-50/30 dark:bg-amber-950/10' : '')}>
                        <div className={cn('grid h-7 w-7 shrink-0 place-items-center rounded', e.severity === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50' : e.severity === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50' : 'bg-muted text-muted-foreground')}>
                          {e.severity === 'high' ? <XCircle className="h-3.5 w-3.5" /> : e.severity === 'medium' ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2"><span className="text-xs font-medium">{e.integration}</span><Badge variant="outline" className="text-[8px] font-mono">{e.code}</Badge></div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{e.error}</div>
                        </div>
                        <span className="text-[9px] text-muted-foreground shrink-0">{e.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  )
}

