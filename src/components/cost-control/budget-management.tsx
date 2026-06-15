'use client'

import { useState } from 'react'
import { api, useAppStore, queryKeys } from '@/lib/store'
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
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus, Pencil, Trash2, Eye, CheckCircle, XCircle, Lock, ChevronDown, ChevronRight,
  DollarSign, FileText, AlertTriangle, CalendarDays,
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
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  locked: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

// ─── প্রকারভেদ ───
interface Budget {
  id: string
  projectId: string
  originalValue: number
  revisedValue: number
  approvedChanges: number
  pendingChanges: number
  retentionPercent: number
  status: string
  createdAt: string
  updatedAt: string
  project: { id: string; name: string; code: string; status: string }
  createdBy: { id: string; name: string }
  approvedBy?: { id: string; name: string } | null
  _count: { lineItems: number; changeOrders: number; snapshots: number }
}

interface LineItem {
  id: string
  budgetId: string
  costCodeId: string
  originalBudget: number
  revisedBudget: number
  committedCost: number
  actualCost: number
  forecastToComplete: number
  estimatedAtCompletion: number
  percentComplete: number
  earnedRevenue: number
  billedRevenue: number
  notes?: string
  costCode: {
    id: string; code: string; name: string; level: number
    parent?: { id: string; code: string; name: string; parent?: { id: string; code: string; name: string } | null } | null
  }
}

interface CostCode {
  id: string
  code: string
  name: string
  level: number
  unitType?: string
}

interface Project {
  id: string
  name: string
  code: string
  status: string
}

export function BudgetManagement() {
  const queryClient = useQueryClient()
  const { navigate } = useAppStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedBudget, setExpandedBudget] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [addLineItemDialog, setAddLineItemDialog] = useState<string | null>(null)
  const [editLineItem, setEditLineItem] = useState<LineItem | null>(null)
  const [selectedProject, setSelectedProject] = useState('')

  // বাজেট আনা
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['cost-control-budgets', statusFilter],
    queryFn: () => api.get<Budget[]>(`/api/cost-control/budgets?status=${statusFilter}`).then(r => r.data!),
  })

  // বাজেটবিহীন প্রকল্প আনা
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-no-budget'],
    queryFn: () => api.get<Project[]>('/api/projects').then(r => {
      const projectData = r.data || []
      const budgetProjectIds = budgets.map(b => b.projectId)
      return projectData.filter(p => !budgetProjectIds.includes(p.id))
    }),
  })

  // খরচ কোড আনা (প্রান্তিক স্তর)
  const { data: costCodes = [] } = useQuery({
    queryKey: ['cost-codes-leaf'],
    queryFn: () => api.get<CostCode[]>('/api/cost-control/cost-codes?includeUsage=true').then(r => r.data || []),
  })

  // প্রসারিত বাজেটের জন্য বিবরণ আনা
  const { data: budgetDetail } = useQuery({
    queryKey: ['budget-detail', expandedBudget],
    queryFn: () => api.get<any>(`/api/cost-control/budgets/${expandedBudget}`).then(r => r.data),
    enabled: !!expandedBudget,
  })

  // বাজেট তৈরি মিউটেশন
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/cost-control/budgets', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control-budgets'] })
      setCreateDialogOpen(false)
      setSelectedProject('')
    },
  })

  // বাজেট স্ট্যাটাস আপডেট
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/api/cost-control/budgets/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cost-control-budgets'] }),
  })

  // বাজেট মুছে ফেলা
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/cost-control/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control-budgets'] })
      setExpandedBudget(null)
    },
  })

  // লাইন আইটেম যোগ
  const addLineItemMutation = useMutation({
    mutationFn: ({ budgetId, ...body }: any) => api.post(`/api/cost-control/budgets/${budgetId}/line-items`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control-budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-detail'] })
      setAddLineItemDialog(null)
    },
  })

  // লাইন আইটেম আপডেট
  const updateLineItemMutation = useMutation({
    mutationFn: ({ budgetId, itemId, ...body }: any) => api.put(`/api/cost-control/budgets/${budgetId}/line-items/${itemId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control-budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-detail'] })
      setEditLineItem(null)
    },
  })

  // লাইন আইটেম মুছে ফেলা
  const deleteLineItemMutation = useMutation({
    mutationFn: ({ budgetId, itemId }: { budgetId: string; itemId: string }) => api.del(`/api/cost-control/budgets/${budgetId}/line-items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control-budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget-detail'] })
    },
  })

  const lineItems: LineItem[] = budgetDetail?.lineItems || []

  return (
    <div className="p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage project budgets with detailed line items</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Budget
          </Button>
        </div>
      </div>

      {/* বাজেট টেবিল */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : budgets.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No budgets found. Create your first budget to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Project</TableHead>
                  <TableHead className="text-xs text-right">Original</TableHead>
                  <TableHead className="text-xs text-right">Revised</TableHead>
                  <TableHead className="text-xs text-right">Pending CO</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Items</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map(b => (
                  <>
                    <TableRow key={b.id} className={cn('cursor-pointer', expandedBudget === b.id && 'bg-muted/50')}>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpandedBudget(expandedBudget === b.id ? null : b.id)}>
                          {expandedBudget === b.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{b.project.name}</p>
                          <p className="text-xs text-muted-foreground">{b.project.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">{formatCurrency(b.originalValue)}</TableCell>
                      <TableCell className="text-right text-sm font-mono">{formatCurrency(b.revisedValue)}</TableCell>
                      <TableCell className="text-right text-sm font-mono text-amber-600">
                        {b.pendingChanges > 0 ? formatCurrency(b.pendingChanges) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', statusColor[b.status] || '')}>
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b._count.lineItems}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(b.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {b.status === 'draft' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Approve" onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'approved' })}>
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Delete" onClick={() => deleteMutation.mutate(b.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </>
                          )}
                          {b.status === 'approved' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Lock" onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'locked' })}>
                              <Lock className="h-3.5 w-3.5 text-amber-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Forecast" onClick={() => navigate('cost-forecasting', { budgetId: b.id })}>
                            <DollarSign className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* প্রসারিত বিবরণ */}
                    {expandedBudget === b.id && (
                      <TableRow key={`${b.id}-detail`}>
                        <TableCell colSpan={9} className="bg-muted/20 p-0">
                          <div className="p-4 border-t">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-semibold">Line Items — {b.project.name}</h3>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddLineItemDialog(b.id)} disabled={b.status !== 'draft'}>
                                  <Plus className="h-3 w-3 mr-1" /> Add Line Item
                                </Button>
                              </div>
                            </div>

                            {lineItems.length === 0 ? (
                              <div className="py-8 text-center text-sm text-muted-foreground">
                                No line items. Add cost code line items to build the budget.
                              </div>
                            ) : (
                              <div className="max-h-96 overflow-y-auto rounded-lg border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-xs">Cost Code</TableHead>
                                      <TableHead className="text-xs">Original</TableHead>
                                      <TableHead className="text-xs">Revised</TableHead>
                                      <TableHead className="text-xs">Actual</TableHead>
                                      <TableHead className="text-xs">Committed</TableHead>
                                      <TableHead className="text-xs">EAC</TableHead>
                                      <TableHead className="text-xs">Progress</TableHead>
                                      <TableHead className="text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {lineItems.map(li => {
                                      const variance = li.revisedBudget - li.actualCost
                                      return (
                                        <TableRow key={li.id}>
                                          <TableCell>
                                            <div>
                                              <p className="text-xs font-mono font-medium">{li.costCode.code}</p>
                                              <p className="text-[11px] text-muted-foreground">{li.costCode.name}</p>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-xs font-mono">{formatCurrency(li.originalBudget)}</TableCell>
                                          <TableCell className="text-xs font-mono">{formatCurrency(li.revisedBudget)}</TableCell>
                                          <TableCell className={cn('text-xs font-mono', variance < 0 && 'text-red-600')}>{formatCurrency(li.actualCost)}</TableCell>
                                          <TableCell className="text-xs font-mono">{formatCurrency(li.committedCost)}</TableCell>
                                          <TableCell className="text-xs font-mono">{formatCurrency(li.estimatedAtCompletion)}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2 w-24">
                                              <Progress value={li.percentComplete} className="h-1.5" />
                                              <span className="text-[10px] text-muted-foreground w-8 text-right">{li.percentComplete.toFixed(0)}%</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditLineItem(li)}>
                                                <Pencil className="h-3 w-3" />
                                              </Button>
                                              {b.status === 'draft' && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteLineItemMutation.mutate({ budgetId: b.id, itemId: li.id })}>
                                                  <Trash2 className="h-3 w-3 text-red-500" />
                                                </Button>
                                              )}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                    {/* মোট সারি */}
                                    <TableRow className="bg-muted/50 font-semibold">
                                      <TableCell className="text-xs">TOTAL</TableCell>
                                      <TableCell className="text-xs font-mono">{formatCurrency(lineItems.reduce((s, li) => s + li.originalBudget, 0))}</TableCell>
                                      <TableCell className="text-xs font-mono">{formatCurrency(lineItems.reduce((s, li) => s + li.revisedBudget, 0))}</TableCell>
                                      <TableCell className="text-xs font-mono">{formatCurrency(lineItems.reduce((s, li) => s + li.actualCost, 0))}</TableCell>
                                      <TableCell className="text-xs font-mono">{formatCurrency(lineItems.reduce((s, li) => s + li.committedCost, 0))}</TableCell>
                                      <TableCell className="text-xs font-mono">{formatCurrency(lineItems.reduce((s, li) => s + li.estimatedAtCompletion, 0))}</TableCell>
                                      <TableCell>
                                        <span className="text-[10px]">
                                          {(lineItems.reduce((s, li) => s + li.percentComplete, 0) / lineItems.length).toFixed(0)}%
                                        </span>
                                      </TableCell>
                                      <TableCell />
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* বাজেট তৈরির ডায়ালগ */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>Select a project and configure the budget</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Project *</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
                  ))}
                  {projects.length === 0 && <SelectItem value="_none" disabled>No available projects</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Line items can be added after creating the budget. Only projects without existing budgets are shown.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" disabled={!selectedProject || createMutation.isPending} onClick={() => createMutation.mutate({ projectId: selectedProject })}>
              {createMutation.isPending ? 'Creating...' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* লাইন আইটেম যোগ ডায়ালগ */}
      <Dialog open={!!addLineItemDialog} onOpenChange={() => setAddLineItemDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Line Item</DialogTitle>
            <DialogDescription>Add a cost code line item to this budget</DialogDescription>
          </DialogHeader>
          <AddLineItemForm
            costCodes={costCodes}
            onSubmit={(data) => addLineItemMutation.mutate({ budgetId: addLineItemDialog!, ...data })}
            isLoading={addLineItemMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* লাইন আইটেম সম্পাদনা ডায়ালগ */}
      <Dialog open={!!editLineItem} onOpenChange={() => setEditLineItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Line Item</DialogTitle>
            <DialogDescription>Update cost and progress for {editLineItem?.costCode.code}</DialogDescription>
          </DialogHeader>
          {editLineItem && (
            <EditLineItemForm
              item={editLineItem}
              onSubmit={(data) => updateLineItemMutation.mutate({ budgetId: editLineItem.budgetId, itemId: editLineItem.id, ...data })}
              isLoading={updateLineItemMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── সাব-উপাদান ───

function AddLineItemForm({ costCodes, onSubmit, isLoading }: { costCodes: CostCode[]; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [costCodeId, setCostCodeId] = useState('')
  const [originalBudget, setOriginalBudget] = useState('')

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label className="text-sm">Cost Code *</Label>
        <Select value={costCodeId} onValueChange={setCostCodeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select cost code..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {costCodes.map(cc => (
              <SelectItem key={cc.id} value={cc.id}>{cc.code} — {cc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm">Original Budget *</Label>
        <Input type="number" placeholder="0.00" value={originalBudget} onChange={e => setOriginalBudget(e.target.value)} />
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={() => { setCostCodeId(''); setOriginalBudget('') }}>Cancel</Button>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" disabled={!costCodeId || !originalBudget || isLoading} onClick={() => onSubmit({ costCodeId, originalBudget: Number(originalBudget) })}>
          {isLoading ? 'Adding...' : 'Add'}
        </Button>
      </DialogFooter>
    </div>
  )
}

function EditLineItemForm({ item, onSubmit, isLoading }: { item: LineItem; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [form, setForm] = useState({
    revisedBudget: String(item.revisedBudget),
    committedCost: String(item.committedCost),
    actualCost: String(item.actualCost),
    forecastToComplete: String(item.forecastToComplete),
    estimatedAtCompletion: String(item.estimatedAtCompletion),
    percentComplete: String(item.percentComplete),
    earnedRevenue: String(item.earnedRevenue),
    billedRevenue: String(item.billedRevenue),
    notes: item.notes || '',
  })

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Revised Budget</Label>
          <Input type="number" className="h-8 text-xs" value={form.revisedBudget} onChange={e => update('revisedBudget', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Committed Cost</Label>
          <Input type="number" className="h-8 text-xs" value={form.committedCost} onChange={e => update('committedCost', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Actual Cost</Label>
          <Input type="number" className="h-8 text-xs" value={form.actualCost} onChange={e => update('actualCost', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Forecast to Complete</Label>
          <Input type="number" className="h-8 text-xs" value={form.forecastToComplete} onChange={e => update('forecastToComplete', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">EAC</Label>
          <Input type="number" className="h-8 text-xs" value={form.estimatedAtCompletion} onChange={e => update('estimatedAtCompletion', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Complete %</Label>
          <Input type="number" min="0" max="100" className="h-8 text-xs" value={form.percentComplete} onChange={e => update('percentComplete', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Earned Revenue</Label>
          <Input type="number" className="h-8 text-xs" value={form.earnedRevenue} onChange={e => update('earnedRevenue', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Billed Revenue</Label>
          <Input type="number" className="h-8 text-xs" value={form.billedRevenue} onChange={e => update('billedRevenue', e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Notes</Label>
        <Textarea className="text-xs min-h-[60px]" value={form.notes} onChange={e => update('notes', e.target.value)} />
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={() => setEditLineItem(null)}>Cancel</Button>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" disabled={isLoading} onClick={() => {
          const data: any = {}
          Object.entries(form).forEach(([k, v]) => { if (k === 'notes') data[k] = v; else data[k] = Number(v) })
          onSubmit(data)
        }}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </div>
  )
}