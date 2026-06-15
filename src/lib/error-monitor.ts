// ---------------------------------------------------------------------------
// ক্লায়েন্ট-সাইড ত্রুটি পর্যবেক্ষণ সহায়ক
// ---------------------------------------------------------------------------

export interface ErrorEvent {
  type: 'api' | 'render' | 'interaction' | 'network'
  message: string
  stack?: string
  url?: string
  timestamp: number
  userAgent?: string
  severity: 'critical' | 'warning' | 'info'
}

// ---------------------------------------------------------------------------
// ErrorMonitor ক্লাস
// ---------------------------------------------------------------------------

class ErrorMonitor {
  private errors: ErrorEvent[] = []
  private maxErrors: number = 100

  /** একটি ত্রুটি ইভেন্ট রেকর্ড করা হচ্ছে। */
  log(event: ErrorEvent): void {
    this.errors.push(event)

    // সীমা অতিক্রম করলে পুরনো এন্ট্রি অপসারণ করা হচ্ছে
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // ডেভেলপার টুলিংয়ের জন্য সর্বদা নেটিভ কনসোলে আউটপুট দেওয়া হচ্ছে
    if (event.severity === 'critical') {
      console.error(`[ErrorMonitor][${event.type}]`, event.message, event.stack ?? '')
    } else if (event.severity === 'warning') {
      console.warn(`[ErrorMonitor][${event.type}]`, event.message)
    } else {
      console.info(`[ErrorMonitor][${event.type}]`, event.message)
    }
  }

  /** সর্বশেষ Nটি ত্রুটি প্রদান করা হচ্ছে (নতুন থেকে পুরনো ক্রমে)। */
  getErrors(limit?: number): ErrorEvent[] {
    if (!limit || limit >= this.errors.length) {
      return [...this.errors].reverse()
    }
    return this.errors.slice(-limit).reverse()
  }

  /** ধরন অনুযায়ী ত্রুটির গণনা প্রদান করা হচ্ছে। */
  getCountByType(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const e of this.errors) {
      counts[e.type] = (counts[e.type] ?? 0) + 1
    }
    return counts
  }

  /** সকল সংরক্ষিত ত্রুটি মুছে ফেলা হচ্ছে। */
  clear(): void {
    this.errors = []
  }

  /** বর্তমান ত্রুটি অবস্থার একটি সংক্ষিপ্ত সারাংশ প্রদান করা হচ্ছে। */
  getSummary(): { total: number; critical: number; byType: Record<string, number> } {
    let critical = 0
    const byType: Record<string, number> = {}

    for (const e of this.errors) {
      if (e.severity === 'critical') critical++
      byType[e.type] = (byType[e.type] ?? 0) + 1
    }

    return { total: this.errors.length, critical, byType }
  }
}

/** সিঙ্গলটন ত্রুটি পর্যবেক্ষণ ইনস্ট্যান্স। */
export const errorMonitor = new ErrorMonitor()

// ---------------------------------------------------------------------------
// React হুক — কম্পোনেন্টের জন্য সুবিধাজনক ত্রুটি হ্যান্ডলার
// ---------------------------------------------------------------------------

export function useErrorHandler(): {
  handleError: (error: Error, context?: string) => void
} {
  return {
    handleError: (error: Error, context?: string) => {
      errorMonitor.log({
        type: 'interaction',
        message: context ? `${context}: ${error.message}` : error.message,
        stack: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        severity: 'critical',
      })
    },
  }
}

// ---------------------------------------------------------------------------
// গ্লোবাল অহ্যান্ডেল করা না হওয়া ত্রুটি শ্রোতা
// ---------------------------------------------------------------------------

/**
 * গ্লোবাল ত্রুটি শ্রোতা আরম্ভ করা হচ্ছে।
 * একটি ক্লায়েন্ট লেআউটে একবার কল করুন (যেমন `useEffect` এর ভিতরে)।
 * সকল শ্রোতা সরানোর একটি ক্লিনআপ ফাংশন প্রদান করে।
 */
export function initErrorMonitoring(): () => void {
  // --- হ্যান্ডেল করা হয়নি এমন Promise প্রত্যাখ্যান ---
  const handleRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault()
    const message =
      event.reason instanceof Error ? event.reason.message : String(event.reason)
    const stack = event.reason instanceof Error ? event.reason.stack : undefined

    errorMonitor.log({
      type: 'api',
      message,
      stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      severity: 'critical',
    })
  }

  // --- ধরা পড়েনি এমন রানটাইম ত্রুটি ---
  // আমাদের রপ্তানি করা ErrorEvent ইন্টারফেস দ্বারা ছায়া পড়তে এড়াতে globalThis.ErrorEvent ব্যবহার করা হচ্ছে
  const handleError = (event: globalThis.ErrorEvent) => {
    // DOM ErrorEvent – `event.error` একটি Error অবজেক্ট হতে পারে
    const errorObj = (event as unknown as { error?: Error }).error
    const message = errorObj instanceof Error ? errorObj.message : event.message
    const stack = errorObj instanceof Error ? errorObj.stack : undefined
    const filename = (event as unknown as { filename?: string }).filename

    errorMonitor.log({
      type: 'render',
      message,
      stack,
      url: filename ?? (typeof window !== 'undefined' ? window.location.href : undefined),
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      severity: 'critical',
    })
  }

  window.addEventListener('unhandledrejection', handleRejection as EventListener)
  window.addEventListener('error', handleError as EventListener)

  // ক্লিনআপ ফাংশন প্রদান করা হচ্ছে
  return () => {
    window.removeEventListener('unhandledrejection', handleRejection as EventListener)
    window.removeEventListener('error', handleError as EventListener)
  }
}