"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Phone, Building2 } from "lucide-react"
import { company } from "@/lib/corporate-data"

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  const navItems = [
    { label: "Home", href: "/" },
    {
      label: "About Us",
      href: "/about",
      dropdown: [
        { label: "Our Story", href: "/about" },
        { label: "Leadership", href: "/about#leadership" },
        { label: "Mission & Vision", href: "/about#mission" },
      ],
    },
    {
      label: "Services",
      href: "/services",
      dropdown: [
        { label: "General Construction", href: "/services/general-construction" },
        { label: "Architectural Design", href: "/services/architectural-design" },
        { label: "Project Management", href: "/services/project-management" },
        { label: "Renovation & Remodeling", href: "/services/renovation-remodeling" },
        { label: "Infrastructure Development", href: "/services/infrastructure-development" },
        { label: "Green Building", href: "/services/green-building" },
      ],
    },
    { label: "Projects", href: "/projects" },
    { label: "Industries", href: "/industries" },
    { label: "Products", href: "/products" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-dark shadow-lg"
            : "bg-transparent"
        }`}
      >
        {/* Top Bar */}
        <div className={`hidden lg:flex items-center justify-between px-6 py-1.5 text-xs transition-all duration-300 ${
          scrolled ? "h-0 opacity-0 overflow-hidden py-0" : "border-b border-white/10"
        }`}>
          <div className="flex items-center gap-4 text-white/70">
            <span>{company.address}</span>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <a href={`tel:${company.phone}`} className="hover:text-corp-gold transition-colors">{company.phone}</a>
            <a href={`mailto:${company.email}`} className="hover:text-corp-gold transition-colors">{company.email}</a>
            <span>{company.hours}</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex items-center justify-between px-4 lg:px-8 py-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-corp-green flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-heading font-bold text-white text-sm lg:text-base leading-tight">
                {company.shortName}
              </div>
              <div className="text-[10px] lg:text-xs text-corp-gold tracking-widest uppercase">
                {company.tagline}
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.href}
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
                  {item.dropdown && <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                </Link>
                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="py-2">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-corp-green/5 hover:text-corp-green transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden lg:inline-flex items-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-corp-gold/20"
            >
              <Phone className="w-4 h-4" />
              Request a Quote
            </Link>
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute top-16 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.href}>
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
                    {item.dropdown?.map((sub) => (
                      <Link
                        key={sub.href}
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
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <a href={`tel:${company.phone}`} className="block px-4 py-2.5 text-sm text-gray-600 hover:text-corp-green">
                  {company.phone}
                </a>
                <a href={`mailto:${company.email}`} className="block px-4 py-2.5 text-sm text-gray-600 hover:text-corp-green">
                  {company.email}
                </a>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center bg-corp-gold text-white px-4 py-3 rounded-xl text-sm font-semibold"
                >
                  Request a Quote
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
