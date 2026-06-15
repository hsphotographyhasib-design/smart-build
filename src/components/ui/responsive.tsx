'use client'

import * as React from 'react'
import type { ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// 1. ResponsiveTable
// ---------------------------------------------------------------------------

interface ResponsiveColumn {
  key: string
  label: string
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode
}

interface ResponsiveTableProps {
  columns: ResponsiveColumn[]
  data: Record<string, unknown>[]
  onRowClick?: (row: Record<string, unknown>) => void
  emptyMessage?: string
  cardTitle?: (row: Record<string, unknown>) => string
  cardSubtitle?: (row: Record<string, unknown>) => string
}

function ResponsiveTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available.',
  cardTitle,
  cardSubtitle,
}: ResponsiveTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* Desktop: standard table (md+) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={idx}
                className={onRowClick ? 'cursor-pointer' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] as ReactNode) ?? '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: card layout (<md) */}
      <div className="flex flex-col gap-3 md:hidden">
        {data.map((row, idx) => {
          const title = cardTitle
            ? cardTitle(row)
            : columns[0]
              ? String(row[columns[0].key] ?? '—')
              : ''
          const subtitle = cardSubtitle ? cardSubtitle(row) : undefined

          return (
            <Card
              key={idx}
              className={cn('py-4', onRowClick && 'cursor-pointer')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              <CardHeader className="pb-0 gap-0">
                <CardTitle className="text-sm">{title}</CardTitle>
                {subtitle && (
                  <p className="text-muted-foreground text-xs mt-1">
                    {subtitle}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-3">
                <div className="grid grid-cols-1 gap-2">
                  {columns.slice(1).map((col) => (
                    <div key={col.key} className="flex justify-between gap-2">
                      <span className="text-muted-foreground text-xs shrink-0">
                        {col.label}
                      </span>
                      <span className="text-right text-xs font-medium">
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] as ReactNode) ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// 2. ResponsiveGrid
// ---------------------------------------------------------------------------

interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: string
  className?: string
}

function ResponsiveGrid({
  children,
  cols,
  gap = 'gap-4',
  className,
}: ResponsiveGridProps) {
  const mobile = cols?.mobile ?? 1
  const tablet = cols?.tablet ?? 2
  const desktop = cols?.desktop ?? 3

  // Build responsive grid-cols classes
  const colClasses = [
    mobile === 1
      ? 'grid-cols-1'
      : mobile === 2
        ? 'grid-cols-2'
        : `grid-cols-${mobile}`,
    tablet === 2
      ? 'sm:grid-cols-2'
      : tablet === 1
        ? 'sm:grid-cols-1'
        : `sm:grid-cols-${tablet}`,
    desktop === 3
      ? 'lg:grid-cols-3'
      : desktop === 4
        ? 'lg:grid-cols-4'
        : `lg:grid-cols-${desktop}`,
    desktop === 4 ? 'xl:grid-cols-4' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cn('grid', colClasses, gap, className)}>{children}</div>
  )
}

// ---------------------------------------------------------------------------
// 3. ResponsiveModal
// ---------------------------------------------------------------------------

interface ResponsiveModalProps
  extends React.ComponentProps<typeof DialogContent> {
  fullScreenMobile?: boolean
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

function ResponsiveModal({
  fullScreenMobile = true,
  title,
  description,
  children,
  footer,
  className,
  ...props
}: ResponsiveModalProps) {
  return (
    <Dialog>
      {/* Trigger is handled by the caller wrapping in <Dialog> themselves */}
      {/* We render only the content part; the caller must wrap this with
          <Dialog open={...} onOpenChange={...}> */}

      {/* This component is intended to be used inside an already-opened Dialog.
          We provide a self-contained wrapper that includes open/onOpenChange
          for convenience, but the primary pattern is: caller controls Dialog
          state and passes children into ResponsiveModal. */}
      <ResponsiveModalInner
        fullScreenMobile={fullScreenMobile}
        title={title}
        description={description}
        footer={footer}
        className={className}
        {...props}
      >
        {children}
      </ResponsiveModalInner>
    </Dialog>
  )
}

// Internal content component used by ResponsiveModal
function ResponsiveModalInner({
  fullScreenMobile = true,
  title,
  description,
  children,
  footer,
  className,
  ...props
}: Omit<ResponsiveModalProps, keyof React.ComponentProps<typeof Dialog>>) {
  return (
    <DialogContent
      className={cn(
        fullScreenMobile &&
          'top-0 left-0 translate-x-0 translate-y-0 h-full w-full max-w-full rounded-none sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:h-auto sm:w-auto sm:max-w-lg sm:rounded-lg',
        className
      )}
      {...(props as React.ComponentProps<typeof DialogContent>)}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      {description && <DialogDescription>{description}</DialogDescription>}
      <div className={cn(title && 'pt-2')}>{children}</div>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  )
}

// Convenience: use ResponsiveModalContent when the parent Dialog is already open
interface ResponsiveModalContentProps
  extends React.ComponentProps<typeof DialogContent> {
  fullScreenMobile?: boolean
}

function ResponsiveModalContent({
  fullScreenMobile = true,
  className,
  ...props
}: ResponsiveModalContentProps) {
  return (
    <DialogContent
      className={cn(
        fullScreenMobile &&
          'top-0 left-0 translate-x-0 translate-y-0 h-full w-full max-w-full rounded-none sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:h-auto sm:w-auto sm:max-w-lg sm:rounded-lg',
        className
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// 4. ResponsiveChart
// ---------------------------------------------------------------------------

interface ResponsiveChartProps {
  title?: string
  children: ReactNode
  collapsible?: boolean
  className?: string
}

function ResponsiveChart({
  title,
  children,
  collapsible = true,
  className,
}: ResponsiveChartProps) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Mobile: collapsible header */}
      <div className="flex items-center justify-between md:hidden">
        {title && (
          <h3 className="text-sm font-medium">{title}</h3>
        )}
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
            className="ml-auto shrink-0"
          >
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            <span className="sr-only">
              {expanded ? 'Collapse' : 'Expand'} chart
            </span>
          </Button>
        )}
      </div>

      {/* Mobile: chart body (collapsible) */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 md:!max-h-none',
          collapsible
            ? expanded
              ? 'max-h-[600px] opacity-100 mt-2'
              : 'max-h-0 opacity-0'
            : 'max-h-[600px] opacity-100 mt-2'
        )}
      >
        {children}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block">
        {title && (
          <h3 className="text-sm font-medium mb-3">{title}</h3>
        )}
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5. MobileOnly & DesktopOnly
// ---------------------------------------------------------------------------

function MobileOnly({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('block md:hidden', className)}>{children}</div>
}

function DesktopOnly({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('hidden md:block', className)}>{children}</div>
}

// ---------------------------------------------------------------------------
// 6. ResponsivePagination
// ---------------------------------------------------------------------------

interface ResponsivePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function ResponsivePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: ResponsivePaginationProps) {
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  // Build page numbers for desktop view with ellipsis
  function getPageNumbers(): (number | 'ellipsis')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = [1]

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }

    pages.push(totalPages)

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center', className)}
    >
      {/* Mobile: prev/next only + page indicator */}
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoPrev}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-muted-foreground text-sm min-w-[80px] text-center">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Desktop: full page numbers */}
      <div className="hidden md:flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!canGoPrev}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {getPageNumbers().map((page, idx) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-muted-foreground text-sm"
              >
                …
              </span>
            )
          }

          const isCurrent = page === currentPage

          return (
            <Button
              key={page}
              variant={isCurrent ? 'default' : 'outline'}
              size="icon"
              className="size-8"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {page}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  ResponsiveTable,
  type ResponsiveTableProps,
  type ResponsiveColumn,
  ResponsiveGrid,
  type ResponsiveGridProps,
  ResponsiveModal,
  ResponsiveModalContent,
  type ResponsiveModalProps,
  type ResponsiveModalContentProps,
  ResponsiveChart,
  type ResponsiveChartProps,
  MobileOnly,
  DesktopOnly,
  ResponsivePagination,
  type ResponsivePaginationProps,
}