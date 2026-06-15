'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api } from '@/lib/store'
import { useFormat } from '@/hooks/use-format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
  Star, Building2, Mail, Phone, Globe, Users, Award, Trophy, X,
} from 'lucide-react'

// ─── Types ───
interface Vendor {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  country: string
  trade: string
  category: string
  rating: number
  status: string
  totalBids: number
  successRate: number
  address?: string
  website?: string
  registrationNo?: string
  taxId?: string
  pastBids?: { id: string; packageNo: string; name: string; status: string; amount: number; result: string }[]
  awards?: { id: string; packageNo: string; name: string; amount: number; awardedDate: string }[]
}

// ─── Config Maps ───
const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  suspended: { label: 'Suspended', className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const tradeOptions = [
  'Civil & Structural', 'Mechanical', 'Electrical', 'Plumbing & Sanitary',
  'HVAC', 'Fire Protection', 'Landscaping', 'Interior Fit-out',
  'Painting & Decoration', 'Piling & Foundation', 'Steel Works',
  'Roofing', ' waterproofing', 'Glass & Aluminum', 'Elevator & Escalator',
  'Consultancy', 'Specialist Works',
]

const emptyVendorForm = () => ({
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  country: '',
  trade: '',
  category: '',
  address: '',
  website: '',
  registrationNo: '',
  taxId: '',
})

// ─── Component ───
export function TenderVendorsPage() {
  const { navigate } = useAppStore()
  const { formatDate } = useFormat()
  const queryClient = useQueryClient()

  const [addOpen, setAddOpen] = useState(false)
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tradeFilter, setTradeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [form, setForm] = useState(emptyVendorForm())

  // ─── Queries ───
  const listParams = useMemo(() => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (categoryFilter !== 'all') p.set('category', categoryFilter)
    if (statusFilter !== 'all') p.set('status', statusFilter)
    if (tradeFilter !== 'all') p.set('trade', tradeFilter)
    p.set('page', String(page))
    p.set('limit', String(pageSize))
    return p.toString()
  }, [search, categoryFilter, statusFilter, tradeFilter, page])

  const { data: listData, isLoading } = useQuery({
    queryKey: ['tender-vendors', listParams],
    queryFn: () => api.get<any>(`/api/tender/vendors?${listParams}`),
  })

  const { data: vendorDetailData } = useQuery({
    queryKey: ['tender-vendor-detail', viewVendor?.id],
    queryFn: () => api.get<Vendor>(`/api/tender/vendors/${viewVendor?.id}`),
    enabled: !!viewVendor?.id,
  })

  const vendors = listData?.data?.vendors || listData?.data || []
  const totalItems = listData?.data?.total || vendors.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const detailVendor = vendorDetailData?.data || viewVendor

  // ─── Mutations ───
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/tender/vendors', body),
    onSuccess: () => {
      toast.success('Vendor added')
      setAddOpen(false)
      setForm(emptyVendorForm())
      queryClient.invalidateQueries({ queryKey: ['tender-vendors'] })
    },
    onError: (err: any) => toast.error(err?.error || 'Failed to add vendor'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/tender/vendors/${id}`),
    onSuccess: () => {
      toast.success('Vendor removed')
      queryClient.invalidateQueries({ queryKey: ['tender-vendors'] })
    },
    onError: (err: any) => toast.error(err?.error || 'Failed to remove'),
  })

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn('h-3 w-3', i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Database</h1>
          <p className="text-sm text-muted-foreground">Manage vendors for tender invitations and evaluations</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Vendor
        </Button>
      </div>

      {/* ফিল্টারসমূহ */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {tradeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={tradeFilter} onValueChange={v => { setTradeFilter(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Trade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {tradeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* টেবিল */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Company Name</TableHead>
                    <TableHead className="text-xs">Contact Person</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Phone</TableHead>
                    <TableHead className="text-xs">Country</TableHead>
                    <TableHead className="text-xs">Trade</TableHead>
                    <TableHead className="text-xs">Rating</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-center">Total Bids</TableHead>
                    <TableHead className="text-xs text-center">Success Rate</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((v: Vendor) => {
                    const sc = statusConfig[v.status] || statusConfig.pending
                    return (
                      <TableRow key={v.id} className="hover:bg-muted/50">
                        <TableCell className="text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="max-w-[150px] truncate">{v.companyName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{v.contactPerson}</TableCell>
                        <TableCell className="text-xs max-w-[150px] truncate">{v.email}</TableCell>
                        <TableCell className="text-xs">{v.phone}</TableCell>
                        <TableCell className="text-xs">{v.country}</TableCell>
                        <TableCell className="text-xs max-w-[100px] truncate">
                          <Badge variant="outline" className="bg-violet-50 text-violet-700 text-[10px] px-1.5 py-0">
                            {v.trade}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderStars(v.rating)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', sc.className)}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center font-medium">{v.totalBids}</TableCell>
                        <TableCell className="text-xs text-center">
                          <span className={cn(
                            'font-semibold',
                            v.successRate >= 50 ? 'text-emerald-600' : v.successRate >= 25 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {v.successRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewVendor(v)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(v.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {vendors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">
                        No vendors found.{' '}
                        <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setAddOpen(true)}>
                          Add one now
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

      {/* ─── ভেন্ডর যোগ ডায়ালগ ─── */}
      <Dialog open={addOpen} onOpenChange={open => { setAddOpen(open); if (!open) setForm(emptyVendorForm()) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
            <DialogDescription>Add a new vendor to the tender vendor database.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Acme Engineering Pte Ltd" />
              </div>
              <div className="space-y-2">
                <Label>Contact Person *</Label>
                <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="John Doe" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@acme.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+65 6123 4567" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="Singapore" />
              </div>
              <div className="space-y-2">
                <Label>Trade</Label>
                <Select value={form.trade} onValueChange={v => setForm(f => ({ ...f, trade: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select trade" /></SelectTrigger>
                  <SelectContent>
                    {tradeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration No</Label>
                <Input value={form.registrationNo} onChange={e => setForm(f => ({ ...f, registrationNo: e.target.value }))} placeholder="REG-001" />
              </div>
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} placeholder="Tax-001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://www.acme.com" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setForm(emptyVendorForm()) }}>Cancel</Button>
            <Button
              onClick={() => {
                if (!form.companyName || !form.contactPerson || !form.email) {
                  toast.error('Please fill required fields')
                  return
                }
                createMutation.mutate(form)
              }}
              disabled={createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ভেন্ডর দেখার ডায়ালগ ─── */}
      <Dialog open={!!viewVendor} onOpenChange={open => { if (!open) setViewVendor(null) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {detailVendor?.companyName || viewVendor?.companyName}
            </DialogTitle>
            <DialogDescription>Vendor details and tender history</DialogDescription>
          </DialogHeader>

          {detailVendor && (
            <div className="space-y-6">
              {/* ভেন্ডর তথ্য গ্রিড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div><span className="text-muted-foreground">Contact:</span><p className="font-medium">{detailVendor.contactPerson}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{detailVendor.email}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{detailVendor.phone}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div><span className="text-muted-foreground">Country:</span><p className="font-medium">{detailVendor.country}</p></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Trade:</span>
                  <p className="font-medium">{detailVendor.trade}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="mt-0.5">{renderStars(detailVendor.rating)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', (statusConfig[detailVendor.status] || statusConfig.pending).className)}>
                      {(statusConfig[detailVendor.status] || statusConfig.pending).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Bids:</span>
                  <p className="font-medium text-lg">{detailVendor.totalBids}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Success Rate:</span>
                  <p className={cn(
                    'font-medium text-lg',
                    detailVendor.successRate >= 50 ? 'text-emerald-600' : detailVendor.successRate >= 25 ? 'text-amber-600' : 'text-red-600'
                  )}>
                    {detailVendor.successRate}%
                  </p>
                </div>
              </div>

              {detailVendor.address && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium">{detailVendor.address}</p>
                </div>
              )}

              <Separator />

              {/* পূর্ববর্তী দরপত্র */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Past Bids</h3>
                {(detailVendor.pastBids || []).length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Package</TableHead>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs text-right">Amount</TableHead>
                          <TableHead className="text-xs">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailVendor.pastBids.map((bid) => (
                          <TableRow key={bid.id}>
                            <TableCell className="text-xs font-mono">{bid.packageNo}</TableCell>
                            <TableCell className="text-xs">{bid.name}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(bid.amount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn(
                                'text-[10px] px-1.5 py-0',
                                bid.result === 'won' ? 'bg-emerald-50 text-emerald-700' :
                                bid.result === 'lost' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                              )}>
                                {bid.result === 'won' ? 'Won' : bid.result === 'lost' ? 'Lost' : bid.result}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No past bids</p>
                )}
              </div>

              {/* পুরস্কার */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Awards Won ({detailVendor.awards?.length || 0})
                </h3>
                {(detailVendor.awards || []).length > 0 ? (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {detailVendor.awards.map((award) => (
                        <div key={award.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium">{award.name}</p>
                            <p className="text-xs text-muted-foreground">{award.packageNo} · {formatDate(award.awardedDate)}</p>
                          </div>
                          <div className="text-sm font-semibold text-emerald-600">
                            {new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(award.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No awards yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}