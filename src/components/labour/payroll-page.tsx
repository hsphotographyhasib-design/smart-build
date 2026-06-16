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
import { Search, Wallet, CheckCircle, Sparkles } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface PayrollRecord {
  id: string
  labourId: string
  projectId: string
  periodStart: string
  periodEnd: string
  daysWorked: number
  overtimeHours: number
  basicPay: number
  overtimePay: number
  deductions: number
  advanceDeductions: number
  netPay: number
  status: string
  paidDate: string | null
  createdAt: string
  labour: {
    id: string
    name: string
    groupId: string
    group: { id: string; name: string }
  }
}

interface PayrollSummary {
  totalBasic: number
  totalOT: number
  totalDeductions: number
  totalNetPay: number
}

interface Project {
  id: string
  name: string
  code: string
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

function statusBadge(status: string) {
  switch (status) {
    case 'paid':
      return <Badge className="bg-emerald-600 text-white border-0 text-xs">Paid</Badge>
    case 'pending':
      return <Badge className="bg-amber-600 text-white border-0 text-xs">Pending</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
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
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// বেতন তৈরি ডায়ালগ
// ──────────────────────────────────────────

function GeneratePayrollDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    projectId: '',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
  })

  const { data: projects } = useQuery({
    queryKey: ['projects-payroll'],
    queryFn: () => api.get<{ success: boolean; data: Project[] }>('/api/projects?status=active').then((r) => r.data),
  })

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/payroll/generate', body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      toast.success(`Payroll generated! ${res.data?.created ?? 0} record(s) created.`)
      onClose()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = () => {
    if (!form.projectId) { toast.error('Select a project'); return }
    mutation.mutate({
      projectId: form.projectId,
      month: parseInt(form.month),
      year: parseInt(form.year),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            Generate Payroll
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {(projects || []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month *</Label>
              <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year *</Label>
              <Input
                type="number"
                min="2020"
                max="2035"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
            This will generate payroll for all active labour. If payroll already exists for this period, it will be regenerated.
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Generating...' : 'Generate Payroll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function PayrollPage() {
  const currentMonth = String(new Date().getMonth() + 1)
  const currentYear = String(new Date().getFullYear())
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [generateOpen, setGenerateOpen] = useState(false)
  const [payId, setPayId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: projects } = useQuery({
    queryKey: ['projects-pr'],
    queryFn: () => api.get<{ success: boolean; data: Project[] }>('/api/projects').then((r) => r.data),
  })

  const { data: payrollData, isLoading, error } = useQuery({
    queryKey: ['payroll', { month, year, project: projectFilter, status: statusFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      params.set('month', month)
      params.set('year', year)
      if (projectFilter && projectFilter !== 'all') params.set('projectId', projectFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      return api.get<{ success: boolean; data: { records: PayrollRecord[]; summary: PayrollSummary } }>(
        `/api/payroll?${params.toString()}`
      ).then((r) => r.data)
    },
  })

  const records = payrollData?.records || []
  const summary = payrollData?.summary || { totalBasic: 0, totalOT: 0, totalDeductions: 0, totalNetPay: 0 }

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records
    return records.filter((r) =>
      r.labour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.labour.group?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [records, searchQuery])

  const payMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/payroll/${id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      toast.success('Payroll marked as paid!')
      setPayId(null)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const monthLabel = MONTHS.find((m) => m.value === month)?.label || month

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${monthLabel} ${year} — ${records.length} record(s)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGenerateOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* ফিল্টারসমূহ */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by labour or group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min="2020"
          max="2035"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full sm:w-24"
        />
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {(projects || []).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* বিষয়বস্তু */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-sm">Failed to load payroll. Please try again.</p>
          </CardContent>
        </Card>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Payroll Records</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || projectFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Generate payroll for the selected period to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Labour Name</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Group</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Days</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden sm:table-cell">OT Hrs</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden lg:table-cell">Basic</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden lg:table-cell">OT Pay</TableHead>
                  <TableHead className="font-semibold text-xs text-right hidden xl:table-cell">Deductions</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Net Pay</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((r) => (
                  <TableRow key={r.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm font-medium">{r.labour.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.labour.group?.name || '—'}</TableCell>
                    <TableCell className="text-right text-sm">{r.daysWorked}</TableCell>
                    <TableCell className="text-right text-sm hidden sm:table-cell">{r.overtimeHours || '—'}</TableCell>
                    <TableCell className="text-right text-sm hidden lg:table-cell">{formatCurrency(r.basicPay)}</TableCell>
                    <TableCell className="text-right text-sm hidden lg:table-cell">{formatCurrency(r.overtimePay)}</TableCell>
                    <TableCell className="text-right text-sm hidden xl:table-cell text-red-600">
                      -{formatCurrency(r.deductions + r.advanceDeductions)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.netPay)}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== 'paid' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => setPayId(r.id)}
                            title="Mark as Paid"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* সারসংক্ষেপ সারি */}
                <TableRow className="bg-muted/80 font-semibold">
                  <TableCell className="text-sm" colSpan={4}>Total</TableCell>
                  <TableCell className="text-right text-sm hidden lg:table-cell">{formatCurrency(summary.totalBasic)}</TableCell>
                  <TableCell className="text-right text-sm hidden lg:table-cell">{formatCurrency(summary.totalOT)}</TableCell>
                  <TableCell className="text-right text-sm hidden xl:table-cell text-red-600">
                    -{formatCurrency(summary.totalDeductions)}
                  </TableCell>
                  <TableCell className="text-right text-sm">{formatCurrency(summary.totalNetPay)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* বেতন তৈরি ডায়ালগ */}
      <GeneratePayrollDialog open={generateOpen} onClose={() => setGenerateOpen(false)} />

      {/* পরিশোধিত হিসেবে চিহ্নিতকরণ নিশ্চিতকরণ */}
      <AlertDialog open={!!payId} onOpenChange={() => setPayId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Paid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark this payroll record as paid. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => payId && payMutation.mutate(payId)}
              disabled={payMutation.isPending}
            >
              {payMutation.isPending ? 'Processing...' : 'Mark as Paid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}