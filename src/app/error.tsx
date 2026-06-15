'use client'

import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Sanitize the error message for safe display
  const message = error.message
    ?.replace(/at\s+[\w$]+.*\n?/g, '')
    .replace(/\/[^\s)]+/g, '')
    .replace(/\(.*?\)/g, '')
    .trim() ?? 'An unexpected error occurred.'

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md border-amber-200 dark:border-amber-800/50">
        <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/60 font-mono mt-1">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button variant="default" onClick={reset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}