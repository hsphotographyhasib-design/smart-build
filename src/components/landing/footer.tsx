'use client'

import { useState } from 'react'
import { Github, Twitter, Linkedin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const footerLinks: {
  title: string
  links: { label: string; href: string }[]
}[] = [
  {
    title: 'Products',
    links: [
      { label: 'Project Management', href: '#' },
      { label: 'Finance', href: '#' },
      { label: 'Procurement', href: '#' },
      { label: 'HR', href: '#' },
      { label: 'Labour', href: '#' },
      { label: 'Assets', href: '#' },
      { label: 'Scheduling', href: '#' },
      { label: 'Sales', href: '#' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Construction Companies', href: '#' },
      { label: 'MEP Contractors', href: '#' },
      { label: 'Developers', href: '#' },
      { label: 'Facility Management', href: '#' },
      { label: 'Government', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'Webinars', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Partners', href: '#' },
      { label: 'Legal', href: '#' },
    ],
  },
]

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="w-full bg-black text-gray-300">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold tracking-widest text-white">
              SMARTBUILD
            </h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
              The all-in-one construction management platform that helps teams
              deliver projects on time, on budget, and to the highest standards.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md',
                    'text-gray-400 transition-colors hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                {group.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className={cn(
                        'text-sm text-gray-400 transition-colors hover:text-white'
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter section */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-10 md:flex-row">
          <p className="text-sm text-gray-400">
            Subscribe to our newsletter
          </p>
          <form
            className="flex w-full max-w-md gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'h-10 flex-1 rounded-md border-white/20 bg-white/5 text-sm text-white',
                'placeholder:text-gray-500 focus-visible:ring-[#ff5201]'
              )}
            />
            <Button
              type="submit"
              size="sm"
              className={cn(
                'h-10 bg-[#ff5201] px-6 font-semibold text-white hover:bg-[#e64a01] active:bg-[#cc4101]',
                'rounded-md shadow-none transition-colors shrink-0'
              )}
            >
              Subscribe
            </Button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-gray-500 md:flex-row">
          <p>&copy; 2025 SmartBuild. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </a>
            <span className="text-white/20">|</span>
            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}