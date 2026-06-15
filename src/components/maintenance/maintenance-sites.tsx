'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Pencil, Eye, MapPin, Building2, Users, Wrench,
  Search, X, Phone, Mail, Calendar, FileText, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFormat } from '@/hooks/use-format'

// ─── Status helpers ───
const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
}

const ticketPriorityConfig: Record<string, { label: string; color: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
}

const ticketStatusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  assigned: { label: 'Assigned', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  on_hold: { label: 'On Hold', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  resolved: { label: 'Resolved', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
}

export function MaintenanceSites() {
  const { formatCurrency } = useFormat()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<any>(null)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Fetch sites
  const { data: sitesData, isLoading } = useQuery({
    queryKey: ['maintenance-sites', search, filterCustomer, filterStatus],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterCustomer !== 'all') params.set('customerId', filterCustomer)
      if (filterStatus !== 'all') params.set('isActive', filterStatus)
      params.set('limit', '100')
      return api.get(`/api/maintenance/sites?${params.toString()}`)
    },
  })
  const sites = sitesData?.data || []

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/api/customers'),
  })
  const customers = customersData?.data || []

  // Fetch site detail when viewing details
  const { data: siteDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['maintenance-site-detail', selectedSiteId],
    queryFn: () => api.get(`/api/maintenance/sites/${selectedSiteId}`),
    enabled: !!selectedSiteId && detailOpen,
  })

  // Fetch AMC contracts for the customer when viewing details
  const customerOfSite = siteDetail?.data?.customer?.id
  const { data: amcData } = useQuery({
    queryKey: ['maintenance-amc-for-site', customerOfSite],
    queryFn: () => {
      const params = new URLSearchParams()
      params.set('customerId', customerOfSite)
      params.set('limit', '50')
      return api.get(`/api/maintenance/amc?${params.toString()}`)
    },
    enabled: !!customerOfSite && detailOpen,
  })
  const amcContracts = amcData?.data || []

  // KPI Stats
  const stats = useMemo(() => {
    const total = sites.length
    const active = sites.filter((s: any) => s.isActive).length
    const withTickets = sites.filter((s: any) => (s._count?.tickets ?? 0) > 0).length
    const totalTickets = sites.reduce((sum: number, s: any) => sum + (s._count?.tickets ?? 0), 0)
    return { total, active, withTickets, totalTickets }
  }, [sites])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/sites', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-sites'] })
      setCreateOpen(false)
      toast({ title: 'Site Created', description: 'New maintenance site has been added.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to create site', variant: 'destructive' }),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/api/maintenance/sites/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-sites'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-site-detail'] })
      setEditOpen(false)
      setEditingSite(null)
      toast({ title: 'Site Updated', description: 'Site information has been updated.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to update site', variant: 'destructive' }),
  })

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/api/maintenance/sites/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-sites'] })
      toast({ title: 'Status Updated', description: 'Site status has been toggled.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to toggle status', variant: 'destructive' }),
  })

  const handleEdit = (site: any) => {
    setEditingSite(site)
    setEditOpen(true)
  }

  const handleViewDetail = (site: any) => {
    setSelectedSiteId(site.id)
    setDetailOpen(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Sites</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage customer sites and locations for maintenance services</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-rose-600 hover:bg-rose-700">
              <Plus className="h-3.5 w-3.5" /> Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Maintenance Site</DialogTitle>
              <DialogDescription>Add a new site location for maintenance service delivery</DialogDescription>
            </DialogHeader>
            <CreateSiteForm
              customers={customers}
              onSubmit={(body) => createMutation.mutate(body)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <Card className="border-rose-200 dark:border-rose-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-rose-600" />
                  <p className="text-xs text-muted-foreground">Total Sites</p>
                </div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Across {customers.length} customers</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <p className="text-xs text-muted-foreground">Active Sites</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% of total` : '—'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <p className="text-xs text-muted-foreground">Sites with Active Tickets</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">{stats.withTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalTickets} total open tickets</p>
              </CardContent>
            </Card>
            <Card className="border-sky-200 dark:border-sky-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="h-4 w-4 text-sky-600" />
                  <p className="text-xs text-muted-foreground">PM Schedules</p>
                </div>
                <p className="text-2xl font-bold text-sky-600">
                  {sites.reduce((sum: number, s: any) => sum + (s._count?.pmSchedules ?? 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Active preventive schedules</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by site name, code, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-48"
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
            >
              <option value="all">All Customers</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-36"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-600" />
            Sites ({sitesData?.total ?? sites.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No sites found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search || filterCustomer !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first maintenance site'}
              </p>
              {!search && filterCustomer === 'all' && filterStatus === 'all' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Site
                </Button>
              )}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Site Name</TableHead>
                    <TableHead className="hidden md:table-cell">Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">Address</TableHead>
                    <TableHead className="hidden lg:table-cell">Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site: any) => (
                    <TableRow key={site.id} className={!site.isActive ? 'opacity-60' : ''}>
                      <TableCell className="text-sm font-mono font-medium text-rose-600">{site.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{site.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{site.customer?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{site.customer?.name || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                        {site.address || '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-xs space-y-0.5">
                          <p className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {site.contactPerson || '—'}
                          </p>
                          <p className="text-muted-foreground">{site.contactPhone || '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            site.isActive ? statusConfig.active.color : statusConfig.inactive.color
                          )}
                        >
                          {site.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleViewDetail(site)}
                          >
                            <Eye className="h-3 w-3" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleEdit(site)}
                          >
                            <Pencil className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={cn('h-7 text-xs', site.isActive ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:text-emerald-700')}
                            onClick={() => toggleMutation.mutate({ id: site.id, isActive: !site.isActive })}
                          >
                            {site.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Site Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditingSite(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Site</DialogTitle>
            <DialogDescription>Update maintenance site information</DialogDescription>
          </DialogHeader>
          {editingSite && (
            <EditSiteForm
              site={editingSite}
              onSubmit={(body) => updateMutation.mutate({ id: editingSite.id, body })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Site Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setSelectedSiteId(null) }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-600" />
              {siteDetail?.data?.code} — {siteDetail?.data?.name}
            </DialogTitle>
            <DialogDescription>Site details and related information</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          ) : siteDetail?.data ? (
            <SiteDetailsPanel
              site={siteDetail.data}
              amcContracts={amcContracts}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Create Site Form ───
function CreateSiteForm({ customers, onSubmit, loading }: {
  customers: any[]
  onSubmit: (data: any) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    customerId: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body: Record<string, unknown> = {
      customerId: form.customerId,
      name: form.name,
    }
    if (form.address) body.address = form.address
    if (form.latitude) body.latitude = parseFloat(form.latitude)
    if (form.longitude) body.longitude = parseFloat(form.longitude)
    if (form.contactPerson) body.contactPerson = form.contactPerson
    if (form.contactPhone) body.contactPhone = form.contactPhone
    if (form.description) body.description = form.description
    onSubmit(body)
    setForm({ customerId: '', name: '', address: '', latitude: '', longitude: '', contactPerson: '', contactPhone: '', contactEmail: '', description: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer *</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.customerId}
            onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
            required
          >
            <option value="">Select customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Site Name *</Label>
          <Input
            placeholder="e.g., HQ Building"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Input
          placeholder="Full site address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Latitude</Label>
          <Input
            type="number"
            step="any"
            placeholder="e.g., 28.6139"
            value={form.latitude}
            onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Longitude</Label>
          <Input
            type="number"
            step="any"
            placeholder="e.g., 77.2090"
            value={form.longitude}
            onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contact Person</Label>
          <Input
            placeholder="Site contact name"
            value={form.contactPerson}
            onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Contact Phone</Label>
          <Input
            placeholder="Phone number"
            value={form.contactPhone}
            onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Contact Email</Label>
        <Input
          type="email"
          placeholder="email@example.com"
          value={form.contactEmail}
          onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          placeholder="Additional notes about this site..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={loading || !form.customerId || !form.name} className="bg-rose-600 hover:bg-rose-700">
          {loading ? 'Creating...' : 'Create Site'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Edit Site Form ───
function EditSiteForm({ site, onSubmit, loading }: {
  site: any
  onSubmit: (data: any) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    name: site.name || '',
    address: site.address || '',
    latitude: site.latitude ? String(site.latitude) : '',
    longitude: site.longitude ? String(site.longitude) : '',
    contactPerson: site.contactPerson || '',
    contactPhone: site.contactPhone || '',
    description: site.description || '',
    isActive: site.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body: Record<string, unknown> = {
      name: form.name,
      isActive: form.isActive,
    }
    if (form.address) body.address = form.address
    else body.address = null
    if (form.latitude) body.latitude = parseFloat(form.latitude)
    else body.latitude = null
    if (form.longitude) body.longitude = parseFloat(form.longitude)
    else body.longitude = null
    if (form.contactPerson) body.contactPerson = form.contactPerson
    else body.contactPerson = null
    if (form.contactPhone) body.contactPhone = form.contactPhone
    else body.contactPhone = null
    if (form.description) body.description = form.description
    else body.description = null
    onSubmit(body)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 flex items-center gap-2">
        <span className="text-xs font-mono text-rose-600 font-bold">{site.code}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{site.customer?.name}</span>
      </div>

      <div className="space-y-2">
        <Label>Site Name *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Latitude</Label>
          <Input
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Longitude</Label>
          <Input
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contact Person</Label>
          <Input
            value={form.contactPerson}
            onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Contact Phone</Label>
          <Input
            value={form.contactPhone}
            onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="relative flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
        </label>
        <Label>Active</Label>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Site Details Panel ───
function SiteDetailsPanel({ site, amcContracts }: { site: any; amcContracts: any[] }) {
  const { formatCurrency } = useFormat()
  const tickets = site.tickets || []
  const pmSchedules = site.pmSchedules || []
  const totalTickets = site._count?.tickets ?? 0
  const totalPM = site._count?.pmSchedules ?? 0

  // Extract unique assets from tickets
  const assets = useMemo(() => {
    const assetMap = new Map<string, any>()
    tickets.forEach((t: any) => {
      if (t.asset && t.asset.id && !assetMap.has(t.asset.id)) {
        assetMap.set(t.asset.id, t.asset)
      }
    })
    return Array.from(assetMap.values())
  }, [tickets])

  return (
    <ScrollArea className="h-[calc(85vh-120px)]">
      <Tabs defaultValue="info" className="w-full px-1">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1">Site Info</TabsTrigger>
          <TabsTrigger value="tickets" className="flex-1">Tickets ({totalTickets})</TabsTrigger>
          <TabsTrigger value="pm" className="flex-1">PM ({totalPM})</TabsTrigger>
          <TabsTrigger value="amc" className="flex-1">AMC</TabsTrigger>
        </TabsList>

        {/* Site Info Tab */}
        <TabsContent value="info" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField icon={<MapPin className="h-3.5 w-3.5" />} label="Site Code" value={site.code} />
            <InfoField icon={<Building2 className="h-3.5 w-3.5" />} label="Customer" value={site.customer?.name || '—'} />
            <InfoField icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={site.address || '—'} />
            <InfoField
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Status"
              value={
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    site.isActive ? statusConfig.active.color : statusConfig.inactive.color
                  )}
                >
                  {site.isActive ? 'Active' : 'Inactive'}
                </Badge>
              }
            />
            <InfoField icon={<Users className="h-3.5 w-3.5" />} label="Contact Person" value={site.contactPerson || '—'} />
            <InfoField icon={<Phone className="h-3.5 w-3.5" />} label="Contact Phone" value={site.contactPhone || '—'} />
            {site.latitude && site.longitude && (
              <InfoField
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Coordinates"
                value={`${site.latitude}, ${site.longitude}`}
              />
            )}
          </div>

          {site.description && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{site.description}</p>
            </div>
          )}

          {/* Equipment/Assets at Site */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-sky-600" />
                Equipment at Site ({assets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {assets.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 text-center">No equipment linked through tickets</p>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Asset</TableHead>
                        <TableHead className="text-xs">Category</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((a: any) => (
                        <TableRow key={a.id}>
                          <TableCell className="text-xs font-medium">{a.name || '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{a.category || '—'}</TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">
                            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {a.status || '—'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4 mt-4">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No active tickets at this site</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t: any) => {
                    const pri = ticketPriorityConfig[t.priority] || ticketPriorityConfig.medium
                    const stat = ticketStatusConfig[t.status] || ticketStatusConfig.new
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs font-mono font-medium text-rose-600">{t.ticketNo}</TableCell>
                        <TableCell className="text-xs font-medium max-w-[180px] truncate">{t.subject || '—'}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className={cn('text-xs', pri.color)}>{pri.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className={cn('text-xs', stat.color)}>{stat.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {t.assignedTechnician?.user?.name || 'Unassigned'}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-lg font-bold text-rose-600">
                {tickets.filter((t: any) => ['new', 'assigned', 'in_progress'].includes(t.status)).length}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">On Hold</p>
              <p className="text-lg font-bold text-amber-600">
                {tickets.filter((t: any) => t.status === 'on_hold').length}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-lg font-bold text-emerald-600">
                {tickets.filter((t: any) => t.status === 'resolved').length}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* PM Schedules Tab */}
        <TabsContent value="pm" className="space-y-4 mt-4">
          {pmSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No active PM schedules for this site</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {pmSchedules.map((pm: any) => {
                const nextDate = pm.nextVisitDate ? new Date(pm.nextVisitDate) : null
                const now = new Date()
                const daysUntil = nextDate ? Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
                return (
                  <Card key={pm.id} className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-rose-600 font-medium">{pm.pmNo}</span>
                        <span className="text-xs font-medium">{pm.name || '—'}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          daysUntil !== null
                            ? daysUntil < 0
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : daysUntil <= 3
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {daysUntil !== null ? (daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)}d` : daysUntil === 0 ? 'Due today' : `In ${daysUntil}d`) : 'No date'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {pm.frequency || '—'}
                      </span>
                      <span>
                        Visits: {pm.completedVisits ?? 0}/{pm.totalVisits ?? 0}
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* AMC Contracts Tab */}
        <TabsContent value="amc" className="space-y-4 mt-4">
          {amcContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No AMC contracts for this customer</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Value</TableHead>
                    <TableHead className="hidden sm:table-cell">Expiry</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amcContracts.map((amc: any) => {
                    const isExpired = amc.endDate && new Date(amc.endDate) < new Date()
                    const isExpiring = amc.endDate && !isExpired && (new Date(amc.endDate).getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000
                    return (
                      <TableRow key={amc.id}>
                        <TableCell className="text-xs font-mono font-medium text-rose-600">{amc.contractNo}</TableCell>
                        <TableCell className="text-xs">{amc.name || '—'}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">
                          {amc.annualValue ? formatCurrency(Number(amc.annualValue)) : '—'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {amc.endDate ? new Date(amc.endDate).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              isExpired
                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                : isExpiring
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                            )}
                          >
                            {isExpired ? 'Expired' : isExpiring ? 'Expiring' : 'Active'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ScrollArea>
  )
}

// ─── Info Field ───
function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {typeof value === 'string' ? (
          <p className="text-sm font-medium">{value}</p>
        ) : (
          value
        )}
      </div>
    </div>
  )
}
