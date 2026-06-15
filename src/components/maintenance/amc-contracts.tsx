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
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Pencil, FileText, DollarSign, CalendarDays,
  RefreshCw, Eye, CreditCard, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Config ───
const amcStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
}

const frequencyLabels: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
}

function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val.toFixed(0)}`
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export function AMCContracts() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editingAMC, setEditingAMC] = useState<any>(null)
  const [viewingAMC, setViewingAMC] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch AMC contracts
  const { data: amcData, isLoading } = useQuery({
    queryKey: ['maintenance-amc', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      return api.get(`/api/maintenance/amc${params.toString() ? `?${params.toString()}` : ''}`)
    },
  })
  const contracts = amcData?.data || []

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['customers-amc'],
    queryFn: () => api.get('/api/customers'),
  })
  const customers = customersData?.data || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/amc', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-amc'] })
      setCreateOpen(false)
      toast({ title: 'AMC Contract Created', description: 'New AMC contract added.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/api/maintenance/amc/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-amc'] })
      setEditOpen(false)
      setEditingAMC(null)
      toast({ title: 'Updated', description: 'AMC contract updated.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // Compute stats
  const now = new Date()
  const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const activeContracts = contracts.filter((c: any) => c.status === 'active').length
  const expiring = contracts.filter((c: any) => {
    if (c.status !== 'active') return false
    const end = c.endDate ? new Date(c.endDate) : null
    return end && end <= monthLater
  }).length
  const expired = contracts.filter((c: any) => c.status === 'expired').length
  const totalValue = contracts.reduce((sum: number, c: any) => sum + (c.annualValue || 0), 0)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Contracts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage Annual Maintenance Contracts with customers</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-3.5 w-3.5" /> New AMC Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create AMC Contract</DialogTitle>
              <DialogDescription>Set up a new annual maintenance contract</DialogDescription>
            </DialogHeader>
            <CreateAMCForm
              customers={customers}
              onSubmit={(body) => createMutation.mutate(body)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-emerald-600" />
              <p className="text-xs text-muted-foreground">Active Contracts</p>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{activeContracts}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-xs text-muted-foreground">Expiring (30d)</p>
            </div>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{expiring}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-red-600" />
              <p className="text-xs text-muted-foreground">Expired</p>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{expired}</p>
          </CardContent>
        </Card>
        <Card className="border-violet-200 dark:border-violet-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-violet-600" />
              <p className="text-xs text-muted-foreground">Total Annual Value</p>
            </div>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'expiring', 'expired', 'cancelled', 'pending'].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            className={statusFilter === s ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No AMC contracts found</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Create Contract
              </Button>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-background z-10">
                    <TableHead>Contract #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Name</TableHead>
                    <TableHead className="hidden lg:table-cell">Period</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Annual Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((amc: any) => {
                    const stat = amcStatusConfig[amc.status] || amcStatusConfig.pending
                    const visitsUsed = amc.visitsUsed || 0
                    const totalVisits = amc.totalVisits || 1
                    const pct = Math.round((visitsUsed / totalVisits) * 100)
                    return (
                      <TableRow key={amc.id}>
                        <TableCell className="text-sm font-mono font-medium">{amc.amcNo}</TableCell>
                        <TableCell className="text-sm">{amc.customerName || amc.customer?.name || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[160px] truncate">{amc.name || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(amc.startDate)} – {formatDate(amc.endDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress value={pct} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{visitsUsed}/{totalVisits}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{formatCurrency(amc.annualValue || 0)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-xs', stat.color)}>{stat.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setViewingAMC(amc); setViewOpen(true) }} title="View">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingAMC(amc); setEditOpen(true) }} title="Edit">
                              <Pencil className="h-3 w-3" />
                            </Button>
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

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>AMC Contract Details</DialogTitle>
          </DialogHeader>
          {viewingAMC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Contract #:</span> <span className="font-medium">{viewingAMC.amcNo}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className={cn('text-xs', amcStatusConfig[viewingAMC.status]?.color)}>{amcStatusConfig[viewingAMC.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{viewingAMC.customerName || '—'}</span></div>
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{viewingAMC.name || '—'}</span></div>
                <div><span className="text-muted-foreground">Start:</span> <span>{formatDate(viewingAMC.startDate)}</span></div>
                <div><span className="text-muted-foreground">End:</span> <span>{formatDate(viewingAMC.endDate)}</span></div>
                <div><span className="text-muted-foreground">Visits:</span> <span>{viewingAMC.visitsUsed || 0} / {viewingAMC.totalVisits}</span></div>
                <div><span className="text-muted-foreground">Frequency:</span> <span>{frequencyLabels[viewingAMC.visitFrequency] || viewingAMC.visitFrequency}</span></div>
                <div><span className="text-muted-foreground">Annual Value:</span> <span className="font-medium">{formatCurrency(viewingAMC.annualValue || 0)}</span></div>
                <div><span className="text-muted-foreground">Auto Renew:</span> <span>{viewingAMC.autoRenew ? 'Yes' : 'No'}</span></div>
              </div>
              {viewingAMC.description && (
                <div className="text-sm"><span className="text-muted-foreground">Description:</span> <p className="mt-1">{viewingAMC.description}</p></div>
              )}
              {viewingAMC.coveredEquipment && (
                <div className="text-sm"><span className="text-muted-foreground">Covered Equipment:</span> <p className="mt-1 text-xs bg-muted rounded p-2">{viewingAMC.coveredEquipment}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit AMC Contract</DialogTitle>
            <DialogDescription>Update contract details</DialogDescription>
          </DialogHeader>
          {editingAMC && (
            <EditAMCForm
              amc={editingAMC}
              customers={customers}
              onSubmit={(body) => updateMutation.mutate({ id: editingAMC.id, body })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Create AMC Form ───
function CreateAMCForm({ customers, onSubmit, loading }: {
  customers: any[]; onSubmit: (data: any) => void; loading: boolean
}) {
  const [form, setForm] = useState({
    customerId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    totalVisits: 12,
    visitFrequency: 'monthly',
    annualValue: 0,
    slaPriority: 'medium',
    autoRenew: false,
    coveredEquipment: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId || !form.name || !form.startDate || !form.endDate) return
    onSubmit({
      ...form,
      annualValue: Number(form.annualValue),
      totalVisits: Number(form.totalVisits),
    })
    setForm({ customerId: '', name: '', description: '', startDate: '', endDate: '', totalVisits: 12, visitFrequency: 'monthly', annualValue: 0, slaPriority: 'medium', autoRenew: false, coveredEquipment: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer *</Label>
          <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
            <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
            <SelectContent>
              {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Contract Name *</Label>
          <Input placeholder="e.g. HVAC Maintenance 2025" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Contract description..." rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>End Date *</Label>
          <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Total Visits</Label>
          <Input type="number" min={1} value={form.totalVisits} onChange={(e) => setForm((f) => ({ ...f, totalVisits: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={form.visitFrequency} onValueChange={(v) => setForm((f) => ({ ...f, visitFrequency: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(frequencyLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Annual Value ($)</Label>
          <Input type="number" min={0} value={form.annualValue} onChange={(e) => setForm((f) => ({ ...f, annualValue: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>SLA Priority</Label>
        <Select value={form.slaPriority} onValueChange={(v) => setForm((f) => ({ ...f, slaPriority: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Covered Equipment</Label>
        <Textarea placeholder='["HVAC System", "Elevator", "Fire Alarm"]' rows={2} value={form.coveredEquipment} onChange={(e) => setForm((f) => ({ ...f, coveredEquipment: e.target.value }))} />
        <p className="text-xs text-muted-foreground">Enter as JSON array of equipment names</p>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.autoRenew} onCheckedChange={(c) => setForm((f) => ({ ...f, autoRenew: c }))} className="data-[state=checked]:bg-emerald-600" />
        <Label>Auto Renew</Label>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={loading || !form.customerId || !form.name || !form.startDate || !form.endDate} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? 'Creating...' : 'Create Contract'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Edit AMC Form ───
function EditAMCForm({ amc, customers, onSubmit, loading }: {
  amc: any; customers: any[]; onSubmit: (data: any) => void; loading: boolean
}) {
  const [form, setForm] = useState({
    name: amc.name || '',
    description: amc.description || '',
    startDate: amc.startDate ? amc.startDate.split('T')[0] : '',
    endDate: amc.endDate ? amc.endDate.split('T')[0] : '',
    totalVisits: amc.totalVisits || 12,
    visitFrequency: amc.visitFrequency || 'monthly',
    annualValue: amc.annualValue || 0,
    slaPriority: amc.slaPriority || 'medium',
    autoRenew: amc.autoRenew ?? false,
    coveredEquipment: amc.coveredEquipment || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      annualValue: Number(form.annualValue),
      totalVisits: Number(form.totalVisits),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Customer</Label>
        <Input value={amc.customerName || '—'} disabled />
      </div>
      <div className="space-y-2">
        <Label>Contract Name</Label>
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Total Visits</Label>
          <Input type="number" min={1} value={form.totalVisits} onChange={(e) => setForm((f) => ({ ...f, totalVisits: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={form.visitFrequency} onValueChange={(v) => setForm((f) => ({ ...f, visitFrequency: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(frequencyLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Annual Value ($)</Label>
          <Input type="number" min={0} value={form.annualValue} onChange={(e) => setForm((f) => ({ ...f, annualValue: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>SLA Priority</Label>
        <Select value={form.slaPriority} onValueChange={(v) => setForm((f) => ({ ...f, slaPriority: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Covered Equipment</Label>
        <Textarea rows={2} value={form.coveredEquipment} onChange={(e) => setForm((f) => ({ ...f, coveredEquipment: e.target.value }))} />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.autoRenew} onCheckedChange={(c) => setForm((f) => ({ ...f, autoRenew: c }))} className="data-[state=checked]:bg-emerald-600" />
        <Label>Auto Renew</Label>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  )
}