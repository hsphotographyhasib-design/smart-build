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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Plus, Search, Filter, ChevronDown, ChevronUp, FileText, DollarSign,
  Clock, CheckCircle2, CircleDot, Play, Pause, Wrench, User, MapPin,
  Calendar, Timer, Package, Image as ImageIcon, ExternalLink,
  ArrowRight, TrendingUp, AlertCircle, ListOrdered, X as XIcon,
  ClipboardList, Eye, RefreshCw, Trash2, CalendarDays,
} from 'lucide-react'

// ─── Types ───
interface WorkOrder {
  id: string
  woNo: string
  status: string
  startDate: string
  targetDate: string
  completedDate?: string
  serviceNotes?: string
  completionNotes?: string
  laborCost: number
  materialCost: number
  otherCost: number
  totalCost: number
  createdAt: string
  ticket: {
    id: string
    ticketNo: string
    subject: string
    priority: string
    customer: { id: string; name: string } | null
    site: { id: string; name: string } | null
  }
  technician: {
    id: string
    employee: { id: string; name: string } | null
  } | null
  materialRequests?: Array<{ id: string; mrNo: string; status: string }>
  photos?: Array<{ id: string; url: string }>
  invoice?: { id: string; invoiceNo: string }
}

interface UnworkedTicket {
  id: string
  ticketNo: string
  subject: string
  priority: string
  customer: { id: string; name: string } | null
  site: { id: string; name: string } | null
  technician: { id: string; employee: { name: string } | null } | null
  status: string
}

// ─── Config ───
const statusConfig: Record<string, { label: string; color: string; step: number; icon: any }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', step: 0, icon: FileText },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', step: 1, icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', step: 2, icon: Play },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', step: 2, icon: Pause },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', step: 3, icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', step: -1, icon: XIcon },
}

const priorityConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dotColor: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', dotColor: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', dotColor: 'bg-amber-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dotColor: 'bg-green-500' },
}

const materialStatusConfig: Record<string, { label: string; color: string }> = {
  requested: { label: 'Requested', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  supervisor_approved: { label: 'Supervisor Approved', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  store_approved: { label: 'Store Approved', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
  issued: { label: 'Issued', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val.toFixed(0)}`
}

// ─── Main Component ───
export function WorkOrders() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [technicianFilter, setTechnicianFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  // Fetch work orders
  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-work-orders', statusFilter, customerFilter, technicianFilter, dateFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (customerFilter !== 'all') params.set('customerId', customerFilter)
      if (technicianFilter !== 'all') params.set('technicianId', technicianFilter)
      const qs = params.toString()
      return api.get<WorkOrder[]>(`/api/maintenance/work-orders${qs ? `?${qs}` : ''}`).then(r => r.data || [])
    },
  })

  // Fetch un-work-ordered tickets for creation
  const { data: ticketsData } = useQuery({
    queryKey: ['unworked-tickets'],
    queryFn: () => api.get<UnworkedTicket[]>('/api/maintenance/tickets?hasWorkOrder=false&status=assigned,accepted,in_progress,completed,verified').then(r => r.data || []),
  })

  const workOrders = data || []
  const unworkedTickets = ticketsData || []

  // Create work order mutation
  const createWOMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/work-orders', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-work-orders'] })
      queryClient.invalidateQueries({ queryKey: ['unworked-tickets'] })
      setCreateOpen(false)
      toast({ title: 'Work Order Created', description: 'New work order has been created successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Creation Failed', description: err.error || 'Failed to create work order', variant: 'destructive' })
    },
  })

  // Update work order mutation
  const updateWOMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; [key: string]: any }) =>
      api.put(`/api/maintenance/work-orders/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-work-orders'] })
      setStatusUpdateOpen(false)
      toast({ title: 'Work Order Updated', description: 'Status has been updated.' })
    },
    onError: (err: any) => {
      toast({ title: 'Update Failed', description: err.error || 'Failed to update', variant: 'destructive' })
    },
  })

  // Stats
  const stats = useMemo(() => {
    const total = workOrders.length
    const pending = workOrders.filter(wo => wo.status === 'pending' || wo.status === 'draft').length
    const inProgress = workOrders.filter(wo => wo.status === 'in_progress' || wo.status === 'on_hold').length
    const completed = workOrders.filter(wo => wo.status === 'completed').length
    const totalCost = workOrders.reduce((sum, wo) => sum + (wo.totalCost || 0), 0)
    return { total, pending, inProgress, completed, totalCost }
  }, [workOrders])

  // Unique customers/technicians for filters
  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, string>()
    workOrders.forEach(wo => {
      if (wo.ticket?.customer?.id && wo.ticket.customer.name) {
        map.set(wo.ticket.customer.id, wo.ticket.customer.name)
      }
    })
    return Array.from(map.entries())
  }, [workOrders])

  const uniqueTechnicians = useMemo(() => {
    const map = new Map<string, string>()
    workOrders.forEach(wo => {
      if (wo.technician?.id && wo.technician.employee?.name) {
        map.set(wo.technician.id, wo.technician.employee.name)
      }
    })
    return Array.from(map.entries())
  }, [workOrders])

  // Search filter
  const filtered = useMemo(() => {
    if (!searchQuery) return workOrders
    const q = searchQuery.toLowerCase()
    return workOrders.filter(wo =>
      wo.woNo.toLowerCase().includes(q) ||
      wo.ticket?.ticketNo?.toLowerCase().includes(q) ||
      wo.ticket?.subject?.toLowerCase().includes(q) ||
      wo.ticket?.customer?.name?.toLowerCase().includes(q) ||
      wo.technician?.employee?.name?.toLowerCase().includes(q)
    )
  }, [workOrders, searchQuery])

  const openStatusUpdate = (wo: WorkOrder) => {
    setSelectedWO(wo)
    setNewStatus(wo.status)
    setStatusUpdateOpen(true)
  }

  const openDetail = (wo: WorkOrder) => {
    setSelectedWO(wo)
    setDetailOpen(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-rose-600" />
            Work Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage maintenance work orders, costs, and progress</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-rose-600 hover:bg-rose-700">
              <Plus className="h-3.5 w-3.5" /> Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Work Order</DialogTitle>
              <p className="text-sm text-muted-foreground">Select a ticket to create a work order</p>
            </DialogHeader>
            <CreateWOForm
              tickets={unworkedTickets}
              onSubmit={(data) => createWOMutation.mutate(data)}
              loading={createWOMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total WOs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                <ListOrdered className="h-4 w-4 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Play className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by WO#, ticket#, customer, technician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {uniqueCustomers.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="sm:w-44">
                <SelectValue placeholder="All Technicians" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {uniqueTechnicians.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="sm:w-36">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ClipboardList className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No work orders found</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Create Work Order
              </Button>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-xs">WO#</TableHead>
                    <TableHead className="text-xs">Ticket#</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Technician</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Start Date</TableHead>
                    <TableHead className="text-xs">Target Date</TableHead>
                    <TableHead className="text-xs text-right">Cost</TableHead>
                    <TableHead className="text-xs w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((wo) => {
                    const stat = statusConfig[wo.status] || statusConfig.draft
                    const pri = priorityConfig[wo.ticket?.priority] || priorityConfig.medium
                    const isExpanded = expandedId === wo.id
                    return (
                      <React.Fragment key={wo.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => setExpandedId(prev => prev === wo.id ? null : wo.id)}
                        >
                          <TableCell className="py-3">
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-medium text-rose-600">{wo.woNo}</TableCell>
                          <TableCell className="text-xs font-mono">{wo.ticket?.ticketNo || '—'}</TableCell>
                          <TableCell className="text-xs">{wo.ticket?.customer?.name || '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{wo.technician?.employee?.name || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={cn('gap-1 text-[10px] px-1.5 py-0', stat.color)}>
                              <stat.icon className="h-3 w-3" />
                              {stat.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {wo.startDate ? new Date(wo.startDate).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {wo.targetDate ? new Date(wo.targetDate).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">
                            {formatCurrency(wo.totalCost || 0)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openDetail(wo) }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openStatusUpdate(wo) }}>
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={10} className="bg-muted/20 px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Service Info */}
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Service Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground text-xs">Subject:</span>
                                      <p className="font-medium text-xs">{wo.ticket?.subject || '—'}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground text-xs">Priority:</span>
                                      <Badge variant="secondary" className={cn('ml-1 text-[10px]', pri.color)}>
                                        {pri.label}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground text-xs">Site:</span>
                                      <p className="font-medium text-xs">{wo.ticket?.site?.name || '—'}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Service Notes */}
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Service Notes</h4>
                                  <p className="text-xs text-muted-foreground max-h-24 overflow-y-auto">
                                    {wo.serviceNotes || 'No service notes recorded'}
                                  </p>
                                </div>

                                {/* Cost Summary */}
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Cost Summary</h4>
                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Labor:</span>
                                      <span className="font-medium">{formatCurrency(wo.laborCost || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Material:</span>
                                      <span className="font-medium">{formatCurrency(wo.materialCost || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Other:</span>
                                      <span className="font-medium">{formatCurrency(wo.otherCost || 0)}</span>
                                    </div>
                                    <Separator className="my-1" />
                                    <div className="flex justify-between font-semibold">
                                      <span>Total:</span>
                                      <span className="text-rose-600">{formatCurrency(wo.totalCost || 0)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Links & Materials */}
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Related</h4>
                                  <div className="space-y-2">
                                    {/* Material Requests */}
                                    {wo.materialRequests && wo.materialRequests.length > 0 && (
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                          <Package className="h-3 w-3" /> Material Requests
                                        </p>
                                        <div className="space-y-1">
                                          {wo.materialRequests.slice(0, 3).map(mr => {
                                            const ms = materialStatusConfig[mr.status] || materialStatusConfig.requested
                                            return (
                                              <div key={mr.id} className="flex items-center justify-between text-xs">
                                                <span className="font-mono">{mr.mrNo}</span>
                                                <Badge variant="secondary" className={cn('text-[10px] px-1 py-0', ms.color)}>
                                                  {ms.label}
                                                </Badge>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Photos */}
                                    {wo.photos && wo.photos.length > 0 && (
                                      <div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <ImageIcon className="h-3 w-3" /> {wo.photos.length} photo(s) attached
                                        </p>
                                      </div>
                                    )}

                                    {/* Invoice */}
                                    {wo.invoice && (
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="font-mono font-medium text-rose-600">{wo.invoice.invoiceNo}</span>
                                      </div>
                                    )}

                                    {!wo.materialRequests?.length && !wo.photos?.length && !wo.invoice && (
                                      <p className="text-xs text-muted-foreground">No related items</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-rose-600">{selectedWO?.woNo}</span>
              <Badge variant="secondary" className={cn('text-[10px]', statusConfig[selectedWO?.status || 'draft']?.color)}>
                {statusConfig[selectedWO?.status || 'draft']?.label}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedWO && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Ticket Info */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Ticket Information</h4>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Ticket #:</span>
                        <p className="font-mono font-medium text-xs">{selectedWO.ticket?.ticketNo}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Customer:</span>
                        <p className="font-medium text-xs">{selectedWO.ticket?.customer?.name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Site:</span>
                        <p className="font-medium text-xs">{selectedWO.ticket?.site?.name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Technician:</span>
                        <p className="font-medium text-xs">{selectedWO.technician?.employee?.name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Start Date:</span>
                        <p className="text-xs">{selectedWO.startDate ? new Date(selectedWO.startDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Target Date:</span>
                        <p className="text-xs">{selectedWO.targetDate ? new Date(selectedWO.targetDate).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Subject:</span>
                      <p className="font-medium text-xs">{selectedWO.ticket?.subject}</p>
                    </div>
                  </div>
                </div>

                {/* Service Notes */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Service Notes</h4>
                  <p className="text-sm">{selectedWO.serviceNotes || 'No service notes recorded'}</p>
                </div>

                {/* Completion Notes */}
                {selectedWO.completionNotes && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Completion Notes</h4>
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                      <p className="text-sm">{selectedWO.completionNotes}</p>
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Cost Breakdown</h4>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Labor Cost</span>
                      <span className="font-medium">{formatCurrency(selectedWO.laborCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material Cost</span>
                      <span className="font-medium">{formatCurrency(selectedWO.materialCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other Costs</span>
                      <span className="font-medium">{formatCurrency(selectedWO.otherCost || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span className="text-rose-600">{formatCurrency(selectedWO.totalCost || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Material Requests */}
                {selectedWO.materialRequests && selectedWO.materialRequests.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Material Requests</h4>
                    <div className="space-y-2">
                      {selectedWO.materialRequests.map(mr => {
                        const ms = materialStatusConfig[mr.status] || materialStatusConfig.requested
                        return (
                          <div key={mr.id} className="flex items-center justify-between p-2.5 rounded-lg border text-sm">
                            <span className="font-mono text-xs font-medium">{mr.mrNo}</span>
                            <Badge variant="secondary" className={cn('text-[10px]', ms.color)}>
                              {ms.label}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {selectedWO.photos && selectedWO.photos.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Photos ({selectedWO.photos.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedWO.photos.map(photo => (
                        <div key={photo.id} className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoice */}
                {selectedWO.invoice && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Invoice</h4>
                    <div className="flex items-center gap-2 p-3 rounded-lg border">
                      <FileText className="h-5 w-5 text-rose-600" />
                      <div>
                        <p className="font-mono font-medium text-sm">{selectedWO.invoice.invoiceNo}</p>
                        <p className="text-xs text-muted-foreground">View invoice for full billing details</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {selectedWO && selectedWO.status !== 'completed' && selectedWO.status !== 'cancelled' && (
              <Button
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => { setDetailOpen(false); openStatusUpdate(selectedWO) }}
              >
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Work Order Status</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedWO?.woNo} — Currently: {statusConfig[selectedWO?.status || 'draft']?.label}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig)
                    .filter(([key]) => key !== 'cancelled')
                    .map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <val.icon className="h-3.5 w-3.5" />
                          {val.label}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'completed' && (
              <div className="space-y-2">
                <Label>Completion Notes</Label>
                <Textarea
                  placeholder="Describe the work completed..."
                  rows={3}
                  id="completion-notes"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              disabled={newStatus === selectedWO?.status || updateWOMutation.isPending}
              onClick={() => {
                if (!selectedWO) return
                const body: any = { id: selectedWO.id, status: newStatus }
                if (newStatus === 'completed') {
                  const notes = (document.getElementById('completion-notes') as HTMLTextAreaElement)?.value
                  if (notes) body.completionNotes = notes
                  body.completedDate = new Date().toISOString()
                }
                updateWOMutation.mutate(body)
              }}
            >
              {updateWOMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Create Work Order Form ───
function CreateWOForm({
  tickets,
  onSubmit,
  loading,
}: {
  tickets: UnworkedTicket[]
  onSubmit: (data: any) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    ticketId: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    serviceNotes: '',
    laborCost: 0,
    materialCost: 0,
    otherCost: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ticketId) return
    onSubmit(form)
    setForm({
      ticketId: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      serviceNotes: '',
      laborCost: 0,
      materialCost: 0,
      otherCost: 0,
    })
  }

  const selectedTicket = tickets.find(t => t.id === form.ticketId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Select Ticket *</Label>
        {tickets.length === 0 ? (
          <div className="p-4 rounded-lg border border-dashed text-center">
            <p className="text-sm text-muted-foreground">No eligible tickets available</p>
            <p className="text-xs text-muted-foreground mt-1">Tickets must be assigned and not already have a work order</p>
          </div>
        ) : (
          <Select value={form.ticketId} onValueChange={(v) => setForm(f => ({ ...f, ticketId: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a ticket..." />
            </SelectTrigger>
            <SelectContent>
              {tickets.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{t.ticketNo}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-xs">{t.subject}</span>
                    {t.technician?.employee?.name && (
                      <Badge variant="secondary" className="text-[10px] ml-2">
                        {t.technician.employee.name}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedTicket && (
          <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{selectedTicket.customer?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Site:</span>
              <span className="font-medium">{selectedTicket.site?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Technician:</span>
              <span className="font-medium">{selectedTicket.technician?.employee?.name || '—'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Target Date</Label>
          <Input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm(f => ({ ...f, targetDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Service Notes</Label>
        <Textarea
          placeholder="Describe the scope of work..."
          rows={3}
          value={form.serviceNotes}
          onChange={(e) => setForm(f => ({ ...f, serviceNotes: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Labor Cost</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.laborCost || ''}
            onChange={(e) => setForm(f => ({ ...f, laborCost: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Material Cost</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.materialCost || ''}
            onChange={(e) => setForm(f => ({ ...f, materialCost: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Other Cost</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.otherCost || ''}
            onChange={(e) => setForm(f => ({ ...f, otherCost: Number(e.target.value) }))}
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          type="submit"
          className="bg-rose-600 hover:bg-rose-700"
          disabled={loading || !form.ticketId || !form.startDate}
        >
          {loading ? 'Creating...' : 'Create Work Order'}
        </Button>
      </DialogFooter>
    </form>
  )
}