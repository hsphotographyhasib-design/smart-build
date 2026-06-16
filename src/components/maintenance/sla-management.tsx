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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Pencil, Clock, Shield, AlertTriangle, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── অগ্রাধিকার রঙ কনফিগারেশন ───
const priorityConfig: Record<string, { label: string; color: string; border: string; bg: string; dot: string }> = {
  emergency: { label: 'Emergency', color: 'text-red-700 dark:text-red-400', border: 'border-red-300 dark:border-red-700', bg: 'bg-red-50 dark:bg-red-950/30', dot: 'bg-red-500' },
  high: { label: 'High', color: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700', bg: 'bg-orange-50 dark:bg-orange-950/30', dot: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/30', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-green-700 dark:text-green-400', border: 'border-green-300 dark:border-green-700', bg: 'bg-green-50 dark:bg-green-950/30', dot: 'bg-green-500' },
}

function formatHours(h: number) {
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  const rem = h % 24
  return rem > 0 ? `${d}d ${rem}h` : `${d}d`
}

export function SLAManagement() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingSLA, setEditingSLA] = useState<any>(null)

  // SLA টেমপ্লেট আনা
  const { data: slaData, isLoading } = useQuery({
    queryKey: ['maintenance-sla'],
    queryFn: () => api.get('/api/maintenance/sla'),
  })
  const slaTemplates = slaData?.data || []

  // SLA সম্মতি / লঙ্ঘনকৃত টিকেট আনা
  const { data: complianceData, isLoading: compLoading } = useQuery({
    queryKey: ['maintenance-sla-compliance'],
    queryFn: () => api.get('/api/maintenance/reports?type=sla'),
  })
  const compliance = complianceData?.data || {}

  // তৈরি মিউটেশন
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/sla', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-sla'] })
      setCreateOpen(false)
      toast({ title: 'SLA Template Created', description: 'New SLA template has been added.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to create SLA', variant: 'destructive' }),
  })

  // আপডেট মিউটেশন
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/api/maintenance/sla/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-sla'] })
      setEditOpen(false)
      setEditingSLA(null)
      toast({ title: 'SLA Updated', description: 'SLA template has been updated.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to update', variant: 'destructive' }),
  })

  // সক্রিয় টগল মিউটেশন
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.put(`/api/maintenance/sla/${id}`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-sla'] })
      toast({ title: 'Updated', description: 'SLA status toggled.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed to toggle', variant: 'destructive' }),
  })

  const handleEdit = (sla: any) => {
    setEditingSLA(sla)
    setEditOpen(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SLA Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Define and manage Service Level Agreement templates for maintenance tickets</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-rose-600 hover:bg-rose-700">
              <Plus className="h-3.5 w-3.5" /> New SLA Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create SLA Template</DialogTitle>
              <DialogDescription>Define response and resolution time targets</DialogDescription>
            </DialogHeader>
            <CreateSLAForm
              onSubmit={(body) => createMutation.mutate(body)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* SLA টেমপ্লেট কার্ড */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-rose-600" /> SLA Templates
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : slaTemplates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No SLA templates found</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slaTemplates.map((sla: any) => {
              const config = priorityConfig[sla.priority] || priorityConfig.medium
              return (
                <Card key={sla.id} className={cn('border-2 relative overflow-hidden', config.border, !sla.active && 'opacity-60')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-3 w-3 rounded-full', config.dot)} />
                        <CardTitle className="text-base">{config.label}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={sla.active}
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: sla.id, active: checked })}
                          className="data-[state=checked]:bg-rose-600"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className={cn('rounded-lg p-3 space-y-2', config.bg)}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Response
                        </span>
                        <span className={cn('text-sm font-bold', config.color)}>
                          {formatHours(sla.responseTimeHours)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Resolution
                        </span>
                        <span className={cn('text-sm font-bold', config.color)}>
                          {formatHours(sla.resolutionTimeHours)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {sla.priority}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleEdit(sla)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList>
          <TabsTrigger value="compliance">SLA Compliance</TabsTrigger>
          <TabsTrigger value="breached">Breached Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold mt-1">{compliance.totalTickets ?? '—'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Breached</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{compliance.breachedCount ?? '—'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Compliance %</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">{compliance.compliancePercent ?? '—'}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Avg Breach Duration</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">
                  {compliance.avgBreachDuration ? formatHours(compliance.avgBreachDuration) : '—'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* অগ্রাধিকার অনুযায়ী সম্মতি */}
          {compliance.byPriority && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Compliance by Priority</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Breached</TableHead>
                      <TableHead className="text-right">Compliance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(compliance.byPriority) ? compliance.byPriority : []).map((p: any) => {
                      const config = priorityConfig[p.priority] || priorityConfig.medium
                      return (
                        <TableRow key={p.priority}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn('h-2.5 w-2.5 rounded-full', config.dot)} />
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm">{p.total ?? 0}</TableCell>
                          <TableCell className="text-right text-sm text-red-600 font-medium">{p.breached ?? 0}</TableCell>
                          <TableCell className="text-right text-sm">
                            <Badge variant="secondary" className={p.compliancePercent >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : p.compliancePercent >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}>
                              {p.compliancePercent ?? 0}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="breached" className="space-y-4">
          {compLoading ? (
            <Card>
              <CardContent className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </CardContent>
            </Card>
          ) : !compliance.breachedTickets || compliance.breachedTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <TrendingUp className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No breached tickets</p>
                <p className="text-xs text-muted-foreground mt-1">Great job maintaining SLA compliance!</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Breached Tickets ({compliance.breachedTickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>SLA Deadline</TableHead>
                        <TableHead>Actual Time</TableHead>
                        <TableHead className="hidden lg:table-cell">Breach Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compliance.breachedTickets.map((t: any) => {
                        const config = priorityConfig[t.priority] || priorityConfig.medium
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="text-sm font-mono font-medium">{t.ticketNo}</TableCell>
                            <TableCell className="text-sm">{t.customerName || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn('text-xs', config.bg, config.color)}>
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {t.slaDeadline ? new Date(t.slaDeadline).toLocaleString() : '—'}
                            </TableCell>
                            <TableCell className="text-sm">{t.actualTime ? formatHours(t.actualTime) : '—'}</TableCell>
                            <TableCell className="text-sm text-red-600 font-medium hidden lg:table-cell">
                              {t.breachDuration ? formatHours(t.breachDuration) : '—'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* সম্পাদনা ডায়ালগ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit SLA Template</DialogTitle>
            <DialogDescription>Update response and resolution time targets</DialogDescription>
          </DialogHeader>
          {editingSLA && (
            <EditSLAForm
              sla={editingSLA}
              onSubmit={(body) => updateMutation.mutate({ id: editingSLA.id, body })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── SLA তৈরির ফর্ম ───
function CreateSLAForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    priority: 'emergency',
    responseTimeHours: 2,
    resolutionTimeHours: 4,
    description: '',
    active: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
    setForm({ priority: 'emergency', responseTimeHours: 2, resolutionTimeHours: 4, description: '', active: true })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Priority *</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
        >
          {Object.entries(priorityConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Response Time (hours) *</Label>
          <Input
            type="number"
            min={1}
            value={form.responseTimeHours}
            onChange={(e) => setForm((f) => ({ ...f, responseTimeHours: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Resolution Time (hours) *</Label>
          <Input
            type="number"
            min={1}
            value={form.resolutionTimeHours}
            onChange={(e) => setForm((f) => ({ ...f, resolutionTimeHours: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          placeholder="Brief description..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700">
          {loading ? 'Creating...' : 'Create SLA'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── SLA সম্পাদনার ফর্ম ───
function EditSLAForm({ sla, onSubmit, loading }: { sla: any; onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    responseTimeHours: sla.responseTimeHours || 2,
    resolutionTimeHours: sla.resolutionTimeHours || 4,
    description: sla.description || '',
    active: sla.active ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  const config = priorityConfig[sla.priority] || priorityConfig.medium

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={cn('rounded-lg p-3 flex items-center gap-2', config.bg)}>
        <span className={cn('h-3 w-3 rounded-full', config.dot)} />
        <span className={cn('font-semibold', config.color)}>{config.label} Priority</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Response Time (hours) *</Label>
          <Input
            type="number"
            min={1}
            value={form.responseTimeHours}
            onChange={(e) => setForm((f) => ({ ...f, responseTimeHours: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Resolution Time (hours) *</Label>
          <Input
            type="number"
            min={1}
            value={form.resolutionTimeHours}
            onChange={(e) => setForm((f) => ({ ...f, resolutionTimeHours: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          placeholder="Brief description..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={form.active}
          onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
          className="data-[state=checked]:bg-rose-600"
        />
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