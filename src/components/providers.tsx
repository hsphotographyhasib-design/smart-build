'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/components/auth/auth-context'
import { NavigationProvider } from '@/components/eppm/nav/nav-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
