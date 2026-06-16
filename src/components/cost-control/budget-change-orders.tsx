'use client'

import { useState } from 'react'
import { api } from '@/lib/store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  Plus, Pencil, Trash2, Eye, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight,
  FileText, Search, GitCompareArrows, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// ─── সহায়ক ফাংশনসমূহ ───
function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val.toFixed(0)}`
}

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  reviewed: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  applied: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
}

// ─── প্রকারভেদ ───
interface ChangeOrder {
  id: string
  budgetId: string
  bcoNo: string
  title: string
  description?: string
  reason?: string
  originalBudget: number
  changeAmount: number
  newBudget: number
  status: string
  submittedById: string
  reviewedById?: string
  approvedById?: string
  reviewedAt?: string
  approvedAt?: string
  createdAt: string
  budget: { id: string; project: { id: string; name: string; code: string } }
  lineItemUpdates: Array<{
    id: string
    previousAmount: number
    newAmount: number
    changeAmount: number
    budgetLineItem: {
      id: string
      costCode: { id: string; code: string; name: string }
      originalBudget: number
      revisedBudget: number
    }
  }>
}

interface BudgetSummary {
  id: string
  projectId: string
  project: { id: string; name: string; code: string }
  status: string
  revisedValue: number
}

interface LineItemOption {
  id: string
  costCode: { id: string; code: string; name: string }
  originalBudget: number
  revisedBudget: number
}

export function BudgetChangeOrders() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState('')
  const [detailCO, setDetailCO] = useState<ChangeOrder | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // সকল পরিবর্তন অর্ডার আনা (বাজেটের মাধ্যমে)
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets-for-co'],
    queryFn: () => api.get<BudgetSummary[]>('/api/cost-control/budgets').then(r => r.data || []),
  })

  // নির্বাচিত/সকল বাজেটের জন্য CO আনা
  const { data: allChangeOrders = [], isLoading: coLoading } = useQuery({
    queryKey: ['all-change-orders', statusFilter, selectedBudgetId],
    queryFn: async () => {
      const budgetIds = selectedBudgetId ? [selectedBudgetId] : budgets.map(b => b.id)
      const results = await Promise.all(
        budgetIds.map(id =>
          api.get<ChangeOrder[]>(`/api/cost-control/budgets/${id}/change-orders?status=${statusFilter === 'all' ? '' : statusFilter}`).then(r => r.data || [])
        )
      )
      return results.flat()
    },
    enabled: budgets.length > 0 || !!selectedBudgetId,
  })

  // তৈরির ডায়ালগের জন্য লাইন আইটেম আনা
  const { data: lineItems = [] } = useQuery({
    queryKey: ['line-items-for-co', selectedBudgetId],
    queryFn: () => api.get<LineItemOption[]>(`/api/cost-control/budgets/${selectedBudgetId}/line-items`).then(r => r.data || []),
    enabled: !!selectedBudgetId,
  })

  // CO তৈরি মিউটেশন
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post(`/api/cost-control/budgets/${selectedBudgetId}/change-orders`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-change-orders'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-for-co'] })
      setCreateDialogOpen(false)
      setSelectedBudgetId('')
    },
  })

  // CO স্ট্যাটাস আপডেট
  const updateMutation = useMutation({
    mutationFn: ({ budgetId, coId, status }: { budgetId: string; coId: string; status: string }) =>
      api.put(`/api/cost-control/budgets/${budgetId}/change-orders/${coId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-change-orders'] })
      setDetailCO(null)
    },
  })

  // CO মুছে ফেলা
  const deleteMutation = useMutation({
    mutationFn: ({ budgetId, coId }: { budgetId: string; coId: string }) =>
      api.del(`/api/cost-control/budgets/${budgetId}/change-orders/${coId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-change-orders'] })
      setDeleteConfirm(null)
    },
  })

  const filteredCOs = search
    ? allChangeOrders.filter(co =>
        co.bcoNo.toLowerCase().includes(search.toLowerCase()) ||
        co.title.toLowerCase().includes(search.toLowerCase()) ||
        co.budget?.project?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : allChangeOrders

  const totalChangeAmount = allChangeOrders.filter(co => co.status === 'approved' || co.status === 'applied').reduce((s, co) => s + co.changeAmount, 0)
  const pendingCOs = allChangeOrders.filter(co => ['draft', 'submitted', 'reviewed'].includes(co.status)).length

  return (
    <div className="p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Change Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {pendingCOs} pending &middot; {formatCurrency(totalChangeAmount)} approved changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedBudgetId || '_all'} onValueChange={v => setSelectedBudgetId(v === '_all' ? '' : v)}>
            <SelectTrigger className="w-48 h-9 text-sm">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Projects</SelectItem>
              {budgets.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.project.code} — {b.project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setCreateDialogOpen(true)} disabled={!selectedBudgetId}>
            <Plus className="h-4 w-4 mr-1" /> New Change Order
          </Button>
        </div>
      </div>

      {/* ফিল্টারসমূহ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search change orders..." className="pl-9 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* টেবিল */}
      <Card>
        <CardContent className="p-0">
          {coLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : filteredCOs.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No change orders found</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">BCO #</TableHead>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Project</TableHead>
                    <TableHead className="text-xs text-right hidden lg:table-cell">Original Budget</TableHead>
                    <TableHead className="text-xs text-right hidden md:table-cell">Change</TableHead>
                    <TableHead className="text-xs text-right hidden lg:table-cell">New Budget</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-xs text-right hidden md:table-cell">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCOs.map(co => (
                    <TableRow key={co.id}>
                      <TableCell className="text-xs font-mono font-medium">{co.bcoNo}</TableCell>
                      <TableCell className="text-xs font-medium max-w-[180px] truncate">{co.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{co.budget?.project?.name}</TableCell>
                      <TableCell className="text-xs font-mono text-right hidden lg:table-cell">{formatCurrency(co.originalBudget)}</TableCell>
                      <TableCell className="text-xs font-mono text-right hidden md:table-cell">
                        <span className={cn('flex items-center justify-end gap-1', co.changeAmount >= 0 ? 'text-amber-600' : 'text-emerald-600')}>
                          {co.changeAmount >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {formatCurrency(Math.abs(co.changeAmount))}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right hidden lg:table-cell">{formatCurrency(co.newBudget)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', statusColor[co.status] || '')}>
                          {co.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{format(new Date(co.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="View Details" onClick={() => setDetailCO(co)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          {co.status === 'draft' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Submit" onClick={() => updateMutation.mutate({ budgetId: co.budgetId, coId: co.id, status: 'submitted' })}>
                              <FileText className="h-3 w-3 text-blue-600" />
                            </Button>
                          )}
                          {co.status === 'submitted' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Review" onClick={() => updateMutation.mutate({ budgetId: co.budgetId, coId: co.id, status: 'reviewed' })}>
                              <GitCompareArrows className="h-3 w-3 text-amber-600" />
                            </Button>
                          )}
                          {co.status === 'reviewed' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Approve" onClick={() => updateMutation.mutate({ budgetId: co.budgetId, coId: co.id, status: 'approved' })}>
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Reject" onClick={() => updateMutation.mutate({ budgetId: co.budgetId, coId: co.id, status: 'rejected' })}>
                                <XCircle className="h-3 w-3 text-red-500" />
                              </Button>
                            </>
                          )}
                          {['draft', 'rejected'].includes(co.status) && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Delete" onClick={() => setDeleteConfirm(co.id)}>
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CO তৈরির ডায়ালগ */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Budget Change Order</DialogTitle>
            <DialogDescription>Define budget adjustments for {budgets.find(b => b.id === selectedBudgetId)?.project?.name}</DialogDescription>
          </DialogHeader>
          <CreateCOForm
            lineItems={lineItems}
            onSubmit={(body) => createMutation.mutate(body)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* বিস্তারিত ডায়ালগ */}
      <Dialog open={!!detailCO} onOpenChange={() => setDetailCO(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailCO?.bcoNo}
              <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', statusColor[detailCO?.status || ''] || '')}>
                {detailCO?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>{detailCO?.title}</DialogDescription>
          </DialogHeader>
          {detailCO && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Original Budget</p>
                  <p className="text-lg font-bold font-mono">{formatCurrency(detailCO.originalBudget)}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <p className="text-xs text-muted-foreground">Change Amount</p>
                  <p className={cn('text-lg font-bold font-mono', detailCO.changeAmount >= 0 ? 'text-amber-600' : 'text-emerald-600')}>
                    {detailCO.changeAmount >= 0 ? '+' : ''}{formatCurrency(detailCO.changeAmount)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">New Budget</p>
                  <p className="text-lg font-bold font-mono">{formatCurrency(detailCO.newBudget)}</p>
                </div>
              </div>

              {detailCO.reason && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm">{detailCO.reason}</p>
                </div>
              )}
              {detailCO.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{detailCO.description}</p>
                </div>
              )}

              <Separator />

              {/* পূর্বে/পরে তুলনা */}
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <GitCompareArrows className="h-4 w-4" /> Line Item Changes
                </p>
                {detailCO.lineItemUpdates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No line item updates</p>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Cost Code</TableHead>
                          <TableHead className="text-xs text-right">Previous</TableHead>
                          <TableHead className="text-xs text-right">New</TableHead>
                          <TableHead className="text-xs text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailCO.lineItemUpdates.map(u => (
                          <TableRow key={u.id}>
                            <TableCell className="text-xs">
                              <p className="font-mono">{u.budgetLineItem?.costCode?.code}</p>
                              <p className="text-muted-foreground">{u.budgetLineItem?.costCode?.name}</p>
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right">{formatCurrency(u.previousAmount)}</TableCell>
                            <TableCell className="text-xs font-mono text-right font-medium">{formatCurrency(u.newAmount)}</TableCell>
                            <TableCell className={cn('text-xs font-mono text-right', u.changeAmount >= 0 ? 'text-amber-600' : 'text-emerald-600')}>
                              {u.changeAmount >= 0 ? '+' : ''}{formatCurrency(u.changeAmount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* মুছে ফেলার নিশ্চিতকরণ */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Change Order</DialogTitle>
            <DialogDescription>This will permanently delete this change order and reverse any pending budget changes.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
            <Button variant="destructive" size="sm" disabled={deleteMutation.isPending} onClick={() => {
              const co = allChangeOrders.find(c => c.id === deleteConfirm)
              if (co) deleteMutation.mutate({ budgetId: co.budgetId, coId: co.id })
            }}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── CO তৈরির ফর্ম ───
function CreateCOForm({ lineItems, onSubmit, isLoading }: { lineItems: LineItemOption[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [title, setTitle] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [updates, setUpdates] = useState<Array<{ budgetLineItemId: string; previousAmount: number; newAmount: number; changeAmount: number }>>([])

  const addUpdate = (li: LineItemOption) => {
    if (updates.find(u => u.budgetLineItemId === li.id)) return
    setUpdates(prev => [...prev, {
      budgetLineItemId: li.id,
      previousAmount: li.revisedBudget,
      newAmount: li.revisedBudget,
      changeAmount: 0,
    }])
  }

  const removeUpdate = (itemId: string) => {
    setUpdates(prev => prev.filter(u => u.budgetLineItemId !== itemId))
  }

  const updateAmount = (itemId: string, newAmount: number) => {
    setUpdates(prev => prev.map(u => {
      if (u.budgetLineItemId !== itemId) return u
      const changeAmount = newAmount - u.previousAmount
      return { ...u, newAmount, changeAmount }
    }))
  }

  const totalChange = updates.reduce((s, u) => s + u.changeAmount, 0)

  const availableItems = lineItems.filter(li => !updates.find(u => u.budgetLineItemId === li.id))

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label className="text-sm">Title *</Label>
        <Input placeholder="Change order title" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label className="text-sm">Reason</Label>
        <Textarea placeholder="Why is this change needed?" value={reason} onChange={e => setReason(e.target.value)} className="min-h-[60px]" />
      </div>
      <div className="space-y-2">
        <Label className="text-sm">Description</Label>
        <Textarea placeholder="Detailed description..." value={description} onChange={e => setDescription(e.target.value)} className="min-h-[60px]" />
      </div>

      <Separator />

      {/* লাইন আইটেম আপডেট */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm">Line Item Adjustments</Label>
          <span className="text-xs font-mono text-amber-600">Total Change: {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)}</span>
        </div>

        {updates.length > 0 && (
          <div className="space-y-2 mb-3">
            {updates.map(u => {
              const li = lineItems.find(l => l.id === u.budgetLineItemId)
              return (
                <div key={u.budgetLineItemId} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono">{li?.costCode.code}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{li?.costCode.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatCurrency(u.previousAmount)}</span>
                    <span className="text-xs">→</span>
                    <Input type="number" className="w-24 h-7 text-xs" value={u.newAmount} onChange={e => updateAmount(u.budgetLineItemId, Number(e.target.value))} />
                    <span className={cn('text-xs font-mono w-20 text-right', u.changeAmount >= 0 ? 'text-amber-600' : 'text-emerald-600')}>
                      {u.changeAmount >= 0 ? '+' : ''}{formatCurrency(u.changeAmount)}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeUpdate(u.budgetLineItemId)}>
                    <XCircle className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <Select onValueChange={(val) => {
          const li = lineItems.find(l => l.id === val)
          if (li) addUpdate(li)
        }}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Add line item adjustment..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {availableItems.map(li => (
              <SelectItem key={li.id} value={li.id}>
                {li.costCode.code} — {li.costCode.name} ({formatCurrency(li.revisedBudget)})
              </SelectItem>
            ))}
            {availableItems.length === 0 && <SelectItem value="_none" disabled>No line items available</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" disabled={!title || isLoading} onClick={() => onSubmit({
          title,
          reason,
          description,
          lineItemUpdates: updates.map(u => ({
            budgetLineItemId: u.budgetLineItemId,
            previousAmount: u.previousAmount,
            newAmount: u.newAmount,
            changeAmount: u.changeAmount,
          })),
        })}>
          {isLoading ? 'Creating...' : 'Create Change Order'}
        </Button>
      </DialogFooter>
    </div>
  )
}