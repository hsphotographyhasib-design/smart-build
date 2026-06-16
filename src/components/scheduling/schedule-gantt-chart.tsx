'use client'

import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Calendar,
  Diamond,
  Loader2,
} from 'lucide-react'
import { differenceInDays, addDays, format, parseISO, startOfMonth, startOfWeek, endOfMonth, endOfWeek, isSameDay, isToday } from 'date-fns'

// ─── প্রকারভেদ ───
export interface GanttActivity {
  id: string
  activityId: string
  name: string
  taskType: 'task' | 'milestone' | 'summary' | 'inspection' | 'procurement' | 'work_order' | 'maintenance' | 'approval'
  parentId: string | null
  startDate: string | null
  finishDate: string | null
  duration: number
  progress: number
  status: string
  priority: string
  isCritical: boolean
  isOnCriticalPath: boolean
  children?: GanttActivity[]
  resourceNames?: string
}

export interface GanttDependency {
  id: string
  predecessorId: string
  successorId: string
  depType: 'FS' | 'SS' | 'FF' | 'SF'
  lagDays: number
}

interface ScheduleGanttChartProps {
  activities: GanttActivity[]
  dependencies?: GanttDependency[]
  scheduleStartDate: string | null
  scheduleEndDate: string | null
  onActivityClick?: (activity: GanttActivity) => void
  loading?: boolean
}

// ─── ধ্রুবক ───
const ROW_HEIGHT = 36
const HEADER_HEIGHT = 56
const TASK_BAR_HEIGHT = 22
const TASK_BAR_Y_OFFSET = (ROW_HEIGHT - TASK_BAR_HEIGHT) / 2
const MILESTONE_SIZE = 14

const TASK_TYPE_COLORS: Record<string, string> = {
  task: 'bg-amber-500',
  milestone: 'bg-amber-600',
  summary: 'bg-gray-700',
  inspection: 'bg-teal-500',
  procurement: 'bg-orange-500',
  work_order: 'bg-emerald-500',
  maintenance: 'bg-violet-500',
  approval: 'bg-rose-500',
}

const TASK_TYPE_PROGRESS_COLORS: Record<string, string> = {
  task: 'bg-amber-700',
  milestone: 'bg-amber-800',
  summary: 'bg-gray-900',
  inspection: 'bg-teal-700',
  procurement: 'bg-orange-700',
  work_order: 'bg-emerald-700',
  maintenance: 'bg-violet-700',
  approval: 'bg-rose-700',
}

type ZoomLevel = 'day' | 'week' | 'month' | 'quarter'

const CELL_WIDTHS: Record<ZoomLevel, number> = {
  day: 40,
  week: 80,
  month: 120,
  quarter: 160,
}

const STATUS_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  delayed: { label: 'Delayed', className: 'bg-red-50 text-red-700' },
  on_hold: { label: 'On Hold', className: 'bg-gray-100 text-gray-700' },
}

// ─── সহায়ক ফাংশনসমূহ ───
function flattenActivities(activities: GanttActivity[]): (GanttActivity & { depth: number })[] {
  const result: (GanttActivity & { depth: number })[] = []

  function traverse(items: GanttActivity[], depth: number) {
    for (const item of items) {
      result.push({ ...item, depth })
      if (item.children && item.children.length > 0) {
        traverse(item.children, depth + 1)
      }
    }
  }
  traverse(activities, 0)
  return result
}

function getCellWidth(zoom: ZoomLevel) {
  return CELL_WIDTHS[zoom]
}

function generateDateColumns(startDate: Date, endDate: Date, zoom: ZoomLevel) {
  const columns: { label: string; subLabel: string; startDate: Date; width: number }[] = []
  let current = new Date(startDate)

  switch (zoom) {
    case 'day': {
      while (current <= endDate) {
        const dayOfWeek = format(current, 'EEE')
        columns.push({
          label: format(current, 'd'),
          subLabel: dayOfWeek,
          startDate: new Date(current),
          width: CELL_WIDTHS.day,
        })
        current = addDays(current, 1)
      }
      break
    }
    case 'week': {
      while (current <= endDate) {
        const weekStart = startOfWeek(current, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(current, { weekStartsOn: 1 })
        if (weekStart > endDate) break
        columns.push({
          label: `W${format(weekStart, 'w')}`,
          subLabel: format(weekStart, 'd MMM'),
          startDate: weekStart,
          width: CELL_WIDTHS.week,
        })
        current = addDays(weekEnd, 1)
      }
      break
    }
    case 'month': {
      while (current <= endDate) {
        const monthStart = startOfMonth(current)
        const monthEnd = endOfMonth(current)
        columns.push({
          label: format(current, 'MMM'),
          subLabel: format(current, 'yyyy'),
          startDate: monthStart,
          width: CELL_WIDTHS.month,
        })
        current = addDays(monthEnd, 1)
      }
      break
    }
    case 'quarter': {
      while (current <= endDate) {
        const month = current.getMonth()
        const quarterLabel = `Q${Math.floor(month / 3) + 1} ${format(current, 'yyyy')}`
        const quarterStart = new Date(current.getFullYear(), Math.floor(month / 3) * 3, 1)
        const quarterEnd = new Date(current.getFullYear(), Math.floor(month / 3) * 3 + 3, 0)
        columns.push({
          label: quarterLabel,
          subLabel: `${format(quarterStart, 'MMM')} - ${format(quarterEnd, 'MMM')}`,
          startDate: quarterStart,
          width: CELL_WIDTHS.quarter,
        })
        current = addDays(quarterEnd, 1)
      }
      break
    }
  }

  return columns
}

// ─── জুম বাটন গ্রুপ ───
function ZoomControls({ zoom, onZoomChange }: { zoom: ZoomLevel; onZoomChange: (z: ZoomLevel) => void }) {
  const levels: ZoomLevel[] = ['day', 'week', 'month', 'quarter']
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {levels.map((l) => (
        <button
          key={l}
          onClick={() => onZoomChange(l)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
            zoom === l ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {l.charAt(0).toUpperCase() + l.slice(1)}
        </button>
      ))}
    </div>
  )
}

// ─── প্রধান গ্যান্ট চার্ট উপাদান ───
export function ScheduleGanttChart({
  activities,
  dependencies = [],
  scheduleStartDate,
  scheduleEndDate,
  onActivityClick,
  loading = false,
}: ScheduleGanttChartProps) {
  const [zoom, setZoom] = useState<ZoomLevel>('week')
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [horizontalScroll, setHorizontalScroll] = useState(0)

  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // ─── গণনাকৃত তথ্য ───
  const baseStartDate = useMemo(() => {
    if (!scheduleStartDate) return new Date()
    return parseISO(scheduleStartDate)
  }, [scheduleStartDate])

  const baseEndDate = useMemo(() => {
    if (!scheduleEndDate) {
      if (activities.length > 0) {
        let latest = new Date(baseStartDate)
        for (const a of activities) {
          if (a.finishDate) {
            const d = parseISO(a.finishDate)
            if (d > latest) latest = d
          }
        }
        return addDays(latest, 14)
      }
      return addDays(baseStartDate, 90)
    }
    return parseISO(scheduleEndDate)
  }, [scheduleEndDate, activities, baseStartDate])

  // টাইমলাইনে প্যাডিং যোগ
  const timelineStart = addDays(baseStartDate, -7)
  const timelineEnd = addDays(baseEndDate, 14)

  const cellWidth = getCellWidth(zoom)

  const dateColumns = useMemo(
    () => generateDateColumns(timelineStart, timelineEnd, zoom),
    [timelineStart, timelineEnd, zoom]
  )

  const totalTimelineWidth = useMemo(
    () => dateColumns.reduce((sum, col) => sum + col.width, 0),
    [dateColumns]
  )

  // সঙ্কুচিত অবস্থা বিবেচনা করে ফিল্টারকৃত সমতল কার্যকলাপ পাওয়া
  const flatActivities = useMemo(() => {
    const flat: (GanttActivity & { depth: number; visibleIndex: number })[] = []
    let visibleIdx = 0

    function traverse(items: GanttActivity[], depth: number) {
      for (const item of items) {
        flat.push({ ...item, depth, visibleIndex: visibleIdx })
        visibleIdx++
        if (item.children && item.children.length > 0 && !collapsedIds.has(item.id)) {
          traverse(item.children, depth + 1)
        }
      }
    }
    traverse(activities, 0)
    return flat
  }, [activities, collapsedIds])

  const totalRows = flatActivities.length

  // নির্ভরতা তীরের জন্য কার্যকলাপ ID -> সারি সূচক ম্যাপ
  const activityRowMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of flatActivities) {
      map.set(a.id, a.visibleIndex)
    }
    return map
  }, [flatActivities])

  // ─── অবস্থান গণনা ───
  function getDatePosition(date: Date): number {
    const daysDiff = differenceInDays(date, timelineStart)
    let position = 0
    let cumDays = 0
    for (const col of dateColumns) {
      const colDays = differenceInDays(
        addDays(col.startDate, zoom === 'month' ? 30 : zoom === 'quarter' ? 90 : zoom === 'week' ? 7 : 1),
        col.startDate
      ) || 1
      if (cumDays + colDays > daysDiff) {
        const fraction = (daysDiff - cumDays) / colDays
        position += col.width * fraction
        break
      }
      position += col.width
      cumDays += colDays
    }
    return position
  }

  function getBarX(startDateStr: string): number {
    try {
      return getDatePosition(parseISO(startDateStr))
    } catch {
      return 0
    }
  }

  function getBarWidth(startDateStr: string, endDateStr: string | null): number {
    try {
      const start = parseISO(startDateStr)
      const end = endDateStr ? parseISO(endDateStr) : addDays(start, 1)
      const startPos = getDatePosition(start)
      const endPos = getDatePosition(end)
      return Math.max(endPos - startPos, cellWidth * 0.5)
    } catch {
      return cellWidth
    }
  }

  // ─── আজকের রেখার অবস্থান ───
  const todayX = useMemo(() => {
    try {
      return getDatePosition(new Date())
    } catch {
      return 0
    }
  }, [dateColumns, timelineStart])

  // ─── সঙ্কুচিত করা/খোলা টগল ───
  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ─── অনুভূমিক স্ক্রল সিঙ্ক ───
  const handleTimelineScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setHorizontalScroll(e.currentTarget.scrollLeft)
  }, [])

  // ─── নির্ভরতা তীর পথ ───
  const dependencyPaths = useMemo(() => {
    const paths: { key: string; d: string; color: string }[] = []

    for (const dep of dependencies) {
      const fromIdx = activityRowMap.get(dep.predecessorId)
      const toIdx = activityRowMap.get(dep.successorId)
      if (fromIdx === undefined || toIdx === undefined) continue

      const fromActivity = flatActivities.find((a) => a.id === dep.predecessorId)
      const toActivity = flatActivities.find((a) => a.id === dep.successorId)
      if (!fromActivity?.startDate || !toActivity?.startDate) continue

      const fromX = getBarX(fromActivity.startDate) + getBarWidth(fromActivity.startDate, fromActivity.finishDate)
      const fromY = fromIdx * ROW_HEIGHT + ROW_HEIGHT / 2
      const toX = getBarX(toActivity.startDate)
      const toY = toIdx * ROW_HEIGHT + ROW_HEIGHT / 2

      const isCritical = dep.depType === 'FS' && (fromActivity.isOnCriticalPath || toActivity.isOnCriticalPath)
      const color = isCritical ? '#ef4444' : '#94a3b8'

      // সরল সমকোণ সংযোগকারী
      const midX = fromX + Math.min((toX - fromX) * 0.4, 40)
      const d = `M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`
      paths.push({ key: dep.id, d, color })
    }
    return paths
  }, [dependencies, flatActivities, activityRowMap, dateColumns, cellWidth])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-xl bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-muted/30">
        <Calendar className="h-10 w-10 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No activities to display</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="border rounded-xl overflow-hidden bg-card">
        {/* ─── টুলবার ─── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">{totalRows} activities</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">
              {zoom === 'day' ? 'Daily View' : zoom === 'week' ? 'Weekly View' : zoom === 'month' ? 'Monthly View' : 'Quarterly View'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* লিজেন্ড */}
            <div className="hidden lg:flex items-center gap-3 mr-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-4 rounded-sm bg-amber-500" />
                <span className="text-[10px] text-muted-foreground">Task</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Diamond className="h-2.5 w-2.5 text-amber-600" />
                <span className="text-[10px] text-muted-foreground">Milestone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-4 rounded-sm bg-teal-500" />
                <span className="text-[10px] text-muted-foreground">Inspection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-4 rounded-sm bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground">Work Order</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-4 rounded-sm bg-red-500" />
                <span className="text-[10px] text-muted-foreground">Critical</span>
              </div>
            </div>
            <ZoomControls zoom={zoom} onZoomChange={setZoom} />
          </div>
        </div>

        {/* ─── প্রধান বিষয়বস্তু ─── */}
        <div className="flex">
          {/* ─── বাম প্যানেল (কার্যকলাপ টেবিল) ─── */}
          <div ref={leftPanelRef} className="w-full md:w-[420px] md:min-w-[420px] border-r flex-col bg-card hidden md:flex">
            {/* বাম হেডার */}
            <div className="flex items-center border-b text-xs font-medium text-muted-foreground bg-muted/50" style={{ height: HEADER_HEIGHT }}>
              <div className="w-8 flex-shrink-0" />
              <div className="flex-1 min-w-0 px-2">Activity Name</div>
              <div className="w-16 text-center">Start</div>
              <div className="w-16 text-center">Finish</div>
              <div className="w-14 text-center">Days</div>
              <div className="w-12 text-center">%</div>
            </div>
            {/* বাম সারিসমূহ */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: Math.min(totalRows * ROW_HEIGHT, 600) }}>
              {flatActivities.map((activity) => {
                const hasChildren = activity.children && activity.children.length > 0
                const isCollapsed = collapsedIds.has(activity.id)
                const isCriticalBar = activity.isOnCriticalPath || activity.isCritical

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex items-center border-b hover:bg-muted/50 cursor-pointer transition-colors group',
                      selectedId === activity.id && 'bg-amber-50/50 dark:bg-amber-950/20'
                    )}
                    style={{ height: ROW_HEIGHT, paddingLeft: activity.depth * 16 }}
                    onClick={() => {
                      setSelectedId(activity.id)
                      onActivityClick?.(activity)
                    }}
                  >
                    {/* প্রসারিত/সঙ্কুচিত */}
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                      {hasChildren ? (
                        <button
                          className="p-0.5 rounded hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCollapse(activity.id)
                          }}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      ) : (
                        <span className="w-3" />
                      )}
                    </div>
                    {/* নাম */}
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 px-1">
                      {activity.taskType === 'milestone' ? (
                        <Diamond className="h-3 w-3 text-amber-600 flex-shrink-0" />
                      ) : activity.taskType === 'summary' ? (
                        <span className="h-3 w-3 rounded-sm bg-gray-700 flex-shrink-0" />
                      ) : (
                        <span
                          className={cn(
                            'h-3 w-3 rounded-sm flex-shrink-0',
                            TASK_TYPE_COLORS[activity.taskType] || 'bg-amber-500',
                            isCriticalBar && !activity.taskType.includes('milestone') && 'ring-2 ring-red-400 ring-offset-0'
                          )}
                        />
                      )}
                      <span className={cn('text-xs truncate', activity.taskType === 'summary' && 'font-semibold')}>
                        {activity.name}
                      </span>
                      {activity.isOnCriticalPath && (
                        <span className="text-[9px] text-red-600 font-medium flex-shrink-0">CP</span>
                      )}
                    </div>
                    {/* শুরু */}
                    <div className="w-16 text-center text-[10px] text-muted-foreground">
                      {activity.startDate ? format(parseISO(activity.startDate), 'd MMM') : '—'}
                    </div>
                    {/* সমাপ্তি */}
                    <div className="w-16 text-center text-[10px] text-muted-foreground">
                      {activity.finishDate ? format(parseISO(activity.finishDate), 'd MMM') : '—'}
                    </div>
                    {/* মেয়াদ */}
                    <div className="w-14 text-center text-[10px] font-medium text-muted-foreground">
                      {activity.duration}d
                    </div>
                    {/* অগ্রগতি */}
                    <div className="w-12 flex items-center justify-center">
                      <span
                        className={cn(
                          'text-[10px] font-semibold',
                          activity.progress >= 100 ? 'text-emerald-600' : activity.progress > 0 ? 'text-amber-600' : 'text-muted-foreground'
                        )}
                      >
                        {Math.round(activity.progress)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─── ডান প্যানেল (টাইমলাইন) ─── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* টাইমলাইন হেডার */}
            <div
              ref={timelineRef}
              className="flex border-b overflow-hidden bg-muted/50"
              style={{ height: HEADER_HEIGHT }}
            >
              {dateColumns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 border-r flex flex-col items-center justify-center"
                  style={{ width: col.width }}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground">{col.subLabel}</span>
                  <span className="text-xs font-medium text-foreground">{col.label}</span>
                </div>
              ))}
            </div>

            {/* টাইমলাইন বডি (স্ক্রলযোগ্য) */}
            <div
              ref={rightPanelRef}
              className="flex-1 overflow-auto relative"
              style={{ maxHeight: Math.min(totalRows * ROW_HEIGHT, 600) + 40 }}
              onScroll={handleTimelineScroll}
            >
              {/* টাইমলাইন বিষয়বস্তু */}
              <div className="relative" style={{ width: totalTimelineWidth, minHeight: totalRows * ROW_HEIGHT }}>
                {/* গ্রিড রেখা */}
                {dateColumns.map((col, idx) => (
                  <div
                    key={`grid-${idx}`}
                    className="absolute top-0 bottom-0 border-r border-border/50"
                    style={{ left: dateColumns.slice(0, idx).reduce((s, c) => s + c.width, 0), width: col.width }}
                  />
                ))}

                {/* বিকল্প সারি পটভূমি */}
                {flatActivities.map((_, idx) => (
                  <div
                    key={`row-bg-${idx}`}
                    className={cn('absolute w-full', idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/20')}
                    style={{ top: idx * ROW_HEIGHT, height: ROW_HEIGHT }}
                  />
                ))}

                {/* আজকের রেখা */}
                {todayX > 0 && todayX < totalTimelineWidth && (
                  <div
                    className="absolute top-0 bottom-0 w-px z-20"
                    style={{ left: todayX }}
                  >
                    <div className="w-full h-full bg-red-500/60" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 4px, #ef4444 4px, #ef4444 8px)' }} />
                    <div className="absolute -top-0 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-b">
                      Today
                    </div>
                  </div>
                )}

                {/* কাজের বার */}
                {flatActivities.map((activity) => {
                  if (!activity.startDate) return null

                  const isMilestone = activity.taskType === 'milestone'
                  const isSummary = activity.taskType === 'summary'
                  const isCritical = activity.isOnCriticalPath || activity.isCritical
                  const rowIdx = activity.visibleIndex
                  const barX = getBarX(activity.startDate)
                  const barWidth = isMilestone ? 0 : getBarWidth(activity.startDate, activity.finishDate)
                  const barY = rowIdx * ROW_HEIGHT + TASK_BAR_Y_OFFSET
                  const progressWidth = isMilestone ? 0 : barWidth * (activity.progress / 100)
                  const barColor = isCritical && !isMilestone ? 'bg-red-500' : (TASK_TYPE_COLORS[activity.taskType] || 'bg-amber-500')
                  const progressColor = isCritical && !isMilestone ? 'bg-red-700' : (TASK_TYPE_PROGRESS_COLORS[activity.taskType] || 'bg-amber-700')

                  return (
                    <TooltipTrigger key={`bar-${activity.id}`} asChild>
                      <div className="absolute group">
                        {/* সাধারণ কাজের বার */}
                        {!isMilestone && (
                          <div
                            className={cn(
                              'absolute rounded-sm transition-all cursor-pointer',
                              barColor,
                              isSummary && 'rounded-t-md font-bold',
                              selectedId === activity.id && 'ring-2 ring-amber-400 ring-offset-1',
                              'opacity-90 hover:opacity-100'
                            )}
                            style={{
                              left: barX,
                              top: barY,
                              width: barWidth,
                              height: TASK_BAR_HEIGHT,
                            }}
                            onClick={() => {
                              setSelectedId(activity.id)
                              onActivityClick?.(activity)
                            }}
                          >
                            {/* অগ্রগতি ওভারলে */}
                            {activity.progress > 0 && (
                              <div
                                className={cn('absolute inset-y-0 left-0 rounded-sm', progressColor)}
                                style={{ width: progressWidth }}
                              />
                            )}
                            {/* অগ্রগতি লেবেল */}
                            {barWidth > 60 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] font-medium text-white drop-shadow-sm">
                                  {activity.name.length > 20 ? activity.name.substring(0, 20) + '...' : activity.name}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* মাইলফলক ডায়মন্ড */}
                        {isMilestone && (
                          <div
                            className="absolute cursor-pointer"
                            style={{
                              left: barX - MILESTONE_SIZE / 2,
                              top: barY + (TASK_BAR_HEIGHT - MILESTONE_SIZE) / 2,
                            }}
                            onClick={() => {
                              setSelectedId(activity.id)
                              onActivityClick?.(activity)
                            }}
                          >
                            <svg width={MILESTONE_SIZE} height={MILESTONE_SIZE} viewBox="0 0 14 14">
                              <polygon
                                points="7,0 14,7 7,14 0,7"
                                fill={activity.status === 'completed' ? '#059669' : '#d97706'}
                                stroke={selectedId === activity.id ? '#f59e0b' : 'none'}
                                strokeWidth={selectedId === activity.id ? 2 : 0}
                              />
                            </svg>
                          </div>
                        )}

                        {/* টুলটিপ */}
                        <TooltipContent side="top" className="text-xs">
                          <div className="space-y-1">
                            <div className="font-semibold">{activity.activityId}: {activity.name}</div>
                            <div className="text-muted-foreground">
                              {activity.startDate && format(parseISO(activity.startDate), 'dd MMM yyyy')} — {activity.finishDate && format(parseISO(activity.finishDate), 'dd MMM yyyy')}
                            </div>
                            <div>Duration: {activity.duration}d &middot; Progress: {Math.round(activity.progress)}%</div>
                            {isCritical && <div className="text-red-600 font-medium">Critical Path</div>}
                          </div>
                        </TooltipContent>
                      </div>
                    </TooltipTrigger>
                  )
                })}

                {/* নির্ভরতা তীর SVG ওভারলে */}
                <svg
                  className="absolute inset-0 pointer-events-none z-10"
                  width={totalTimelineWidth}
                  height={totalRows * ROW_HEIGHT}
                  style={{ overflow: 'visible' }}
                >
                  {dependencyPaths.map(({ key, d, color }) => (
                    <g key={key}>
                      <path
                        d={d}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        strokeDasharray="4,2"
                        opacity={0.6}
                      />
                      <circle
                        cx={parseFloat(d.match(/H\s+([\d.]+)/)?.[1] || '0')}
                        cy={parseFloat(d.match(/V\s+([\d.]+)/)?.[1] || '0')}
                        r={2.5}
                        fill={color}
                        opacity={0.8}
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
