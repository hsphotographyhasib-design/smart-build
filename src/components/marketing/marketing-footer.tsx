'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, SquareIcon, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const productLinks = [
  { label: 'Project Management', href: '/features/project-management' },
  { label: 'Finance', href: '/features/finance' },
  { label: 'Procurement', href: '/features/procurement' },
  { label: 'HR Management', href: '/features/hr' },
  { label: 'Resource Management', href: '/features/resource-management' },
  { label: 'Asset Management', href: '/features/asset-management' },
  { label: 'Client Portal', href: '/features/client-portal' },
]

const solutionLinks = [
  { label: 'Construction Companies', href: '/solutions' },
  { label: 'Facility Management', href: '/solutions' },
  { label: 'HVAC Contractors', href: '/solutions' },
  { label: 'MEP Contractors', href: '/solutions' },
  { label: 'Government', href: '/solutions' },
]

const resourceLinks = [
  { label: 'Documentation', href: '/documentation' },
  { label: 'API Reference', href: '/documentation' },
  { label: 'Blog', href: '/blog' },
  { label: 'Case Studies', href: '/resources' },
  { label: 'Support', href: '/support' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
  { label: 'Partners', href: '/partners' },
  { label: 'Press', href: '/about' },
]

const mobileSections = [
  { title: 'Products', links: productLinks },
  { title: 'Solutions', links: solutionLinks },
  { title: 'Resources', links: resourceLinks },
  { title: 'Company', links: companyLinks },
]

export function MarketingFooter() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main grid - 5 columns on lg, stacked on mobile */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <SquareIcon className="w-4 h-4 text-white fill-white" strokeWidth={0} />
                <div className="absolute inset-0 rounded-md bg-white/10" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white">
                SMARTBUILD
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              The all-in-one construction management platform built for modern
              teams. Streamline projects, finances, and resources.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Products - desktop */}
          <div className="hidden lg:block">
            <h4 className="text-sm font-semibold text-white">Products</h4>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-orange-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions - desktop */}
          <div className="hidden lg:block">
            <h4 className="text-sm font-semibold text-white">Solutions</h4>
            <ul className="mt-4 space-y-2.5">
              {solutionLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-orange-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources - desktop */}
          <div className="hidden lg:block">
            <h4 className="text-sm font-semibold text-white">Resources</h4>
            <ul className="mt-4 space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-orange-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company - desktop */}
          <div className="hidden lg:block">
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-orange-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile collapsible sections */}
          {mobileSections.map((section) => (
            <div key={section.title} className="lg:hidden">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between text-sm font-semibold text-white"
              >
                {section.title}
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                    openSections[section.title] ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSections[section.title] && (
                <ul className="mt-3 space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 transition-colors hover:text-orange-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-400">
            Subscribe to our newsletter for the latest updates.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-sm items-center gap-2"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-10 border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:border-orange-500 focus-visible:ring-orange-500/20"
            />
            <Button
              type="submit"
              className="h-10 shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-5 text-white font-medium shadow-md shadow-orange-500/20"
            >
              Subscribe
            </Button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-8 text-sm text-gray-500 sm:flex-row">
          <p>&copy; 2025 SmartBuild. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-gray-300"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-700">|</span>
            <Link
              href="/terms-of-service"
              className="transition-colors hover:text-gray-300"
            >
              Terms of Service
            </Link>
            <span className="text-gray-700">|</span>
            <Link
              href="/cookie-policy"
              className="transition-colors hover:text-gray-300"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}