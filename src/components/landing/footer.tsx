'use client'

import { Github, Twitter, Linkedin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const columns = [
  {
    title: 'Products',
    links: [
      'Project Management',
      'Finance',
      'Procurement',
      'HR',
      'Labour',
      'Assets',
      'Scheduling',
      'Sales',
    ],
  },
  {
    title: 'Solutions',
    links: [
      'Construction Companies',
      'MEP Contractors',
      'Developers',
      'Facility Management',
      'Government',
    ],
  },
  {
    title: 'Resources',
    links: [
      'Documentation',
      'API Reference',
      'Blog',
      'Case Studies',
      'Webinars',
      'Help Center',
    ],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact', 'Press', 'Partners', 'Legal'],
  },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <h3 className="text-xl font-bold tracking-wider text-white">
              SMARTBUILD
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              The all-in-one construction management platform built for modern
              teams.
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

          {/* Link columns */}
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-white">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
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
              className="h-10 border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
            />
            <Button
              type="submit"
              className="h-10 shrink-0 bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              Subscribe
            </Button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-8 text-sm text-gray-500 sm:flex-row">
          <p>&copy; 2024 SmartBuild. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="transition-colors hover:text-gray-300">
              Privacy Policy
            </a>
            <span className="text-gray-700">|</span>
            <a href="#" className="transition-colors hover:text-gray-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}