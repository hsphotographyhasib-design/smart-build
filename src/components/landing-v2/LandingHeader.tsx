'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Sun, Moon, Menu, ArrowRight, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'Industries', href: '#industries' },
  { label: 'AI', href: '#ai' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '#resources' },
] as const

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="tap-target inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="container-landing flex h-16 items-center justify-between lg:h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 tap-target" aria-label="SmartBuild Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 21L12 3L21 21H3Z" fill="white" fillOpacity="0.9" />
              <path d="M8 21L12 13L16 21" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            SmartBuild
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 tap-target"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tap-target"
          >
            Sign In
          </Link>
          <Button asChild size="sm" className="font-semibold">
            <Link href="#contact">
              Request Demo
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="tap-target inline-flex items-center justify-center rounded-lg p-2 hover:bg-muted transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-orange">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M3 21L12 3L21 21H3Z" fill="white" fillOpacity="0.9" />
                      </svg>
                    </div>
                    <span className="font-display text-base font-bold">SmartBuild</span>
                  </Link>
                  <button onClick={() => setMobileOpen(false)} className="tap-target p-1 rounded-lg hover:bg-muted" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex-1 p-4" aria-label="Mobile navigation">
                  <div className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-3 text-base font-medium text-foreground hover:text-brand-orange rounded-lg hover:bg-muted transition-colors tap-target"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </nav>
                <div className="p-4 border-t border-border space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-muted transition-colors tap-target"
                  >
                    Sign In
                  </Link>
                  <Button asChild className="w-full font-semibold">
                    <Link href="#contact" onClick={() => setMobileOpen(false)}>
                      Request Demo
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
