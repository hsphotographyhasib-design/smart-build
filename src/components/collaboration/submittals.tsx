'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Search, Plus, FileText, ArrowLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, RotateCcw, Eye, Send,
} from 'lucide-react'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  returned: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  for_info: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const categories = ['architectural', 'structural', 'mechanical', 'electrical', 'plumbing', 'fire_protection', 'civil', 'finish']

export function SubmittalsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState({
    projectId: '', title: '', specification: '', category: 'architectural', priority: 'medium', dueDate: '', notes: '',
  })

  const { data: projects } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => api.get('/api/projects'),
  })
  const projectList = projects?.data || []

  const { data: submittalsData, isLoading } = useQuery({
    queryKey: ['submittals', statusFilter, categoryFilter, search],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      return api.get(`/api/collaboration/submittals?${params.toString()}`)
    },
  })

  const { data: detailSubmittal } = useQuery({
    queryKey: ['submittal-detail', detailId],
    queryFn: () => api.get(`/api/collaboration/submittals/${detailId}`),
    enabled: !!detailId,
  })

  const submittalList = (submittalsData?.data || []).filter((s: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.title?.toLowerCase().includes(q) || s.submittalNo?.toLowerCase().includes(q) || s.project?.name?.toLowerCase().includes(q)
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/collaboration/submittals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submittals'] })
      setCreateOpen(false)
      resetForm()
      toast.success('Submittal created')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const actionMutation = useMutation({
    mutationFn: ({ id, action, data }: { id: string; action: string; data?: any }) =>
      api.put(`/api/collaboration/submittals/${id}`, { action, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submittals'] })
      queryClient.invalidateQueries({ queryKey: ['submittal-detail'] })
      toast.success('Action completed')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/collaboration/submittals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submittals'] })
      setDetailId(null)
      toast.success('Submittal deleted')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const resetForm = () => setForm({ projectId: '', title: '', specification: '', category: 'architectural', priority: 'medium', dueDate: '', notes: '' })

  const detail = detailSubmittal?.data

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Submittals</h1>
          <p className="text-muted-foreground text-sm mt-1">{submittalList.length} submittals</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setCreateOpen(true) }} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Submittal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search submittals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.keys(statusColors).map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : submittalList.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No submittals found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {submittalList.map((s: any) => (
            <Card key={s.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setDetailId(s.id)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{s.submittalNo}</span>
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[s.status] || ''}`}>{s.status?.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className="text-[10px]">{s.category?.replace(/_/g, ' ')}</Badge>
                    <Badge variant="secondary" className={`text-[10px] ${priorityColors[s.priority] || ''}`}>{s.priority}</Badge>
                  </div>
                  <p className="text-sm font-medium mt-0.5 truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.project?.name} · Rev {s.revision}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create Submittal</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={form.projectId} onValueChange={(v) => setForm((p) => ({ ...p, projectId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{projectList.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Submittal title" />
            </div>
            <div className="space-y-2">
              <Label>Specification</Label>
              <Input value={form.specification} onChange={(e) => setForm((p) => ({ ...p, specification: e.target.value }))} placeholder="Spec reference" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Additional notes" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.projectId || !form.title || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!detailId} onOpenChange={(open) => { if (!open) setDetailId(null) }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <SheetTitle>{detail.submittalNo}</SheetTitle>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusColors[detail.status]}>{detail.status?.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline">{detail.category?.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={priorityColors[detail.priority]}>{detail.priority}</Badge>
                  <Badge variant="outline">Rev {detail.revision}</Badge>
                </div>
                <h2 className="text-lg font-semibold">{detail.title}</h2>
                {detail.specification && <p className="text-sm text-muted-foreground">Spec: {detail.specification}</p>}
                {detail.project && <p className="text-sm text-muted-foreground">Project: {detail.project.name}</p>}
                {detail.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Due: {new Date(detail.dueDate).toLocaleDateString()}
                  </div>
                )}
                {detail.notes && <p className="text-sm bg-muted/50 p-3 rounded-lg">{detail.notes}</p>}

                {/* Actions */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.status === 'draft' && (
                      <Button size="sm" onClick={() => actionMutation.mutate({ id: detail.id, action: 'submit' })} className="gap-1">
                        <Send className="h-3.5 w-3.5" /> Submit
                      </Button>
                    )}
                    {detail.status === 'submitted' && (
                      <Button size="sm" onClick={() => actionMutation.mutate({ id: detail.id, action: 'review' })} className="gap-1">
                        <Eye className="h-3.5 w-3.5" /> Start Review
                      </Button>
                    )}
                    {(detail.status === 'submitted' || detail.status === 'under_review') && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={() => actionMutation.mutate({ id: detail.id, action: 'approve' })}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-red-600" onClick={() => actionMutation.mutate({ id: detail.id, action: 'reject' })}>
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-orange-600" onClick={() => actionMutation.mutate({ id: detail.id, action: 'return' })}>
                          <RotateCcw className="h-3.5 w-3.5" /> Return
                        </Button>
                      </>
                    )}
                    {detail.status !== 'draft' && (
                      <Button size="sm" variant="outline" className="gap-1 text-purple-600" onClick={() => actionMutation.mutate({ id: detail.id, action: 'for_info' })}>
                        <Eye className="h-3.5 w-3.5" /> For Info
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(detail.id)} className="gap-1">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}