'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useSearch } from '@/hooks/use-search'
import {
  Plus, Search, ChevronDown, ChevronUp, Ticket, CheckCircle2,
  Clock, ArrowLeft, Star, Link as LinkIcon,
} from 'lucide-react'

// ─── যৌথ ধ্রুবক ───
const PRIORITY_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dotColor: 'bg-red-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', dotColor: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', dotColor: 'bg-yellow-500' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dotColor: 'bg-green-500' },
  preventive: { label: 'Preventive', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', dotColor: 'bg-blue-500' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  new: { label: 'New', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', step: 0 },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', step: 1 },
  assigned: { label: 'Assigned', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', step: 2 },
  accepted: { label: 'Accepted', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300', step: 3 },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', step: 4 },
  pending_parts: { label: 'Pending Parts', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', step: 5 },
  pending_customer: { label: 'Pending Customer', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', step: 6 },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', step: 7 },
  customer_verification: { label: 'Customer Verification', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300', step: 8 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', step: 9 },
}

const STATUS_WORKFLOW = [
  'new', 'under_review', 'assigned', 'accepted', 'in_progress',
  'pending_parts', 'pending_customer', 'completed', 'customer_verification', 'closed',
]

const CATEGORY_LABELS: Record<string, string> = {
  air_conditioning: 'Air Conditioning',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  fire_protection: 'Fire Protection',
  mechanical: 'Mechanical',
  civil: 'Civil',
  cleaning: 'Cleaning',
  security: 'Security',
  it: 'IT',
  general_maintenance: 'General Maintenance',
  other: 'Other',
}

const TYPE_LABELS: Record<string, string> = {
  complaint: 'Complaint',
  work_request: 'Work Request',
  emergency: 'Emergency',
  inspection: 'Inspection',
  quotation: 'Quotation',
  preventive_maintenance: 'Preventive Maintenance',
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  complaint: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  work_request: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  inspection: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  quotation: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  preventive_maintenance: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
}

// ─── SLA কাউন্টডাউন উপাদান ───
function SLACountdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function calc() {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('BREACHED')
        return
      }
      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setRemaining(`${days}d ${hours % 24}h`)
      } else {
        setRemaining(`${hours}h ${mins}m`)
      }
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [deadline])

  const isBreached = remaining === 'BREACHED'

  return (
    <span className={cn(
      'text-xs font-mono font-medium',
      isBreached ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
    )}>
      {isBreached && '⚠ '}{remaining}
    </span>
  )
}

// ─── স্ট্যাটাস ওয়ার্কফ্লো স্টেপার (সংক্ষিপ্ত) ───
function CompactWorkflowStepper({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? -1

  return (
    <div className="flex items-center gap-0.5">
      {STATUS_WORKFLOW.map((step, idx) => {
        const isActive = currentStep >= idx
        const isCurrent = currentStep === idx
        return (
          <React.Fragment key={step}>
            <div
              className={cn(
                'h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-colors shrink-0',
                isActive
                  ? isCurrent
                    ? 'bg-rose-500 text-white ring-2 ring-rose-200 dark:ring-rose-800'
                    : 'bg-rose-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
              title={STATUS_CONFIG[step]?.label}
            >
              {isActive ? <CheckCircle2 className="h-2.5 w-2.5" /> : idx + 1}
            </div>
            {idx < STATUS_WORKFLOW.length - 1 && (
              <div className={cn('flex-1 h-0.5 min-w-[4px]', isActive ? 'bg-rose-500' : 'bg-muted')} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── প্রধান উপাদান ───
export function ServiceRequests() {
  const { navigate } = useAppStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // ফিল্টারসমূহ
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')
  const { query, debouncedQuery, setQuery } = useSearch()
  const [activeTab, setActiveTab] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // টিকেট আনা
  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-tickets', statusFilter, priorityFilter, categoryFilter, typeFilter, customerFilter, siteFilter, debouncedQuery],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (customerFilter !== 'all') params.set('customerId', customerFilter)
      if (siteFilter !== 'all') params.set('siteId', siteFilter)
      if (debouncedQuery) params.set('search', debouncedQuery)
      const qs = params.toString()
      return api.get(`/api/maintenance/tickets${qs ? `?${qs}` : ''}`)
    },
  })

  const tickets = (data?.data || []) as any[]

  // রেফারেন্স তথ্য আনা
  const { data: sitesData } = useQuery({
    queryKey: ['maintenance-sites'],
    queryFn: () => api.get('/api/maintenance/sites'),
  })
  const sites = (sitesData?.data || []) as any[]

  const { data: assetsData } = useQuery({
    queryKey: ['maintenance-assets'],
    queryFn: () => api.get('/api/assets'),
  })
  const assets = (assetsData?.data || []) as any[]

  // তৈরি মিউটেশন
  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/api/maintenance/tickets', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] })
      toast({ title: 'Ticket Created', description: 'Your service request has been submitted successfully.' })
      setActiveTab('all')
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.error || 'Failed to create ticket', variant: 'destructive' })
    },
  })

  // ক্লায়েন্ট-সাইড অনুসন্ধান ফিল্টার
  const filtered = tickets.filter((t: any) => {
    if (query) {
      const q = query.toLowerCase()
      return (
        t.subject?.toLowerCase().includes(q) ||
        t.ticketNo?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // আমার অনুরোধ ফিল্টার (স্থানধারক - স্টোর থেকে বর্তমান ব্যবহারকারী আইডি ব্যবহার করে)
  const { user } = useAppStore()
  const myTickets = tickets.filter((t: any) => t.createdById === user?.id)

  const displayTickets = activeTab === 'my' ? myTickets : filtered

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('maintenance-dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Service Requests</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Create and manage maintenance service requests</p>
          </div>
        </div>
      </div>

      {/* ট্যাবসমূহ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="my">My Requests</TabsTrigger>
          <TabsTrigger value="create" className="gap-1">
            <Plus className="h-3 w-3" /> Create New
          </TabsTrigger>
        </TabsList>

        {/* সকল অনুরোধ / আমার অনুরোধ */}
        <TabsContent value="all" className="space-y-4 mt-4">
          <TicketFilters
            sites={sites}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            customerFilter={customerFilter}
            setCustomerFilter={setCustomerFilter}
            siteFilter={siteFilter}
            setSiteFilter={setSiteFilter}
            searchQuery={query}
            setSearchQuery={setQuery}
          />
          <TicketTable
            tickets={filtered}
            isLoading={isLoading}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onNavigate={navigate as (page: string, params?: Record<string, string>) => void}
          />
        </TabsContent>

        <TabsContent value="my" className="space-y-4 mt-4">
          <TicketTable
            tickets={myTickets}
            isLoading={isLoading}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onNavigate={navigate as (page: string, params?: Record<string, string>) => void}
            emptyMessage="No requests created by you"
          />
        </TabsContent>

        {/* নতুন তৈরি */}
        <TabsContent value="create" className="mt-4">
          <CreateTicketForm
            sites={sites}
            assets={assets}
            onSubmit={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── ফিল্টার বার উপাদান ───
function TicketFilters({
  sites,
  statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter,
  categoryFilter, setCategoryFilter,
  typeFilter, setTypeFilter,
  customerFilter, setCustomerFilter,
  siteFilter, setSiteFilter,
  searchQuery, setSearchQuery,
}: {
  sites: any[]
  statusFilter: string; setStatusFilter: (v: string) => void
  priorityFilter: string; setPriorityFilter: (v: string) => void
  categoryFilter: string; setCategoryFilter: (v: string) => void
  typeFilter: string; setTypeFilter: (v: string) => void
  customerFilter: string; setCustomerFilter: (v: string) => void
  siteFilter: string; setSiteFilter: (v: string) => void
  searchQuery: string; setSearchQuery: (v: string) => void
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* অনুসন্ধান সারি */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket #, subject, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* ফিল্টার সারি */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-1.5">
                      <span className={cn('h-2 w-2 rounded-full', val.dotColor)} />
                      {val.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── টিকেট টেবিল উপাদান ───
function TicketTable({
  tickets,
  isLoading,
  expandedId,
  setExpandedId,
  onNavigate,
  emptyMessage,
}: {
  tickets: any[]
  isLoading: boolean
  expandedId: string | null
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>
  onNavigate: (page: string, params?: Record<string, string>) => void
  emptyMessage?: string
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Ticket className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">{emptyMessage || 'No tickets found'}</p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="text-xs">Ticket #</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-xs">Subject</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Category</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Priority</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket: any) => {
                  const pri = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium
                  const stat = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.new
                  const isExpanded = expandedId === ticket.id
                  return (
                    <React.Fragment key={ticket.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => setExpandedId(prev => prev === ticket.id ? null : ticket.id)}
                      >
                        <TableCell className="py-3">
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-rose-600 font-medium">{ticket.ticketNo}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className={cn('text-[10px]', TYPE_BADGE_COLORS[ticket.type] || '')}>
                            {TYPE_LABELS[ticket.type] || ticket.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{ticket.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {CATEGORY_LABELS[ticket.category] || ticket.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className={cn('gap-1 text-xs', pri.color)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', pri.dotColor)} />
                            {pri.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-xs', stat.color)}>
                            {stat.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {ticket.slaDeadline ? <SLACountdown deadline={ticket.slaDeadline} /> : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/20 px-6 py-4">
                            <div className="space-y-4">
                              {/* ওয়ার্কফ্লো স্টেপার */}
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Status Progress</h4>
                                <CompactWorkflowStepper status={ticket.status} />
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {STATUS_WORKFLOW.map((step, idx) => (
                                    <span
                                      key={step}
                                      className={cn(
                                        'text-[9px] px-1.5 py-0.5 rounded',
                                        (STATUS_CONFIG[ticket.status]?.step ?? -1) === idx
                                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 font-semibold'
                                          : 'text-muted-foreground'
                                      )}
                                    >
                                      {STATUS_CONFIG[step]?.label}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              {/* বিবরণ গ্রিড */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground text-xs">Description:</span>
                                  <p className="mt-1">{ticket.description || 'No description'}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-xs">Site:</span>
                                  <p className="mt-1 font-medium">{ticket.site?.name || '—'}</p>
                                  <span className="text-muted-foreground text-xs mt-2 block">Location:</span>
                                  <p className="font-medium">{[ticket.building, ticket.floor, ticket.room].filter(Boolean).join(' / ') || ticket.location || '—'}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-xs">Contact Person:</span>
                                  <p className="mt-1 font-medium">{ticket.contactPerson || '—'}</p>
                                  <span className="text-muted-foreground text-xs mt-2 block">Contact Phone:</span>
                                  <p className="font-medium">{ticket.contactPhone || '—'}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-xs">Equipment:</span>
                                  <p className="mt-1 font-medium">{ticket.asset?.name || '—'}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-xs">Preferred Visit:</span>
                                  <p className="mt-1 font-medium">
                                    {ticket.preferredVisitDate
                                      ? `${ticket.preferredVisitDate}${ticket.preferredVisitTime ? ` at ${ticket.preferredVisitTime}` : ''}`
                                      : '—'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-xs">Technician:</span>
                                  <p className="mt-1 font-medium">{ticket.technician?.employee?.name || '—'}</p>
                                </div>
                              </div>

                              {/* সংযুক্তি */}
                              {(ticket.photoUrls?.length > 0 || ticket.videoUrls?.length > 0 || ticket.documentUrls?.length > 0) && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Attachments</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {ticket.photoUrls?.map((url: string, i: number) => (
                                      <Badge key={`p${i}`} variant="outline" className="gap-1 text-xs">
                                        <LinkIcon className="h-3 w-3" /> Photo {i + 1}
                                      </Badge>
                                    ))}
                                    {ticket.videoUrls?.map((url: string, i: number) => (
                                      <Badge key={`v${i}`} variant="outline" className="gap-1 text-xs">
                                        <LinkIcon className="h-3 w-3" /> Video {i + 1}
                                      </Badge>
                                    ))}
                                    {ticket.documentUrls?.map((url: string, i: number) => (
                                      <Badge key={`d${i}`} variant="outline" className="gap-1 text-xs">
                                        <LinkIcon className="h-3 w-3" /> Document {i + 1}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  className="bg-rose-600 hover:bg-rose-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onNavigate('maintenance-ticket-detail', { id: ticket.id })
                                  }}
                                >
                                  View Full Details
                                </Button>
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
  )
}

// ─── টিকেট তৈরির ফর্ম উপাদান ───
function CreateTicketForm({
  sites,
  assets,
  onSubmit,
  loading,
}: {
  sites: any[]
  assets: any[]
  onSubmit: (data: any) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    type: '',
    category: '',
    priority: 'medium',
    subject: '',
    description: '',
    customerId: '',
    siteId: '',
    building: '',
    floor: '',
    room: '',
    assetId: '',
    location: '',
    preferredVisitDate: '',
    preferredVisitTime: '',
    contactPerson: '',
    contactPhone: '',
    photoUrls: '',
    videoUrls: '',
    documentUrls: '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.type || !form.category || !form.subject) return

    const payload: any = {
      type: form.type,
      category: form.category,
      priority: form.priority,
      subject: form.subject,
      description: form.description,
      siteId: form.siteId || undefined,
      building: form.building || undefined,
      floor: form.floor || undefined,
      room: form.room || undefined,
      assetId: form.assetId || undefined,
      location: form.location || undefined,
      preferredVisitDate: form.preferredVisitDate || undefined,
      preferredVisitTime: form.preferredVisitTime || undefined,
      contactPerson: form.contactPerson || undefined,
      contactPhone: form.contactPhone || undefined,
    }

    // URL ফিল্ডকে অ্যারেতে পার্স করা
    if (form.photoUrls.trim()) {
      payload.photoUrls = form.photoUrls.split('\n').map(u => u.trim()).filter(Boolean)
    }
    if (form.videoUrls.trim()) {
      payload.videoUrls = form.videoUrls.split('\n').map(u => u.trim()).filter(Boolean)
    }
    if (form.documentUrls.trim()) {
      payload.documentUrls = form.documentUrls.split('\n').map(u => u.trim()).filter(Boolean)
    }

    onSubmit(payload)
    // ফর্ম রিসেট
    setForm({
      type: '', category: '', priority: 'medium', subject: '', description: '',
      customerId: '', siteId: '', building: '', floor: '', room: '',
      assetId: '', location: '', preferredVisitDate: '', preferredVisitTime: '',
      contactPerson: '', contactPhone: '', photoUrls: '', videoUrls: '', documentUrls: '',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Service Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* সারি ১: প্রকার, বিভাগ, অগ্রাধিকার */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Request Type *</Label>
              <Select value={form.type} onValueChange={v => update('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => update('priority', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-1.5">
                        <span className={cn('h-2 w-2 rounded-full', val.dotColor)} />
                        {val.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* সারি ২: বিষয় */}
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input
              placeholder="Brief description of the request"
              value={form.subject}
              onChange={e => update('subject', e.target.value)}
            />
          </div>

          {/* সারি ৩: বিবরণ */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Provide detailed information about the service request..."
              rows={4}
              value={form.description}
              onChange={e => update('description', e.target.value)}
            />
          </div>

          <Separator />

          {/* সারি ৪: সাইট, গ্রাহক */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={form.customerId} onValueChange={v => update('customerId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Site</Label>
              <Select value={form.siteId} onValueChange={v => update('siteId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* সারি ৫: ভবন, তলা, কক্ষ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Building</Label>
              <Input
                placeholder="Building name/number"
                value={form.building}
                onChange={e => update('building', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Floor</Label>
              <Input
                placeholder="Floor number"
                value={form.floor}
                onChange={e => update('floor', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Input
                placeholder="Room name/number"
                value={form.room}
                onChange={e => update('room', e.target.value)}
              />
            </div>
          </div>

          {/* সারি ৬: সরঞ্জাম, অবস্থান */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Equipment</Label>
              <Select value={form.assetId} onValueChange={v => update('assetId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.code || a.assetCode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location Details</Label>
              <Input
                placeholder="Additional location info"
                value={form.location}
                onChange={e => update('location', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* সারি ৭: পছন্দের পরিদর্শন */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Visit Date</Label>
              <Input
                type="date"
                value={form.preferredVisitDate}
                onChange={e => update('preferredVisitDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Visit Time</Label>
              <Input
                type="time"
                value={form.preferredVisitTime}
                onChange={e => update('preferredVisitTime', e.target.value)}
              />
            </div>
          </div>

          {/* সারি ৮: যোগাযোগ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                placeholder="Name of contact person"
                value={form.contactPerson}
                onChange={e => update('contactPerson', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                placeholder="Phone number"
                value={form.contactPhone}
                onChange={e => update('contactPhone', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* সারি ৯: সংযুক্তি (URL ক্ষেত্র) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Attachments (URLs)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Photo URLs</Label>
                <Textarea
                  placeholder="One URL per line"
                  rows={2}
                  value={form.photoUrls}
                  onChange={e => update('photoUrls', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Video URLs</Label>
                <Textarea
                  placeholder="One URL per line"
                  rows={2}
                  value={form.videoUrls}
                  onChange={e => update('videoUrls', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Document URLs</Label>
                <Textarea
                  placeholder="One URL per line"
                  rows={2}
                  value={form.documentUrls}
                  onChange={e => update('documentUrls', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">Cancel</Button>
            <Button
              type="submit"
              disabled={loading || !form.type || !form.category || !form.subject}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}