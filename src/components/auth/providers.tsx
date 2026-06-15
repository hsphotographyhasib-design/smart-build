'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState, type ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'bg-white text-foreground border shadow-lg',
            title: 'text-sm font-semibold',
            description: 'text-sm text-muted-foreground',
          },
        }}
        richColors
        closeButton
      />
    </QueryClientProvider>
  )
}