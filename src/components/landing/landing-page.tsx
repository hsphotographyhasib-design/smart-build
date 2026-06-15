'use client'

import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Trust } from '@/components/landing/trust'
import { Features } from '@/components/landing/features'
import { ResourceManagement } from '@/components/landing/resource-management'
import { CostControl } from '@/components/landing/cost-control'
import { MobileApp } from '@/components/landing/mobile-app'
import { WhySmartBuild } from '@/components/landing/why-smartbuild'
import { ROICalculator } from '@/components/landing/roi-calculator'
import { Statistics } from '@/components/landing/statistics'
import { Testimonials } from '@/components/landing/testimonials'
import { ProductShowcase } from '@/components/landing/product-showcase'
import { Integrations } from '@/components/landing/integrations'
import { Security } from '@/components/landing/security'
import { FAQ } from '@/components/landing/faq'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'
import { useAppStore } from '@/lib/store'
import { LoginPage } from '@/components/auth/login-page'
import { useState } from 'react'

export function LandingPage() {
  const { navigate } = useAppStore()
  const [showLogin, setShowLogin] = useState(false)

  const handleLogin = () => {
    setShowLogin(true)
  }

  if (showLogin) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar onLogin={handleLogin} />
      <Hero />
      <Trust />
      <Features />
      <ResourceManagement />
      <CostControl />
      <MobileApp />
      <WhySmartBuild />
      <Statistics />
      <Testimonials />
      <ProductShowcase />
      <ROICalculator />
      <Integrations />
      <Security />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
