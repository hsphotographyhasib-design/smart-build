'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface CashflowData {
  openingBalance: number
  closingBalance: number
  totalInflows: number
  totalOutflows: number
  inflows: Array<{
    id: string
    date: string
    description: string
    project: string | null
    amount: number
    method: string
  }>
  outflows: Array<{
    id: string
    date: string
    description: string
    category: string
    amount: number
  }>
  monthlyTrend: Array<{
    month: string
    inflows: number
    outflows: number
  }>
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

function abbreviateCurrency(value: number): string {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  return `₹${value}`
}

// ──────────────────────────────────────────
// Skeleton Loaders
// ──────────────────────────────────────────

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-28 mb-2" /><Skeleton className="h-8 w-32" /></CardContent></Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────
// Custom Chart Tooltip
// ──────────────────────────────────────────

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}</span>
          </div>
          <span className="font-medium">{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

export function CashflowPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()))

  // Generate year options
  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear()
    return [
      { value: String(currentYear - 1), label: String(currentYear - 1) },
      { value: String(currentYear), label: String(currentYear) },
      { value: String(currentYear + 1), label: String(currentYear + 1) },
    ]
  }, [])

  const { data: cashflow, isLoading, error } = useQuery({
    queryKey: queryKeys.cashflow(parseInt(selectedMonth), parseInt(selectedYear)),
    queryFn: () => api.get(`/api/cashflow?month=${selectedMonth}&year=${selectedYear}`).then((r) => r.data as CashflowData),
  })

  const monthLabel = months.find((m) => m.value === selectedMonth)?.label || ''

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cashflow</h1>
          <p className="text-sm text-muted-foreground mt-1">Track inflows and outflows across periods</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="outline" className="text-xs font-mono">
            {monthLabel} {selectedYear}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Opening Balance</p>
                  <p className="text-lg font-bold">{formatCurrency(cashflow?.openingBalance ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Inflows</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(cashflow?.totalInflows ?? 0)}</p>
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
                  <p className="text-xs text-muted-foreground">Total Outflows</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(cashflow?.totalOutflows ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                  <ArrowRightLeft className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Closing Balance</p>
                  <p className={cn('text-lg font-bold', (cashflow?.closingBalance ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    {formatCurrency(cashflow?.closingBalance ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Trend Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
            <p className="text-red-600 text-sm">Failed to load cashflow data.</p>
          </CardContent>
        </Card>
      ) : !cashflow ? null : (
        <>
          {/* Chart */}
          {cashflow.monthlyTrend && cashflow.monthlyTrend.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Monthly Trend — {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashflow.monthlyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={abbreviateCurrency}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={70}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar dataKey="inflows" name="Inflows" fill="#059669" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="outflows" name="Outflows" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inflows & Outflows Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inflows Table */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold">Inflows (Payments Received)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {cashflow.inflows.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No inflows recorded for this period.</div>
                ) : (
                  <ScrollArea className="max-h-80">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashflow.inflows.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</TableCell>
                            <TableCell className="text-sm">
                              <div>
                                <p className="font-medium truncate max-w-[180px]">{item.description}</p>
                                {item.project && <p className="text-xs text-muted-foreground">{item.project}</p>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium text-emerald-600">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Outflows Table */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <CardTitle className="text-sm font-semibold">Outflows (Expenses)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {cashflow.outflows.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No outflows recorded for this period.</div>
                ) : (
                  <ScrollArea className="max-h-80">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashflow.outflows.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</TableCell>
                            <TableCell className="text-sm">
                              <div>
                                <p className="font-medium truncate max-w-[180px]">{item.description}</p>
                                {item.category && <p className="text-xs text-muted-foreground">{formatCategory(item.category)}</p>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium text-red-600">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}