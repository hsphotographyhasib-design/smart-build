'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Search, Package, Trash2, Pencil, Eye, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  sku: string
  brand: string | null
  unit: string
  costPrice: number
  sellingPrice: number
  currentStock: number
  minStock: number
  isActive: boolean
  category: { id: string; name: string }
  createdAt: string
}

interface Category { id: string; name: string; isActive: boolean }

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function ProductCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<Product | null>(null)
  const [editItem, setEditItem] = useState<Product | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    categoryId: '', name: '', sku: '', brand: '', unit: 'pcs', costPrice: '', sellingPrice: '', currentStock: '0', minStock: '0',
  })
  const queryClient = useQueryClient()

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (categoryFilter !== 'all') p.set('categoryId', categoryFilter)
    if (activeFilter === 'active') p.set('isActive', 'true')
    if (activeFilter === 'inactive') p.set('isActive', 'false')
    if (searchQuery) p.set('search', searchQuery)
    return p
  }, [categoryFilter, activeFilter, searchQuery])

  const { data: items, isLoading, error } = useQuery({
    queryKey: [...queryKeys.products, Object.fromEntries(params)],
    queryFn: () => api.get(`/api/products?${params.toString()}`).then((r) => r.data as Product[]),
  })

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => api.get('/api/product-categories').then((r) => r.data as Category[]),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/products', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      toast.success('Product created!')
      setCreateOpen(false)
      setForm({ categoryId: '', name: '', sku: '', brand: '', unit: 'pcs', costPrice: '', sellingPrice: '', currentStock: '0', minStock: '0' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      toast.success('Product deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoryId || !form.name || !form.sku) { toast.error('Category, name, and SKU are required'); return }
    createMutation.mutate({
      ...form,
      costPrice: parseFloat(form.costPrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      currentStock: parseFloat(form.currentStock) || 0,
      minStock: parseFloat(form.minStock) || 0,
    })
  }

  const getStockBadge = (stock: number, minStock: number) => {
    if (minStock > 0 && stock <= minStock) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    if (stock <= 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : items ? `${items.length} product(s)` : 'No products'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, SKU, brand..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load products.</p></CardContent></Card>
      ) : items && items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Products Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first product to get started.</p>
          </CardContent>
        </Card>
      ) : items ? (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">SKU</TableHead>
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Brand</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Category</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden md:table-cell">Cost</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Selling</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Stock</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-mono text-muted-foreground">{p.sku}</TableCell>
                    <TableCell>
                      <button onClick={() => setViewItem(p)} className="text-sm font-medium text-amber-700 hover:underline text-left">{p.name}</button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{p.brand || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{p.category?.name || '—'}</TableCell>
                    <TableCell className="text-right text-sm hidden md:table-cell text-muted-foreground">{formatCurrency(p.costPrice)}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(p.sellingPrice)}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn('text-xs', getStockBadge(p.currentStock, p.minStock))}>
                        {p.currentStock} {p.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', p.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground')}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewItem(p)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditItem(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}

      {/* তৈরির ডায়ালগ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. PRD-001" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" required />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pcs" />
              </div>
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Min Stock Alert</Label>
                <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="0" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* দেখার ডায়ালগ */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-amber-600" />{viewItem?.name}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono">{viewItem.sku}</Badge>
                <Badge variant="outline">{viewItem.category?.name}</Badge>
                <Badge className={viewItem.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground'}>
                  {viewItem.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {viewItem.brand && <div><span className="text-muted-foreground">Brand</span><p className="font-medium">{viewItem.brand}</p></div>}
                <div><span className="text-muted-foreground">Unit</span><p className="font-medium">{viewItem.unit}</p></div>
                <div><span className="text-muted-foreground">Cost Price</span><p className="font-medium">{formatCurrency(viewItem.costPrice)}</p></div>
                <div><span className="text-muted-foreground">Selling Price</span><p className="font-bold text-lg">{formatCurrency(viewItem.sellingPrice)}</p></div>
                <div><span className="text-muted-foreground">Current Stock</span><p className="font-medium">{viewItem.currentStock} {viewItem.unit}</p></div>
                <div><span className="text-muted-foreground">Min Stock</span><p className="font-medium">{viewItem.minStock} {viewItem.unit}</p></div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg text-sm">
                <span className="text-muted-foreground">Margin</span>
                <p className="font-bold text-lg text-emerald-600">
                  {viewItem.costPrice > 0 ? (((viewItem.sellingPrice - viewItem.costPrice) / viewItem.costPrice) * 100).toFixed(1) : '—'}%
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* সম্পাদনা ডায়ালগ - সরল সক্রিয় টগল */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          {editItem && (
            <EditProductForm item={editItem} onClose={() => setEditItem(null)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the product.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EditProductForm({ item, onClose }: { item: Product; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: item.name,
    brand: item.brand || '',
    unit: item.unit,
    costPrice: String(item.costPrice),
    sellingPrice: String(item.sellingPrice),
    currentStock: String(item.currentStock),
    minStock: String(item.minStock),
    isActive: item.isActive,
  })

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.put(`/api/products/${item.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      toast.success('Product updated!')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutation.mutate({
        ...form,
        costPrice: parseFloat(form.costPrice),
        sellingPrice: parseFloat(form.sellingPrice),
        currentStock: parseFloat(form.currentStock),
        minStock: parseFloat(form.minStock),
      })
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
        <div className="space-y-2"><Label>Cost Price</Label><Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Selling Price</Label><Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></div>
        <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} /></div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="edit-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
        <Label htmlFor="edit-active">Active</Label>
      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>Update</Button>
      </DialogFooter>
    </form>
  )
}