'use client'

import { useState, useEffect, useMemo } from 'react'

export interface DeadlineInfo {
  /** ডেডলাইন অতিক্রম হয়েছে কিনা */
  isOverdue: boolean
  /** ডেডলাইন ১ ঘণ্টারের মধ্যে আছে কিনা (জরুরি) */
  isUrgent: boolean
  /** মানবিক পঠনায়ী সময়, যেমন "2d 5h" বা "Overdue" */
  timeRemaining: string
  /** বাকি দিন (0 বা ঋণাত্মক যদি ডেডলাইন অতিক্রম হলে) */
  daysLeft: number
  /** বাকি ঘণ্টা (0 বা ঋণাত্মক যদি ডেডলাইন অতিক্রম হলে) */
  hoursLeft: number
}

const URGENT_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour
const TICK_INTERVAL_MS = 60 * 1000 // প্রতি মিনিটে পুনঃহিসাব করা হচ্ছে

/**
 * ISO তারিখ স্ট্রিং থেকে ডেডলাইন পরিমাপ নিয়ম করা হচ্ছে।
 * UI সতেজ রাখতে প্রতি মিনিটে পুনঃহিসাব করে।
 *
 * ডেডলাইন null, undefined, বা পার্স করা না গেলে যুক্তিমান ডিফল্ট প্রদান করে।
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

  // প্রতি মিনিটে কাউন্টডাউন রিফ্রেশ রাখতে হচ্ছে
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, TICK_INTERVAL_MS)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return useMemo<DeadlineInfo>(() => {
    // null / undefined / খালি ডেডলাইন হ্যান্ডেল করা হচ্ছে
    if (!deadline) {
      return {
        isOverdue: false,
        isUrgent: false,
        timeRemaining: '—',
        daysLeft: -1,
        hoursLeft: -1,
      }
    }

    // ডেডলাইন পার্স করা হচ্ছে
    const deadlineMs = new Date(deadline).getTime()

    // পার্স করতে না পারা তারিখ হ্যান্ডেল করা হচ্ছে
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

    // সময় বাকি ফরম্যাট স্ট্রিং করা হচ্ছে
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
