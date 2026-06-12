'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, Package, Pencil, Trash2, ArrowUpDown, AlertTriangle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface Material {
  id: string
  name: string
  code: string
  unit: string
  category: string | null
  description: string | null
  currentStock: number
  minStock: number
  unitPrice: number
  stockStatus: string
  createdAt: string
  updatedAt: string
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function stockBadge(status: string) {
  switch (status) {
    case 'out_of_stock':
      return <Badge className="bg-red-600 text-white border-0 text-xs">Out of Stock</Badge>
    case 'low_stock':
      return <Badge className="bg-amber-600 text-white border-0 text-xs">Low Stock</Badge>
    default:
      return <Badge className="bg-emerald-600 text-white border-0 text-xs">In Stock</Badge>
  }
}

// ──────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-20 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Create / Edit Dialog
// ──────────────────────────────────────────

function MaterialFormDialog({ material, open, onClose }: { material: Material | null; open: boolean; onClose: () => void }) {
  const isEdit = !!material
  const [form, setForm] = useState({
    name: material?.name || '',
    code: material?.code || '',
    unit: material?.unit || '',
    category: material?.category || '',
    currentStock: material?.currentStock?.toString() || '0',
    minStock: material?.minStock?.toString() || '0',
    unitPrice: material?.unitPrice?.toString() || '0',
  })
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      isEdit ? api.put(`/api/materials/${material!.id}`, body) : api.post('/api/materials', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials })
      toast.success(isEdit ? 'Material updated!' : 'Material created!')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim() || !form.unit.trim()) {
      toast.error('Name, code, and unit are required')
      return
    }
    mutation.mutate({
      name: form.name.trim(),
      code: form.code.trim(),
      unit: form.unit.trim(),
      category: form.category.trim() || null,
      currentStock: parseFloat(form.currentStock) || 0,
      minStock: parseFloat(form.minStock) || 0,
      unitPrice: parseFloat(form.unitPrice) || 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Material' : 'Add Material'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Material name" required />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MAT-001" required disabled={isEdit} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. kg, nos" required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Cement, Steel" />
            </div>
            <div className="space-y-2">
              <Label>Min Stock</Label>
              <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <Input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} placeholder="0" disabled={isEdit} />
            </div>
            <div className="space-y-2">
              <Label>Unit Price (₹)</Label>
              <Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="0" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Stock Adjustment Dialog
// ──────────────────────────────────────────

function StockAdjustDialog({ material, open, onClose }: { material: Material | null; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ type: 'in', quantity: '', notes: '' })
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/api/materials/${material!.id}/adjust-stock`, body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials })
      toast.success(`Stock adjusted! New stock: ${res.data?.newStock ?? '—'}`)
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to adjust stock'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.quantity || parseFloat(form.quantity) <= 0) {
      toast.error('Enter a valid quantity')
      return
    }
    mutation.mutate({
      type: form.type,
      quantity: parseFloat(form.quantity),
      notes: form.notes.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock — {material?.name}</DialogTitle>
        </DialogHeader>
        <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
          <p>Current Stock: <span className="font-semibold">{material?.currentStock}</span> {material?.unit}</p>
          <p>Min Stock: <span className="font-semibold">{material?.minStock}</span> {material?.unit}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Add Stock (In)</SelectItem>
                <SelectItem value="out">Reduce Stock (Out)</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="Enter quantity"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Notes / Reason</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Reason for adjustment..."
              rows={2}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editMaterial, setEditMaterial] = useState<Material | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [adjustMaterial, setAdjustMaterial] = useState<Material | null>(null)
  const queryClient = useQueryClient()

  const { data: materials, isLoading, error } = useQuery({
    queryKey: [...queryKeys.materials, { search: searchQuery, category: categoryFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)
      const qs = params.toString()
      return api.get<{ success: boolean; data: Material[] }>(`/api/materials${qs ? `?${qs}` : ''}`).then((r) => r.data)
    },
  })

  const categories = useMemo(() => {
    if (!materials) return []
    const cats = new Set<string>()
    materials.forEach((m) => { if (m.category) cats.add(m.category) })
    return Array.from(cats).sort()
  }, [materials])

  const lowStockItems = useMemo(() => {
    if (!materials) return []
    return materials.filter((m) => m.currentStock < m.minStock)
  }, [materials])

  const filteredMaterials = useMemo(() => {
    if (!materials) return []
    return materials
  }, [materials])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials })
      toast.success('Material deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete'),
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : materials ? `${materials.length} material(s)` : 'No materials'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Stock Alerts */}
      {!isLoading && lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Stock Alerts ({lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {lowStockItems.map((m) => (
                <Badge
                  key={m.id}
                  variant="outline"
                  className={cn(
                    'text-xs cursor-pointer',
                    m.currentStock === 0
                      ? 'border-red-300 text-red-700 bg-red-100 dark:bg-red-950/40 dark:text-red-400'
                      : 'border-amber-300 text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
                  )}
                >
                  {m.name} ({m.code}): {m.currentStock} / {m.minStock} {m.unit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load materials. Please try again.</p>
          </CardContent>
        </Card>
      ) : filteredMaterials && filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Materials Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || categoryFilter !== 'all' ? 'Try a different search or filter.' : 'Add your first material to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : filteredMaterials ? (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs">Code</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Unit</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Category</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Current Stock</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden md:table-cell">Min Stock</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden lg:table-cell">Unit Price</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((m) => (
                  <TableRow key={m.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-medium">{m.name}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{m.code}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{m.unit}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{m.category || '—'}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{m.currentStock} {m.unit}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">{m.minStock} {m.unit}</TableCell>
                    <TableCell className="text-right text-sm hidden lg:table-cell">{formatCurrency(m.unitPrice)}</TableCell>
                    <TableCell>{stockBadge(m.stockStatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setAdjustMaterial(m)}
                          title="Adjust Stock"
                        >
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditMaterial(m)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}

      {/* Create Dialog */}
      <MaterialFormDialog material={null} open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Edit Dialog */}
      <MaterialFormDialog material={editMaterial} open={!!editMaterial} onClose={() => setEditMaterial(null)} />

      {/* Stock Adjustment Dialog */}
      <StockAdjustDialog material={adjustMaterial} open={!!adjustMaterial} onClose={() => setAdjustMaterial(null)} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this material and all its stock movement history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
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