import type { Metadata } from 'next'
import { RegionalProvider } from '@/components/providers/regional-provider'
import { AuthLayoutShell } from '@/components/auth/auth-layout-shell'

export const metadata: Metadata = {
  title: 'SmartBuild - Sign In',
  description: 'Sign in to your SmartBuild account to manage construction projects, maintenance, and operations.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RegionalProvider>
      <AuthLayoutShell>
        {children}
      </AuthLayoutShell>
    </RegionalProvider>
  )
}
