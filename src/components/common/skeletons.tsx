'use client'

import { Skeleton } from '@/components/ui/skeleton'

/* -------------------------------------------------------------------------- */
/*  KPI Card Skeleton                                                         */
/* -------------------------------------------------------------------------- */

export function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-7 w-32 rounded-md" />
        <Skeleton className="h-3.5 w-20 rounded-md" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Chart Skeleton                                                            */
/* -------------------------------------------------------------------------- */

export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <div className={`mt-6 ${height} w-full rounded-lg bg-accent/50`} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page Header Skeleton                                                      */
/* -------------------------------------------------------------------------- */

export function PageHeaderSkeleton({
  hasActions = true,
}: {
  hasActions?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-56 rounded-md" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md" />
      </div>
      {hasActions && (
        <div className="mt-3 flex items-center gap-2 sm:mt-0">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Table Skeleton                                                            */
/* -------------------------------------------------------------------------- */

export function TableSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number
  rows?: number
}) {
  const colWidths = ['w-12', 'w-40', 'w-28', 'w-24', 'w-20', 'w-32']

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 border-b px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`th-${i}`}
            className={`h-4 rounded-md ${colWidths[i % colWidths.length]}`}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`tr-${r}`}
          className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={`td-${r}-${c}`}
              className={`h-4 rounded-md ${colWidths[c % colWidths.length]}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card Grid Skeleton                                                        */
/* -------------------------------------------------------------------------- */

export function CardGridSkeleton({
  columns = 3,
  rows = 2,
}: {
  columns?: number
  rows?: number
}) {
  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={gridCols[columns] ?? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} style={{ display: 'grid', gap: '1rem' }}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <div
          key={`card-${i}`}
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Form Skeleton                                                             */
/* -------------------------------------------------------------------------- */

export function FormSkeleton({
  rows = 4,
  hasActions = true,
}: {
  rows?: number
  hasActions?: boolean
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`field-${i}`} className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
      {hasActions && (
        <div className="mt-6 flex items-center gap-3 border-t pt-5">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Profile Skeleton                                                          */
/* -------------------------------------------------------------------------- */

export function ProfileSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Skeleton className="size-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <Skeleton className="mx-auto h-5 w-40 rounded-md sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-52 max-w-full rounded-md sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-36 max-w-full rounded-md sm:mx-0" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md shrink-0" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="space-y-1.5 text-center">
            <Skeleton className="mx-auto h-6 w-16 rounded-md" />
            <Skeleton className="mx-auto h-3 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  List Skeleton                                                             */
/* -------------------------------------------------------------------------- */

export function ListSkeleton({
  rows = 5,
  showAvatar = true,
}: {
  rows?: number
  showAvatar?: boolean
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={`list-${i}`}
          className="flex items-center gap-3 px-4 py-3"
        >
          {showAvatar && <Skeleton className="size-9 rounded-full shrink-0" />}
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48 max-w-full rounded-md" />
            <Skeleton className="h-3 w-32 max-w-full rounded-md" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Skeleton                                                        */
/* -------------------------------------------------------------------------- */

export function DashboardSkeleton({
  kpiCount = 4,
}: {
  kpiCount?: number
}) {
  const kpiCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeaderSkeleton hasActions />

      {/* KPI cards */}
      <div
        className={kpiCols[kpiCount] ?? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}
        style={{ display: 'grid', gap: '1rem' }}
      >
        {Array.from({ length: kpiCount }).map((_, i) => (
          <KpiCardSkeleton key={`kpi-${i}`} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ChartSkeleton height="h-72" />
        </div>
        <div className="lg:col-span-3">
          <ChartSkeleton height="h-72" />
        </div>
      </div>

      {/* Recent activity table */}
      <TableSkeleton columns={5} rows={4} />
    </div>
  )
}