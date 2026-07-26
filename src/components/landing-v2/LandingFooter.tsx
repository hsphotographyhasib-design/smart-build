'use client'

import Link from 'next/link'
import { 
  Building2, Twitter, Linkedin, Youtube, Mail 
} from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Project Management', href: '#features' },
    { label: 'Scheduling', href: '#features' },
    { label: 'Cost Management', href: '#features' },
    { label: 'Document Control', href: '#features' },
    { label: 'HSE Management', href: '#features' },
    { label: 'AI & Analytics', href: '#ai' },
  ],
  Solutions: [
    { label: 'Commercial', href: '#industries' },
    { label: 'Infrastructure', href: '#industries' },
    { label: 'Healthcare', href: '#industries' },
    { label: 'Aviation', href: '#industries' },
    { label: 'Residential', href: '#industries' },
    { label: 'Energy', href: '#industries' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '#contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Case Studies', href: '#resources' },
    { label: 'Webinars', href: '#' },
    { label: 'Support', href: '#' },
  ],
} as const

export function LandingFooter() {
  return (
    <footer className="bg-brand-navy text-slate-400" role="contentinfo">
      <div className="container-landing py-14 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4" aria-label="SmartBuild Home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 21L12 3L21 21H3Z" fill="white" fillOpacity="0.9" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold text-white">SmartBuild</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Enterprise project portfolio management for construction, maintenance, and facility operations.
            </p>
            {/* Socials */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Youtube, label: 'YouTube' },
                { icon: Mail, label: 'Email' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors tap-target"
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-display text-sm font-semibold text-white mb-4">{heading}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors tap-target inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-landing py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>&copy; {new Date().getFullYear()} SmartBuild Technologies. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
