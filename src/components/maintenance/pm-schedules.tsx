'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Pencil, CalendarClock, Wrench, AlertTriangle, CheckCircle,
  Clock, PlayCircle, Ban, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Config ───
const typeLabels: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  deactivated: { label: 'Deactivated', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
}

function getNextVisitColor(nextVisit: string | null) {
  if (!nextVisit) return ''
  const now = new Date()
  const nv = new Date(nextVisit)
  const diffHours = (nv.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (diffHours < 0) return 'text-red-600 font-medium'
  if (diffHours < 72) return 'text-amber-600 font-medium'
  return 'text-green-600'
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export function PMSchedules() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingPM, setEditingPM] = useState<any>(null)
  const [tab, setTab] = useState('active')

  // Fetch PM schedules
  const { data: pmData, isLoading } = useQuery({
    queryKey: ['maintenance-pm-schedules', tab],
    queryFn: () => {
      const params = new URLSearchParams()
      if (tab === 'active') params.set('status', 'active')
      return api.get(`/api/maintenance/pm-schedules${params.toString() ? `?${params.toString()}` : ''}`)
    },
  })
  const schedules = pmData?.data || []

  // Fetch dropdown data
  const { data: customersData } = useQuery({
    queryKey: ['customers-pm'],
    queryFn: () => api.get('/api/customers'),
  })
  const customers = customersData?.data || []

  const { data: sitesData } = useQuery({
    queryKey: ['maintenance-sites-pm'],
    queryFn: () => api.get('/api/maintenance/sites'),
  })
  const sites = sitesData?.data || []

  const { data: techsData } = useQuery({
    queryKey: ['maintenance-technicians-pm'],
    queryFn: () => api.get('/api/maintenance/technicians'),
  })
  const technicians = techsData?.data || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/pm-schedules', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-pm-schedules'] })
      setCreateOpen(false)
      toast({ title: 'PM Schedule Created', description: 'New preventive maintenance schedule added.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to create', variant: 'destructive' }),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/api/maintenance/pm-schedules/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-pm-schedules'] })
      setEditOpen(false)
      setEditingPM(null)
      toast({ title: 'Updated', description: 'PM schedule updated.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to update', variant: 'destructive' }),
  })

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/maintenance/pm-schedules/${id}`, { status: 'deactivated' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-pm-schedules'] })
      toast({ title: 'Deactivated', description: 'PM schedule has been deactivated.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // Compute stats
  const allSchedules = pmData?.data || []
  const activePMs = allSchedules.filter((s: any) => s.status === 'active').length
  const now = new Date()
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcoming = allSchedules.filter((s: any) => {
    const nv = s.nextVisitDate ? new Date(s.nextVisitDate) : null
    return nv && nv >= now && nv <= weekLater && s.status === 'active'
  }).length
  const overdue = allSchedules.filter((s: any) => {
    const nv = s.nextVisitDate ? new Date(s.nextVisitDate) : null
    return nv && nv < now && s.status === 'active'
  }).length
  const completedThisMonth = allSchedules.filter((s: any) => {
    if (s.status !== 'completed') return false
    const d = s.completedAt ? new Date(s.completedAt) : null
    return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Preventive Maintenance Schedules</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage scheduled maintenance to prevent equipment failures</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-3.5 w-3.5" /> New PM Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create PM Schedule</DialogTitle>
              <DialogDescription>Set up a new preventive maintenance schedule</DialogDescription>
            </DialogHeader>
            <CreatePMForm
              customers={customers}
              sites={sites}
              technicians={technicians}
              onSubmit={(body) => createMutation.mutate(body)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="h-4 w-4 text-cyan-600" />
              <p className="text-xs text-muted-foreground">Active PMs</p>
            </div>
            <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">{activePMs}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-green-600" />
              <p className="text-xs text-muted-foreground">Upcoming (7d)</p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{upcoming}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{overdue}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-muted-foreground">Completed (Month)</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{completedThisMonth}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Schedules</TabsTrigger>
            <TabsTrigger value="all">All Schedules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Wrench className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No PM schedules found</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Create Schedule
                  </Button>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="sticky top-0 bg-background z-10">
                        <TableHead>Schedule #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden md:table-cell">Site</TableHead>
                        <TableHead className="hidden lg:table-cell">Equipment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                        <TableHead>Next Visit</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((pm: any) => {
                        const stat = statusConfig[pm.status] || statusConfig.active
                        const visitsCompleted = pm.visitsCompleted || 0
                        const totalVisits = pm.totalVisits || 1
                        const progressPct = Math.round((visitsCompleted / totalVisits) * 100)
                        return (
                          <TableRow key={pm.id}>
                            <TableCell className="text-sm font-mono font-medium">{pm.pmNo}</TableCell>
                            <TableCell className="text-sm">{pm.customerName || pm.customer?.name || '—'}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{pm.siteName || pm.site?.name || '—'}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{pm.equipmentName || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {typeLabels[pm.scheduleType] || pm.scheduleType}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatDate(pm.lastVisitDate)}</TableCell>
                            <TableCell className={cn('text-sm', getNextVisitColor(pm.nextVisitDate))}>
                              {formatDate(pm.nextVisitDate)}
                            </TableCell>
                            <TableCell className="w-28">
                              <div className="flex items-center gap-2">
                                <Progress value={progressPct} className="h-2 flex-1" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{visitsCompleted}/{totalVisits}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn('text-xs', stat.color)}>{stat.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingPM(pm); setEditOpen(true) }} title="Edit">
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                {pm.status === 'active' && (
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => deactivateMutation.mutate(pm.id)} title="Deactivate">
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit PM Schedule</DialogTitle>
            <DialogDescription>Update schedule details</DialogDescription>
          </DialogHeader>
          {editingPM && (
            <EditPMForm
              pm={editingPM}
              customers={customers}
              sites={sites}
              technicians={technicians}
              onSubmit={(body) => updateMutation.mutate({ id: editingPM.id, body })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Create PM Form ───
function CreatePMForm({ customers, sites, technicians, onSubmit, loading }: {
  customers: any[]; sites: any[]; technicians: any[]; onSubmit: (data: any) => void; loading: boolean
}) {
  const [form, setForm] = useState({
    customerId: '',
    siteId: '',
    equipmentName: '',
    scheduleType: 'monthly',
    assignedTechnicianId: '',
    totalVisits: 12,
    description: '',
    autoGenerateWorkOrder: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId) return
    onSubmit({
      ...form,
      totalVisits: Number(form.totalVisits),
      assignedTechnicianId: form.assignedTechnicianId || undefined,
    })
    setForm({ customerId: '', siteId: '', equipmentName: '', scheduleType: 'monthly', assignedTechnicianId: '', totalVisits: 12, description: '', autoGenerateWorkOrder: true })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Customer *</Label>
        <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
          <SelectContent>
            {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Site</Label>
          <Select value={form.siteId} onValueChange={(v) => setForm((f) => ({ ...f, siteId: v }))}>
            <SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger>
            <SelectContent>
              {sites.filter((s: any) => !form.customerId || s.customerId === form.customerId).map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Equipment</Label>
          <Input placeholder="Equipment name" value={form.equipmentName} onChange={(e) => setForm((f) => ({ ...f, equipmentName: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Schedule Type *</Label>
        <div className="flex flex-wrap gap-3">
          {Object.entries(typeLabels).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="scheduleType"
                value={key}
                checked={form.scheduleType === key}
                onChange={(e) => setForm((f) => ({ ...f, scheduleType: e.target.value }))}
                className="accent-cyan-600"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Assigned Technician</Label>
          <Select value={form.assignedTechnicianId} onValueChange={(v) => setForm((f) => ({ ...f, assignedTechnicianId: v }))}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {technicians.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Total Visits</Label>
          <Input type="number" min={1} value={form.totalVisits} onChange={(e) => setForm((f) => ({ ...f, totalVisits: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Schedule description..." rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.autoGenerateWorkOrder} onCheckedChange={(c) => setForm((f) => ({ ...f, autoGenerateWorkOrder: c }))} className="data-[state=checked]:bg-cyan-600" />
        <Label>Auto Generate Work Order</Label>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={loading || !form.customerId} className="bg-cyan-600 hover:bg-cyan-700">
          {loading ? 'Creating...' : 'Create Schedule'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Edit PM Form ───
function EditPMForm({ pm, customers, sites, technicians, onSubmit, loading }: {
  pm: any; customers: any[]; sites: any[]; technicians: any[]; onSubmit: (data: any) => void; loading: boolean
}) {
  const [form, setForm] = useState({
    customerId: pm.customerId || '',
    siteId: pm.siteId || '',
    equipmentName: pm.equipmentName || '',
    scheduleType: pm.scheduleType || 'monthly',
    assignedTechnicianId: pm.assignedTechnicianId || '',
    totalVisits: pm.totalVisits || 12,
    visitsCompleted: pm.visitsCompleted || 0,
    description: pm.description || '',
    autoGenerateWorkOrder: pm.autoGenerateWorkOrder ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      totalVisits: Number(form.totalVisits),
      visitsCompleted: Number(form.visitsCompleted),
      assignedTechnicianId: form.assignedTechnicianId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Customer</Label>
        <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
          <SelectContent>
            {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Site</Label>
          <Select value={form.siteId} onValueChange={(v) => setForm((f) => ({ ...f, siteId: v }))}>
            <SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger>
            <SelectContent>
              {sites.filter((s: any) => !form.customerId || s.customerId === form.customerId).map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Equipment</Label>
          <Input placeholder="Equipment name" value={form.equipmentName} onChange={(e) => setForm((f) => ({ ...f, equipmentName: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Schedule Type</Label>
        <div className="flex flex-wrap gap-3">
          {Object.entries(typeLabels).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="editScheduleType" value={key} checked={form.scheduleType === key} onChange={(e) => setForm((f) => ({ ...f, scheduleType: e.target.value }))} className="accent-cyan-600" />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Technician</Label>
          <Select value={form.assignedTechnicianId} onValueChange={(v) => setForm((f) => ({ ...f, assignedTechnicianId: v }))}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {technicians.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Total Visits</Label>
          <Input type="number" min={1} value={form.totalVisits} onChange={(e) => setForm((f) => ({ ...f, totalVisits: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Completed</Label>
          <Input type="number" min={0} value={form.visitsCompleted} onChange={(e) => setForm((f) => ({ ...f, visitsCompleted: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Description..." rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.autoGenerateWorkOrder} onCheckedChange={(c) => setForm((f) => ({ ...f, autoGenerateWorkOrder: c }))} className="data-[state=checked]:bg-cyan-600" />
        <Label>Auto Generate Work Order</Label>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  )
}