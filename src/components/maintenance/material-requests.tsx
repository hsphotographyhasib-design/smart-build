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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, ChevronDown, ChevronUp, Package, Clock, DollarSign,
  CheckCircle, XCircle, ShoppingCart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── কনফিগারেশন ───
const mrStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  supervisor_approved: { label: 'Supervisor Approved', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  store_approved: { label: 'Store Approved', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
  issued: { label: 'Issued', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

function formatCurrency(val: number) {
  return `$${val.toFixed(2)}`
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

export function MaterialRequests() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('pending')
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // উপাদান অনুরোধ আনা
  const { data: mrData, isLoading } = useQuery({
    queryKey: ['maintenance-materials', tab],
    queryFn: () => {
      const params = new URLSearchParams()
      if (tab !== 'all') params.set('status', tab === 'pending' ? 'pending' : tab === 'approved' ? 'store_approved' : 'issued')
      return api.get(`/api/maintenance/materials${params.toString() ? `?${params.toString()}` : ''}`)
    },
  })
  const requests = mrData?.data || []

  // ড্রপডাউন আনা
  const { data: workOrdersData } = useQuery({
    queryKey: ['maintenance-workorders-mr'],
    queryFn: () => api.get('/api/maintenance/work-orders'),
  })
  const workOrders = workOrdersData?.data || []

  const { data: ticketsData } = useQuery({
    queryKey: ['maintenance-tickets-mr'],
    queryFn: () => api.get('/api/maintenance/tickets'),
  })
  const tickets = ticketsData?.data || []

  // তৈরি মিউটেশন
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/materials', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-materials'] })
      setCreateOpen(false)
      toast({ title: 'Material Request Created', description: 'New request submitted for approval.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // অনুমোদন মিউটেশন
  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => api.put(`/api/maintenance/materials/${id}`, { status: action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-materials'] })
      toast({ title: 'Updated', description: 'Request status updated.' })
    },
    onError: (err: any) => toast({ title: 'Error', description: err.error || 'Failed', variant: 'destructive' }),
  })

  // পরিসংখ্যান গণনা
  const allReqs = requests
  const pendingCount = allReqs.filter((r: any) => r.status === 'pending').length
  const waitingForStore = allReqs.filter((r: any) => r.status === 'supervisor_approved').length
  const today = new Date().toDateString()
  const issuedToday = allReqs.filter((r: any) => r.status === 'issued' && r.issuedAt && new Date(r.issuedAt).toDateString() === today).length
  const totalValue = allReqs.reduce((sum: number, r: any) => sum + (r.totalCost || 0), 0)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Material Requests</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage material requisitions for maintenance work</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-rose-600 hover:bg-rose-700">
              <Plus className="h-3.5 w-3.5" /> New Material Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Material Request</DialogTitle>
              <DialogDescription>Request materials for maintenance work</DialogDescription>
            </DialogHeader>
            <CreateMRForm
              workOrders={workOrders}
              tickets={tickets}
              onSubmit={(body) => createMutation.mutate(body)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* পরিসংখ্যান কার্ড */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-muted-foreground">Pending Approval</p>
            </div>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-muted-foreground">Waiting for Store</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{waitingForStore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs text-muted-foreground">Issued Today</p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{issuedToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-rose-600" />
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ট্যাব + টেবিল */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="issued">Issued</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Package className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No material requests found</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Create Request
                  </Button>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="sticky top-0 bg-background z-10">
                        <TableHead className="w-8" />
                        <TableHead>Request #</TableHead>
                        <TableHead className="hidden md:table-cell">Work Order</TableHead>
                        <TableHead className="hidden lg:table-cell">Ticket</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-28">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((mr: any) => {
                        const stat = mrStatusConfig[mr.status] || mrStatusConfig.pending
                        const isExpanded = expandedId === mr.id
                        const items = Array.isArray(mr.items) ? mr.items : []
                        return (
                          <React.Fragment key={mr.id}>
                            <TableRow
                              className="cursor-pointer hover:bg-muted/40"
                              onClick={() => setExpandedId((prev) => (prev === mr.id ? null : mr.id))}
                            >
                              <TableCell className="py-3">
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </TableCell>
                              <TableCell className="text-sm font-mono font-medium">{mr.mrNo}</TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{mr.workOrderNo || '—'}</TableCell>
                              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{mr.ticketNo || '—'}</TableCell>
                              <TableCell className="text-sm">{mr.requestedByName || '—'}</TableCell>
                              <TableCell className="text-sm">{items.length}</TableCell>
                              <TableCell className="text-sm font-medium">{formatCurrency(mr.totalCost || 0)}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={cn('text-xs', stat.color)}>{stat.label}</Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatDate(mr.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  {mr.status === 'pending' && (
                                    <>
                                      <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={() => approveMutation.mutate({ id: mr.id, action: 'supervisor_approved' })}>
                                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => approveMutation.mutate({ id: mr.id, action: 'rejected' })}>
                                        <XCircle className="h-3 w-3 mr-1" /> Reject
                                      </Button>
                                    </>
                                  )}
                                  {mr.status === 'supervisor_approved' && (
                                    <Button size="sm" variant="ghost" className="h-7 text-xs text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/30" onClick={() => approveMutation.mutate({ id: mr.id, action: 'store_approved' })}>
                                      <CheckCircle className="h-3 w-3 mr-1" /> Store Approve
                                    </Button>
                                  )}
                                  {mr.status === 'store_approved' && (
                                    <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => approveMutation.mutate({ id: mr.id, action: 'issued' })}>
                                      <Package className="h-3 w-3 mr-1" /> Issue
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* প্রসারিত সারি */}
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={10} className="bg-muted/20 px-6 py-4">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* আইটেম সাব-টেবিল */}
                                    <div>
                                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Items</h4>
                                      {items.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No items</p>
                                      ) : (
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Name</TableHead>
                                              <TableHead className="text-right">Req. Qty</TableHead>
                                              <TableHead className="text-right">Issued</TableHead>
                                              <TableHead>Status</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {items.map((item: any, idx: number) => (
                                              <TableRow key={idx}>
                                                <TableCell className="text-sm">{item.name}</TableCell>
                                                <TableCell className="text-sm text-right">{item.requestedQty}</TableCell>
                                                <TableCell className="text-sm text-right">{item.issuedQty ?? 0}</TableCell>
                                                <TableCell>
                                                  <Badge variant="secondary" className="text-xs">
                                                    {item.status || 'pending'}
                                                  </Badge>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      )}
                                    </div>

                                    {/* অনুমোদন শৃঙ্খল */}
                                    <div>
                                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Approval Chain</h4>
                                      <div className="space-y-3">
                                        {[
                                          { step: 'Requested', done: true, name: mr.requestedByName, time: mr.createdAt, color: 'text-green-600' },
                                          { step: 'Supervisor Approved', done: ['supervisor_approved', 'store_approved', 'issued'].includes(mr.status), name: mr.supervisorApprovedByName, time: mr.supervisorApprovedAt, color: 'text-blue-600' },
                                          { step: 'Store Approved', done: ['store_approved', 'issued'].includes(mr.status), name: mr.storeApprovedByName, time: mr.storeApprovedAt, color: 'text-cyan-600' },
                                          { step: 'Issued', done: mr.status === 'issued', name: mr.issuedByName, time: mr.issuedAt, color: 'text-emerald-600' },
                                        ].map((s, idx) => (
                                          <div key={idx} className="flex items-start gap-3">
                                            <div className={cn('mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs', s.done ? 'bg-green-100 dark:bg-green-900' : 'bg-muted')}>
                                              {s.done ? <CheckCircle className="h-3 w-3 text-green-600" /> : <span className="text-muted-foreground text-xs">{idx + 1}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className={cn('text-sm font-medium', s.done ? s.color : 'text-muted-foreground')}>{s.step}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {s.name ? `${s.name}` : 'Pending'}
                                                {s.time && ` · ${new Date(s.time).toLocaleString()}`}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                        {mr.status === 'rejected' && (
                                          <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                                            <p className="text-xs text-red-600 font-medium">Request Rejected</p>
                                          </div>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── MR তৈরির ফর্ম ───
function CreateMRForm({ workOrders, tickets, onSubmit, loading }: {
  workOrders: any[]; tickets: any[]; onSubmit: (data: any) => void; loading: boolean
}) {
  const [linkType, setLinkType] = useState<'workOrder' | 'ticket' | ''>('')
  const [linkId, setLinkId] = useState('')
  const [items, setItems] = useState([{ name: '', requestedQty: 1, unit: 'pcs', unitCost: 0, notes: '' }])

  const totalCost = items.reduce((sum, item) => sum + (item.requestedQty * item.unitCost), 0)

  const addItem = () => {
    setItems([...items, { name: '', requestedQty: 1, unit: 'pcs', unitCost: 0, notes: '' }])
  }

  const removeItem = (idx: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validItems = items.filter((i) => i.name)
    if (validItems.length === 0) return
    onSubmit({
      workOrderId: linkType === 'workOrder' ? linkId : undefined,
      ticketId: linkType === 'ticket' ? linkId : undefined,
      items: validItems.map((i) => ({
        name: i.name,
        requestedQty: Number(i.requestedQty),
        unit: i.unit,
        unitCost: Number(i.unitCost),
        notes: i.notes,
      })),
      totalCost,
    })
    setLinkType('')
    setLinkId('')
    setItems([{ name: '', requestedQty: 1, unit: 'pcs', unitCost: 0, notes: '' }])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Link To</Label>
        <div className="flex gap-2">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={linkType || ''}
            onChange={(e) => { setLinkType(e.target.value as any); setLinkId('') }}
          >
            <option value="">None</option>
            <option value="workOrder">Work Order</option>
            <option value="ticket">Ticket</option>
          </select>
        </div>
      </div>

      {linkType && (
        <div className="space-y-2">
          <Label>{linkType === 'workOrder' ? 'Work Order' : 'Ticket'} *</Label>
          <Select value={linkId} onValueChange={setLinkId}>
            <SelectTrigger><SelectValue placeholder={`Select ${linkType === 'workOrder' ? 'work order' : 'ticket'}...`} /></SelectTrigger>
            <SelectContent>
              {(linkType === 'workOrder' ? workOrders : tickets).map((item: any) => (
                <SelectItem key={item.id} value={item.id}>{item.woNo || item.ticketNo || item.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Items *</Label>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addItem}>
            <Plus className="h-3 w-3" /> Add Item
          </Button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Item #{idx + 1}</span>
              {items.length > 1 && (
                <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => removeItem(idx)}>
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input placeholder="Item name" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Quantity</Label>
                <Input type="number" min={1} value={item.requestedQty} onChange={(e) => updateItem(idx, 'requestedQty', Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Input placeholder="pcs, kg, m..." value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Unit Cost ($)</Label>
                <Input type="number" min={0} step={0.01} value={item.unitCost} onChange={(e) => updateItem(idx, 'unitCost', Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Input placeholder="Optional..." value={item.notes} onChange={(e) => updateItem(idx, 'notes', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
        <span className="text-sm font-medium">Total Cost</span>
        <span className="text-lg font-bold text-rose-600">{formatCurrency(totalCost)}</span>
      </div>

      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={loading || items.every((i) => !i.name)} className="bg-rose-600 hover:bg-rose-700">
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogFooter>
    </form>
  )
}