import Link from "next/link"
import { Building2, Phone, Mail, MapPin, Clock, Facebook, Linkedin, ArrowUpRight } from "lucide-react"
import { company } from "@/lib/corporate-data"

const footerLinks = {
  services: [
    { label: "General Construction", href: "/services/general-construction" },
    { label: "Architectural Design", href: "/services/architectural-design" },
    { label: "Project Management", href: "/services/project-management" },
    { label: "Renovation & Remodeling", href: "/services/renovation-remodeling" },
    { label: "Infrastructure Development", href: "/services/infrastructure-development" },
    { label: "Green Building", href: "/services/green-building" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Industries", href: "/industries" },
    { label: "Products", href: "/products" },
    { label: "Safety & Quality", href: "/safety" },
    { label: "Careers", href: "/careers" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-corp-charcoal text-white">
      {/* Main Footer */}
      <div className="container-corp section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-lg bg-corp-green flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-heading font-bold text-white text-sm leading-tight">{company.shortName}</div>
                <div className="text-[10px] text-corp-gold tracking-widest uppercase">{company.tagline}</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {company.description}
            </p>
            <div className="flex items-center gap-3">
              <a href={company.social.facebook} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-corp-gold flex items-center justify-center transition-all duration-200">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-corp-gold flex items-center justify-center transition-all duration-200">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-corp-gold mb-5 uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-corp-gold mb-5 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-corp-gold mb-5 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-corp-gold mt-0.5 shrink-0" />
                <span>{company.address}</span>
              </li>
              <li>
                <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-corp-gold shrink-0" />
                  <span>{company.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-corp-gold shrink-0" />
                  <span>{company.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Clock className="w-4 h-4 text-corp-gold mt-0.5 shrink-0" />
                <span>{company.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-corp flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/about" className="hover:text-gray-300 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
