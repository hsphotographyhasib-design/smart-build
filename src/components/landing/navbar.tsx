'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  ChevronDown,
  X,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Users,
  Box,
  Layers,
  SquareIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

const solutions = [
  { name: 'Project Management', icon: Briefcase },
  { name: 'Finance', icon: DollarSign },
  { name: 'Procurement', icon: ShoppingCart },
  { name: 'Workforce', icon: Users },
  { name: 'Assets', icon: Box },
  { name: 'Resource Management', icon: Layers },
]

const navItems = ['Solutions', 'Features', 'Pricing', 'Resources', 'About', 'Contact']

export function Navbar({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseEnter = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current)
      dropdownTimeout.current = null
    }
    setDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setDropdownOpen(false)
    }, 150)
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-gray-200/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
            <SquareIcon className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            <div className="absolute inset-0 rounded-md bg-white/10" />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className={`text-lg font-extrabold tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              SMARTBUILD
            </span>
            <span
              className={`text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${
                scrolled ? 'text-orange-500' : 'text-orange-300'
              }`}
            >
              Construction ERP
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) =>
            item === 'Solutions' ? (
              <div
                key={item}
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    scrolled
                      ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl shadow-gray-900/10 border border-gray-100 p-2 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full mb-2 mx-2" />
                      {solutions.map((solution, i) => {
                        const Icon = solution.icon
                        return (
                          <motion.button
                            key={solution.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.15 }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150 text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                              <Icon className="w-4 h-4 text-blue-600" />
                            </div>
                            {solution.name}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                key={item}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {item}
              </button>
            )
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onLogin}
            className={`rounded-lg text-sm font-medium transition-all duration-200 border ${
              scrolled
                ? 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                : 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
            }`}
          >
            Login
          </Button>
          <Button
            className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            Request Demo
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 overflow-y-auto">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <SquareIcon className="w-4 h-4 text-white fill-white" strokeWidth={0} />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-lg font-extrabold tracking-tight text-gray-900">
                      SMARTBUILD
                    </span>
                    <span className="text-[10px] font-medium tracking-widest uppercase text-orange-500">
                      Construction ERP
                    </span>
                  </div>
                </div>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col py-4">
                {/* Solutions with expandable submenu */}
                <div>
                  <button
                    onClick={() => setMobileSubOpen(!mobileSubOpen)}
                    className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-sm font-medium">Solutions</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        mobileSubOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileSubOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-10 pr-6 pb-2">
                          {solutions.map((solution) => {
                            const Icon = solution.icon
                            return (
                              <button
                                key={solution.name}
                                className="w-full flex items-center gap-3 py-2.5 text-sm text-gray-500 hover:text-blue-700 transition-colors"
                              >
                                <Icon className="w-4 h-4" />
                                {solution.name}
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Other nav items */}
                {navItems
                  .filter((item) => item !== 'Solutions')
                  .map((item) => (
                    <button
                      key={item}
                      className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors text-left"
                    >
                      {item}
                    </button>
                  ))}

                <div className="border-t border-gray-100 mt-4 pt-4 px-6 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false)
                      onLogin()
                    }}
                    className="w-full rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </Button>
                  <Button className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md shadow-orange-500/25">
                    Request Demo
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}