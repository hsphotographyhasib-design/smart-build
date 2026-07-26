'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'Industries', href: '#industries' },
  { label: 'AI', href: '#ai' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
] as const

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/50 bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 tap-target"
          aria-label="SmartBuild Home"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-orange"
            aria-hidden="true"
          />
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            SmartBuild
          </span>
        </Link>

        {/* Desktop nav */
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */
        <div className="flex items-center gap-2">
          {/* Theme toggle — only show when mounted to avoid hydration mismatch */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="tap-target relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <Sun className="h-4 w-4 scale-100 dark:scale-0 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:scale-100" />
              <span className="sr-only">
                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </span>
            </button>
          )}

          {/* Sign In */}
          <Link
            href="#sign-in"
            className="hidden sm:inline-flex tap-target items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-md"
            aria-label="Sign in to SmartBuild"
          >
            Sign In
          </Link>

          {/* Request Demo CTA */}
          <Button
            asChild
            href="#demo"
            className="bg-brand-orange text-white hover:bg-brand-orange-dark font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Request Demo
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpen={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="lg:hidden tap-target relative flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </button>
            </SheetTrigger>
            <SheetContent
              id="mobile-nav"
              className="w-80 bg-background p-6 pt-2"
              onClose={closeMobile}
            >
              <SheetClose
                className="mb-6 ml-auto"
                aria-label="Close navigation menu"
              />
              <AnimatePresence>
                <motion.nav
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="flex flex-col gap-1"
                >
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMobile}
                        className="block rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
                        aria-label={link.label}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  <div className="mt-4 border-t border-border pt-4">
                    <Link
                      href="#sign-in"
                      onClick={closeMobile}
                      className="block rounded-lg px-4 py-3 text-center text-sm font-medium text-brand-orange hover:bg-brand-orange/10 transition-colors"
                      aria-label="Sign in to SmartBuild"
                    >
                      Sign In
                    </Link>
                    <Button
                      asChild
                      href="#demo"
                      className="mt-3 w-full bg-brand-orange text-white hover:bg-brand-orange-dark font-medium transition-colors"
                      aria-label="Request a demo"
                    >
                      Request Demo
                    </Button>
                  </div>
                </motion.nav>
              </AnimatePresence>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
