"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Phone, Mail, Search, Building2, LogIn, UserCheck, MonitorSmartphone } from "lucide-react"
import { company } from "@/lib/corporate-data"

const portalLinks = [
  { label: "Employee Login", href: "/login", icon: LogIn },
  { label: "Client Portal", href: "/login?portal=client", icon: UserCheck },
  { label: "EPPM Login", href: "/login", icon: MonitorSmartphone },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  const navItems: {
    label: string
    href: string
    dropdown?: { label: string; href: string }[]
    wide?: boolean
  }[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
      label: "Services",
      href: "/services",
      dropdown: company.services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
      wide: true,
    },
    { label: "Industries", href: "/industries" },
    { label: "Projects", href: "/projects" },
    {
      label: "Resources",
      href: "#",
      dropdown: [
        { label: "News & Insights", href: "/news" },
        { label: "Safety & Quality", href: "/safety" },
        { label: "Gallery", href: "/gallery" },
        { label: "Products", href: "/products" },
      ],
    },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className={`hidden lg:block transition-all duration-300 ${
        scrolled ? "h-0 overflow-hidden opacity-0" : "h-auto opacity-100"
      }`}>
        <div className="bg-corp-charcoal border-b border-white/5">
          <div className="container-corp flex items-center justify-between py-2.5">
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <a href={`mailto:${company.email}`} className="flex items-center gap-1.5 hover:text-corp-gold transition-colors">
                <Mail className="w-3.5 h-3.5" /> {company.email}
              </a>
              <a href={`tel:${company.phone}`} className="flex items-center gap-1.5 hover:text-corp-gold transition-colors">
                <Phone className="w-3.5 h-3.5" /> {company.phone}
              </a>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-400">
              {portalLinks.map((portal) => (
                <Link key={portal.label} href={portal.href} className="flex items-center gap-1.5 hover:text-corp-gold transition-colors">
                  <portal.icon className="w-3.5 h-3.5" /> {portal.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-corp-charcoal/95 backdrop-blur-lg shadow-lg"
          : "lg:top-[41px] bg-corp-charcoal/80 backdrop-blur-sm"
      }`}>
        <div className="container-corp">
          <div className="flex items-center justify-between py-3 lg:py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-corp-green to-corp-green-dark flex items-center justify-center shadow-lg shadow-corp-green/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-heading font-bold text-white text-base lg:text-lg leading-tight tracking-tight">
                  {company.shortName}
                </div>
                <div className="text-[10px] lg:text-xs text-corp-gold tracking-[0.15em] uppercase font-medium">
                  {company.tagline}
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? "text-corp-gold bg-white/10"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                    {item.dropdown && item.dropdown.length > 0 && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>
                  {item.dropdown && item.dropdown.length > 0 && (
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className={`absolute top-full left-0 mt-1 rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden ${
                            item.wide ? "w-[34rem]" : "w-56"
                          }`}
                        >
                          <div className={item.wide ? "py-2 grid grid-cols-2" : "py-2"}>
                            {item.dropdown.map((sub) => (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-corp-green/5 hover:text-corp-green transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              <Link
                href="/login"
                className="hidden xl:inline-flex items-center gap-2 border border-white/20 hover:border-corp-gold/60 hover:text-corp-gold text-white/90 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                EPPM Login
              </Link>
              <Link
                href="/contact"
                className="hidden lg:inline-flex items-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-corp-gold/20 hover:shadow-corp-gold/30"
              >
                <Phone className="w-4 h-4" />
                Request Quotation
              </Link>
              <button
                aria-label="Open menu"
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <div className="w-full max-w-2xl px-6" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services, projects, news..."
                  aria-label="Search the website"
                  className="w-full bg-white rounded-2xl px-6 py-5 text-lg text-gray-900 placeholder-gray-400 outline-none shadow-2xl"
                  autoFocus
                />
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-corp-green" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-5">
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 ml-auto mb-4"
                >
                  <X className="w-5 h-5" />
                </button>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <div key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? "bg-corp-green/10 text-corp-green"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                      {item.label === "Resources" && item.dropdown?.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="block pl-8 pr-4 py-2.5 text-sm text-gray-500 hover:text-corp-green transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                  <div className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">HJSB EPPM Platform</div>
                  {portalLinks.map((portal) => (
                    <Link
                      key={portal.label}
                      href={portal.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-corp-green/5 hover:text-corp-green transition-colors"
                    >
                      <portal.icon className="w-4 h-4 text-corp-gold" /> {portal.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <a href={`tel:${company.phone}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-corp-green">
                    <Phone className="w-4 h-4 text-corp-gold" /> {company.phone}
                  </a>
                  <a href={`mailto:${company.email}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-corp-green">
                    <Mail className="w-4 h-4 text-corp-gold" /> {company.email}
                  </a>
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center bg-corp-gold text-white px-4 py-3.5 rounded-xl text-sm font-semibold mt-4"
                  >
                    Request Quotation
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
