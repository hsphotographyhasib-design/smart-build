'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
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
import { Separator } from '@/components/ui/separator'
import {
  Search, Plus, Megaphone, ArrowLeft, Trash2, Edit3,
  ShieldAlert, CalendarClock, Award, AlertTriangle, Info, Bell,
} from 'lucide-react'
import { toast } from 'sonner'

const priorityConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  low: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: Info, label: 'Low' },
  normal: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Bell, label: 'Normal' },
  high: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', icon: AlertTriangle, label: 'High' },
  urgent: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: ShieldAlert, label: 'Urgent' },
}

const categoryConfig: Record<string, { icon: React.ElementType; label: string }> = {
  general: { icon: Info, label: 'General' },
  safety: { icon: ShieldAlert, label: 'Safety' },
  schedule_change: { icon: CalendarClock, label: 'Schedule Change' },
  policy: { icon: Edit3, label: 'Policy' },
  achievement: { icon: Award, label: 'Achievement' },
  emergency: { icon: AlertTriangle, label: 'Emergency' },
}

const categories = ['general', 'safety', 'schedule_change', 'policy', 'achievement', 'emergency']
const priorities = ['low', 'normal', 'high', 'urgent']
const scopes = ['all', 'management', 'projects', 'specific_project']

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function AnnouncementsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', content: '', category: 'general', priority: 'normal',
    targetScope: 'all', projectId: '', expiresAt: '',
  })

  const { data: projects } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => api.get('/api/projects'),
  })
  const projectList = projects?.data || []

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['announcements', categoryFilter, priorityFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      return api.get(`/api/collaboration/announcements?${params.toString()}`)
    },
  })

  const { data: detailData } = useQuery({
    queryKey: ['announcement-detail', detailId],
    queryFn: () => api.get(`/api/collaboration/announcements/${detailId}`),
    enabled: !!detailId,
  })

  const announcementList = (announcementsData?.data || []).filter((a: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q)
  })

  const detail = detailData?.data

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/collaboration/announcements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setCreateOpen(false)
      resetForm()
      toast.success('Announcement created')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/api/collaboration/announcements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcement-detail'] })
      setEditId(null)
      setDetailId(null)
      toast.success('Announcement updated')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/collaboration/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setDetailId(null)
      toast.success('Announcement deleted')
    },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const resetForm = () => setForm({ title: '', content: '', category: 'general', priority: 'normal', targetScope: 'all', projectId: '', expiresAt: '' })

  const openEdit = (a: any) => {
    setForm({
      title: a.title, content: a.content, category: a.category, priority: a.priority,
      targetScope: a.targetScope, projectId: a.projectId || '', expiresAt: a.expiresAt ? a.expiresAt.split('T')[0] : '',
    })
    setEditId(a.id)
  }

  const handleSubmit = () => {
    if (editId) {
      updateMutation.mutate({ id: editId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">{announcementList.length} announcements</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setEditId(null); setCreateOpen(true) }} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Announcement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{categoryConfig[c]?.label || c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map((p) => <SelectItem key={p} value={p}>{priorityConfig[p]?.label || p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      ) : announcementList.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No announcements found</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {announcementList.map((a: any) => {
            const pCfg = priorityConfig[a.priority] || priorityConfig.normal
            const cCfg = categoryConfig[a.category] || categoryConfig.general
            const PriorityIcon = pCfg.icon
            const CategoryIcon = cCfg.icon
            return (
              <Card key={a.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setDetailId(a.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${pCfg.color}`}>
                      <PriorityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className={`text-[10px] ${pCfg.color}`}>{pCfg.label}</Badge>
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <CategoryIcon className="h-3 w-3" /> {cCfg.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {a.targetScope?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-semibold mt-1 truncate">{a.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{formatTimeAgo(a.createdAt)}</span>
                        {a.expiresAt && <span>· Expires {new Date(a.expiresAt).toLocaleDateString()}</span>}
                        {a.project && <span>· {a.project.name}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen || !!editId} onOpenChange={(open) => { if (!open) { setCreateOpen(false); setEditId(null) } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit Announcement' : 'New Announcement'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} placeholder="Announcement content" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{categoryConfig[c]?.label || c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{priorityConfig[p]?.label || p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target Scope</Label>
              <Select value={form.targetScope} onValueChange={(v) => setForm((p) => ({ ...p, targetScope: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {scopes.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.targetScope === 'specific_project' && (
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm((p) => ({ ...p, projectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>{projectList.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Expiration Date (optional)</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditId(null) }}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.title || !form.content || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}
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
                  <SheetTitle className="text-lg">Announcement</SheetTitle>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={priorityConfig[detail.priority]?.color}>{priorityConfig[detail.priority]?.label}</Badge>
                  <Badge variant="outline" className="gap-1">
                    {React.createElement(categoryConfig[detail.category]?.icon || Info, { className: 'h-3 w-3' })}
                    {categoryConfig[detail.category]?.label || detail.category}
                  </Badge>
                  <Badge variant="outline">{detail.targetScope?.replace(/_/g, ' ')}</Badge>
                </div>
                <h2 className="text-xl font-semibold">{detail.title}</h2>
                <div className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{detail.content}</div>
                <Separator />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {new Date(detail.createdAt).toLocaleString()}</p>
                  {detail.expiresAt && <p>Expires: {new Date(detail.expiresAt).toLocaleString()}</p>}
                  {detail.project && <p>Project: {detail.project.name}</p>}
                </div>
                <div className="flex gap-2 border-t pt-4">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => { openEdit(detail); setDetailId(null) }}>
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => deleteMutation.mutate(detail.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}