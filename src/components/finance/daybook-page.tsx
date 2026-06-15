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
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
  BookOpen,
  TrendingUp,
  TrendingDown,
  Scale,
  AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// প্রকারভেদ
// ──────────────────────────────────────────

interface DaybookEntry {
  id: string
  date: string
  description: string
  category: string
  type: 'income' | 'expense'
  amount: number
  status: string
  notes: string | null
  createdAt: string
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-secondary text-secondary-foreground' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
}

const categories = [
  'material', 'labour', 'equipment', 'transport', 'subcontractor',
  'consultant', 'government_fees', 'rental', 'maintenance', 'salary',
  'professional_fees', 'miscellaneous', 'other',
]

function getStatusBadge(status: string) {
  const config = statusConfig[status] || statusConfig.draft
  return <Badge variant="outline" className={cn('font-medium text-xs', config.className)}>{config.label}</Badge>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ──────────────────────────────────────────
// স্কেলেটন লোডারসমূহ
// ──────────────────────────────────────────

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></CardContent></Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// এন্ট্রি তৈরি ডায়ালগ
// ──────────────────────────────────────────

function AddEntryDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    category: 'material',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    notes: '',
  })
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/daybook', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daybook })
      toast.success('Entry added to daybook!')
      setOpen(false)
      setForm({ date: format(new Date(), 'yyyy-MM-dd'), description: '', category: 'material', type: 'expense', amount: '', notes: '' })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add entry'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim() || !form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Description and valid amount are required')
      return
    }
    createMutation.mutate({
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      type: form.type,
      amount: parseFloat(form.amount),
      notes: form.notes.trim() || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />Add Entry
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add Daybook Entry</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-date">Date *</Label>
              <Input id="db-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-type">Type *</Label>
              <Select value={form.type} onValueChange={(v: 'income' | 'expense') => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="db-desc">Description *</Label>
            <Input id="db-desc" placeholder="e.g. Cement purchase from ABC Traders" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-cat">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{formatCategory(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-amount">Amount (₹) *</Label>
              <Input id="db-amount" type="number" min="0" step="0.01" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="db-notes">Notes</Label>
            <Textarea id="db-notes" placeholder="Additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Add Entry'}
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

export function DaybookPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const { data: entries, isLoading, error } = useQuery({
    queryKey: [...queryKeys.daybook, { search: searchQuery, category: categoryFilter, date: dateFilter }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)
      if (dateFilter) params.set('date', dateFilter)
      const qs = params.toString()
      return api.get(`/api/daybook${qs ? `?${qs}` : ''}`).then((r) => r.data as DaybookEntry[])
    },
  })

  // এন্ট্রি থেকে সারসংক্ষেপ গণনা
  const summary = useMemo(() => {
    if (!entries) return { totalIncome: 0, totalExpense: 0, net: 0 }
    const totalIncome = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const totalExpense = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    return { totalIncome, totalExpense, net: totalIncome - totalExpense }
  }, [entries])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Day Book</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : entries ? `${entries.length} entr${entries.length !== 1 ? 'ies' : 'y'}` : 'No entries'}
          </p>
        </div>
        <AddEntryDialog />
      </div>

      {/* সারসংক্ষেপ কার্ড */}
      {isLoading ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Income</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(summary.totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Expense</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(summary.totalExpense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Balance</p>
                  <p className={cn('text-lg font-bold', summary.net >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    {formatCurrency(summary.net)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* টুলবার */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full sm:w-[160px]"
          placeholder="Filter by date"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{formatCategory(cat)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* বিষয়বস্তু */}
      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
            <p className="text-red-600 text-sm">Failed to load daybook entries.</p>
          </CardContent>
        </Card>
      ) : entries && entries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Daybook Entries</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || categoryFilter !== 'all' || dateFilter
                ? 'Try adjusting your filters.'
                : 'Add your first income or expense entry.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-360px)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Category</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                    <TableCell className="text-sm font-medium max-w-[200px] truncate">{entry.description}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatCategory(entry.category)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-medium text-xs',
                          entry.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                        )}
                      >
                        {entry.type === 'income' ? 'Income' : 'Expense'}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn('text-right text-sm font-medium', entry.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>
                      {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{getStatusBadge(entry.status)}</TableCell>
                  </TableRow>
                ))}
                {/* মোট সারি */}
                {entries && entries.length > 0 && (
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4} className="text-right text-sm">Net</TableCell>
                    <TableCell className={cn('text-right text-sm', summary.net >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {formatCurrency(summary.net)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell" />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}