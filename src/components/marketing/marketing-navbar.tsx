'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  ChevronDown,
  SquareIcon,
  Building2,
  Wind,
  Warehouse,
  Zap,
  Home,
  Landmark,
  Wrench,
  Settings,
  Briefcase,
  ClipboardList,
  Users,
  DollarSign,
  Smartphone,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'

const byIndustry = [
  { name: 'Construction Companies', href: '/solutions', icon: Building2 },
  { name: 'HVAC Contractors', href: '/solutions', icon: Wind },
  { name: 'Facility Management', href: '/solutions', icon: Warehouse },
  { name: 'Electrical Contractors', href: '/solutions', icon: Zap },
  { name: 'Property Management', href: '/solutions', icon: Home },
  { name: 'Government Projects', href: '/solutions', icon: Landmark },
  { name: 'MEP Contractors', href: '/solutions', icon: Wrench },
  { name: 'Maintenance Companies', href: '/solutions', icon: Settings },
]

const byUseCase = [
  { name: 'Project Management', href: '/solutions', icon: Briefcase },
  { name: 'Maintenance Management', href: '/solutions', icon: ClipboardList },
  { name: 'Resource Planning', href: '/solutions', icon: Users },
  { name: 'Cost Control', href: '/solutions', icon: DollarSign },
  { name: 'Mobile Workforce', href: '/solutions', icon: Smartphone },
  { name: 'Compliance & Safety', href: '/solutions', icon: ShieldCheck },
]

const navLinks = [
  { label: 'Solutions', href: '/solutions', hasDropdown: true },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function MarketingNavbar() {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* লোগো */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
            <SquareIcon className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            <div className="absolute inset-0 rounded-md bg-white/10" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight text-gray-900">
              SMARTBUILD
            </span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-orange-500">
              Construction ERP
            </span>
          </div>
        </Link>

        {/* ডেস্কটপ নেভিগেশন */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) =>
            item.hasDropdown ? (
              <div
                key={item.label}
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50/50'
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* মেগা মেনু ড্রপডাউন */}
                {dropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[640px] bg-white rounded-xl shadow-xl shadow-gray-900/10 border border-gray-100 p-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full mb-5" />
                    <div className="grid grid-cols-2 gap-8">
                      {/* শিল্প অনুযায়ী */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                          By Industry
                        </h3>
                        <ul className="space-y-0.5">
                          {byIndustry.map((item) => {
                            const Icon = item.icon
                            return (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-150"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-orange-500" />
                                  </div>
                                  {item.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>

                      {/* ব্যবহারের ক্ষেত্র অনুযায়ী */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                          By Use Case
                        </h3>
                        <ul className="space-y-0.5">
                          {byUseCase.map((item) => {
                            const Icon = item.icon
                            return (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-150"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-orange-500" />
                                  </div>
                                  {item.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50/50'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* ডেস্কটপ কার্যকলাপ */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="outline"
            asChild
            className="rounded-lg text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Link href="/request-demo">Request Demo</Link>
          </Button>
        </div>

        {/* মোবাইল মেনু */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
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
                {/* সমাধান সহ সঙ্কুচিত সাবমেনু */}
                <Collapsible open={mobileSolutionsOpen} onOpenChange={setMobileSolutionsOpen}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 transition-colors">
                    <span className="text-sm font-medium">Solutions</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        mobileSolutionsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-6 pr-6 pb-2">
                      <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        By Industry
                      </p>
                      {byIndustry.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            {item.name}
                          </Link>
                        )
                      })}

                      <p className="px-3 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        By Use Case
                      </p>
                      {byUseCase.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* অন্যান্য নেভ আইটেম */}
                {navLinks
                  .filter((item) => !item.hasDropdown)
                  .map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`px-6 py-3 text-sm font-medium transition-colors text-left ${
                        isActive(item.href)
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50/50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}

                {/* নিচের বাটন */}
                <div className="border-t border-gray-100 mt-4 pt-4 px-6 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md shadow-orange-500/25"
                  >
                    <Link href="/request-demo">Request Demo</Link>
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