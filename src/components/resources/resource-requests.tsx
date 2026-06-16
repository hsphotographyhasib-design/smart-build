'use client'

import { useState, useEffect, useMemo } from 'react'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Search, ClipboardList, Check, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

// ──────────────────────────────────────────
// ধরন
// ──────────────────────────────────────────

interface ResourceRequest {
  id: string
  requestNo: string
  resourceType: string
  resourceName: string
  quantity: number
  projectId: string
  projectName: string
  priority: string
  requestedBy: string
  trade: string
  requiredSkills: string
  startDate: string | null
  endDate: string | null
  shift: string
  reason: string
  status: string
  createdAt: string
}

interface Project {
  id: string
  name: string
  code: string
  status: string
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0',
  supervisor_approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0',
  pm_approved: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0',
  assigned: 'bg-emerald-600 text-white border-0',
  rejected: 'bg-red-600 text-white border-0',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  supervisor_approved: 'Supervisor Approved',
  pm_approved: 'PM Approved',
  assigned: 'Assigned',
  rejected: 'Rejected',
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white border-0',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const emptyForm = {
  projectId: '',
  resourceType: '',
  resourceName: '',
  quantity: '',
  trade: '',
  requiredSkills: '',
  priority: 'medium',
  startDate: '',
  endDate: '',
  shift: '',
  reason: '',
}

// ──────────────────────────────────────────
// প্রধান কম্পোনেন্ট
// ──────────────────────────────────────────

export function ResourceRequests() {
  const [requests, setRequests] = useState<ResourceRequest[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = () => {
    setLoading(true)
    Promise.all([
      api.get<ResourceRequest[]>('/api/resources/requests'),
      api.get<Project[]>('/api/projects'),
    ])
      .then(([reqRes, projRes]) => {
        if (reqRes.success && reqRes.data) setRequests(reqRes.data)
        else if (reqRes.error) setError(reqRes.error)
        if (projRes.success && projRes.data) setProjects(projRes.data)
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    const load = () => {
      setLoading(true)
      Promise.all([
        api.get('/api/resources/requests'),
        api.get('/api/projects'),
      ])
        .then(([reqRes, projRes]) => {
          if (cancelled) return
          if (reqRes.success && reqRes.data) setRequests(reqRes.data)
          else if (reqRes.error) setError(reqRes.error)
          if (projRes.success && projRes.data) setProjects(projRes.data)
        })
        .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load') })
        .finally(() => { if (!cancelled) setLoading(false) })
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredRequests = useMemo(() => {
    let items = requests
    if (activeTab !== 'all') {
      items = items.filter((r) => r.status === activeTab)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((r) =>
        r.requestNo?.toLowerCase().includes(q) ||
        r.resourceName?.toLowerCase().includes(q) ||
        r.projectName?.toLowerCase().includes(q) ||
        r.requestedBy?.toLowerCase().includes(q)
      )
    }
    return items
  }, [requests, activeTab, searchQuery])

  const tabCounts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      supervisor_approved: requests.filter((r) => r.status === 'supervisor_approved').length,
      pm_approved: requests.filter((r) => r.status === 'pm_approved').length,
      assigned: requests.filter((r) => r.status === 'assigned').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }
  }, [requests])

  const handleStatusChange = (requestId: string, newStatus: string) => {
    api.put(`/api/resources/requests/${requestId}`, { status: newStatus })
      .then((res) => {
        if (res.success) {
          toast.success(`Request ${newStatus === 'rejected' ? 'rejected' : 'updated'}!`)
          fetchRequests()
        } else {
          toast.error(res.error || 'Failed')
        }
      })
      .catch(() => toast.error('Failed'))
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId || !form.resourceType || !form.resourceName) {
      toast.error('Project, Resource Type, and Resource Name are required')
      return
    }
    setSubmitting(true)
    api.post('/api/resources/requests', {
      ...form,
      quantity: parseInt(form.quantity) || 1,
    })
      .then((res) => {
        if (res.success) {
          toast.success('Request created!')
          setCreateOpen(false)
          setForm(emptyForm)
          fetchRequests()
        } else {
          toast.error(res.error || 'Failed')
        }
      })
      .catch(() => toast.error('Failed'))
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resource Requests & Approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Loading...' : `${requests.length} request(s)`}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />New Request
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="pending" className="gap-1.5 text-xs">Pending {tabCounts.pending > 0 && <Badge className="h-4 min-w-4 px-1 bg-amber-600 text-white text-[10px]">{tabCounts.pending}</Badge>}</TabsTrigger>
            <TabsTrigger value="supervisor_approved" className="gap-1.5 text-xs">Supervisor Approved {tabCounts.supervisor_approved > 0 && <Badge className="h-4 min-w-4 px-1 bg-blue-600 text-white text-[10px]">{tabCounts.supervisor_approved}</Badge>}</TabsTrigger>
            <TabsTrigger value="pm_approved" className="gap-1.5 text-xs">PM Approved {tabCounts.pm_approved > 0 && <Badge className="h-4 min-w-4 px-1 bg-purple-600 text-white text-[10px]">{tabCounts.pm_approved}</Badge>}</TabsTrigger>
            <TabsTrigger value="assigned" className="gap-1.5 text-xs">Assigned {tabCounts.assigned > 0 && <Badge className="h-4 min-w-4 px-1 bg-emerald-600 text-white text-[10px]">{tabCounts.assigned}</Badge>}</TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1.5 text-xs">Rejected {tabCounts.rejected > 0 && <Badge className="h-4 min-w-4 px-1 bg-red-600 text-white text-[10px]">{tabCounts.rejected}</Badge>}</TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5 text-xs">All {tabCounts.all > 0 && <Badge className="h-4 min-w-4 px-1 bg-secondary text-secondary-foreground text-[10px]">{tabCounts.all}</Badge>}</TabsTrigger>
          </TabsList>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        {['pending', 'supervisor_approved', 'pm_approved', 'assigned', 'rejected', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <Card><CardContent className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                  </div>
                ))}
              </CardContent></Card>
            ) : error ? (
              <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">{error}</p></CardContent></Card>
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <h3 className="font-semibold">No Requests Found</h3>
                  <p className="text-sm mt-1">{tab === 'all' ? 'No resource requests yet.' : `No ${statusLabels[tab] || tab} requests.`}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-xs">Request No</TableHead>
                        <TableHead className="font-semibold text-xs">Type</TableHead>
                        <TableHead className="font-semibold text-xs">Resource Name</TableHead>
                        <TableHead className="font-semibold text-xs hidden md:table-cell">Qty</TableHead>
                        <TableHead className="font-semibold text-xs hidden lg:table-cell">Project</TableHead>
                        <TableHead className="font-semibold text-xs hidden xl:table-cell">Priority</TableHead>
                        <TableHead className="font-semibold text-xs hidden lg:table-cell">Requested By</TableHead>
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((r) => (
                        <TableRow key={r.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                          <TableCell className="text-sm font-mono text-muted-foreground">{r.requestNo || r.id.slice(0, 8)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">{r.resourceType}</Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{r.resourceName}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-center">{r.quantity}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-[160px]">{r.projectName || '—'}</TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Badge className={cn('text-xs capitalize', priorityColors[r.priority] || 'bg-secondary')}>
                              {r.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{r.requestedBy || '—'}</TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', statusColors[r.status] || 'bg-secondary')}>
                              {statusLabels[r.status] || r.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {r.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => handleStatusChange(r.id, 'supervisor_approved')}
                                    title="Approve"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleStatusChange(r.id, 'rejected')}
                                    title="Reject"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                              {r.status === 'supervisor_approved' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-1"
                                  onClick={() => handleStatusChange(r.id, 'pm_approved')}
                                  title="PM Approve"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                  <span className="text-xs">PM Approve</span>
                                </Button>
                              )}
                              {r.status === 'pm_approved' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                                  onClick={() => handleStatusChange(r.id, 'assigned')}
                                  title="Mark Assigned"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span className="text-xs">Assign</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* নতুন অনুরোধ ডায়ালগ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader><DialogTitle>New Resource Request</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.filter((p) => p.status === 'active').map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resource Type *</Label>
                <Select value={form.resourceType} onValueChange={(v) => setForm({ ...form, resourceType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="labour">Labour</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resource Name *</Label>
                <Input value={form.resourceName} onChange={(e) => setForm({ ...form, resourceName: e.target.value })} placeholder="e.g. Mason, Crane" required />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="1" min="1" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trade</Label>
                <Input value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} placeholder="e.g. Masonry, Plumbing" />
              </div>
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <Input value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} placeholder="Comma separated" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why is this resource needed?" rows={3} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}