'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/store'
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
  Users,
  Trash2,
  Pencil,
  Eye,
  Phone,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  gstNo: string | null
  balance: number
  isActive: boolean
  invoiceCount: number
  createdAt: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

function CustomerFormDialog({ customer, open, onClose }: { customer: Customer | null; open: boolean; onClose: () => void }) {
  const isEdit = !!customer
  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    gstNo: customer?.gstNo || '',
  })
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      isEdit ? api.put(`/api/customers/${customer!.id}`, body) : api.post('/api/customers', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
      toast.success(isEdit ? 'Customer updated!' : 'Customer created!')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    mutation.mutate({
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      gstNo: form.gstNo.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
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

function ViewDialog({ customer, open, onClose }: { customer: Customer | null; open: boolean; onClose: () => void }) {
  if (!customer) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-amber-600" />{customer.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Badge className={customer.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground'}>
            {customer.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {customer.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div><span className="text-muted-foreground">Email</span><p className="font-medium">{customer.email}</p></div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{customer.phone}</p></div>
              </div>
            )}
            {customer.gstNo && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div><span className="text-muted-foreground">GST</span><p className="font-medium">{customer.gstNo}</p></div>
              </div>
            )}
          </div>
          {customer.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div><span className="text-muted-foreground">Address</span><p className="font-medium">{customer.address}</p></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">Balance</span>
              <p className="text-lg font-bold">{formatCurrency(customer.balance)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Invoices</span>
              <p className="text-lg font-bold">{customer.invoiceCount}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: items, isLoading, error } = useQuery({
    queryKey: [...queryKeys.customers, { search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      const qs = params.toString()
      return api.get(`/api/customers${qs ? `?${qs}` : ''}`).then((r) => r.data as Customer[])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
      toast.success('Customer deleted')
      setDeleteId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : items ? `${items.length} customer(s)` : 'No customers'}
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Customer
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load customers.</p></CardContent></Card>
      ) : items && items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Customers Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term.' : 'Add your first customer to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : items ? (
        <Card className="overflow-hidden">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Name</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Email</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Phone</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Address</TableHead>
                  <TableHead className="font-semibold text-xs hidden xl:table-cell">GST</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Balance</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell>
                      <button onClick={() => setViewCustomer(c)} className="text-sm font-medium text-amber-700 hover:underline text-left">{c.name}</button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.email || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.phone || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{c.address || '—'}</TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{c.gstNo || '—'}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(c.balance)}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', c.isActive ? 'bg-emerald-600 text-white border-0' : 'bg-secondary text-secondary-foreground')}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewCustomer(c)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditCustomer(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}

      <CustomerFormDialog customer={null} open={createOpen} onClose={() => setCreateOpen(false)} />
      <CustomerFormDialog customer={editCustomer} open={!!editCustomer} onClose={() => setEditCustomer(null)} />
      <ViewDialog customer={viewCustomer} open={!!viewCustomer} onClose={() => setViewCustomer(null)} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the customer. Customers with existing invoices cannot be deleted.</AlertDialogDescription>
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