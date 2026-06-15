import type { Metadata } from 'next'
import { RegionalProvider } from '@/components/providers/regional-provider'
import { AuthBackground } from '@/components/auth/auth-background'

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
      <div className="relative min-h-screen">
        <AuthBackground />
        {children}
      </div>
    </RegionalProvider>
  )
}
