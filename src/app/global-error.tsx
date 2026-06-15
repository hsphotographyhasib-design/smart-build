'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Sanitize the error message for display
  const message = error.message
    ?.replace(/at\s+[\w$]+.*\n?/g, '')
    .replace(/\/[^\s)]+/g, '')
    .replace(/\(.*?\)/g, '')
    .trim() ?? 'An unexpected error occurred.'

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="flex flex-col items-center gap-6 max-w-lg text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground leading-relaxed">{message}</p>
              {error.digest && (
                <p className="text-xs text-muted-foreground/70 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <Button
              variant="default"
              size="lg"
              onClick={() => {
                reset()
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}