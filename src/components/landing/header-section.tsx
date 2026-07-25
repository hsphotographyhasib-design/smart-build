'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { fadeInUp } from './motion'
import type { MenuItem } from './types'

interface HeaderSectionProps {
  config: Record<string, unknown>
  menu: MenuItem[]
}

export function HeaderSection({ config, menu }: HeaderSectionProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const navItems = menu.length > 0
    ? menu
    : [
        { id: '1', label: 'Products', url: '#products' },
        { id: '2', label: 'Solutions', url: '#solutions' },
        { id: '3', label: 'Industries', url: '#industries' },
        { id: '4', label: 'Pricing', url: '#pricing' },
        { id: '5', label: 'Company', url: '#company' },
      ]

  const loginLabel = (config.loginLabel as string) || 'Login'
  const ctaLabel = (config.ctaLabel as string) || 'Request Demo'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-lg shadow-brand-navy/20' : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="container-brand flex items-center justify-between h-16 lg:h-[72px]">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-1.5 shrink-0"
          aria-label="SmartBuild Home"
        >
          <span className="font-heading font-bold text-lg text-white">
            SmartBuild<span className="text-brand-gold">.</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="relative px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors tap-target flex items-center gap-1 group"
            >
              {item.label}
              {item.children && item.children.length > 0 && (
                <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-gold rounded-full group-hover:w-3/4 transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            aria-label={loginLabel}
          >
            {loginLabel}
          </Button>
          <Button
            className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-semibold"
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-80 bg-brand-navy border-l border-white/10 p-0"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="font-heading font-bold text-lg text-white">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4" aria-label="Mobile navigation">
                <AnimatePresence>
                  {navItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                    >
                      <a
                        href={item.url}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-6 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span className="font-medium">{item.label}</span>
                        {item.children && item.children.length > 0 && (
                          <ChevronDown className="w-4 h-4 opacity-60" />
                        )}
                      </a>
                      {item.children?.map((child) => (
                        <a
                          key={child.id}
                          href={child.url}
                          onClick={() => setMobileOpen(false)}
                          className="block pl-10 pr-6 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </nav>

              <div className="p-4 border-t border-white/10 space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  aria-label={loginLabel}
                >
                  {loginLabel}
                </Button>
                <Button
                  className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-semibold"
                  aria-label={ctaLabel}
                >
                  {ctaLabel}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
