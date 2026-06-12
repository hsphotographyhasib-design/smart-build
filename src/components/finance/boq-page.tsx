'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import {
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface BoqItem {
  id: string
  itemNo: string
  description: string
  unit: string
  quantity: number
  unitRate: number
  amount: number
}

interface ProjectOption {
  id: string
  name: string
  code: string
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// ──────────────────────────────────────────
// Skeleton Loader
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20 text-right" />
          <Skeleton className="h-4 w-24 text-right" />
          <Skeleton className="h-4 w-28 text-right" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Add BOQ Item Dialog
// ──────────────────────────────────────────

function AddBoqItemDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    itemNo: '',
    description: '',
    unit: 'nos',
    quantity: '',
    unitRate: '',
  })
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/api/boq/${projectId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boq(projectId) })
      toast.success('BOQ item added!')
      setOpen(false)
      setForm({ itemNo: '', description: '', unit: 'nos', quantity: '', unitRate: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add BOQ item'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { toast.error('Description is required'); return }
    createMutation.mutate({
      itemNo: form.itemNo.trim() || null,
      description: form.description.trim(),
      unit: form.unit,
      quantity: parseFloat(form.quantity) || 0,
      unitRate: parseFloat(form.unitRate) || 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />Add Item
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add BOQ Item</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="boq-no">Item No</Label>
              <Input id="boq-no" placeholder="e.g. 1.1" value={form.itemNo} onChange={(e) => setForm({ ...form, itemNo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boq-unit">Unit</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nos">Nos</SelectItem>
                  <SelectItem value="sqft">Sq.Ft</SelectItem>
                  <SelectItem value="sqm">Sq.M</SelectItem>
                  <SelectItem value="cum">Cu.M</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="mt">MT</SelectItem>
                  <SelectItem value="m">M</SelectItem>
                  <SelectItem value="lot">Lot</SelectItem>
                  <SelectItem value="ls">Lump Sum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="boq-desc">Description *</Label>
            <Input id="boq-desc" placeholder="Item description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="boq-qty">Quantity</Label>
              <Input id="boq-qty" type="number" min="0" step="1" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boq-rate">Unit Rate (₹)</Label>
              <Input id="boq-rate" type="number" min="0" step="0.01" placeholder="0" value={form.unitRate} onChange={(e) => setForm({ ...form, unitRate: e.target.value })} />
            </div>
          </div>
          {form.quantity && form.unitRate && (
            <div className="rounded-lg border p-3 text-sm bg-muted/30">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatCurrency((parseFloat(form.quantity) || 0) * (parseFloat(form.unitRate) || 0))}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Delete BOQ Item
// ──────────────────────────────────────────

function DeleteBoqItemDialog({ projectId, itemId, itemDesc }: { projectId: string; itemId: string; itemDesc: string }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/boq/${projectId}/item/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boq(projectId) })
      toast.success('BOQ item removed!')
      setOpen(false)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to remove item'),
  })

  return (
    <>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove BOQ Item</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove <span className="font-semibold">{itemDesc}</span> from the bill of quantities?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Removing...' : 'Remove'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function BoqPage() {
  const [projectFilter, setProjectFilter] = useState('')

  // Fetch projects for selector
  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => api.get('/api/projects').then((r) => r.data as ProjectOption[]),
  })

  // Fetch BOQ items for selected project
  const { data: boqItems, isLoading, error } = useQuery({
    queryKey: queryKeys.boq(projectFilter),
    queryFn: () => api.get(`/api/boq/${projectFilter}`).then((r) => r.data as BoqItem[]),
    enabled: !!projectFilter,
  })

  const totalAmount = useMemo(() => {
    if (!boqItems) return 0
    return boqItems.reduce((sum, item) => sum + item.amount, 0)
  }, [boqItems])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bill of Quantities</h1>
          <p className="text-sm text-muted-foreground mt-1">Select a project to view or manage its BOQ</p>
        </div>
        {projectFilter && <AddBoqItemDialog projectId={projectFilter} />}
      </div>

      {/* Project Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Select a project..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {!projectFilter ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">Select a Project</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose a project from the dropdown above to view its bill of quantities.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-28 ml-auto" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TableSkeleton />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
            <p className="text-red-600 text-sm">Failed to load BOQ data.</p>
          </CardContent>
        </Card>
      ) : boqItems && boqItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No BOQ Items</h3>
            <p className="text-sm text-muted-foreground mt-1">Start adding items to the bill of quantities.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-5 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {boqItems?.length} item{boqItems && boqItems.length !== 1 ? 's' : ''}
              </CardTitle>
              <div className="text-sm font-bold">
                Total: <span className="text-amber-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[calc(100vh-320px)]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[80px]">Item No</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell w-[80px]">Unit</TableHead>
                    <TableHead className="font-semibold text-right w-[100px]">Quantity</TableHead>
                    <TableHead className="font-semibold text-right w-[120px]">Rate</TableHead>
                    <TableHead className="font-semibold text-right w-[140px]">Amount</TableHead>
                    <TableHead className="font-semibold w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boqItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">{item.itemNo || '—'}</TableCell>
                      <TableCell className="text-sm font-medium">{item.description}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground uppercase">{item.unit}</TableCell>
                      <TableCell className="text-right text-sm">{item.quantity.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(item.unitRate)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <DeleteBoqItemDialog projectId={projectFilter} itemId={item.id} itemDesc={item.description} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  {boqItems && boqItems.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={5} className="text-right text-sm">Grand Total</TableCell>
                      <TableCell className="text-right text-sm text-amber-600">{formatCurrency(totalAmount)}</TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}