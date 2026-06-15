'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search, Plus, Filter, HelpCircle, ArrowLeft, Send,
  ChevronRight, Clock, User,
} from 'lucide-react'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  answered: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export function RFIManagement() {
  const { navigate } = useAppStore()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({ projectId: '', title: '', description: '', category: 'general', priority: 'medium', dueDate: '' })

  // তৈরি ফর্মের জন্য প্রকল্প আনা হচ্ছে
  const { data: projects } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => api.get('/api/projects'),
  })

  // সকল প্রকল্প জুড়ে RFI আনা হচ্ছে
  const { data: projectsData } = useQuery({
    queryKey: ['projects-all'],
    queryFn: () => api.get('/api/projects'),
  })

  const projectList = projectsData?.data || []

  // প্রতিটি প্রকল্পের জন্য RFI আনা হচ্ছে (আমরা সেগুলো সমন্বিত করব)
  const { data: allRfis, isLoading } = useQuery({
    queryKey: ['rfis-all', statusFilter, categoryFilter, search],
    queryFn: async () => {
      const rfis: any[] = []
      const results = await Promise.all(
        projectList.map((p: any) =>
          api.get(`/api/projects/${p.id}/rfis?status=${statusFilter === 'all' ? '' : statusFilter}`).catch(() => ({ data: [] }))
        )
      )
      for (const r of results) {
        const items = r.data || r.success ? (r.data || []) : []
        rfis.push(...items)
      }
      let filtered = rfis
      if (search) {
        const s = search.toLowerCase()
        filtered = filtered.filter((r: any) =>
          r.title?.toLowerCase().includes(s) || r.rfiNo?.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s)
        )
      }
      if (categoryFilter !== 'all') {
        filtered = filtered.filter((r: any) => r.category === categoryFilter)
      }
      return filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    enabled: projectList.length > 0,
  })

  // বিস্তারিত আনা হচ্ছে
  const { data: detailRfi } = useQuery({
    queryKey: ['rfi-detail', detailId],
    queryFn: () => {
      if (!detailRfiProjectId || !detailId) return Promise.resolve(null)
      return api.get(`/api/projects/${detailRfiProjectId}/rfis/${detailId}`)
    },
    enabled: !!detailId,
  })

  // বিস্তারিত RFI-এর জন্য প্রকল্প ID প্রাপ্ত হচ্ছে
  const [detailRfiProjectId, setDetailRfiProjectId] = useState<string | null>(null)

  const handleOpenDetail = (rfi: any) => {
    setDetailRfiProjectId(rfi.projectId)
    setDetailId(rfi.id)
  }

  // মন্তব্য আনা হচ্ছে
  const { data: rfiComments } = useQuery({
    queryKey: ['rfi-comments', detailId],
    queryFn: () => {
      if (!detailRfiProjectId || !detailId) return Promise.resolve({ data: [] })
      return api.get(`/api/projects/${detailRfiProjectId}/rfis/${detailId}/comments`)
    },
    enabled: !!detailId,
  })

  const [commentText, setCommentText] = useState('')

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const projId = data.projectId
      return api.post(`/api/projects/${projId}/rfis`, {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        dueDate: data.dueDate || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfis-all'] })
      setCreateOpen(false)
      setCreateForm({ projectId: '', title: '', description: '', category: 'general', priority: 'medium', dueDate: '' })
      toast.success('RFI created successfully')
    },
    onError: (err: any) => toast.error(err.error || 'Failed to create RFI'),
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => {
      if (!detailRfiProjectId || !detailId) return Promise.reject('No detail selected')
      return api.post(`/api/projects/${detailRfiProjectId}/rfis/${detailId}/comments`, { content })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfi-comments', detailId] })
      setCommentText('')
      toast.success('Comment added')
    },
    onError: (err: any) => toast.error(err.error || 'Failed to add comment'),
  })

  const statusTransitionMutation = useMutation({
    mutationFn: ({ rfiId, projectId, status }: { rfiId: string; projectId: string; status: string }) =>
      api.put(`/api/projects/${projectId}/rfis/${rfiId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfis-all'] })
      queryClient.invalidateQueries({ queryKey: ['rfi-detail'] })
      toast.success('Status updated')
    },
    onError: (err: any) => toast.error(err.error || 'Failed to update status'),
  })

  const rfiList = allRfis || []
  const rfi = detailRfi?.data
  const comments = rfiComments?.data || []

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RFI Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{rfiList.length} requests for information</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New RFI
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search RFIs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="design">Design</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* RFI List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : rfiList.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No RFIs found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rfiList.map((r: any) => (
            <Card key={r.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => handleOpenDetail(r)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{r.rfiNo}</span>
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[r.status] || ''}`}>
                      {r.status?.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="secondary" className={`text-[10px] ${priorityColors[r.priority] || ''}`}>
                      {r.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mt-0.5 truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create RFI Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New RFI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={createForm.projectId} onValueChange={(v) => setCreateForm((p) => ({ ...p, projectId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projectList.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} placeholder="RFI title" />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={createForm.description} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the question or issue" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={createForm.category} onValueChange={(v) => setCreateForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={createForm.priority} onValueChange={(v) => setCreateForm((p) => ({ ...p, priority: v }))}>
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
              <Input type="date" value={createForm.dueDate} onChange={(e) => setCreateForm((p) => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate(createForm)}
              disabled={!createForm.projectId || !createForm.title || !createForm.description || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create RFI'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!detailId} onOpenChange={(open) => { if (!open) setDetailId(null) }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {rfi && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <SheetTitle className="text-lg">{rfi.rfiNo}</SheetTitle>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusColors[rfi.status]}>{rfi.status?.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline">{rfi.category}</Badge>
                  <Badge variant="outline" className={priorityColors[rfi.priority]}>{rfi.priority}</Badge>
                </div>
                <h2 className="text-lg font-semibold">{rfi.title}</h2>
                <p className="text-sm text-muted-foreground">{rfi.description}</p>

                {rfi.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Due: {new Date(rfi.dueDate).toLocaleDateString()}
                  </div>
                )}

                {/* Status Transitions */}
                <div className="flex flex-wrap gap-2">
                  {rfi.status === 'draft' && (
                    <Button size="sm" onClick={() => statusTransitionMutation.mutate({ rfiId: rfi.id, projectId: rfi.projectId, status: 'submitted' })}>
                      Submit
                    </Button>
                  )}
                  {rfi.status === 'submitted' && (
                    <Button size="sm" onClick={() => statusTransitionMutation.mutate({ rfiId: rfi.id, projectId: rfi.projectId, status: 'under_review' })}>
                      Start Review
                    </Button>
                  )}
                  {rfi.status === 'under_review' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => statusTransitionMutation.mutate({ rfiId: rfi.id, projectId: rfi.projectId, status: 'answered' })}>
                        Mark Answered
                      </Button>
                    </>
                  )}
                  {rfi.status === 'answered' && (
                    <Button size="sm" onClick={() => statusTransitionMutation.mutate({ rfiId: rfi.id, projectId: rfi.projectId, status: 'closed' })}>
                      Close
                    </Button>
                  )}
                </div>

                {/* Comments */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Comments ({comments.length})</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                    {comments.map((c: any) => (
                      <div key={c.id} className="flex gap-2">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{c.userId}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm mt-0.5">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && commentText.trim()) commentMutation.mutate(commentText.trim()) }}
                    />
                    <Button size="icon" onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())} disabled={!commentText.trim()}>
                      <Send className="h-4 w-4" />
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