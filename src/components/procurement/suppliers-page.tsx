'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Plus,
  Search,
  Building2,
  Trash2,
  Pencil,
  Eye,
  Phone,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface Supplier {
  id: string
  name: string
  code: string
  contact: string | null
  email: string | null
  phone: string | null
  address: string | null
  gstNo: string | null
  balance: number
  isActive: boolean
  orderCount: number
  createdAt: string
  updatedAt: string
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

// ──────────────────────────────────────────
// স্কেলেটন
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// তৈরি/সম্পাদনা ডায়ালগ
// ──────────────────────────────────────────

function SupplierFormDialog({ supplier, open, onClose }: { supplier: Supplier | null; open: boolean; onClose: () => void }) {
  const isEdit = !!supplier
  const [form, setForm] = useState({
    name: supplier?.name || '',
    code: supplier?.code || '',
    contact: supplier?.contact || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    gstNo: supplier?.gstNo || '',
  })
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      isEdit ? api.put(`/api/suppliers/${supplier!.id}`, body) : api.post('/api/suppliers', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers })
      toast.success(isEdit ? 'Supplier updated!' : 'Supplier created!')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) { toast.error('Name and code are required'); return }

    mutation.mutate({
      name: form.name.trim(),
      code: form.code.trim(),
      contact: form.contact.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      gstNo: form.gstNo.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" required />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SUP-001" required disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contact Person</Label>
            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Contact person name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} placeholder="Full address" />
          </div>
          <div className="space-y-2">
            <Label>GST No</Label>
            <Input value={form.gstNo} onChange={(e) => setForm({ ...form, gstNo: e.target.value })} placeholder="GST number" />
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
// দেখার ডায়ালগ
// ──────────────────────────────────────────

function ViewSupplierDialog({ supplier, open, onClose }: { supplier: Supplier | null; open: boolean; onClose: () => void }) {
  if (!supplier) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-600" />
            {supplier.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono">{supplier.code}</Badge>
            <Badge className={supplier.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground'}>
              {supplier.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {supplier.contact && (
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div><span className="text-muted-foreground">Contact</span><p className="font-medium">{supplier.contact}</p></div>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div><span className="text-muted-foreground">Email</span><p className="font-medium">{supplier.email}</p></div>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{supplier.phone}</p></div>
              </div>
            )}
            {supplier.gstNo && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div><span className="text-muted-foreground">GST</span><p className="font-medium">{supplier.gstNo}</p></div>
              </div>
            )}
          </div>

          {supplier.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div><span className="text-muted-foreground">Address</span><p className="font-medium">{supplier.address}</p></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">Balance</span>
              <p className="text-lg font-bold">{formatCurrency(supplier.balance)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Orders</span>
              <p className="text-lg font-bold">{supplier.orderCount}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: [...queryKeys.suppliers, { search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      const qs = params.toString()
      return api.get(`/api/suppliers${qs ? `?${qs}` : ''}`).then((r) => r.data as Supplier[])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers })
      toast.success('Supplier deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete'),
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : suppliers ? `${suppliers.length} supplier(s)` : 'No suppliers'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* অনুসন্ধান */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, code, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* বিষয়বস্তু */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load suppliers. Please try again.</p>
          </CardContent>
        </Card>
      ) : suppliers && suppliers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Suppliers Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term.' : 'Add your first supplier to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : suppliers ? (
        <Card className="overflow-hidden">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs">Code</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Contact</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Email</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="font-semibold text-xs hidden xl:table-cell">GST</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Balance</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell>
                      <button onClick={() => setViewSupplier(s)} className="text-sm font-medium text-amber-700 hover:underline text-left">
                        {s.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{s.code}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.contact || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{s.email || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{s.phone || '—'}</TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{s.gstNo || '—'}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(s.balance)}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', s.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground')}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewSupplier(s)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditSupplier(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(s.id)}
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

      {/* তৈরির ডায়ালগ */}
      <SupplierFormDialog supplier={null} open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* সম্পাদনা ডায়ালগ */}
      <SupplierFormDialog supplier={editSupplier} open={!!editSupplier} onClose={() => setEditSupplier(null)} />

      {/* দেখার ডায়ালগ */}
      <ViewSupplierDialog supplier={viewSupplier} open={!!viewSupplier} onClose={() => setViewSupplier(null)} />

      {/* মুছে ফেলার নিশ্চিতকরণ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the supplier. Suppliers with existing purchase orders cannot be deleted.
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
