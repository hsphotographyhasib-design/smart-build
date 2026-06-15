'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
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
import { Plus, Search, Wrench, Trash2, Eye, Pencil, Filter } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  name: string
  code: string
  type: string
  category: string | null
  purchaseDate: string | null
  purchasePrice: number
  currentValue: number
  status: string
  location: string | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const statusColors: Record<string, string> = {
  available: 'bg-emerald-600 text-white border-0',
  issued: 'bg-amber-600 text-white border-0',
  maintenance: 'bg-red-600 text-white border-0',
  disposed: 'bg-slate-500 text-white border-0',
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<Asset | null>(null)
  const [editItem, setEditItem] = useState<Asset | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    name: '', code: '', type: '', category: '', purchaseDate: '', purchasePrice: '', location: '',
  })
  const queryClient = useQueryClient()

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (typeFilter !== 'all') p.set('type', typeFilter)
    if (statusFilter !== 'all') p.set('status', statusFilter)
    return p
  }, [typeFilter, statusFilter])

  const { data: items, isLoading, error } = useQuery({
    queryKey: [...queryKeys.assets, Object.fromEntries(params)],
    queryFn: () => api.get(`/api/assets?${params.toString()}`).then((r) => r.data as Asset[]),
  })

  const filteredItems = useMemo(() => {
    if (!items) return []
    if (!searchQuery) return items
    const q = searchQuery.toLowerCase()
    return items.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q)
    )
  }, [items, searchQuery])

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/assets', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets })
      toast.success('Asset created!')
      setCreateOpen(false)
      setForm({ name: '', code: '', type: '', category: '', purchaseDate: '', purchasePrice: '', location: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.put(`/api/assets/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets })
      toast.success('Asset updated!')
      setEditItem(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets })
      toast.success('Asset deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.code || !form.type) { toast.error('Name, code, and type are required'); return }
    createMutation.mutate({
      ...form,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : items ? `${items.length} asset(s)` : 'No assets'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Asset
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="tool">Tool</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="disposed">Disposed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load assets.</p></CardContent></Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Assets Found</h3>
            <p className="text-sm text-muted-foreground mt-1">{searchQuery ? 'Try a different search.' : 'Add your first asset.'}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs">Code</TableHead>
                  <TableHead className="font-semibold text-xs">Type</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Category</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Value</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Location</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((a) => (
                  <TableRow key={a.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell>
                      <button onClick={() => setViewItem(a)} className="text-sm font-medium text-amber-700 hover:underline text-left">{a.name}</button>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{a.code}</TableCell>
                    <TableCell className="text-sm capitalize">{a.type}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{a.category || '—'}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(a.currentValue)}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs capitalize', statusColors[a.status] || 'bg-secondary text-secondary-foreground')}>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{a.location || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewItem(a)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditItem(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Asset</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Asset name" required />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. AST-001" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Purchase Price</Label>
                <Input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Storage location" />
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

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Asset</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!editItem) return
            const fd = new FormData(e.currentTarget)
            editMutation.mutate({
              id: editItem.id,
              body: {
                status: (fd.get('status') as string) || editItem.status,
                location: fd.get('location') as string || null,
                currentValue: parseFloat(fd.get('currentValue') as string) || undefined,
              },
            })
          }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editItem?.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current Value</Label>
                <Input name="currentValue" type="number" defaultValue={editItem?.currentValue} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input name="location" defaultValue={editItem?.location || ''} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={editMutation.isPending}>Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-amber-600" />{viewItem?.name}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono">{viewItem.code}</Badge>
                <Badge className={cn('text-xs capitalize', statusColors[viewItem.status])}>{viewItem.status}</Badge>
                <Badge variant="outline" className="capitalize">{viewItem.type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Purchase Price</span><p className="font-medium">{formatCurrency(viewItem.purchasePrice)}</p></div>
                <div><span className="text-muted-foreground">Current Value</span><p className="font-bold text-lg">{formatCurrency(viewItem.currentValue)}</p></div>
                {viewItem.category && <div><span className="text-muted-foreground">Category</span><p className="font-medium">{viewItem.category}</p></div>}
                {viewItem.location && <div><span className="text-muted-foreground">Location</span><p className="font-medium">{viewItem.location}</p></div>}
                {viewItem.purchaseDate && <div><span className="text-muted-foreground">Purchase Date</span><p className="font-medium">{format(parseISO(viewItem.purchaseDate), 'dd MMM yyyy')}</p></div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the asset.</AlertDialogDescription>
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