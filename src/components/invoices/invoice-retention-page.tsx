'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { useFormat } from '@/hooks/use-format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Shield, Banknote, AlertTriangle, CreditCard, DollarSign, Unlock,
} from 'lucide-react'

// ─── Config ───
const retStatusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-purple-100 text-purple-700' },
  released: { label: 'Released', className: 'bg-teal-100 text-teal-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
}

// ─── Component ───
export function InvoiceRetentionPage() {
  const { navigate } = useAppStore()
  const { formatCurrency, formatDate } = useFormat()
  const queryClient = useQueryClient()

  const [releaseDialog, setReleaseDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  // Filters
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Release form
  const [relForm, setRelForm] = useState({ amount: 0, reference: '' })

  // ─── Queries ───
  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (projectFilter !== 'all') p.set('projectId', projectFilter)
    if (statusFilter !== 'all') p.set('status', statusFilter)
    if (search) p.set('search', search)
    p.set('page', String(page))
    p.set('limit', String(pageSize))
    return p.toString()
  }, [projectFilter, statusFilter, search, page])

  const { data: retData, isLoading } = useQuery({
    queryKey: [...queryKeys.invoiceRetention, params],
    queryFn: () => api.get<any>(`/api/invoicing/retention?${params}`),
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects-retention'],
    queryFn: () => api.get('/api/projects'),
  })

  const retentionList = retData?.data?.invoices || retData?.data || []
  const summary = retData?.data?.summary || {}
  const projects = projectsData?.data || []
  const totalItems = retData?.data?.total || retentionList.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // ─── Mutations ───
  const releaseMutation = useMutation({
    mutationFn: ({ invoiceId, body }: { invoiceId: string; body: any }) =>
      api.post(`/api/invoicing/retention/${invoiceId}/release`, body),
    onSuccess: () => {
      toast.success('Retention released')
      setReleaseDialog(false)
      setSelectedInvoice(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.invoiceRetention })
    },
    onError: (e: any) => toast.error(e?.error || 'Failed to release retention'),
  })

  const openReleaseDialog = (inv: any) => {
    const outstanding = (inv.retentionHeld || 0) - (inv.retentionReleased || 0)
    setSelectedInvoice(inv)
    setRelForm({ amount: Math.max(0, outstanding), reference: '' })
    setReleaseDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Retention Management</h1>
        <p className="text-sm text-muted-foreground">Track and release invoice retention amounts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Retention Held</span>
              <div className="p-2 rounded-lg bg-purple-50">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2 text-purple-600">{formatCurrency(summary.totalHeld ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Released</span>
              <div className="p-2 rounded-lg bg-teal-50">
                <Banknote className="h-4 w-4 text-teal-600" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2 text-teal-600">{formatCurrency(summary.totalReleased ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Outstanding Retention</span>
              <div className="p-2 rounded-lg bg-orange-50">
                <CreditCard className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2 text-orange-600">{formatCurrency((summary.totalHeld ?? 0) - (summary.totalReleased ?? 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Overdue Retention</span>
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-xl font-bold mt-2 text-red-600">{formatCurrency(summary.overdueAmount ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
            </div>
            <Select value={projectFilter} onValueChange={v => { setProjectFilter(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name || p.code}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(retStatusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="lg:col-span-2" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Invoice No</TableHead>
                  <TableHead className="text-xs">Project</TableHead>
                  <TableHead className="text-xs">Vendor</TableHead>
                  <TableHead className="text-xs text-right">Invoice Amount</TableHead>
                  <TableHead className="text-xs text-right">Retention %</TableHead>
                  <TableHead className="text-xs text-right">Retention Held</TableHead>
                  <TableHead className="text-xs text-right">Released</TableHead>
                  <TableHead className="text-xs text-right">Outstanding</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-14" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : retentionList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-12">
                      No retention records found
                    </TableCell>
                  </TableRow>
                ) : (
                  retentionList.map((inv: any, idx: number) => {
                    const retHeld = inv.retentionHeld || (inv.total || 0) * ((inv.retentionRate || 0) / 100)
                    const retReleased = inv.retentionReleased || 0
                    const outstanding = retHeld - retReleased
                    const sc = retStatusConfig[inv.retentionStatus || (outstanding <= 0 ? 'released' : 'active')] || retStatusConfig.active
                    return (
                      <TableRow key={inv.id || idx} className="cursor-pointer hover:bg-muted/50" onClick={() => inv.id && navigate('invoice-detail', { id: inv.id })}>
                        <TableCell className="text-xs font-mono font-medium">{inv.invoiceNo || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate">{inv.project?.name || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate">{inv.vendorName || inv.vendor?.name || '—'}</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency(inv.total || 0)}</TableCell>
                        <TableCell className="text-xs text-right">{inv.retentionRate || 0}%</TableCell>
                        <TableCell className="text-xs text-right text-purple-600 font-medium">{formatCurrency(retHeld)}</TableCell>
                        <TableCell className="text-xs text-right text-teal-600">{formatCurrency(retReleased)}</TableCell>
                        <TableCell className="text-xs text-right font-medium text-orange-600">{formatCurrency(outstanding)}</TableCell>
                        <TableCell className="text-xs">{formatDate(inv.retentionDueDate)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', sc.className)}>{sc.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                          {outstanding > 0 && (
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => openReleaseDialog(inv)}>
                              <Unlock className="h-3 w-3" /> Release
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ‹
                </Button>
                <span className="flex items-center px-3 text-xs">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  ›
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Release Retention Dialog ─── */}
      <Dialog open={releaseDialog} onOpenChange={open => { setReleaseDialog(open); if (!open) setSelectedInvoice(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Retention</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>
                  Invoice: <span className="font-mono font-medium">{selectedInvoice.invoiceNo}</span> —
                  Outstanding: <span className="font-semibold text-purple-600">{formatCurrency((selectedInvoice.retentionHeld || 0) - (selectedInvoice.retentionReleased || 0))}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Amount to Release *</Label>
              <Input
                type="number" min={0} step={0.01}
                value={relForm.amount}
                onChange={e => setRelForm(f => ({ ...f, amount: Number(e.target.value) }))}
              />
              {selectedInvoice && (
                <p className="text-xs text-muted-foreground">
                  Max: {formatCurrency((selectedInvoice.retentionHeld || 0) - (selectedInvoice.retentionReleased || 0))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                value={relForm.reference}
                onChange={e => setRelForm(f => ({ ...f, reference: e.target.value }))}
                placeholder="Release reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReleaseDialog(false); setSelectedInvoice(null) }}>Cancel</Button>
            <Button
              onClick={() => selectedInvoice && releaseMutation.mutate({ invoiceId: selectedInvoice.id, body: relForm })}
              disabled={releaseMutation.isPending || relForm.amount <= 0}
              className="gap-1"
            >
              {releaseMutation.isPending && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <Unlock className="h-3.5 w-3.5" /> Release Retention
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}