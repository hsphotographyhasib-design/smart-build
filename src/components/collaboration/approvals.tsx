'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CheckCircle2, XCircle, Clock, ShoppingCart, FileText,
  ClipboardList, ChevronRight, Filter, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

type ApprovalItem = {
  id: string
  type: 'purchase_request' | 'leave_request' | 'submittal' | 'change_event'
  title: string
  projectName?: string
  priority?: string
  dueDate?: string
  requestor?: string
  status: string
  projectId?: string
}

const typeIcons: Record<string, React.ElementType> = {
  purchase_request: ShoppingCart,
  leave_request: ClipboardList,
  submittal: FileText,
  change_event: AlertTriangle,
}

const typeLabels: Record<string, string> = {
  purchase_request: 'Purchase Request',
  leave_request: 'Leave Request',
  submittal: 'Submittal',
  change_event: 'Change Event',
}

const typeColors: Record<string, string> = {
  purchase_request: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600',
  leave_request: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600',
  submittal: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600',
  change_event: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600',
}

export function ApprovalsPage() {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Fetch pending purchase requests
  const { data: prData } = useQuery({
    queryKey: ['approvals-pr', typeFilter],
    queryFn: () => api.get('/api/purchase-requests?status=submitted'),
    enabled: typeFilter === 'all' || typeFilter === 'purchase_request',
  })

  // Fetch pending leave requests
  const { data: lrData } = useQuery({
    queryKey: ['approvals-lr', typeFilter],
    queryFn: () => api.get('/api/leave-requests?status=pending'),
    enabled: typeFilter === 'all' || typeFilter === 'leave_request',
  })

  // Fetch pending submittals
  const { data: subData } = useQuery({
    queryKey: ['approvals-sub', typeFilter],
    queryFn: () => api.get('/api/collaboration/submittals?status=submitted'),
    enabled: typeFilter === 'all' || typeFilter === 'submittal',
  })

  // Fetch projects for change events
  const { data: projectsData } = useQuery({
    queryKey: ['projects-all'],
    queryFn: () => api.get('/api/projects'),
  })

  // Fetch pending change events from all projects
  const projectList = projectsData?.data || []
  const { data: ceResults } = useQuery({
    queryKey: ['approvals-ce', typeFilter, projectList.length],
    queryFn: async () => {
      const results = await Promise.all(
        projectList.map((p: any) =>
          api.get(`/api/projects/${p.id}/change-events?status=open`).catch(() => ({ data: [] }))
        )
      )
      return results.flatMap((r: any) => r.data || [])
    },
    enabled: typeFilter === 'all' || typeFilter === 'change_event',
  })

  // Combine all into a unified list
  const items: ApprovalItem[] = [
    ...(prData?.data || []).map((pr: any) => ({
      id: pr.id, type: 'purchase_request' as const,
      title: `${pr.requestNo} - ${pr.projectName}`,
      projectName: pr.projectName, priority: 'medium', requestor: pr.createdByName,
      status: pr.status, projectId: pr.projectId,
    })),
    ...(lrData?.data || []).map((lr: any) => ({
      id: lr.id, type: 'leave_request' as const,
      title: `${lr.type} Leave - ${lr.employeeId}`,
      priority: 'medium', requestor: lr.userId, status: lr.status,
    })),
    ...(subData?.data || []).map((s: any) => ({
      id: s.id, type: 'submittal' as const,
      title: `${s.submittalNo} - ${s.title}`,
      projectName: s.project?.name, priority: s.priority, status: s.status, projectId: s.projectId,
    })),
    ...(ceResults || []).map((ce: any) => ({
      id: ce.id, type: 'change_event' as const,
      title: `${ce.eventNo} - ${ce.title}`,
      projectName: undefined, priority: 'high', status: ce.status, projectId: ce.projectId,
    })),
  ]

  const filteredItems = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase()
      return item.title.toLowerCase().includes(q) || item.projectName?.toLowerCase().includes(q) || item.requestor?.toLowerCase().includes(q)
    }
    return true
  })

  const approvePR = useMutation({
    mutationFn: (id: string) => api.post(`/api/purchase-requests/${id}/approve`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvals-pr'] }); toast.success('Approved') },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const rejectPR = useMutation({
    mutationFn: (id: string) => api.post(`/api/purchase-requests/${id}/reject`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvals-pr'] }); toast.success('Rejected') },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const approveLR = useMutation({
    mutationFn: (id: string) => api.post(`/api/leave-requests/${id}/approve`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvals-lr'] }); toast.success('Approved') },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const rejectLR = useMutation({
    mutationFn: (id: string) => api.post(`/api/leave-requests/${id}/reject`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvals-lr'] }); toast.success('Rejected') },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const approveSub = useMutation({
    mutationFn: (id: string) => api.put(`/api/collaboration/submittals/${id}`, { action: 'approve' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvals-sub'] }); toast.success('Approved') },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const rejectSub = useMutation({
    mutationFn: (id: string) => api.put(`/api/collaboration/submittals/${id}`, { action: 'reject' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvals-sub'] }); toast.success('Rejected') },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const approveCE = useMutation({
    mutationFn: ({ projectId, eventId }: { projectId: string; eventId: string }) =>
      api.post(`/api/projects/${projectId}/change-events/${eventId}/approve`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvals-ce'] }); toast.success('Approved') },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const rejectCE = useMutation({
    mutationFn: ({ projectId, eventId }: { projectId: string; eventId: string }) =>
      api.post(`/api/projects/${projectId}/change-events/${eventId}/reject`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvals-ce'] }); toast.success('Rejected') },
    onError: (err: any) => toast.error(err.error || 'Failed'),
  })

  const handleApprove = (item: ApprovalItem) => {
    if (item.type === 'purchase_request') approvePR.mutate(item.id)
    else if (item.type === 'leave_request') approveLR.mutate(item.id)
    else if (item.type === 'submittal') approveSub.mutate(item.id)
    else if (item.type === 'change_event' && item.projectId) approveCE.mutate({ projectId: item.projectId, eventId: item.id })
  }

  const handleReject = (item: ApprovalItem) => {
    if (item.type === 'purchase_request') rejectPR.mutate(item.id)
    else if (item.type === 'leave_request') rejectLR.mutate(item.id)
    else if (item.type === 'submittal') rejectSub.mutate(item.id)
    else if (item.type === 'change_event' && item.projectId) rejectCE.mutate({ projectId: item.projectId, eventId: item.id })
  }

  const isLoading = !prData && !lrData && !subData

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approvals Center</h1>
          <p className="text-muted-foreground text-sm mt-1">{filteredItems.length} pending approvals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search approvals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 h-9"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="purchase_request">Purchase Requests</SelectItem>
            <SelectItem value="leave_request">Leave Requests</SelectItem>
            <SelectItem value="submittal">Submittals</SelectItem>
            <SelectItem value="change_event">Change Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { type: 'purchase_request', label: 'Purchase Requests' },
          { type: 'leave_request', label: 'Leave Requests' },
          { type: 'submittal', label: 'Submittals' },
          { type: 'change_event', label: 'Change Events' },
        ].map(({ type, label }) => {
          const count = items.filter((i) => i.type === type).length
          const Icon = typeIcons[type]
          return (
            <Card key={type} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${typeColors[type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : filteredItems.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
          <p>All caught up! No pending approvals.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = typeIcons[item.type]
            return (
              <Card key={`${item.type}-${item.id}`} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${typeColors[item.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{typeLabels[item.type]}</Badge>
                      {item.priority && (
                        <Badge variant="secondary" className={`text-[10px] ${priorityColors[item.priority] || ''}`}>{item.priority}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-0.5 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      {item.projectName && <span>{item.projectName}</span>}
                      {item.requestor && <span>· by {item.requestor}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleApprove(item)}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleReject(item)}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}