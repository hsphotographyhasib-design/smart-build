'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore, api } from '@/lib/store'
import { useFormat } from '@/hooks/use-format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft, Download, Trophy, TrendingDown, TrendingUp, Star, Target, Award, Eye, DollarSign,
} from 'lucide-react'

// ─── Props ───
interface TenderComparisonPageProps {
  packageId: string
}

// ─── Types ───
interface VendorBid {
  vendorId: string
  vendorName: string
  bidAmount: number
  technicalScore: number
  commercialScore: number
  combinedScore: number
  leadTime: number
  warranty: string
  experienceRating: number
  complianceScore: number
  ranking: number
}

interface ComparisonItem {
  id: string
  description: string
  unit: string
  quantity: number
  unitPrices: Record<string, number> // vendorId -> unitPrice
  totals: Record<string, number> // vendorId -> total
}

interface ComparisonData {
  packageId: string
  packageNo: string
  packageName: string
  estimatedBudget: number
  vendors: VendorBid[]
  items: ComparisonItem[]
  lowestBidVendorId: string
  highestScoreVendorId: string
  bestValueVendorId: string
}

// ─── Component ───
export function TenderComparisonPage({ packageId }: TenderComparisonPageProps) {
  const { navigate } = useAppStore()
  const { formatCurrency } = useFormat()

  const { data, isLoading } = useQuery({
    queryKey: ['tender-comparison', packageId],
    queryFn: () => api.get<ComparisonData>(`/api/tender/packages/${packageId}/comparison`),
    enabled: !!packageId,
  })

  const comparison = data?.data

  const handleExport = () => {
    if (!comparison) return
    toast.info('Exporting comparison data...')
    // CSV export logic
    const vendors = comparison.vendors || []
    const items = comparison.items || []

    const headers = ['Criteria', ...vendors.map(v => v.vendorName)]
    const rows: string[][] = []

    // Header row
    rows.push(headers)

    // Bid amounts per item
    items.forEach(item => {
      const row: string[] = [item.description]
      vendors.forEach(v => {
        const total = item.totals?.[v.vendorId]
        row.push(total !== undefined ? String(total) : '—')
      })
      rows.push(row)
    })

    // Summary rows
    const summaryRows = [
      { label: 'Bid Amount', key: 'bidAmount', format: true },
      { label: 'Technical Score', key: 'technicalScore', format: false },
      { label: 'Commercial Score', key: 'commercialScore', format: false },
      { label: 'Combined Score', key: 'combinedScore', format: false },
      { label: 'Lead Time (days)', key: 'leadTime', format: false },
      { label: 'Warranty', key: 'warranty', format: false },
      { label: 'Experience Rating', key: 'experienceRating', format: false },
      { label: 'Compliance Score', key: 'complianceScore', format: false },
      { label: 'Ranking', key: 'ranking', format: false },
    ]

    rows.push([])
    summaryRows.forEach(sr => {
      const row: string[] = [sr.label]
      vendors.forEach(v => {
        const val = (v as any)[sr.key]
        row.push(val !== undefined ? String(val) : '—')
      })
      rows.push(row)
    })

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tender-comparison-${comparison.packageNo || packageId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Comparison exported successfully')
  }

  // Computed highlights
  const vendors = comparison?.vendors || []
  const items = comparison?.items || []

  const lowestBidId = useMemo(() => {
    if (vendors.length === 0) return null
    return vendors.reduce((min, v) => v.bidAmount < (vendors.find(x => x.vendorId === min)?.bidAmount ?? Infinity) ? v.vendorId : min, vendors[0].vendorId)
  }, [vendors])

  const highestScoreId = useMemo(() => {
    if (vendors.length === 0) return null
    return vendors.reduce((max, v) => v.combinedScore > (vendors.find(x => x.vendorId === max)?.combinedScore ?? -1) ? v.vendorId : max, vendors[0].vendorId)
  }, [vendors])

  const bestValueId = useMemo(() => {
    if (vendors.length === 0) return null
    return vendors.reduce((best, v) => {
      const bestV = vendors.find(x => x.vendorId === best)
      const bestRatio = bestV && bestV.bidAmount > 0 ? bestV.combinedScore / bestV.bidAmount : 0
      const currRatio = v.bidAmount > 0 ? v.combinedScore / v.bidAmount : 0
      return currRatio > bestRatio ? v.vendorId : best
    }, vendors[0].vendorId)
  }, [vendors])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" className="mt-0.5" onClick={() => navigate('tender-detail', { packageId })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono text-muted-foreground">{comparison?.packageNo || ''}</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">Comparison</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">{comparison?.packageName || 'Bid Comparison'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Est. Budget: {formatCurrency(comparison?.estimatedBudget ?? 0)} · {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} compared
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport} disabled={vendors.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {vendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 space-y-4">
            <Target className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No bids submitted yet. Comparison will be available once vendors submit their bids.</p>
            <Button variant="outline" onClick={() => navigate('tender-detail', { packageId })}>
              Back to Tender
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ─── Summary Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Lowest Bid */}
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">Lowest Bid</span>
                </div>
                <p className="text-lg font-bold">{vendors.find(v => v.vendorId === lowestBidId)?.vendorName || '—'}</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {formatCurrency(vendors.find(v => v.vendorId === lowestBidId)?.bidAmount ?? 0)}
                </p>
              </CardContent>
            </Card>

            {/* Highest Score */}
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">Highest Score</span>
                </div>
                <p className="text-lg font-bold">{vendors.find(v => v.vendorId === highestScoreId)?.vendorName || '—'}</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {vendors.find(v => v.vendorId === highestScoreId)?.combinedScore ?? 0} pts
                </p>
              </CardContent>
            </Card>

            {/* Best Value */}
            <Card className="border-violet-200 bg-violet-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-violet-600" />
                  <span className="text-xs font-medium text-violet-700">Best Value</span>
                </div>
                <p className="text-lg font-bold">{vendors.find(v => v.vendorId === bestValueId)?.vendorName || '—'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Score/Price ratio is highest — best balance of quality and cost
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ─── Item-by-Item Comparison ─── */}
          {items.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Item-by-Item Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-96">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sticky left-0 bg-background min-w-[200px]">Item Description</TableHead>
                          <TableHead className="text-xs text-center">Qty</TableHead>
                          <TableHead className="text-xs">Unit</TableHead>
                          {vendors.map(v => (
                            <TableHead key={v.vendorId} className="text-xs text-right min-w-[130px]">
                              {v.vendorName}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          // Find lowest total for this item
                          const itemPrices = vendors.map(v => item.totals?.[v.vendorId] ?? Infinity).filter(p => p !== Infinity)
                          const itemLowest = itemPrices.length > 0 ? Math.min(...itemPrices) : Infinity

                          return (
                            <TableRow key={item.id}>
                              <TableCell className="text-xs sticky left-0 bg-background font-medium">{item.description}</TableCell>
                              <TableCell className="text-xs text-center">{item.quantity}</TableCell>
                              <TableCell className="text-xs">{item.unit}</TableCell>
                              {vendors.map(v => {
                                const total = item.totals?.[v.vendorId]
                                const isLowest = total !== undefined && total === itemLowest && itemLowest !== Infinity
                                return (
                                  <TableCell key={v.vendorId} className={cn('text-xs text-right font-medium', isLowest && 'text-emerald-600 bg-emerald-50/50')}>
                                    {total !== undefined ? formatCurrency(total) : '—'}
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          )
                        })}
                        {/* Item Totals Row */}
                        <TableRow className="bg-muted/30 font-bold">
                          <TableCell className="text-xs sticky left-0 bg-muted/30">Item Total</TableCell>
                          <TableCell />
                          <TableCell />
                          {vendors.map(v => {
                            const vendorTotal = items.reduce((s, item) => s + (item.totals?.[v.vendorId] ?? 0), 0)
                            const isLowest = v.vendorId === lowestBidId
                            return (
                              <TableCell key={v.vendorId} className={cn('text-xs text-right', isLowest && 'text-emerald-600')}>
                                {formatCurrency(vendorTotal)}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* ─── Overall Comparison Matrix ─── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Overall Comparison Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sticky left-0 bg-background min-w-[160px]">Criteria</TableHead>
                        {vendors.map(v => (
                          <TableHead key={v.vendorId} className="text-xs text-right min-w-[140px]">
                            {v.vendorName}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Bid Amount */}
                      <TableRow>
                        <TableCell className="text-xs sticky left-0 bg-background font-medium flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Bid Amount
                        </TableCell>
                        {vendors.map(v => {
                          const isLowest = v.vendorId === lowestBidId
                          return (
                            <TableCell key={v.vendorId} className={cn('text-xs text-right font-semibold', isLowest && 'text-emerald-600 bg-emerald-50/50')}>
                              <div className="flex items-center justify-end gap-1">
                                {formatCurrency(v.bidAmount)}
                                {isLowest && <Badge className="bg-emerald-100 text-emerald-700 text-[9px] px-1 py-0 h-4">LOWEST</Badge>}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      {/* Technical Score */}
                      <TableRow>
                        <TableCell className="text-xs sticky left-0 bg-background font-medium flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-muted-foreground" /> Technical Score
                        </TableCell>
                        {vendors.map(v => {
                          const isHighest = v.technicalScore === Math.max(...vendors.map(x => x.technicalScore))
                          return (
                            <TableCell key={v.vendorId} className={cn('text-xs text-right font-semibold', isHighest && 'text-emerald-600 bg-emerald-50/50')}>
                              <div className="flex items-center justify-end gap-1">
                                {v.technicalScore}/100
                                {isHighest && <Badge className="bg-emerald-100 text-emerald-700 text-[9px] px-1 py-0 h-4">HIGHEST</Badge>}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      {/* Commercial Score */}
                      <TableRow>
                        <TableCell className="text-xs sticky left-0 bg-background font-medium flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Commercial Score
                        </TableCell>
                        {vendors.map(v => {
                          const isHighest = v.commercialScore === Math.max(...vendors.map(x => x.commercialScore))
                          return (
                            <TableCell key={v.vendorId} className={cn('text-xs text-right font-semibold', isHighest && 'text-emerald-600 bg-emerald-50/50')}>
                              <div className="flex items-center justify-end gap-1">
                                {v.commercialScore}/100
                                {isHighest && <Badge className="bg-emerald-100 text-emerald-700 text-[9px] px-1 py-0 h-4">HIGHEST</Badge>}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      {/* Combined Score */}
                      <TableRow className="bg-amber-50/30">
                        <TableCell className="text-xs sticky left-0 bg-amber-50/30 font-bold flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-amber-600" /> Combined Score
                        </TableCell>
                        {vendors.map(v => {
                          const isHighest = v.vendorId === highestScoreId
                          return (
                            <TableCell key={v.vendorId} className={cn('text-xs text-right font-bold', isHighest && 'text-amber-700')}>
                              <div className="flex items-center justify-end gap-1">
                                {v.combinedScore}/100
                                {isHighest && <Badge className="bg-amber-100 text-amber-700 text-[9px] px-1 py-0 h-4">BEST</Badge>}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      <Separator className="col-span-full" />

                      {/* Lead Time */}
                      <TableRow>
                        <TableCell className="text-xs sticky left-0 bg-background font-medium">Lead Time</TableCell>
                        {vendors.map(v => {
                          const isLowest = v.leadTime === Math.min(...vendors.map(x => x.leadTime))
                          return (
                            <TableCell key={v.vendorId} className={cn('text-xs text-right', isLowest ? 'text-emerald-600 font-semibold' : '')}>
                              {v.leadTime} days
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      {/* Warranty */}
                      <TableRow>
                        <TableCell className="text-xs sticky left-0 bg-background font-medium">Warranty</TableCell>
                        {vendors.map(v => (
                          <TableCell key={v.vendorId} className="text-xs text-right">{v.warranty || '—'}</TableCell>
                        ))}
                      </TableRow>

                      {/* Experience Rating */}
                      <TableRow>
                        <TableCell className="text-xs sticky left-0 bg-background font-medium flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-500" /> Experience Rating
                        </TableCell>
                        {vendors.map(v => {
                          const isHighest = v.experienceRating === Math.max(...vendors.map(x => x.experienceRating))
                          return (
                            <TableCell key={v.vendorId} className={cn('text-xs text-right', isHighest && 'text-emerald-600 font-semibold')}>
                              <div className="flex items-center justify-end gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn('h-3 w-3', i < Math.round(v.experienceRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
                                  />
                                ))}
                                <span className="ml-1">({v.experienceRating.toFixed(1)})</span>
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      {/* Compliance Score */}
                      <TableRow>
                        <TableCell className="text-xs sticky left-0 bg-background font-medium">Compliance Score</TableCell>
                        {vendors.map(v => {
                          const isHighest = v.complianceScore === Math.max(...vendors.map(x => x.complianceScore))
                          return (
                            <TableCell key={v.vendorId} className={cn('text-xs text-right', isHighest && 'text-emerald-600 font-semibold')}>
                              <div className="flex items-center justify-end gap-1">
                                {v.complianceScore}/100
                                {isHighest && <Badge className="bg-emerald-100 text-emerald-700 text-[9px] px-1 py-0 h-4">BEST</Badge>}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      <Separator className="col-span-full" />

                      {/* Ranking */}
                      <TableRow className="bg-violet-50/30">
                        <TableCell className="text-xs sticky left-0 bg-violet-50/30 font-bold flex items-center gap-1.5">
                          <Trophy className="h-3.5 w-3.5 text-violet-600" /> Ranking
                        </TableCell>
                        {vendors.map(v => {
                          const isFirst = v.ranking === 1
                          return (
                            <TableCell key={v.vendorId} className="text-xs text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <span className={cn(
                                  'inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold',
                                  isFirst ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                )}>
                                  {v.ranking}
                                </span>
                                {isFirst && <Badge className="bg-amber-100 text-amber-700 text-[9px] px-1 py-0 h-4">RECOMMENDED</Badge>}
                                {v.vendorId === bestValueId && v.ranking !== 1 && (
                                  <Badge className="bg-violet-100 text-violet-700 text-[9px] px-1 py-0 h-4">BEST VALUE</Badge>
                                )}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      {/* Budget Comparison */}
                      <TableRow className="bg-muted/20">
                        <TableCell className="text-xs sticky left-0 bg-muted/20 font-medium">
                          Budget Variance
                        </TableCell>
                        {vendors.map(v => {
                          const variance = (comparison?.estimatedBudget ?? 0) - v.bidAmount
                          const isPositive = variance >= 0
                          return (
                            <TableCell key={v.vendorId} className={cn('text-xs text-right font-semibold', isPositive ? 'text-emerald-600' : 'text-red-600')}>
                              {isPositive ? '+' : ''}{formatCurrency(variance)}
                              <span className="text-muted-foreground font-normal ml-1">
                                ({((variance / (comparison?.estimatedBudget || 1)) * 100).toFixed(1)}%)
                              </span>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}