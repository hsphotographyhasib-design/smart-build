'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollText, Search, Filter, CalendarDays } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface AuditLogEntry {
  id: string
  userId: string | null
  user: { id: string; name: string; email: string } | null
  action: string
  entity: string
  entityId: string | null
  oldValues: string | null
  newValues: string | null
  ipAddress: string | null
  createdAt: string
}

const ENTITY_TYPES = ['User', 'Project', 'Supplier', 'SubContractor', 'WorkOrder', 'Asset', 'Product', 'Customer', 'SalesInvoice', 'PurchaseOrder', 'PurchaseRequest', 'Material', 'Payment', 'Invoice', 'Expense', 'Employee', 'LabourGroup']

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'EXPORT']

const actionColors: Record<string, string> = {
  CREATE: 'bg-emerald-600 text-white border-0',
  UPDATE: 'bg-amber-600 text-white border-0',
  DELETE: 'bg-red-600 text-white border-0',
  EXPORT: 'bg-teal-600 text-white border-0',
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

function truncateJson(str: string | null, maxLen = 50) {
  if (!str) return '—'
  try {
    const obj = JSON.parse(str)
    const text = JSON.stringify(obj)
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen) + '...'
  } catch {
    return str.length > maxLen ? str.slice(0, maxLen) + '...' : str
  }
}

export function AuditLogPage() {
  const [entityFilter, setEntityFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (entityFilter !== 'all') p.set('entity', entityFilter)
    if (actionFilter !== 'all') p.set('action', actionFilter)
    if (startDate) p.set('startDate', startDate)
    if (endDate) p.set('endDate', endDate)
    p.set('page', String(page))
    p.set('limit', '50')
    return p.toString()
  }, [entityFilter, actionFilter, startDate, endDate, page])

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-log', params],
    queryFn: () => api.get(`/api/audit-log?${params}`).then((r) => r.data),
  })

  const items = (data as any)?.data as AuditLogEntry[] || []
  const total = (data as any)?.total || 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? 'Loading...' : `${total} log entries`}
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs"><Filter className="h-3 w-3" />Entity</Label>
              <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All entities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {ENTITY_TYPES.map((e) => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Action</Label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="All actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {ACTIONS.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs"><CalendarDays className="h-3 w-3" />From</Label>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1) }} className="w-[160px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">To</Label>
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1) }} className="w-[160px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="p-0"><TableSkeleton /></CardContent></Card>
      ) : error ? (
        <Card className="border-red-200"><CardContent className="p-8 text-center"><p className="text-red-600 text-sm">Failed to load audit log.</p></CardContent></Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg text-muted-foreground">No Audit Logs Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Adjust your filters to see activity logs.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-xs">Timestamp</TableHead>
                  <TableHead className="font-semibold text-xs">User</TableHead>
                  <TableHead className="font-semibold text-xs">Action</TableHead>
                  <TableHead className="font-semibold text-xs">Entity</TableHead>
                  <TableHead className="font-semibold text-xs hidden md:table-cell">Entity ID</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">Old Values</TableHead>
                  <TableHead className="font-semibold text-xs hidden lg:table-cell">New Values</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((log) => (
                  <TableRow key={log.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(parseISO(log.createdAt), 'dd MMM yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm">{log.user?.name || 'System'}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', actionColors[log.action] || 'bg-secondary text-secondary-foreground')}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.entity}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground max-w-[100px] truncate">{log.entityId || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[150px]">{truncateJson(log.oldValues)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[150px]">{truncateJson(log.newValues)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {total > 50 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">Showing {((page - 1) * 50) + 1}–{Math.min(page * 50, total)} of {total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page * 50 >= total} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}