'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { BarChart3, Download, CalendarDays, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const REPORT_TYPES = [
  { value: 'project-pl', label: 'Project P&L' },
  { value: 'income-expense', label: 'Income & Expense' },
  { value: 'labour', label: 'Labour Report' },
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'material', label: 'Material Report' },
  { value: 'supplier', label: 'Supplier Report' },
  { value: 'asset', label: 'Asset Report' },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatNumber(n: number, decimals = 0) {
  return n.toFixed(decimals)
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function ReportsPage() {
  const [reportType, setReportType] = useState('')
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (reportType) p.set('type', reportType)
    if (startDate) p.set('start', startDate)
    if (endDate) p.set('end', endDate)
    return p.toString()
  }, [reportType, startDate, endDate])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', reportType, startDate, endDate],
    queryFn: () => api.get(`/api/reports?${params}`).then((r) => r.data),
    enabled: !!reportType,
  })

  const handleExport = () => {
    toast.info('Export feature coming soon!')
  }

  const renderReportTable = () => {
    if (!data) return null

    // বিভিন্ন রিপোর্ট ধরন পরিচালনা করা হচ্ছে
    if (reportType === 'income-expense') {
      const d = data as any
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Income</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-emerald-600">{formatCurrency(d.income?.total || 0)}</p><p className="text-xs text-muted-foreground mt-1">{d.income?.transactions || 0} transactions</p></CardContent>
            </Card>
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Expense</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-red-600">{formatCurrency(d.expense?.total || 0)}</p><p className="text-xs text-muted-foreground mt-1">{d.expense?.transactions || 0} transactions</p></CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Cashflow</CardTitle></CardHeader>
              <CardContent><p className={cn('text-2xl font-bold', (d.net || 0) >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatCurrency(d.net || 0)}</p></CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (reportType === 'asset') {
      const d = data as any
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Asset Summary by Type</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Count</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Total Value</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Available</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Issued</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Maintenance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(d.summary || []).map((row: any) => (
                    <TableRow key={row.type}>
                      <TableCell className="text-sm capitalize font-medium">{row.type}</TableCell>
                      <TableCell className="text-sm text-right">{row.count}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{formatCurrency(row.totalValue)}</TableCell>
                      <TableCell className="text-sm text-right">{row.available}</TableCell>
                      <TableCell className="text-sm text-right">{row.issued}</TableCell>
                      <TableCell className="text-sm text-right">{row.maintenance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (reportType === 'labour') {
      const d = data as any
      return (
        <div className="space-y-4">
          {(d || []).map((group: any) => (
            <Card key={group.group}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{group.group}</span>
                  <Badge variant="outline">{group.labourCount} labours</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">Name</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Rate</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Attendance</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Total Pay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.labours.map((l: any) => (
                      <TableRow key={l.name}>
                        <TableCell className="text-sm">{l.name}</TableCell>
                        <TableCell className="text-sm text-right">{formatCurrency(l.dailyRate)}/day</TableCell>
                        <TableCell className="text-sm text-right">{l.attendanceDays}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{formatCurrency(l.totalPay)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // project-pl, উপস্থিতি, উপকরণ, সরবরাহকারীর জন্য সাধারণ সারণি
    const rows = Array.isArray(data) ? data : (data as any).assets || []
    if (rows.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No data available for this report.</p>
        </div>
      )
    }

    const columns = Object.keys(rows[0]).filter((k) => k !== 'id')
    return (
      <Card className="overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((col) => (
                  <TableHead key={col} className="text-xs font-semibold capitalize text-right last:text-right first:text-left">
                    {col.replace(/([A-Z])/g, ' $1').trim()}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: any, i: number) => (
                <TableRow key={i} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                  {columns.map((col) => {
                    const val = row[col]
                    const isNumber = typeof val === 'number'
                    return (
                      <TableCell key={col} className={cn('text-sm', isNumber ? 'text-right font-medium' : '')}>
                        {isNumber && (col.toLowerCase().includes('price') || col.toLowerCase().includes('amount') || col.toLowerCase().includes('value') || col.toLowerCase().includes('cost') || col.toLowerCase().includes('pay') || col.toLowerCase().includes('income') || col.toLowerCase().includes('expense') || col.toLowerCase().includes('profit') || col.toLowerCase().includes('ordered') || col.toLowerCase().includes('balance') || col.toLowerCase().includes('stock'))
                          ? formatCurrency(val)
                          : isNumber && (col.toLowerCase().includes('margin') || col.toLowerCase().includes('percent') || col.toLowerCase().includes('retention'))
                          ? `${formatNumber(val, 1)}%`
                          : col.toLowerCase().includes('date') && typeof val === 'string'
                          ? val.split('T')[0]
                          : String(val ?? '—')}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and view business reports</p>
        </div>
        {data && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-600" />
                Report Type
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue placeholder="Select report type" /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" />Start</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[160px]" />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[160px]" />
            </div>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => refetch()}
              disabled={!reportType || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {!reportType ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">Select a Report Type</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose a report type and click Generate to view data.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to generate report.</p></CardContent></Card>
      ) : (
        renderReportTable()
      )}
    </div>
  )
}