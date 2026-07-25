'use client';

import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { MenuItem } from './types';

interface FooterSectionProps {
  config: Record<string, any>;
  menu?: MenuItem[];
}

export function FooterSection({ config, menu }: FooterSectionProps) {
  const company = config?.company || 'SmartBuild';
  const tagline = config?.tagline || 'The all-in-one enterprise construction management platform.';
  const copyright = config?.copyright || '© 2025 SmartBuild Technologies, Inc. All rights reserved.';
  const address = config?.address || '350 Fifth Avenue, Suite 4200, New York, NY 10118';
  const email = config?.email || 'hello@smartbuild.io';
  const phone = config?.phone || '+1 (800) 555-0199';

  const columns = [
    {
      heading: 'Products',
      links: [
        { label: 'Project Management', url: '#' },
        { label: 'Resource Planning', url: '#' },
        { label: 'Financial Tracking', url: '#' },
        { label: 'Field Operations', url: '#' },
        { label: 'Safety & Compliance', url: '#' },
      ],
    },
    {
      heading: 'Solutions',
      links: [
        { label: 'General Contractors', url: '#' },
        { label: 'Specialty Contractors', url: '#' },
        { label: 'Commercial', url: '#' },
        { label: 'Residential', url: '#' },
        { label: 'Infrastructure', url: '#' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Blog', url: '#' },
        { label: 'Case Studies', url: '#' },
        { label: 'Documentation', url: '#' },
        { label: 'Webinars', url: '#' },
        { label: 'Help Center', url: '#' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us', url: '#' },
        { label: 'Careers', url: '#' },
        { label: 'Press', url: '#' },
        { label: 'Contact', url: '#' },
        { label: 'Partners', url: '#' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy', url: '#' },
        { label: 'Terms of Service', url: '#' },
        { label: 'Cookie Policy', url: '#' },
        { label: 'Security', url: '#' },
        { label: 'GDPR', url: '#' },
      ],
    },
  ];

  const socials = [
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
  ];

  return (
    <footer className="bg-[#0B2345] text-white">
      <div className="container-brand section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {columns.map((col) => (
            <div key={col.heading} className="col-span-1">
              <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url}
                      className="font-body text-sm text-white/60 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        <div className="mt-16 border-t border-white/10 pt-10">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-heading text-2xl font-bold text-white">{company}</h3>
              <p className="mt-2 max-w-sm font-body text-sm text-white/50">{tagline}</p>
              <p className="mt-4 font-body text-xs text-white/40">{copyright}</p>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-6">
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1.5 font-body text-xs text-white/50 transition-colors hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </a>
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 font-body text-xs text-white/50 transition-colors hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {phone}
                </a>
                <span className="inline-flex items-center gap-1.5 font-body text-xs text-white/50">
                  <MapPin className="h-3.5 w-3.5" />
                  {address}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 lg:items-end">
              <div className="flex items-center gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all duration-200 hover:border-[#F5A623]/50 hover:bg-[#F5A623]/10 hover:text-[#F5A623]"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>

              <div className="w-full max-w-xs lg:max-w-none">
                <p className="mb-3 font-heading text-sm font-semibold text-white/80">
                  Subscribe to our newsletter
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-10 border-white/10 bg-white/5 font-body text-sm text-white placeholder:text-white/30 focus:border-[#F5A623]/50 focus:ring-[#F5A623]/20"
                  />
                  <Button
                    size="sm"
                    className="h-10 flex-shrink-0 bg-[#F5A623] font-body text-sm font-semibold text-white hover:bg-[#F5A623]/90"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
