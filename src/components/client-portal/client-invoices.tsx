'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  FileText, DollarSign, Download, ArrowLeft, Search,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock,
} from 'lucide-react'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Clock },
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', icon: AlertCircle },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', icon: FileText },
}

export function ClientInvoices() {
  const { navigate } = useAppStore()
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = React.useState(false)

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['client-portal-projects-invoices'],
    queryFn: () => api.get('/api/client-portal/projects'),
  })
  const projects = projectsData?.data || []

  React.useEffect(() => {
    if (!hasInitialized && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
      setHasInitialized(true)
    }
  }, [projects, hasInitialized])

  // Fetch invoices
  const { data, isLoading } = useQuery({
    queryKey: ['client-portal-invoices', selectedProjectId],
    queryFn: () => api.get(`/api/client-portal/projects/${selectedProjectId}/invoices`),
    enabled: !!selectedProjectId,
  })

  const invoices = data?.data?.invoices || []
  const summary = data?.data?.summary || { totalAmount: 0, totalPaid: 0, totalOutstanding: 0, overdueAmount: 0, count: 0 }

  // Filter
  const filteredInvoices = invoices.filter((inv: any) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return inv.invoiceNo.toLowerCase().includes(q) || (inv.notes || '').toLowerCase().includes(q)
    }
    return true
  })

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id))
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('client-dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground text-sm mt-0.5">View and track project invoices</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
          const csvContent = `Invoice No,Date,Status,Amount,Paid,Balance\n${invoices.map((i: any) =>
            `${i.invoiceNo},${i.issueDate},${i.status},${i.total},${i.paidAmount},${i.total - i.paidAmount}`
          ).join('\n')}`
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'invoices.csv'
          a.click()
          URL.revokeObjectURL(url)
        }}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Project Selector + Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="sm:w-64">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedProjectId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Select a project to view invoices</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xl font-bold">{formatCurrency(summary.totalAmount)}</p>
                <p className="text-xs text-muted-foreground">Total Invoiced</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(summary.totalPaid)}</p>
                <p className="text-xs text-muted-foreground">Total Paid</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-600">{formatCurrency(summary.totalOutstanding)}</p>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-red-600">{formatCurrency(summary.overdueAmount)}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No invoices found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((inv: any) => {
                        const config = statusConfig[inv.status] || statusConfig.draft
                        const StatusIcon = config.icon
                        const isExpanded = expandedRow === inv.id
                        const balance = inv.total - inv.paidAmount
                        return (
                          <React.Fragment key={inv.id}>
                            <TableRow
                              className="cursor-pointer hover:bg-muted/40"
                              onClick={() => toggleRow(inv.id)}
                            >
                              <TableCell className="py-3">
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </TableCell>
                              <TableCell className="font-medium text-sm">{inv.invoiceNo}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(inv.issueDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`gap-1 text-xs ${config.color}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">{formatCurrency(inv.total)}</TableCell>
                              <TableCell className="text-right text-sm text-emerald-600">{formatCurrency(inv.paidAmount)}</TableCell>
                              <TableCell className="text-right text-sm font-medium">
                                <span className={balance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                  {formatCurrency(balance)}
                                </span>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={7} className="bg-muted/20 px-6 py-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Line Items</h4>
                                      {(inv.items || []).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No line items</p>
                                      ) : (
                                        <div className="space-y-1">
                                          {(inv.items || []).map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                              <span className="text-muted-foreground">{item.description} × {item.quantity} {item.unit}</span>
                                              <span className="font-medium">{formatCurrency(item.amount)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Payment History</h4>
                                      {(inv.payments || []).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No payments recorded</p>
                                      ) : (
                                        <div className="space-y-1">
                                          {(inv.payments || []).map((pay: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                              <span className="text-muted-foreground">
                                                {new Date(pay.createdAt).toLocaleDateString()}
                                              </span>
                                              <span className="font-medium text-emerald-600">{formatCurrency(pay.amount)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div className="mt-3 pt-2 border-t space-y-1">
                                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(inv.subtotal)}</span></div>
                                        {inv.tax > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(inv.tax)}</span></div>}
                                        {inv.discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-emerald-600">-{formatCurrency(inv.discount)}</span></div>}
                                        {inv.retention > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Retention</span><span>{formatCurrency(inv.retention)}</span></div>}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
