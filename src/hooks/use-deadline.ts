'use client'

import { useState, useEffect, useMemo } from 'react'

export interface DeadlineInfo {
  /** Whether the deadline has passed */
  isOverdue: boolean
  /** Whether the deadline is within 1 hour (urgent) */
  isUrgent: boolean
  /** Human-readable time remaining, e.g. "2d 5h" or "Overdue" */
  timeRemaining: string
  /** Whole days remaining (0 or negative if overdue) */
  daysLeft: number
  /** Whole hours remaining (0 or negative if overdue) */
  hoursLeft: number
}

const URGENT_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour
const TICK_INTERVAL_MS = 60 * 1000 // Re-calculate every minute

/**
 * Calculates time remaining from a deadline string (ISO date string).
 * Re-calculates every minute so the UI stays fresh.
 *
 * Returns sensible defaults when the deadline is null, undefined,
 * or cannot be parsed.
 *
 * @example
 * function TaskCard({ task }) {
 *   const deadline = useDeadline(task.dueDate)
 *
 *   return (
 *     <div>
 *       <Badge variant={deadline.isOverdue ? 'destructive' : deadline.isUrgent ? 'warning' : 'default'}>
 *         {deadline.timeRemaining}
 *       </Badge>
 *     </div>
 *   )
 * }
 */
export function useDeadline(deadline: string | null | undefined): DeadlineInfo {
  const [now, setNow] = useState<number>(() => Date.now())

  // Tick every minute to keep the countdown fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, TICK_INTERVAL_MS)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return useMemo<DeadlineInfo>(() => {
    // Handle null / undefined / empty deadline
    if (!deadline) {
      return {
        isOverdue: false,
        isUrgent: false,
        timeRemaining: '—',
        daysLeft: -1,
        hoursLeft: -1,
      }
    }

    // Parse the deadline
    const deadlineMs = new Date(deadline).getTime()

    // Handle unparseable dates
    if (Number.isNaN(deadlineMs)) {
      return {
        isOverdue: false,
        isUrgent: false,
        timeRemaining: 'Invalid date',
        daysLeft: -1,
        hoursLeft: -1,
      }
    }

    const diffMs = deadlineMs - now
    const isOverdue = diffMs <= 0
    const isUrgent = !isOverdue && diffMs <= URGENT_THRESHOLD_MS

    const absDiffMs = Math.abs(diffMs)
    const totalMinutes = Math.floor(absDiffMs / (1000 * 60))
    const totalHours = Math.floor(absDiffMs / (1000 * 60 * 60))
    const days = Math.floor(totalHours / 24)
    const hours = totalHours % 24

    const daysLeft = isOverdue ? -Math.ceil(-diffMs / (1000 * 60 * 60 * 24)) : Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hoursLeft = isOverdue ? -Math.ceil(-diffMs / (1000 * 60 * 60)) : Math.floor(diffMs / (1000 * 60 * 60))

    // Format time remaining string
    let timeRemaining: string

    if (isOverdue) {
      if (days >= 1) {
        timeRemaining = `Overdue by ${days}d ${hours}h`
      } else if (hours >= 1) {
        timeRemaining = `Overdue by ${hours}h`
      } else {
        timeRemaining = 'Overdue'
      }
    } else {
      if (days >= 1) {
        timeRemaining = `${days}d ${hours}h`
      } else if (hours >= 1) {
        const minutes = totalMinutes % 60
        timeRemaining = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
      } else {
        const minutes = totalMinutes
        timeRemaining = `${minutes}m`
      }
    }

    return {
      isOverdue,
      isUrgent,
      timeRemaining,
      daysLeft,
      hoursLeft,
    }
  }, [deadline, now])
}
