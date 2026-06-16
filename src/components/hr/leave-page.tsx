'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore, api, queryKeys } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, CalendarOff, Banknote, CheckCircle, XCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface LeaveRequest {
  id: string
  employeeId: string
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string | null
  status: string
  createdAt: string
  employee: { id: string; name: string; empCode: string } | null
  approvedBy: { id: string; name: string } | null
}

interface Loan {
  id: string
  employeeId: string
  amount: number
  interestRate: number
  tenureMonths: number
  emiAmount: number
  startDate: string
  status: string
  createdAt: string
  employee: { id: string; name: string; empCode: string } | null
}

interface Employee {
  id: string
  name: string
  empCode: string
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function leaveStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-amber-600 text-white border-0 text-xs">Pending</Badge>
    case 'approved':
      return <Badge className="bg-emerald-600 text-white border-0 text-xs">Approved</Badge>
    case 'rejected':
      return <Badge className="bg-red-600 text-white border-0 text-xs">Rejected</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
}

function loanStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-600 text-white border-0 text-xs">Active</Badge>
    case 'pending':
      return <Badge className="bg-amber-600 text-white border-0 text-xs">Pending</Badge>
    case 'closed':
      return <Badge className="bg-secondary text-secondary-foreground text-xs">Closed</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>
  }
}

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Compensatory Off', 'Loss of Pay']

// ──────────────────────────────────────────
// স্কেলেটনসমূহ
// ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// ছুটির আবেদন ডায়ালগ
// ──────────────────────────────────────────

function ApplyLeaveDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    employeeId: '',
    type: '',
    startDate: '',
    endDate: '',
    days: '',
    reason: '',
  })

  const { data: employees } = useQuery({
    queryKey: ['employees-mini'],
    queryFn: () => api.get<{ success: boolean; data: Employee[] }>('/api/employees?status=active').then((r) => r.data),
  })

  // স্বয়ংক্রিয়ভাবে দিন গণনা
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updated = { ...form, [field]: value }
    if (updated.startDate && updated.endDate) {
      const start = new Date(updated.startDate)
      const end = new Date(updated.endDate)
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      updated.days = String(Math.max(0, diff))
    }
    setForm(updated)
  }

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/leave-requests', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests })
      toast.success('Leave request submitted!')
      onClose()
      setForm({ employeeId: '', type: '', startDate: '', endDate: '', days: '', reason: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employeeId || !form.type || !form.startDate || !form.endDate) {
      toast.error('Employee, type, start date, and end date are required')
      return
    }
    mutation.mutate({
      employeeId: form.employeeId,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      days: parseFloat(form.days) || 1,
      reason: form.reason.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply Leave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {(employees || []).map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.empCode})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Leave Type *</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={(e) => handleDateChange('startDate', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input type="date" value={form.endDate} onChange={(e) => handleDateChange('endDate', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Days</Label>
              <Input type="number" value={form.days} readOnly className="bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Reason for leave..."
              rows={2}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// ঋণ তৈরি ডায়ালগ
// ──────────────────────────────────────────

function CreateLoanDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    employeeId: '',
    amount: '',
    interestRate: '',
    tenureMonths: '',
    emiAmount: '',
    startDate: '',
  })

  const { data: employees } = useQuery({
    queryKey: ['employees-loan'],
    queryFn: () => api.get<{ success: boolean; data: Employee[] }>('/api/employees?status=active').then((r) => r.data),
  })

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/loans', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      toast.success('Loan created!')
      onClose()
      setForm({ employeeId: '', amount: '', interestRate: '', tenureMonths: '', emiAmount: '', startDate: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employeeId || !form.amount || !form.startDate) {
      toast.error('Employee, amount, and start date are required')
      return
    }
    mutation.mutate({
      employeeId: form.employeeId,
      amount: parseFloat(form.amount) || 0,
      interestRate: parseFloat(form.interestRate) || 0,
      tenureMonths: parseInt(form.tenureMonths, 10) || 0,
      emiAmount: parseFloat(form.emiAmount) || 0,
      startDate: form.startDate,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {(employees || []).map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.empCode})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loan Amount (₹) *</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label>Interest Rate (%)</Label>
              <Input type="number" step="0.1" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tenure (Months)</Label>
              <Input type="number" value={form.tenureMonths} onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>EMI Amount (₹)</Label>
              <Input type="number" value={form.emiAmount} onChange={(e) => setForm({ ...form, emiAmount: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Loan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────
// প্রধান উপাদান
// ──────────────────────────────────────────

export function LeavePage() {
  const [activeTab, setActiveTab] = useState('leave')
  const [leaveStatus, setLeaveStatus] = useState('all')
  const [loanStatus, setLoanStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false)
  const [createLoanOpen, setCreateLoanOpen] = useState(false)
  const queryClient = useQueryClient()

  // ছুটির অনুরোধ কুয়েরি
  const { data: leaveRequests, isLoading: leaveLoading, error: leaveError } = useQuery({
    queryKey: [...queryKeys.leaveRequests, { status: leaveStatus }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (leaveStatus && leaveStatus !== 'all') params.set('status', leaveStatus)
      const qs = params.toString()
      return api.get<{ success: boolean; data: LeaveRequest[] }>(`/api/leave-requests${qs ? `?${qs}` : ''}`).then((r) => r.data)
    },
    enabled: activeTab === 'leave',
  })

  // ঋণ কুয়েরি
  const { data: loans, isLoading: loanLoading, error: loanError } = useQuery({
    queryKey: ['loans', { status: loanStatus }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (loanStatus && loanStatus !== 'all') params.set('status', loanStatus)
      const qs = params.toString()
      return api.get<{ success: boolean; data: Loan[] }>(`/api/loans${qs ? `?${qs}` : ''}`).then((r) => r.data)
    },
    enabled: activeTab === 'loans',
  })

  const filteredLeaves = useMemo(() => {
    if (!leaveRequests || !searchQuery) return leaveRequests || []
    return leaveRequests.filter((lr) =>
      lr.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lr.type?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [leaveRequests, searchQuery])

  const filteredLoans = useMemo(() => {
    if (!loans || !searchQuery) return loans || []
    return loans.filter((l) =>
      l.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [loans, searchQuery])

  // মিউটেশনসমূহ
  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/leave-requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests })
      toast.success('Leave approved!')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/leave-requests/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests })
      toast.success('Leave rejected!')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed'),
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Leave requests and employee loans</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'leave' && (
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setApplyLeaveOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Apply Leave
            </Button>
          )}
          {activeTab === 'loans' && (
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setCreateLoanOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Loan
            </Button>
          )}
        </div>
      </div>

      {/* ট্যাবসমূহ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
        </TabsList>

        {/* ─── ছুটির অনুরোধ ট্যাব ─── */}
        <TabsContent value="leave" className="space-y-4 mt-4">
          {/* ফিল্টারসমূহ */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={leaveStatus} onValueChange={setLeaveStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {leaveLoading ? (
            <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
          ) : leaveError ? (
            <Card className="border-red-200">
              <CardContent className="p-8 text-center">
                <p className="text-red-600 text-sm">Failed to load leave requests. Please try again.</p>
              </CardContent>
            </Card>
          ) : filteredLeaves.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-semibold text-lg text-muted-foreground">No Leave Requests</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || leaveStatus !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Apply a leave request to get started.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-xs">Employee</TableHead>
                      <TableHead className="font-semibold text-xs">Type</TableHead>
                      <TableHead className="font-semibold text-xs hidden sm:table-cell">Start</TableHead>
                      <TableHead className="font-semibold text-xs hidden sm:table-cell">End</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Days</TableHead>
                      <TableHead className="font-semibold text-xs hidden lg:table-cell">Reason</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaves.map((lr) => (
                      <TableRow key={lr.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                        <TableCell className="text-sm font-medium">{lr.employee?.name || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{lr.type}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {format(parseISO(lr.startDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {format(parseISO(lr.endDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-right text-sm">{lr.days}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-32 truncate">
                          {lr.reason || '—'}
                        </TableCell>
                        <TableCell>{leaveStatusBadge(lr.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {lr.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => approveMutation.mutate(lr.id)}
                                  disabled={approveMutation.isPending}
                                  title="Approve"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => rejectMutation.mutate(lr.id)}
                                  disabled={rejectMutation.isPending}
                                  title="Reject"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ─── ঋণ ট্যাব ─── */}
        <TabsContent value="loans" className="space-y-4 mt-4">
          {/* ফিল্টারসমূহ */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={loanStatus} onValueChange={setLoanStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loanLoading ? (
            <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
          ) : loanError ? (
            <Card className="border-red-200">
              <CardContent className="p-8 text-center">
                <p className="text-red-600 text-sm">Failed to load loans. Please try again.</p>
              </CardContent>
            </Card>
          ) : filteredLoans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Banknote className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-semibold text-lg text-muted-foreground">No Loans</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || loanStatus !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Create a loan to get started.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-xs">Employee</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Amount</TableHead>
                      <TableHead className="font-semibold text-xs text-right hidden md:table-cell">Interest %</TableHead>
                      <TableHead className="font-semibold text-xs text-right hidden md:table-cell">Tenure</TableHead>
                      <TableHead className="font-semibold text-xs text-right hidden lg:table-cell">EMI</TableHead>
                      <TableHead className="font-semibold text-xs hidden lg:table-cell">Start Date</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoans.map((loan) => (
                      <TableRow key={loan.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                        <TableCell className="text-sm font-medium">{loan.employee?.name || '—'}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{formatCurrency(loan.amount)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">{loan.interestRate}%</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">{loan.tenureMonths} mo</TableCell>
                        <TableCell className="text-right text-sm hidden lg:table-cell">{loan.emiAmount ? formatCurrency(loan.emiAmount) : '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {format(parseISO(loan.startDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>{loanStatusBadge(loan.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ছুটির আবেদন ডায়ালগ */}
      <ApplyLeaveDialog open={applyLeaveOpen} onClose={() => setApplyLeaveOpen(false)} />

      {/* ঋণ তৈরি ডায়ালগ */}
      <CreateLoanDialog open={createLoanOpen} onClose={() => setCreateLoanOpen(false)} />
    </div>
  )
}