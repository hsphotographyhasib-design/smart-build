'use client'

import React from 'react'
import { AlertTriangle, Search, Filter, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyTickets } from '@/components/common/empty-states'

const complaints = [
  { id: 'CMP-001', subject: 'Water leakage in Block A', site: 'Sunrise Residences', priority: 'High', status: 'Open', date: '2025-01-15', assignee: 'Ahmad bin Ali' },
  { id: 'CMP-002', subject: 'Elevator malfunction Floor 12', site: 'Meridian Tower', priority: 'Critical', status: 'In Progress', date: '2025-01-14', assignee: 'Raj Kumar' },
  { id: 'CMP-003', subject: 'Parking lot lighting faulty', site: 'Greenview Condo', priority: 'Medium', status: 'Open', date: '2025-01-13', assignee: 'Unassigned' },
  { id: 'CMP-004', subject: 'Fire alarm false trigger', site: 'Harbour Point', priority: 'High', status: 'Resolved', date: '2025-01-12', assignee: 'Tan Wei Ming' },
  { id: 'CMP-005', subject: 'Gate motor not responding', site: 'East Coast Villas', priority: 'Medium', status: 'Open', date: '2025-01-11', assignee: 'Siti Fatimah' },
]

function getPriorityBadge(priority: string) {
  const map: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700',
    High: 'bg-amber-50 text-amber-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-stone-100 text-stone-600',
  }
  return map[priority] || 'bg-gray-100 text-gray-700'
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    Open: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-amber-50 text-amber-700',
    Resolved: 'bg-emerald-50 text-emerald-700',
    Closed: 'bg-gray-100 text-gray-600',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

export function MaintenanceComplaints() {
  return (
    <div className="space-y-6">
      {/* পৃষ্ঠা হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all maintenance complaints</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Complaint
          </Button>
        </div>
      </div>

      {/* সারসংক্ষেপ কার্ড */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: '12', color: 'text-blue-600' },
          { label: 'In Progress', value: '8', color: 'text-amber-600' },
          { label: 'Resolved Today', value: '5', color: 'text-emerald-600' },
          { label: 'Overdue', value: '3', color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* অভিযোগ টেবিল */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold">All Complaints</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search complaints..." className="pl-9 h-9 w-[200px]" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Site</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Assignee</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-sm">{c.subject}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.site}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className={getPriorityBadge(c.priority)}>{c.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusBadge(c.status)}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{c.assignee}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{c.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
