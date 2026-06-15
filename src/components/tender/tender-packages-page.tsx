'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api } from '@/lib/store'
import { useFormat } from '@/hooks/use-format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  FileText, Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Users, Send,
} from 'lucide-react'

// ─── Types ───
interface TenderPackage {
  id: string
  packageNo: string
  name: string
  status: string
  projectId: string
  project: { id: string; name: string; code: string } | null
  category: string
  estimatedBudget: number
  bidDueDate: string
  invitationsCount: number
  submittedCount: number
  createdAt: string
}

// ─── Config Maps ───
const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  published: { label: 'Published', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  under_evaluation: { label: 'Under Evaluation', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  awarded: { label: 'Awarded', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'under_evaluation', label: 'Under Evaluation' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'closed', label: 'Closed' },
]

const emptyForm = () => ({
  name: '',
  projectId: '',
  category: '',
  description: '',
  scopeOfWork: '',
  bidDueDate: '',
  estimatedBudget: 0,
  boqReference: '',
  requireTechnicalProposal: true,
  requireCommercialProposal: true,
  requireMethodStatement: false,
  requireQualityPlan: false,
  requireSafetyPlan: false,
})

// ─── Component ───
export function TenderPackagesPage() {
  const { navigate } = useAppStore()
  const { formatCurrency, formatDate } = useFormat()
  const queryClient = useQueryClient()

  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [form, setForm] = useState(emptyForm())

  // ─── Queries ───
  const listParams = useMemo(() => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (statusFilter !== 'all') p.set('status', statusFilter)
    p.set('page', String(page))
    p.set('limit', String(pageSize))
    return p.toString()
  }, [search, statusFilter, page])

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['tender-packages', listParams],
    queryFn: () => api.get<any>(`/api/tender/packages?${listParams}`),
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects-tender'],
    queryFn: () => api.get('/api/projects'),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['tender-categories'],
    queryFn: () => api.get<string[]>('/api/tender/categories'),
  })

  const packages = listData?.data?.packages || listData?.data || []
  const totalItems = listData?.data?.total || packages.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const projects = projectsData?.data || []
  const categories = categoriesData?.data || []

  // ─── Mutations ───
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/tender/packages', body),
    onSuccess: (res) => {
      toast.success('Bid package created')
      setCreateOpen(false)
      setForm(emptyForm())
      queryClient.invalidateQueries({ queryKey: ['tender-packages'] })
      if (res?.data?.id) {
        navigate('tender-detail', { packageId: res.data.id })
      }
    },
    onError: (err: any) => toast.error(err?.error || 'Failed to create bid package'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/tender/packages/${id}`),
    onSuccess: () => {
      toast.success('Bid package deleted')
      queryClient.invalidateQueries({ queryKey: ['tender-packages'] })
    },
    onError: (err: any) => toast.error(err?.error || 'Failed to delete'),
  })

  const handleCreate = () => {
    if (!form.name || !form.projectId) {
      toast.error('Please fill in required fields (Name, Project)')
      return
    }
    createMutation.mutate(form)
  }

  const resetForm = () => setForm(emptyForm())

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bid Packages</h1>
          <p className="text-sm text-muted-foreground">Create and manage tender bid packages</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Bid Package
        </Button>
      </div>

      {/* ফিল্টারসমূহ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bid packages..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
          </div>
          <div className="mt-3">
            <Tabs value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
              <TabsList className="h-9">
                {statusTabs.map(t => (
                  <TabsTrigger key={t.value} value={t.value} className="text-xs px-3">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* টেবিল */}
      <Card>
        <CardContent className="p-0">
          {listLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Package No</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Project</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-right">Est. Budget</TableHead>
                    <TableHead className="text-xs">Bid Due</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-center">Invited</TableHead>
                    <TableHead className="text-xs text-center">Submitted</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg: TenderPackage) => {
                    const sc = statusConfig[pkg.status] || statusConfig.draft
                    return (
                      <TableRow
                        key={pkg.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate('tender-detail', { packageId: pkg.id })}
                      >
                        <TableCell className="text-xs font-mono font-medium">{pkg.packageNo}</TableCell>
                        <TableCell className="text-xs max-w-[180px] truncate font-medium">{pkg.name}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate">{pkg.project?.name || '—'}</TableCell>
                        <TableCell className="text-xs">
                          {pkg.category ? (
                            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-[10px] px-1.5 py-0">
                              {pkg.category}
                            </Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-right font-medium">{formatCurrency(pkg.estimatedBudget)}</TableCell>
                        <TableCell className="text-xs">{pkg.bidDueDate ? formatDate(pkg.bidDueDate) : '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', sc.className)}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {pkg.invitationsCount ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <span className={cn(
                            'font-semibold',
                            (pkg.submittedCount ?? 0) > 0 ? 'text-emerald-600' : 'text-muted-foreground'
                          )}>
                            {pkg.submittedCount ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => navigate('tender-detail', { packageId: pkg.id })}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {pkg.status === 'draft' && (
                              <>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500"
                                  onClick={() => deleteMutation.mutate(pkg.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {packages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">
                        No bid packages found.{' '}
                        <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setCreateOpen(true)}>
                          Create one now
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* পেজিনেশন */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center px-3 text-xs">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── বিড প্যাকেজ তৈরির ডায়ালগ ─── */}
      <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Bid Package</DialogTitle>
            <DialogDescription>Set up a new tender bid package. It will be saved as a draft.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Mechanical Works Package A"
                />
              </div>
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name || p.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)
                    ) : (
                      ['Civil Works', 'Mechanical', 'Electrical', 'Plumbing', 'HVAC', 'Fire Protection', 'Landscaping', 'Specialist Works', 'Consultancy'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Budget</Label>
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  value={form.estimatedBudget || ''}
                  onChange={e => setForm(f => ({ ...f, estimatedBudget: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bid Due Date</Label>
                <Input
                  type="date"
                  value={form.bidDueDate}
                  onChange={e => setForm(f => ({ ...f, bidDueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>BOQ Reference</Label>
                <Input
                  value={form.boqReference}
                  onChange={e => setForm(f => ({ ...f, boqReference: e.target.value }))}
                  placeholder="BOQ-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the tender scope..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Scope of Work</Label>
              <Textarea
                value={form.scopeOfWork}
                onChange={e => setForm(f => ({ ...f, scopeOfWork: e.target.value }))}
                placeholder="Detailed scope of work requirements..."
                rows={3}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <h4 className="font-semibold text-sm">Required Proposals</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'requireTechnicalProposal', label: 'Technical Proposal' },
                  { key: 'requireCommercialProposal', label: 'Commercial Proposal' },
                  { key: 'requireMethodStatement', label: 'Method Statement' },
                  { key: 'requireQualityPlan', label: 'Quality Plan' },
                  { key: 'requireSafetyPlan', label: 'Safety Plan' },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <Checkbox
                      id={item.key}
                      checked={form[item.key as keyof typeof form] as boolean}
                      onCheckedChange={v => setForm(f => ({ ...f, [item.key]: !!v }))}
                    />
                    <Label htmlFor={item.key} className="text-sm font-normal cursor-pointer">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm() }}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !form.name || !form.projectId}
              className="gap-2"
            >
              {createMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Create Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}