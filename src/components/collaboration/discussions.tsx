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
  Search, Plus, MessageSquare, ArrowLeft, Send, ChevronRight,
  Clock, User, CircleDot,
} from 'lucide-react'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  open: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  in_progress: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const categoryColors: Record<string, string> = {
  general: '',
  technical: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  schedule: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  quality: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  safety: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  commercial: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
}

const categories = ['general', 'technical', 'schedule', 'quality', 'safety', 'commercial']
const priorities = ['low', 'medium', 'high', 'critical']
const statuses = ['open', 'in_progress', 'resolved', 'closed']

export function DiscussionsPage() {
  const queryClient = useQueryClient()
  const { user } = useAppStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [form, setForm] = useState({
    projectId: '', title: '', description: '', category: 'general', priority: 'medium', assignedTo: '', dueDate: '',
  })

  const { data: projects } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => api.get('/api/projects'),
  })
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => api.get('/api/auth/users'),
  })
  const projectList = projects?.data || []
  const userList = users?.data || []

  const { data: discussionsData, isLoading } = useQuery({
    queryKey: ['discussions', statusFilter, categoryFilter, search],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (search) params.set('search', search)
      return api.get(`/api/collaboration/discussions?${params.toString()}`)
    },
  })

  const { data: detailData } = useQuery({
    queryKey: ['discussion-detail', detailId],
    queryFn: () => api.get(`/api/collaboration/discussions/${detailId}`),
    enabled: !!detailId,
  })

  const discussionList = discussionsData?.data || []
  const detail = detailData?.data
  const comments = detail?.comments || []

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/collaboration/discussions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      setCreateOpen(false)
      resetForm()
      toast.success('Discussion created')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.post(`/api/collaboration/discussions/${detailId}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-detail', detailId] })
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      setCommentText('')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/api/collaboration/discussions/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-detail'] })
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      toast.success('Status updated')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const resetForm = () => setForm({ projectId: '', title: '', description: '', category: 'general', priority: 'medium', assignedTo: '', dueDate: '' })

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discussions</h1>
          <p className="text-muted-foreground text-sm mt-1">{discussionList.length} discussions</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setCreateOpen(true) }} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Discussion
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search discussions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : discussionList.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No discussions found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {discussionList.map((d: any) => (
            <Card key={d.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setDetailId(d.id)}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[d.status] || ''}`}>{d.status?.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${categoryColors[d.category] || ''}`}>{d.category}</Badge>
                    <Badge variant="secondary" className={`text-[10px] ${priorityColors[d.priority] || ''}`}>{d.priority}</Badge>
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{d.title}</p>
                  {d.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{d.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{d.project?.name}</span>
                    <span>·</span>
                    <span>{d.commentCount || 0} comments</span>
                    <span>·</span>
                    <span>{formatTimeAgo(d.updatedAt)}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New Discussion</DialogTitle></DialogHeader>
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
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Discussion topic" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the topic" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={form.assignedTo} onValueChange={(v) => setForm((p) => ({ ...p, assignedTo: v }))}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{userList.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
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
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <SheetTitle className="text-lg">Discussion</SheetTitle>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusColors[detail.status]}>{detail.status?.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={categoryColors[detail.category]}>{detail.category}</Badge>
                  <Badge variant="outline" className={priorityColors[detail.priority]}>{detail.priority}</Badge>
                </div>
                <h2 className="text-lg font-semibold">{detail.title}</h2>
                {detail.description && <p className="text-sm text-muted-foreground">{detail.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {detail.project && <span>Project: {detail.project.name}</span>}
                  {detail.dueDate && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(detail.dueDate).toLocaleDateString()}</span>
                  )}
                  <span>{comments.length} comments</span>
                </div>

                {/* Status Management */}
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {statuses.filter((s) => s !== detail.status).map((s) => (
                    <Button key={s} size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: detail.id, status: s })}>
                      <CircleDot className="h-3 w-3 mr-1" /> {s.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>

                {/* Comments Thread */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Comments ({comments.length})</h3>
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-4">
                      {comments.map((c: any) => (
                        <div key={c.id} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{c.userId}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="mt-1 text-sm bg-muted/50 rounded-lg p-3">{c.content}</div>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Start the discussion!</p>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Comment Input */}
                  <div className="flex gap-2 mt-4">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={2}
                      className="flex-1"
                      onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey && commentText.trim()) commentMutation.mutate(commentText.trim()) }}
                    />
                    <Button
                      size="icon"
                      className="self-end shrink-0"
                      onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())}
                      disabled={!commentText.trim()}
                    >
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