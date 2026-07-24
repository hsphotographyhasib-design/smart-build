'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/components/auth/auth-context'
import { NavigationProvider } from '@/components/eppm/nav/nav-context'
import { WorkflowProvider } from '@/components/eppm/workflow/workflow-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <WorkflowProvider>
          <NavigationProvider>{children}</NavigationProvider>
        </WorkflowProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
