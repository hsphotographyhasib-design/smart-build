'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, ArrowLeft, Search, Filter, MessageSquare, AlertTriangle,
  ChevronDown, ChevronUp, Trash2, CheckCircle2, XCircle,
} from 'lucide-react'

const severityConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dotColor: 'bg-green-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', dotColor: 'bg-yellow-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', dotColor: 'bg-orange-500' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dotColor: 'bg-red-500' },
}

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  open: { label: 'Open', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', step: 0 },
  acknowledged: { label: 'Acknowledged', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', step: 1 },
  investigating: { label: 'Investigating', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', step: 2 },
  resolving: { label: 'Resolving', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', step: 3 },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', step: 4 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', step: 5 },
}

const categoryLabels: Record<string, string> = {
  quality: 'Quality',
  safety: 'Safety',
  delay: 'Delay',
  communication: 'Communication',
  billing: 'Billing',
  scope_change: 'Scope Change',
  other: 'Other',
}

const STATUS_WORKFLOW = ['open', 'acknowledged', 'investigating', 'resolving', 'resolved', 'closed']

export function ClientComplaints() {
  const { navigate } = useAppStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [severityFilter, setSeverityFilter] = React.useState<string>('all')
  const [projectFilter, setProjectFilter] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  // Fetch complaints
  const { data, isLoading } = useQuery({
    queryKey: ['client-complaints', statusFilter, severityFilter, projectFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (severityFilter !== 'all') params.set('severity', severityFilter)
      if (projectFilter !== 'all') params.set('projectId', projectFilter)
      const qs = params.toString()
      return api.get(`/api/client-portal/complaints${qs ? `?${qs}` : ''}`)
    },
  })

  const complaints = data?.data || []

  // Fetch projects for dropdowns
  const { data: projectsData } = useQuery({
    queryKey: ['client-portal-projects-complaints'],
    queryFn: () => api.get('/api/client-portal/projects'),
  })
  const projects = projectsData?.data || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/client-portal/complaints', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-complaints'] })
      setCreateOpen(false)
      toast({ title: 'Complaint submitted', description: 'Your complaint has been filed successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.error || 'Failed to submit complaint', variant: 'destructive' })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/client-portal/complaints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-complaints'] })
      setDeleteId(null)
      toast({ title: 'Deleted', description: 'Complaint has been deleted.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.error || 'Failed to delete', variant: 'destructive' })
    },
  })

  // Filter
  const filtered = complaints.filter((c: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return c.subject.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('client-dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Submit and track your complaints</p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-3.5 w-3.5" /> New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>File a Complaint</DialogTitle>
            </DialogHeader>
            <CreateComplaintForm
              projects={projects}
              onSubmit={(data) => createMutation.mutate(data)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="sm:w-36">
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {Object.entries(severityConfig).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No complaints found</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> File a Complaint
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((complaint: any) => {
                    const sev = severityConfig[complaint.severity] || severityConfig.medium
                    const stat = statusConfig[complaint.status] || statusConfig.open
                    const isExpanded = expandedId === complaint.id
                    return (
                      <React.Fragment key={complaint.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => setExpandedId((prev) => (prev === complaint.id ? null : complaint.id))}
                        >
                          <TableCell className="py-3">
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{complaint.subject}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-xs">{complaint.description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{complaint.project?.name || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {categoryLabels[complaint.category] || complaint.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`gap-1.5 text-xs ${sev.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sev.dotColor}`} />
                              {sev.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-xs ${stat.color}`}>
                              {stat.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {complaint.status === 'open' && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={(e) => { e.stopPropagation(); setDeleteId(complaint.id) }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/20 px-6 py-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Complaint Details */}
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Complaint Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Description:</span>
                                      <p className="mt-1">{complaint.description}</p>
                                    </div>
                                    <div className="flex gap-4">
                                      <div>
                                        <span className="text-muted-foreground text-xs">Filed by:</span>
                                        <p className="font-medium">{complaint.clientName}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground text-xs">Created:</span>
                                        <p className="font-medium">{new Date(complaint.createdAt).toLocaleString()}</p>
                                      </div>
                                    </div>
                                    {complaint.assignedTo && (
                                      <div>
                                        <span className="text-muted-foreground text-xs">Assigned To:</span>
                                        <p className="font-medium">{complaint.assignedTo}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Status Workflow */}
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Status Progress</h4>
                                  <div className="flex items-center gap-1 mb-3">
                                    {STATUS_WORKFLOW.map((step, idx) => {
                                      const isActive = statusConfig[complaint.status]?.step >= idx
                                      const isCurrent = statusConfig[complaint.status]?.step === idx
                                      return (
                                        <React.Fragment key={step}>
                                          <div
                                            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                              isActive
                                                ? isCurrent
                                                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-200 dark:ring-emerald-800'
                                                  : 'bg-emerald-500 text-white'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                            title={statusConfig[step]?.label}
                                          >
                                            {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                                          </div>
                                          {idx < STATUS_WORKFLOW.length - 1 && (
                                            <div className={`flex-1 h-0.5 ${isActive ? 'bg-emerald-500' : 'bg-muted'}`} />
                                          )}
                                        </React.Fragment>
                                      )
                                    })}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {STATUS_WORKFLOW.map((step) => (
                                      <div key={step} className={`text-[10px] ${statusConfig[step]?.step === statusConfig[complaint.status]?.step ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}`}>
                                        {statusConfig[step]?.label}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Resolution */}
                                  {complaint.resolution && (
                                    <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolution
                                      </div>
                                      <p className="text-sm">{complaint.resolution}</p>
                                      {complaint.resolutionDate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Resolved: {new Date(complaint.resolutionDate).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  )}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this complaint? This action cannot be undone. Only open complaints can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CreateComplaintForm({
  projects,
  onSubmit,
  loading,
}: {
  projects: any[]
  onSubmit: (data: any) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    projectId: '',
    subject: '',
    description: '',
    category: '',
    severity: 'medium',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId || !form.subject || !form.description || !form.category) return
    onSubmit(form)
    setForm({ projectId: '', subject: '', description: '', category: '', severity: 'medium' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Project *</Label>
        <Select value={form.projectId} onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select project..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Subject *</Label>
        <Input
          placeholder="Brief description of the issue"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea
          placeholder="Provide detailed information about your complaint..."
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Severity</Label>
          <Select value={form.severity} onValueChange={(v) => setForm((f) => ({ ...f, severity: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(severityConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                    {config.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={loading || !form.projectId || !form.subject || !form.description || !form.category} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </Button>
      </DialogFooter>
    </form>
  )
}
