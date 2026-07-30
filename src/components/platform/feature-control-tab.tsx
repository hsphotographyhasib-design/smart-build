'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Shield, Search, Filter,
  RefreshCw, Crown, Loader2, ArrowUpDown,
  FolderKanban, Gavel, Wrench, Users as UsersIcon, HardHat,
  Warehouse, ShoppingCart, DollarSign, BarChart3, Brain, Settings,
  Headphones, ToggleLeft, ToggleRight, Building2, User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  FEATURE_GROUPS,
  FEATURE_LABELS,
  FEATURE_DESCRIPTIONS,
  MATRIX_COLUMNS,
  PLAN_FEATURE_MAP,
  PLAN_BADGE_COLORS,
  ALL_FEATURES,
  type FeatureKey,
} from '@/lib/features'

// ---------- Types ----------
interface TenantFeatureRow {
  id: string
  slug: string
  name: string
  email: string
  status: string
  tier: string
  maxUsers: number
  maxProjects: number
  maxStorage: number
  currentUsers: number
  currentProjects: number
  currentStorage: number
  subscription: { planId: string; planName: string; status: string } | null
  features: Record<string, boolean>
}

// ---------- Icon Map for Groups ----------
const GROUP_ICONS: Record<string, typeof Shield> = {
  delivery: FolderKanban,
  tender: Gavel,
  maintenance: Wrench,
  resources: UsersIcon,
  assets: HardHat,
  inventory: Warehouse,
  procurement: ShoppingCart,
  finance: DollarSign,
  reports: BarChart3,
  ai: Brain,
  admin: Settings,
  support: Headphones,
}

// ---------- Plan Badge ----------
function PlanBadge({ tier }: { tier: string }) {
  const colorClass = PLAN_BADGE_COLORS[tier] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
  return <Badge variant="outline" className={cn('text-xs font-medium', colorClass)}>{tier}</Badge>
}

// ---------- Status Badge ----------
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: 'bg-emerald-500',
    Trial: 'bg-amber-500',
    Suspended: 'bg-red-500',
    Expired: 'bg-slate-400',
    Archived: 'bg-gray-400',
    Pending: 'bg-blue-500',
  }
  return <span className={cn('inline-block h-2 w-2 rounded-full', colors[status] || 'bg-gray-400')} />
}

// ---------- Feature Toggle Cell ----------
function FeatureToggleCell({
  enabled,
  saving,
  onToggle,
  featureLabel,
}: {
  enabled: boolean
  saving: boolean
  onToggle: () => void
  featureLabel: string
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Switch
                checked={enabled}
                onCheckedChange={onToggle}
                className={cn(
                  'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600',
                  'scale-75'
                )}
                aria-label={featureLabel}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {featureLabel}: {enabled ? 'Enabled' : 'Disabled'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ---------- Company Detail Panel ----------
function CompanyDetailPanel({
  tenant,
  onClose,
  onSaveFeature,
  onApplyPlan,
  onBulkToggle,
  savingFeature,
}: {
  tenant: TenantFeatureRow
  onClose: () => void
  onSaveFeature: (feature: string, enabled: boolean) => Promise<void>
  onApplyPlan: (planName: string) => Promise<void>
  onBulkToggle: (enable: boolean) => Promise<void>
  savingFeature: string | null
}) {
  const [applyingPlan, setApplyingPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')

  const totalFeatures = ALL_FEATURES.length
  const enabledCount = Object.values(tenant.features).filter(Boolean).length
  const enabledPercent = totalFeatures > 0 ? Math.round((enabledCount / totalFeatures) * 100) : 0

  const handleApplyPlan = async () => {
    if (!selectedPlan) return
    setApplyingPlan(true)
    try {
      await onApplyPlan(selectedPlan)
      setSelectedPlan('')
    } finally {
      setApplyingPlan(false)
    }
  }

  const handleBulkToggle = async (enable: boolean) => {
    await onBulkToggle(enable)
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 space-y-3 shrink-0">
          <SheetHeader className="space-y-0">
            <SheetTitle className="flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="truncate">{tenant.name}</div>
                <div className="text-sm font-normal text-muted-foreground">{tenant.email}</div>
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* Company Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <PlanBadge tier={tenant.tier} />
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={tenant.status} />
              <span className="text-muted-foreground">{tenant.status}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              {tenant.currentUsers} / {tenant.maxUsers} users
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5" />
              {tenant.currentProjects} / {tenant.maxProjects} projects
            </div>
            <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
              <Settings className="h-3.5 w-3.5" />
              {tenant.currentStorage} / {tenant.maxStorage} MB storage
            </div>
          </div>

          {/* Feature Summary Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${enabledPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {enabledCount}/{totalFeatures} features ({enabledPercent}%)
            </span>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkToggle(true)}
              className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400"
            >
              <ToggleRight className="h-3.5 w-3.5 mr-1" /> Enable All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkToggle(false)}
              className="h-8 text-xs border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400"
            >
              <ToggleLeft className="h-3.5 w-3.5 mr-1" /> Disable All
            </Button>
            <div className="flex items-center gap-1.5">
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue placeholder="Apply plan template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free Trial">Free Trial</SelectItem>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleApplyPlan}
                disabled={!selectedPlan || applyingPlan}
                className="h-8 text-xs"
              >
                {applyingPlan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Groups */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {FEATURE_GROUPS.map((group) => {
              const GroupIcon = GROUP_ICONS[group.id] || Shield
              const groupEnabled = group.features.filter((f) => tenant.features[f]).length
              const groupTotal = group.features.length

              return (
                <div key={group.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <GroupIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{group.label}</h3>
                    <Badge variant="secondary" className="text-[10px] ml-auto">
                      {groupEnabled}/{groupTotal}
                    </Badge>
                  </div>
                  <div className="space-y-2 pl-6">
                    {group.features.map((featureKey) => {
                      const isEnabled = tenant.features[featureKey] ?? false
                      const isSaving = savingFeature === featureKey
                      const label = FEATURE_LABELS[featureKey]
                      const desc = FEATURE_DESCRIPTIONS[featureKey]

                      // Which plans include this feature
                      const includedInPlans = Object.entries(PLAN_FEATURE_MAP)
                        .filter(([, features]) => features.includes(featureKey))
                        .map(([planName]) => planName)

                      return (
                        <div
                          key={featureKey}
                          className={cn(
                            'flex items-start gap-3 p-2.5 rounded-lg transition-colors',
                            isEnabled
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                              : 'bg-muted/30 dark:bg-muted/10'
                          )}
                        >
                          <div className="pt-0.5">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => onSaveFeature(featureKey, checked)}
                              disabled={isSaving}
                              className={cn(
                                'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600'
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'text-sm font-medium',
                                isEnabled ? 'text-foreground' : 'text-muted-foreground'
                              )}>
                                {label}
                              </span>
                              {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{desc}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {includedInPlans.map((plan) => (
                                <Badge
                                  key={plan}
                                  variant="outline"
                                  className={cn('text-[10px] py-0 px-1.5', PLAN_BADGE_COLORS[plan])}
                                >
                                  {plan}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// ---------- Main Feature Control Tab ----------
export default function FeatureControlTab() {
  const [tenants, setTenants] = useState<TenantFeatureRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [savingCell, setSavingCell] = useState<{ tenantId: string; feature: string } | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<TenantFeatureRow | null>(null)
  const [savingFeature, setSavingFeature] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'name' | 'tier' | 'status'>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const fetchFeatures = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/platform/features')
      const data = await res.json()
      if (data.tenants) setTenants(data.tenants)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load feature data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  // Toggle a single feature in the matrix
  const handleToggleFeature = async (tenantId: string, feature: string, enabled: boolean) => {
    setSavingCell({ tenantId, feature })

    // Optimistic update
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? { ...t, features: { ...t.features, [feature]: enabled } }
          : t
      )
    )

    try {
      const res = await fetch('/api/platform/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, features: { [feature]: enabled } }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update feature')
        // Revert
        setTenants((prev) =>
          prev.map((t) =>
            t.id === tenantId
              ? { ...t, features: { ...t.features, [feature]: !enabled } }
              : t
          )
        )
      } else {
        toast.success(`${FEATURE_LABELS[feature as FeatureKey] || feature} ${enabled ? 'enabled' : 'disabled'}`)
      }
    } catch {
      toast.error('Network error')
      // Revert
      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenantId
            ? { ...t, features: { ...t.features, [feature]: !enabled } }
            : t
        )
      )
    } finally {
      setSavingCell(null)
    }
  }

  // Toggle feature from detail panel
  const handleDetailToggle = async (feature: string, enabled: boolean) => {
    if (!selectedTenant) return
    setSavingFeature(feature)

    // Optimistic update for selected tenant
    setSelectedTenant((prev) =>
      prev ? { ...prev, features: { ...prev.features, [feature]: enabled } } : prev
    )
    // Also update in list
    setTenants((prev) =>
      prev.map((t) =>
        t.id === selectedTenant.id
          ? { ...t, features: { ...t.features, [feature]: enabled } }
          : t
      )
    )

    try {
      const res = await fetch('/api/platform/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selectedTenant.id, features: { [feature]: enabled } }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update feature')
        setSelectedTenant((prev) =>
          prev ? { ...prev, features: { ...prev.features, [feature]: !enabled } } : prev
        )
        setTenants((prev) =>
          prev.map((t) =>
            t.id === selectedTenant.id
              ? { ...t, features: { ...t.features, [feature]: !enabled } }
              : t
          )
        )
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSavingFeature(null)
    }
  }

  // Apply a plan template
  const handleApplyPlan = async (planName: string) => {
    if (!selectedTenant) return
    const planFeatures = PLAN_FEATURE_MAP[planName]
    if (!planFeatures) return

    const newFeatures: Record<string, boolean> = {}
    for (const f of ALL_FEATURES) {
      newFeatures[f] = planFeatures.includes(f)
    }

    setSavingFeature('__plan__')

    try {
      const res = await fetch('/api/platform/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selectedTenant.id, features: newFeatures }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to apply plan')
      } else {
        toast.success(`Applied ${planName} template (${data.changedCount} changes)`)
        // Refresh selected tenant
        const refreshed = {
          ...selectedTenant,
          features: newFeatures,
        }
        setSelectedTenant(refreshed)
        setTenants((prev) =>
          prev.map((t) => (t.id === selectedTenant.id ? refreshed : t))
        )
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSavingFeature(null)
    }
  }

  // Bulk enable/disable all features
  const handleBulkToggle = async (enable: boolean) => {
    if (!selectedTenant) return

    const newFeatures: Record<string, boolean> = {}
    for (const f of ALL_FEATURES) {
      newFeatures[f] = enable
    }

    setSavingFeature('__bulk__')

    try {
      const res = await fetch('/api/platform/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selectedTenant.id, features: newFeatures }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update features')
      } else {
        toast.success(`All features ${enable ? 'enabled' : 'disabled'} (${data.changedCount} changes)`)
        const refreshed = { ...selectedTenant, features: newFeatures }
        setSelectedTenant(refreshed)
        setTenants((prev) =>
          prev.map((t) => (t.id === selectedTenant.id ? refreshed : t))
        )
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSavingFeature(null)
    }
  }

  // Sorting
  const handleSort = (field: 'name' | 'tier' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  // Filtering
  const filtered = tenants
    .filter((t) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.slug.toLowerCase().includes(q) &&
          !t.email.toLowerCase().includes(q)
        )
          return false
      }
      if (planFilter !== 'all' && t.tier !== planFilter) return false
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir
      if (sortField === 'tier') return a.tier.localeCompare(b.tier) * dir
      return a.status.localeCompare(b.status) * dir
    })

  // Count enabled features per column for summary
  const columnEnabledCount = (featureKey: string) =>
    filtered.filter((t) => t.features[featureKey]).length

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Feature Access Control
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage which modules each company can access
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchFeatures}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Free Trial">Free Trial</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Trial">Trial</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Badge variant="outline" className="font-normal">
          {filtered.length} of {tenants.length} companies
        </Badge>
        {MATRIX_COLUMNS.map((col) => (
          <TooltipProvider key={col.key} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-normal cursor-default',
                    columnEnabledCount(col.key) > 0
                      ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                      : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-500'
                  )}
                >
                  {col.label}: {columnEnabledCount(col.key)}/{filtered.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {columnEnabledCount(col.key)} companies have {col.label} enabled
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Feature Matrix Table */}
      <Card>
        <div className="overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead
                  className="sticky left-0 z-20 bg-background min-w-[200px] cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Company
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('tier')}
                >
                  <div className="flex items-center gap-1">
                    Plan
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableHead>
                {MATRIX_COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className="text-center min-w-[72px]"
                  >
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default font-medium text-xs">
                            {col.label}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {FEATURE_LABELS[col.key]}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  {/* Company Name - Sticky */}
                  <TableCell className="sticky left-0 z-10 bg-background font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                        {tenant.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate max-w-[160px]">{tenant.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                          {tenant.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Plan */}
                  <TableCell>
                    <PlanBadge tier={tenant.tier} />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={tenant.status} />
                      <span className="text-xs">{tenant.status}</span>
                    </div>
                  </TableCell>

                  {/* Feature Toggles */}
                  {MATRIX_COLUMNS.map((col) => {
                    const isSaving =
                      savingCell?.tenantId === tenant.id && savingCell?.feature === col.key
                    return (
                      <TableCell
                        key={col.key}
                        className="text-center p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FeatureToggleCell
                          enabled={tenant.features[col.key] ?? false}
                          saving={isSaving}
                          featureLabel={FEATURE_LABELS[col.key]}
                          onToggle={() =>
                            handleToggleFeature(
                              tenant.id,
                              col.key,
                              !(tenant.features[col.key] ?? false)
                            )
                          }
                        />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3 + MATRIX_COLUMNS.length} className="text-center py-12">
                    <div className="text-muted-foreground">
                      <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No companies match your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Panel */}
      {selectedTenant && (
        <CompanyDetailPanel
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onSaveFeature={handleDetailToggle}
          onApplyPlan={handleApplyPlan}
          onBulkToggle={handleBulkToggle}
          savingFeature={savingFeature}
        />
      )}
    </div>
  )
}
