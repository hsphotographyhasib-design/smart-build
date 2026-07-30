'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Building2, Users, CreditCard, Activity, Shield, Settings, FileText, BarChart3,
  Plus, Search, MoreHorizontal, ChevronRight, Globe, Database, AlertTriangle, CheckCircle2,
  XCircle, Pause, Trash2, Eye, TrendingUp, DollarSign, Server, Cpu, HardDrive, Wifi,
  LogOut, User, Menu, X, RefreshCw, ChevronDown, ToggleLeft
} from 'lucide-react'
import FeatureControlTab from '@/components/platform/feature-control-tab'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ---------- Types ----------
interface Tenant {
  id: string; slug: string; name: string; domain: string | null; email: string; phone: string | null
  status: string; tier: string; maxUsers: number; maxProjects: number; maxStorage: number; maxBranches: number
  currentUsers: number; currentProjects: number; currentStorage: number
  trialEndsAt: string | null; approvedAt: string | null; createdAt: string
  settings: { defaultTimezone: string; currency: string; enableRegistration: boolean } | null
  subscription: { plan: { name: string; priceMonthly: number } } | null
  _count: { users: number; branches: number }
}

interface Analytics {
  totalTenants: number; activeTenants: number; trialTenants: number; suspendedTenants: number; expiredTenants: number
  totalUsers: number; activeUsers: number; totalProjects: number; totalBranches: number
  monthlyRevenue: number; annualRevenue: number
  tierDistribution: { tier: string; count: number }[]
  recentAuditLogs: AuditEntry[]
}

interface AuditEntry {
  id: string; tenantId: string | null; userId: string | null; userName: string | null
  action: string; resource: string; resourceId: string | null; details: string | null
  ipAddress: string | null; createdAt: string; level: string
}

interface Plan { id: string; name: string; description: string | null; priceMonthly: number; priceAnnual: number; maxUsers: number; maxProjects: number; maxStorage: number; features: string; active: boolean }

// ---------- Status Badge ----------
function TenantStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    Active: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    Trial: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: RefreshCw },
    Suspended: { color: 'bg-red-100 text-red-700 border-red-200', icon: Pause },
    Expired: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: XCircle },
    Archived: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle },
    Pending: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertTriangle },
  }
  const v = variants[status] || variants.Pending
  const Icon = v.icon
  return <Badge variant="outline" className={cn('gap-1 text-xs font-medium', v.color)}><Icon className="h-3 w-3" /> {status}</Badge>
}

// ---------- KPI Card ----------
function KpiCard({ label, value, sub, icon: Icon, trend }: { label: string; value: string | number; sub?: string; icon: typeof Building2; trend?: string }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5"><Icon className="h-5 w-5 text-primary" /></div>
        </div>
        {trend && <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {trend}</p>}
      </CardContent>
    </Card>
  )
}

// ---------- Main Page ----------
export default function PlatformConsole() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailTenant, setDetailTenant] = useState<Tenant | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Create tenant form
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formPlan, setFormPlan] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tRes, aRes, pRes] = await Promise.all([
        fetch('/api/platform/tenants'), fetch('/api/platform/analytics'), fetch('/api/platform/plans'),
      ])
      const tData = await tRes.json(); const aData = await aRes.json(); const pData = await pRes.json()
      if (tData.tenants) setTenants(tData.tenants)
      if (aData) setAnalytics(aData)
      if (pData.plans) setPlans(pData.plans)
      if (aData.recentAuditLogs) setAuditLogs(aData.recentAuditLogs)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Super Admin')) {
      router.push('/login')
      return
    }
    if (user?.role === 'Super Admin') fetchData()
  }, [user, authLoading, router, fetchData])

  const handleCreate = async () => {
    if (!formName || !formSlug || !formEmail) { toast.error('Name, slug, and email are required'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/platform/tenants', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, slug: formSlug, email: formEmail, phone: formPhone || null, planId: formPlan || null, approve: true }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create tenant'); return }
      toast.success(`Tenant "${formName}" created`)
      setCreateOpen(false); setFormName(''); setFormSlug(''); setFormEmail(''); setFormPhone(''); setFormPlan('')
      fetchData()
    } catch { toast.error('Network error') }
    finally { setCreating(false) }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/platform/tenants/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return }
      toast.success(`Tenant ${status}`)
      fetchData()
    } catch { toast.error('Network error') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will permanently delete this tenant and ALL its data.')) return
    try {
      const res = await fetch(`/api/platform/tenants/${id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return }
      toast.success('Tenant deleted')
      setDetailTenant(null)
      fetchData()
    } catch { toast.error('Network error') }
  }

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
    { id: 'features', label: 'Feature Control', icon: ToggleLeft },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ]

  if (authLoading) return <div className="flex h-screen items-center justify-center bg-background"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (!user || user.role !== 'Super Admin') return null

  return (
    <div className="flex h-dvh w-full bg-muted/30 overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 border-r bg-[#0B2345] text-white flex flex-col transition-transform lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-14 items-center gap-3 px-4 border-b border-white/10">
          <Image src="/brand/smartbuild-app-dark.svg" alt="SmartBuild" width={32} height={32} className="h-8 w-8" />
          <div>
            <div className="text-sm font-bold">SmartBuild</div>
            <div className="text-[10px] text-white/50">Platform Console</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              className={cn('w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                tab === item.id ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/90')}>
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5A623] text-xs font-bold text-[#0B2345]">SA</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user.name}</div>
              <div className="text-[10px] text-white/50">Super Admin</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-red-400">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <h1 className="text-lg font-bold">Platform Console</h1>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-[#F5A623] text-[#F5A623]"><Shield className="h-3 w-3" /> Super Admin</Badge>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            </div>
          ) : tab === 'overview' ? (
            <OverviewTab analytics={analytics} tenants={tenants} onNavigateTenants={() => setTab('tenants')} />
          ) : tab === 'tenants' ? (
            <TenantsTab tenants={filtered} search={search} setSearch={setSearch} plans={plans} onCreate={() => setCreateOpen(true)} onView={(t) => setDetailTenant(t)} onStatusChange={handleStatusChange} />
          ) : tab === 'features' ? (
            <FeatureControlTab />
          ) : tab === 'audit' ? (
            <AuditTab logs={auditLogs} />
          ) : tab === 'settings' ? (
            <SettingsTab />
          ) : null}
        </div>
      </main>

      {/* Create Tenant Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>Provision a new company workspace on the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Company Name *</Label>
              <Input value={formName} onChange={e => { setFormName(e.target.value); setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) }} placeholder="Hasanur Jaya Sdn. Bhd." />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={formSlug} onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="hasanur-jaya" />
              <p className="text-[11px] text-muted-foreground">Used in URL: smartbuild.app/{formSlug || '...'}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Company Email *</Label>
              <Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="info@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+60 12-345 6789" />
            </div>
            <div className="space-y-1.5">
              <Label>Subscription Plan</Label>
              <Select value={formPlan} onValueChange={setFormPlan}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — ${p.priceMonthly}/mo</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !formName || !formSlug || !formEmail} className="bg-[#0B2345] hover:bg-[#132D52]">
              {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenant Detail Dialog */}
      <Dialog open={!!detailTenant} onOpenChange={() => setDetailTenant(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          {detailTenant && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
                  {detailTenant.name}
                </DialogTitle>
                <DialogDescription>Slug: {detailTenant.slug} &middot; {detailTenant.tier} Plan</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Status:</span> <TenantStatusBadge status={detailTenant.status} /></div>
                <div><span className="text-muted-foreground">Email:</span> {detailTenant.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {detailTenant.phone || '—'}</div>
                <div><span className="text-muted-foreground">Domain:</span> {detailTenant.domain || '—'}</div>
                <div><span className="text-muted-foreground">Users:</span> {detailTenant._count.users} / {detailTenant.maxUsers}</div>
                <div><span className="text-muted-foreground">Branches:</span> {detailTenant._count.branches} / {detailTenant.maxBranches}</div>
                <div><span className="text-muted-foreground">Storage:</span> {detailTenant.currentStorage} MB / {detailTenant.maxStorage} MB</div>
                <div><span className="text-muted-foreground">Created:</span> {new Date(detailTenant.createdAt).toLocaleDateString()}</div>
                <div><span className="text-muted-foreground">Currency:</span> {detailTenant.settings?.currency || 'MYR'}</div>
                <div><span className="text-muted-foreground">Plan:</span> {detailTenant.subscription?.plan.name || 'None'}</div>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                {detailTenant.status !== 'Active' && (
                  <Button size="sm" onClick={() => handleStatusChange(detailTenant.id, 'Active')} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Activate</Button>
                )}
                {detailTenant.status === 'Active' && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(detailTenant.id, 'Suspended')} className="border-red-300 text-red-600 hover:bg-red-50"><Pause className="h-3.5 w-3.5 mr-1" /> Suspend</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleStatusChange(detailTenant.id, 'Trial')}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Set Trial</Button>
                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleDelete(detailTenant.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------- Overview Tab ----------
function OverviewTab({ analytics, tenants, onNavigateTenants }: { analytics: Analytics | null; tenants: Tenant[]; onNavigateTenants: () => void }) {
  if (!analytics) return <Skeleton className="h-96 rounded-xl" />
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time platform metrics and tenant health.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Tenants" value={analytics.totalTenants} icon={Building2} sub={`${analytics.activeTenants} active`} />
        <KpiCard label="Total Users" value={analytics.activeUsers} icon={Users} sub={`${analytics.totalUsers} registered`} />
        <KpiCard label="Monthly Revenue" value={`$${analytics.monthlyRevenue.toLocaleString()}`} icon={DollarSign} sub={`$${analytics.annualRevenue.toLocaleString()}/yr`} />
        <KpiCard label="Total Projects" value={analytics.totalProjects} icon={Activity} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-emerald-200 bg-emerald-50/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-700">{analytics.activeTenants}</p><p className="text-xs text-emerald-600 font-medium">Active</p></CardContent></Card>
        <Card className="border-amber-200 bg-amber-50/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-700">{analytics.trialTenants}</p><p className="text-xs text-amber-600 font-medium">Trial</p></CardContent></Card>
        <Card className="border-red-200 bg-red-50/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-700">{analytics.suspendedTenants}</p><p className="text-xs text-red-600 font-medium">Suspended</p></CardContent></Card>
        <Card className="border-slate-200 bg-slate-50/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-600">{analytics.expiredTenants}</p><p className="text-xs text-slate-500 font-medium">Expired</p></CardContent></Card>
        <Card className="border-blue-200 bg-blue-50/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">{analytics.totalBranches}</p><p className="text-xs text-blue-600 font-medium">Branches</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Recent Tenants</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tenants.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary shrink-0">{t.name.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.tier} &middot; {t._count.users} users</p>
                  </div>
                  <TenantStatusBadge status={t.status} />
                </div>
              ))}
              {tenants.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tenants yet</p>}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3" onClick={onNavigateTenants}>View All <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </CardContent>
        </Card>

        {/* Recent Audit */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentAuditLogs.slice(0, 8).map(log => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className={cn('mt-0.5 h-2 w-2 rounded-full shrink-0', log.level === 'security' ? 'bg-red-500' : 'bg-blue-500')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium"><span className="text-muted-foreground">{log.userName || 'System'}</span> {log.action} <span className="text-muted-foreground">{log.resource}</span></p>
                    <p className="text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------- Tenants Tab ----------
function TenantsTab({ tenants, search, setSearch, plans, onCreate, onView, onStatusChange }: {
  tenants: Tenant[]; search: string; setSearch: (s: string) => void; plans: Plan[]
  onCreate: () => void; onView: (t: Tenant) => void; onStatusChange: (id: string, status: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenant Management</h2>
          <p className="text-sm text-muted-foreground">{tenants.length} tenant{tenants.length !== 1 ? 's' : ''} on the platform</p>
        </div>
        <Button onClick={onCreate} className="bg-[#0B2345] hover:bg-[#132D52]"><Plus className="h-4 w-4 mr-2" /> New Tenant</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Company</TableHead>
            <TableHead className="hidden md:table-cell">Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Plan</TableHead>
            <TableHead className="hidden lg:table-cell">Users</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {tenants.map(t => (
              <TableRow key={t.id} className="cursor-pointer" onClick={() => onView(t)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary shrink-0">{t.name.slice(0, 2).toUpperCase()}</div>
                    <div><p className="font-medium text-sm">{t.name}</p><p className="text-xs text-muted-foreground md:hidden">{t.slug}</p></div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{t.slug}</TableCell>
                <TableCell><TenantStatusBadge status={t.status} /></TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{t.tier}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{t._count.users}/{t.maxUsers}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); onView(t) }}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); onStatusChange(t.id, 'Active') }}><CheckCircle2 className="h-4 w-4 mr-2" /> Activate</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); onStatusChange(t.id, 'Suspended') }}><Pause className="h-4 w-4 mr-2" /> Suspend</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); onStatusChange(t.id, 'Archived') }} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {tenants.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tenants found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// ---------- Audit Tab ----------
function AuditTab({ logs }: { logs: AuditEntry[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-sm text-muted-foreground">Platform-wide activity trail.</p>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead className="hidden lg:table-cell">IP</TableHead>
            <TableHead>Level</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-sm font-medium">{log.userName || 'System'}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{log.action}</Badge></TableCell>
                <TableCell className="text-sm">{log.resource}{log.resourceId ? ` #${log.resourceId.slice(0, 8)}` : ''}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{log.ipAddress || '—'}</TableCell>
                <TableCell><Badge variant={log.level === 'security' ? 'destructive' : 'secondary'} className="text-[10px]">{log.level}</Badge></TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No audit logs</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// ---------- Settings Tab ----------
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
        <p className="text-sm text-muted-foreground">Global configuration for the SmartBuild platform.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">General</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Platform Name</Label><Input defaultValue="SmartBuild" /></div>
          <div className="space-y-1.5"><Label>Support Email</Label><Input defaultValue="support@smartbuild.app" /></div>
          <div className="space-y-1.5"><Label>Default Timezone</Label><Input defaultValue="Asia/Singapore" /></div>
          <Button className="bg-[#0B2345] hover:bg-[#132D52]">Save Changes</Button>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Require Email Verification</p><p className="text-xs text-muted-foreground">Users must verify email before access</p></div><Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge></div>
          <Separator />
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Optional 2FA for all tenant users</p></div><Badge className="bg-amber-100 text-amber-700">Optional</Badge></div>
          <Separator />
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Session Duration</p><p className="text-xs text-muted-foreground">JWT token lifetime</p></div><Badge>7 days</Badge></div>
          <Separator />
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Max Login Attempts</p><p className="text-xs text-muted-foreground">Before account lockout</p></div><Badge>5 attempts</Badge></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Email (SMTP)</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>SMTP Host</Label><Input placeholder="smtp.gmail.com" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Port</Label><Input placeholder="587" /></div>
            <div className="space-y-1.5"><Label>From</Label><Input placeholder="noreply@smartbuild.app" /></div>
          </div>
          <Button className="bg-[#0B2345] hover:bg-[#132D52]">Test Connection</Button>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Payment Gateway</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Stripe</p><p className="text-xs text-muted-foreground">Credit card payments</p></div><Badge className="bg-slate-100 text-slate-600">Not Configured</Badge></div>
          <Separator />
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">PayPal</p><p className="text-xs text-muted-foreground">Alternative payment method</p></div><Badge className="bg-slate-100 text-slate-600">Not Configured</Badge></div>
        </CardContent></Card>
      </div>
    </div>
  )
}