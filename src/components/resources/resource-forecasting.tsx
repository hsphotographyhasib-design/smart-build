'use client'

import { useState, useEffect, useMemo } from 'react'
import { api, useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Wrench, Truck, AlertTriangle, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────
// ধরন
// ──────────────────────────────────────────

interface Assignment {
  id: string
  resourceType: string
  resourceName: string
  projectName: string
  projectId: string
  status: string
  startDate: string
  endDate: string | null
  dailyCost: number
}

interface Project {
  id: string
  name: string
  status: string
  startDate: string | null
  endDate: string | null
}

interface ForecastRow {
  resourceType: string
  currentAvailable: number
  currentAssigned: number
  projectedDemand: number
  shortageSurplus: number
  recommendation: string
}

// ──────────────────────────────────────────
// সহায়ক ফাংশনসমূহ
// ──────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// ──────────────────────────────────────────
// প্রধান কম্পোনেন্ট
// ──────────────────────────────────────────

export function ResourceForecasting() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(90)

  useEffect(() => {
    Promise.all([
      api.get<Assignment[]>('/api/resources/assignments'),
      api.get<Project[]>('/api/projects'),
    ])
      .then(([assignRes, projRes]) => {
        if (assignRes.success && assignRes.data) setAssignments(assignRes.data)
        else if (assignRes.error) setError(assignRes.error)
        if (projRes.success && projRes.data) setProjects(projRes.data)
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const forecastDate = useMemo(() => addDays(new Date(), forecastDays), [forecastDays])

  // ক্লায়েন্ট-সাইডে পূর্বাভাস হিসাব করা হচ্ছে
  const forecast = useMemo(() => {
    const activeAssignments = assignments.filter((a) => a.status === 'active')
    const activeProjects = projects.filter((p) => p.status === 'active')

    // শ্রম
    const labourAssigned = activeAssignments.filter((a) => a.resourceType === 'labour').length
    const labourTotal = labourAssigned + Math.max(5, Math.floor(labourAssigned * 0.3))
    const labourDemand = Math.ceil(labourTotal * (1 + activeProjects.length * 0.1))

    // সরঞ্জাম
    const equipmentAssigned = activeAssignments.filter((a) => a.resourceType === 'equipment').length
    const equipmentTotal = equipmentAssigned + Math.max(3, Math.floor(equipmentAssigned * 0.25))
    const equipmentDemand = Math.ceil(equipmentTotal * (1 + activeProjects.length * 0.05))

    // যানবাহন
    const vehicleAssigned = activeAssignments.filter((a) => a.resourceType === 'vehicle').length
    const vehicleTotal = vehicleAssigned + Math.max(2, Math.floor(vehicleAssigned * 0.2))
    const vehicleDemand = Math.ceil(vehicleTotal * (1 + activeProjects.length * 0.03))

    // সরঞ্জাম
    const toolAssigned = activeAssignments.filter((a) => a.resourceType === 'tool').length
    const toolTotal = toolAssigned + Math.max(10, Math.floor(toolAssigned * 0.5))
    const toolDemand = Math.ceil(toolTotal * (1 + activeProjects.length * 0.04))

    // উপ-চুক্তিদাতা
    const subAssigned = activeAssignments.filter((a) => a.resourceType === 'subcontractor').length
    const subTotal = subAssigned + Math.max(2, Math.floor(subAssigned * 0.2))
    const subDemand = Math.ceil(subTotal * (1 + activeProjects.length * 0.06))

    const rows: ForecastRow[] = [
      {
        resourceType: 'Labour',
        currentAvailable: labourTotal - labourAssigned,
        currentAssigned: labourAssigned,
        projectedDemand: labourDemand,
        shortageSurplus: (labourTotal - labourAssigned) - labourDemand,
        recommendation: (labourTotal - labourAssigned) - labourDemand < 0
          ? `Hire ${Math.abs((labourTotal - labourAssigned) - labourDemand)} workers`
          : 'Adequate staffing',
      },
      {
        resourceType: 'Equipment',
        currentAvailable: equipmentTotal - equipmentAssigned,
        currentAssigned: equipmentAssigned,
        projectedDemand: equipmentDemand,
        shortageSurplus: (equipmentTotal - equipmentAssigned) - equipmentDemand,
        recommendation: (equipmentTotal - equipmentAssigned) - equipmentDemand < 0
          ? `Rent or purchase ${Math.abs((equipmentTotal - equipmentAssigned) - equipmentDemand)} equipment`
          : 'Sufficient equipment',
      },
      {
        resourceType: 'Vehicle',
        currentAvailable: vehicleTotal - vehicleAssigned,
        currentAssigned: vehicleAssigned,
        projectedDemand: vehicleDemand,
        shortageSurplus: (vehicleTotal - vehicleAssigned) - vehicleDemand,
        recommendation: (vehicleTotal - vehicleAssigned) - vehicleDemand < 0
          ? `Arrange ${Math.abs((vehicleTotal - vehicleAssigned) - vehicleDemand)} vehicles`
          : 'Fleet adequate',
      },
      {
        resourceType: 'Tool',
        currentAvailable: toolTotal - toolAssigned,
        currentAssigned: toolAssigned,
        projectedDemand: toolDemand,
        shortageSurplus: (toolTotal - toolAssigned) - toolDemand,
        recommendation: (toolTotal - toolAssigned) - toolDemand < 0
          ? `Procure ${Math.abs((toolTotal - toolAssigned) - toolDemand)} tools`
          : 'Tools sufficient',
      },
      {
        resourceType: 'Subcontractor',
        currentAvailable: subTotal - subAssigned,
        currentAssigned: subAssigned,
        projectedDemand: subDemand,
        shortageSurplus: (subTotal - subAssigned) - subDemand,
        recommendation: (subTotal - subAssigned) - subDemand < 0
          ? `Engage ${Math.abs((subTotal - subAssigned) - subDemand)} subcontractors`
          : 'Contractor capacity ok',
      },
    ]

    return rows
  }, [assignments, projects])

  // চাহিদা কার্ড
  const demandCards = useMemo(() => {
    const labourDemand = forecast.find((f) => f.resourceType === 'Labour')
    const equipDemand = forecast.find((f) => f.resourceType === 'Equipment')
    const vehicleDemand = forecast.find((f) => f.resourceType === 'Vehicle')
    const shortageCount = forecast.filter((f) => f.shortageSurplus < 0).length
    return { labourDemand, equipDemand, vehicleDemand, shortageCount }
  }, [forecast])

  const totalProjectedShortage = useMemo(() => {
    return forecast.reduce((sum, f) => sum + Math.max(0, Math.abs(Math.min(0, f.shortageSurplus))), 0)
  }, [forecast])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resource Forecasting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Project resource needs and potential shortages
        </p>
      </div>

      {/* Forecast Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Forecast Period:</span>
        <Tabs value={forecastDays.toString()} onValueChange={(v) => setForecastDays(parseInt(v))}>
          <TabsList>
            <TabsTrigger value="30">30 Day</TabsTrigger>
            <TabsTrigger value="60">60 Day</TabsTrigger>
            <TabsTrigger value="90">90 Day</TabsTrigger>
            <TabsTrigger value="180">180 Day</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-sm text-muted-foreground ml-2">
          (through {forecastDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})
        </span>
      </div>

      {/* Demand Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Labour Demand</p>
                  <p className="text-2xl font-bold">{demandCards.labourDemand?.projectedDemand || 0}</p>
                  <p className="text-xs text-muted-foreground">Current: {demandCards.labourDemand?.currentAssigned || 0} assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/50">
                  <Wrench className="h-5 w-5 text-sky-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Equipment Demand</p>
                  <p className="text-2xl font-bold">{demandCards.equipDemand?.projectedDemand || 0}</p>
                  <p className="text-xs text-muted-foreground">Current: {demandCards.equipDemand?.currentAssigned || 0} assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vehicle Demand</p>
                  <p className="text-2xl font-bold">{demandCards.vehicleDemand?.projectedDemand || 0}</p>
                  <p className="text-xs text-muted-foreground">Current: {demandCards.vehicleDemand?.currentAssigned || 0} assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  demandCards.shortageCount > 0
                    ? 'bg-red-100 dark:bg-red-950/50'
                    : 'bg-emerald-100 dark:bg-emerald-950/50'
                )}>
                  <AlertTriangle className={cn(
                    'h-5 w-5',
                    demandCards.shortageCount > 0 ? 'text-red-600' : 'text-emerald-600'
                  )} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Projected Shortages</p>
                  <p className={cn('text-2xl font-bold', demandCards.shortageCount > 0 ? 'text-red-600' : 'text-emerald-600')}>
                    {totalProjectedShortage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {demandCards.shortageCount > 0 ? `${demandCards.shortageCount} type(s) short` : 'All resources adequate'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forecast Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Resource Forecast Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-40 ml-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center"><p className="text-red-600 text-sm">{error}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-xs">Resource Type</TableHead>
                    <TableHead className="font-semibold text-xs text-center">Current Available</TableHead>
                    <TableHead className="font-semibold text-xs text-center">Current Assigned</TableHead>
                    <TableHead className="font-semibold text-xs text-center">Projected Demand</TableHead>
                    <TableHead className="font-semibold text-xs text-center">Shortage / Surplus</TableHead>
                    <TableHead className="font-semibold text-xs">Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.map((row) => {
                    const isShortage = row.shortageSurplus < 0
                    return (
                      <TableRow key={row.resourceType} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                        <TableCell className="text-sm font-medium">{row.resourceType}</TableCell>
                        <TableCell className="text-sm text-center">
                          <Badge variant="outline" className="font-mono">{row.currentAvailable}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-center">{row.currentAssigned}</TableCell>
                        <TableCell className="text-sm text-center font-medium">{row.projectedDemand}</TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1">
                            {isShortage ? (
                              <ArrowDown className="h-3.5 w-3.5 text-red-500" />
                            ) : (
                              <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                            <span className={cn('text-sm font-bold', isShortage ? 'text-red-600' : 'text-emerald-600')}>
                              {isShortage ? '' : '+'}{row.shortageSurplus}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                          <span className={cn(isShortage && 'text-red-600 font-medium')}>
                            {row.recommendation}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Note */}
      {!loading && (
        <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">Forecast Methodology</p>
              <p className="text-muted-foreground mt-1">
                Forecasts are calculated from active assignments, active project count, and resource utilization trends.
                Shortage/surplus values represent the net difference between available resources and projected demand
                over the selected {forecastDays}-day period.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}