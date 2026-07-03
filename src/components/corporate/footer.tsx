import Link from "next/link"
import {
  Building2, Phone, Mail, MapPin, Clock, Facebook, Linkedin,
  ArrowUpRight, LogIn, UserCheck, MonitorSmartphone, MessageCircle,
} from "lucide-react"
import { company } from "@/lib/corporate-data"

const footerLinks = {
  services: [
    { label: "General Construction", href: "/services/general-construction" },
    { label: "Civil Engineering", href: "/services/civil-engineering" },
    { label: "Mechanical & Electrical", href: "/services/mechanical-electrical" },
    { label: "Facility Maintenance", href: "/services/facility-maintenance" },
    { label: "Road Works & Drainage", href: "/services/road-works-drainage" },
    { label: "Project Management", href: "/services/project-management" },
    { label: "All Services", href: "/services" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Industries", href: "/industries" },
    { label: "Safety & Quality", href: "/safety" },
    { label: "News & Insights", href: "/news" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  eppm: [
    { label: "Employee Login", href: "/login", icon: LogIn },
    { label: "Client Portal", href: "/login?portal=client", icon: UserCheck },
    { label: "EPPM Login", href: "/login", icon: MonitorSmartphone },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-corp-charcoal text-white">
      {/* Main Footer */}
      <div className="container-corp section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
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
              <a href={company.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-corp-gold flex items-center justify-center transition-all duration-200">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-corp-gold flex items-center justify-center transition-all duration-200">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-corp-gold flex items-center justify-center transition-all duration-200">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-corp-gold mb-5 uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
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

          {/* HJSB EPPM */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-corp-gold mb-5 uppercase tracking-wider">HJSB EPPM</h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Our secure enterprise platform for projects, maintenance, procurement, and client collaboration.
            </p>
            <ul className="space-y-3">
              {footerLinks.eppm.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group flex items-center gap-2 text-sm text-gray-400 hover:text-corp-gold transition-colors">
                    <link.icon className="w-4 h-4 text-corp-gold/70" />
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
              <li>
                <a href={company.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <MapPin className="w-4 h-4 text-corp-gold mt-0.5 shrink-0" />
                  <span>{company.address}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-corp-gold shrink-0" />
                  <span>{company.phone}</span>
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4 text-corp-gold shrink-0" />
                  <span>WhatsApp Us</span>
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
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
