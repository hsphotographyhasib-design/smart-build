"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, ChevronRight, Building2, CheckCircle, Phone, Mail,
  Quote, Star, Plus, Minus, ChevronLeft, Award, Users, Clock, Leaf,
  HardHat, ShieldCheck, Brain, Truck, Heart, Landmark, Building,
  Factory, Home, Hotel, HeartPulse, GraduationCap, Route, Fuel,
  PlugZap, BadgeCheck, Search, AlertTriangle, FileCheck, KanbanSquare,
  CalendarClock, Gavel, Wrench, ClipboardList, QrCode, Boxes,
  ShoppingCart, Wallet, BarChart3, UserCheck, LogIn, MonitorSmartphone,
  CalendarCheck, LucideIcon,
} from "lucide-react"
import { company } from "@/lib/corporate-data"
import StatCounter from "@/components/corporate/stat-counter"
import ServiceCard from "@/components/corporate/service-card"
import ProjectCard from "@/components/corporate/project-card"
import SectionHeader from "@/components/corporate/section-header"

const iconMap: Record<string, LucideIcon> = {
  Landmark, Building, Factory, Home, Hotel, HeartPulse, GraduationCap,
  Route, Fuel, PlugZap, Brain, Award, ShieldCheck, Users, Truck, Clock,
  Heart, Leaf, BadgeCheck, Search, AlertTriangle, FileCheck, KanbanSquare,
  CalendarClock, Gavel, Wrench, ClipboardList, QrCode, Boxes, ShoppingCart,
  Wallet, BarChart3, UserCheck, HardHat,
}

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1920&q=70",
    tagline: "Trusted Government & Private-Sector Contractor",
    title: "Building Brunei's Future with Engineering Excellence",
    subtitle: company.hero.subheadline,
  },
  {
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=70",
    tagline: "Construction · Engineering · Infrastructure",
    title: "Quality Construction You Can Trust",
    subtitle: "From government complexes to luxury residences and large-scale infrastructure — we deliver excellence every time.",
  },
  {
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1920&q=70",
    tagline: "Powered by HJSB EPPM",
    title: "Digitally Managed. Professionally Delivered.",
    subtitle: "Every project is planned, tracked, and delivered through our integrated Enterprise Project Portfolio Management platform.",
  },
]

const faqs = [
  {
    q: "What types of projects does Hasanur Jaya undertake?",
    a: "We handle a wide range of projects including government buildings, luxury residential villas, commercial buildings, infrastructure development (roads, drainage, bridges), renovations, steel structures, and industrial facilities across government, private, and hospitality sectors.",
  },
  {
    q: "How long has Hasanur Jaya been in business?",
    a: "Hasanur Jaya Sdn Bhd has been operating in Brunei since 1995, bringing three decades of experience in the construction and development industry.",
  },
  {
    q: "What areas does Hasanur Jaya serve?",
    a: "We are based in Bandar Seri Begawan, Brunei, and serve clients throughout Brunei Darussalam, including Kuala Belait, Seria, Gadong, Muara, and all other districts.",
  },
  {
    q: "What is HJSB EPPM and how do I access it?",
    a: "HJSB EPPM is our Enterprise Project Portfolio Management platform — the secure digital system our employees, clients, and consultants use to manage projects, maintenance, work orders, and finance. Employees and clients can sign in via the Employee Login and Client Portal links at the top of this website.",
  },
  {
    q: "What certifications and safety standards do you follow?",
    a: "We strictly comply with Brunei's Workplace Safety and Health regulations. Our safety policies include comprehensive risk assessments, regular training, zero-harm philosophy, and continuous monitoring, backed by rigorous quality assurance processes.",
  },
  {
    q: "How can I request a quotation for my project?",
    a: `You can request a free quotation by contacting us via phone at ${company.phone}, email at ${company.email}, or by filling out the contact form on our website. Our team will respond promptly to discuss your project needs.`,
  },
]

const testimonials = [
  {
    name: "Awang Haji Metussin",
    role: "Government Project Director",
    content: "Hasanur Jaya delivered our infrastructure project ahead of schedule with exceptional quality. Their professionalism and attention to safety standards were outstanding.",
    rating: 5,
  },
  {
    name: "Dayang Norhayati",
    role: "Private Homeowner",
    content: "We entrusted Hasanur Jaya with building our family home. The team was communicative, transparent, and the result exceeded our expectations. Truly a pleasure to work with.",
    rating: 5,
  },
  {
    name: "Pengiran Ahmad",
    role: "Commercial Developer",
    content: "For our commercial development, we needed a contractor who understood both design aesthetics and structural integrity. Hasanur Jaya delivered on both fronts. Highly recommended.",
    rating: 5,
  },
]

const blogPosts = [
  {
    title: "The Future of Sustainable Construction in Brunei",
    excerpt: "Exploring how green building practices are shaping the future of construction in Brunei Darussalam.",
    date: "Jan 15, 2026",
    category: "Sustainability",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=70",
  },
  {
    title: "How HJSB EPPM Digitizes Project Delivery",
    excerpt: "A look inside the enterprise platform that gives our clients real-time visibility of schedule, cost, and quality.",
    date: "Dec 10, 2025",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=70",
  },
  {
    title: "Understanding Waterproofing Solutions for Tropical Climates",
    excerpt: "Why proper waterproofing is critical for buildings in Brunei's tropical climate and how to choose the right system.",
    date: "Nov 5, 2025",
    category: "Materials",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=70",
  },
]

function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-corp-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroSlides[current].image})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-corp-charcoal/95 via-corp-charcoal/75 to-corp-charcoal/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-corp-charcoal via-transparent to-corp-charcoal/60" />

      <div className="relative container-corp w-full flex-1 flex items-center pt-36 pb-12 lg:pt-44">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${current}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.25em] uppercase mb-6 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-corp-gold/20">
              {heroSlides[current].tagline}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] mb-6">
              {heroSlides[current].title}
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
              {heroSlides[current].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-xl shadow-corp-gold/25 hover:shadow-2xl hover:shadow-corp-gold/30 hover:-translate-y-0.5"
              >
                Request a Quotation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/25 hover:border-white/50 bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
              >
                View Our Projects
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-corp-gold/40 hover:border-corp-gold bg-corp-gold/10 backdrop-blur-sm text-corp-gold px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
              >
                <LogIn className="w-5 h-5" />
                Access HJSB EPPM
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-40 lg:bottom-44 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? "w-10 bg-corp-gold" : "w-3 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
      <button
        aria-label="Previous slide"
        onClick={() => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all hidden lg:flex"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => setCurrent((prev) => (prev + 1) % heroSlides.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all hidden lg:flex"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* KPI Counter Band */}
      <div className="relative container-corp pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 px-6 py-8 lg:px-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4"
        >
          {company.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-3xl lg:text-4xl font-bold text-corp-gold mb-1">
                <StatCounter value={stat.value} suffix={stat.suffix} label="" />
              </div>
              <div className="text-xs lg:text-sm font-medium text-gray-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-corp">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <div
                className="aspect-[4/3] rounded-2xl bg-cover bg-center overflow-hidden border border-gray-200 shadow-lg"
                style={{ backgroundImage: "url(https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=70)" }}
                role="img"
                aria-label="Hasanur Jaya engineers reviewing construction plans on site"
              />
              <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-corp-green text-white rounded-2xl px-6 py-5 shadow-xl">
                <div className="font-heading text-3xl font-bold">{company.yearsInBusiness}+</div>
                <div className="text-xs uppercase tracking-wider text-white/80">Years of Excellence</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              About Our Company
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-corp-charcoal leading-tight mb-6">
              Brunei&apos;s Trusted Partner in <span className="text-corp-green">Construction &amp; Engineering</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {company.about.history}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {company.about.values.slice(0, 4).map((value) => (
                <div key={value.title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-corp-green mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-corp-charcoal text-sm">{value.title}</div>
                    <div className="text-xs text-gray-500">{value.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 bg-corp-green hover:bg-corp-green-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
            >
              Learn More About Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section className="section-padding bg-corp-offwhite">
      <div className="container-corp">
        <SectionHeader
          label="Our Services"
          title="What We Offer"
          description="Comprehensive construction, engineering, and maintenance services delivered with engineering excellence."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {company.services.slice(0, 6).map((service, i) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.shortDesc}
              icon={service.icon}
              slug={service.slug}
              image={service.image}
              index={i}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 bg-corp-green hover:bg-corp-green-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            View All {company.services.length} Services <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function IndustriesSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-corp">
        <SectionHeader
          label="Industries We Serve"
          title="Expertise Across Every Sector"
          description="From government infrastructure to oil & gas support facilities, we deliver for every industry in Brunei."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {company.industries.map((industry, i) => {
            const Icon = iconMap[industry.icon] ?? Building2
            return (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href="/industries"
                  className="group flex flex-col items-center text-center rounded-2xl border border-gray-200 bg-white p-6 h-full hover:border-corp-green/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-4 group-hover:bg-corp-green group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-heading font-bold text-sm text-corp-charcoal group-hover:text-corp-green transition-colors">
                    {industry.name}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("All")
  const filters = ["All", "Completed", "Ongoing"]
  const projects = activeFilter === "All"
    ? company.projects
    : company.projects.filter((p) => p.status === activeFilter)

  return (
    <section className="section-padding bg-corp-offwhite">
      <div className="container-corp">
        <SectionHeader
          label="Our Portfolio"
          title="Featured Projects"
          description="Showcasing our commitment to quality, innovation, and precision in every project we deliver."
        />

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeFilter === cat
                  ? "bg-corp-green text-white shadow-lg shadow-corp-green/20"
                  : "bg-white text-gray-600 hover:bg-corp-green/10 hover:text-corp-green border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} {...project} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 bg-corp-green hover:bg-corp-green-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function WhyChooseUsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-corp">
        <SectionHeader
          label="Why Choose Us"
          title="Built on Excellence, Driven by Integrity"
          description="What sets Hasanur Jaya apart as Brunei's contractor of choice."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {company.whyChooseUs.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Award
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-4 group-hover:bg-corp-green group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-base font-bold text-corp-charcoal mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SafetyQualitySection() {
  return (
    <section className="relative section-padding overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=60)" }}
      />
      <div className="absolute inset-0 bg-corp-charcoal/92" style={{ backgroundColor: "rgba(26,26,46,0.93)" }} />
      <div className="container-corp relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Safety &amp; Quality
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Zero Harm. <span className="text-corp-gold">Uncompromising Quality.</span>
          </h2>
          <p className="text-gray-300 leading-relaxed">{company.safety.commitment}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {company.safety.pillars.map((pillar, i) => {
            const Icon = iconMap[pillar.icon] ?? ShieldCheck
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-corp-gold/15 text-corp-gold flex items-center justify-center mb-4">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-heading text-base font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            )
          })}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/safety"
            className="inline-flex items-center gap-2 border-2 border-corp-gold/50 hover:border-corp-gold text-corp-gold px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            Explore Our HSE Commitment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section className="section-padding bg-corp-offwhite">
      <div className="container-corp">
        <SectionHeader
          label="Our Process"
          title="From Consultation to After Sales Support"
          description="A proven, transparent delivery process — every step managed digitally through HJSB EPPM."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {company.process.map((phase, i) => (
            <motion.div
              key={phase.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-2xl bg-white border border-gray-200 p-5 text-center hover:border-corp-green/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-corp-green text-white font-heading font-bold text-sm flex items-center justify-center mx-auto mb-3">
                {i + 1}
              </div>
              <div className="font-heading font-bold text-sm text-corp-charcoal mb-1.5">{phase.step}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{phase.description}</p>
              {i < company.process.length - 1 && (
                <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 w-4 h-4 text-corp-gold z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EppmSection() {
  return (
    <section id="eppm" className="relative section-padding overflow-hidden bg-corp-charcoal">
      <div className="absolute inset-0 bg-gradient-to-br from-corp-green-dark/40 via-corp-charcoal to-corp-charcoal" />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="container-corp relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-corp-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4 bg-white/5 px-4 py-2 rounded-full border border-corp-gold/20">
              <MonitorSmartphone className="w-4 h-4" /> {company.eppm.name}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              {company.eppm.title}
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              {company.eppm.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-corp-gold/20"
              >
                <LogIn className="w-4 h-4" /> Employee Login
              </Link>
              <Link
                href="/login?portal=client"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300"
              >
                <UserCheck className="w-4 h-4" /> Client Portal
              </Link>
              <Link
                href="/services/project-management"
                className="inline-flex items-center justify-center gap-2 text-corp-gold hover:text-corp-gold-light px-4 py-3.5 text-sm font-semibold transition-all duration-300"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative hidden lg:block"
          >
            <div
              className="aspect-[4/3] rounded-2xl bg-cover bg-center border border-white/10 shadow-2xl"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=70)" }}
              role="img"
              aria-label="Project planning documents and dashboards"
            />
            <div className="absolute -bottom-5 -left-5 bg-corp-green text-white rounded-2xl px-5 py-4 shadow-xl border border-white/10">
              <div className="font-heading text-xl font-bold">One Platform</div>
              <div className="text-xs text-white/70">Projects · Maintenance · Finance</div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {company.eppm.features.map((feature, i) => {
            const Icon = iconMap[feature.icon] ?? KanbanSquare
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="rounded-2xl bg-white/[0.05] backdrop-blur-sm border border-white/10 p-5 hover:bg-white/10 hover:border-corp-gold/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-corp-gold/15 text-corp-gold flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-heading font-bold text-sm text-white mb-1">{feature.title}</div>
                <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ClientsSection() {
  return (
    <section className="py-16 lg:py-20 bg-white border-y border-gray-100">
      <div className="container-corp">
        <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-8">
          Trusted by Government Agencies, Developers &amp; Consultants
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {company.clients.map((client) => (
            <div
              key={client}
              className="font-heading font-semibold text-sm lg:text-base text-gray-400 hover:text-corp-green transition-colors"
            >
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="section-padding bg-corp-offwhite">
      <div className="container-corp">
        <SectionHeader
          label="Testimonials"
          title="What Our Clients Say"
          description="Hear from our satisfied clients about their experience working with Hasanur Jaya."
        />
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-8 lg:p-12 shadow-lg">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-corp-green/10" />
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-corp-gold text-corp-gold" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-8 italic">
                  &ldquo;{testimonials[active].content}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-corp-green to-corp-charcoal flex items-center justify-center text-white font-bold text-sm">
                    {testimonials[active].name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-corp-charcoal">{testimonials[active].name}</div>
                    <div className="text-sm text-gray-500">{testimonials[active].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "w-8 bg-corp-green" : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="container-corp">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              FAQ
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-corp-charcoal leading-tight mb-6">
              Frequently Asked <span className="text-corp-green">Questions</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Find answers to common questions about our services, process, and how we work with our clients.
            </p>
            <div className="hidden lg:flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-corp-gold" />
                {company.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-corp-gold" />
                {company.email}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-300 ${
                  openIndex === i ? "border-corp-green bg-corp-green/5" : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex items-center justify-between w-full px-6 py-4 text-left"
                >
                  <span className="font-semibold text-corp-charcoal text-sm">{faq.q}</span>
                  <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    openIndex === i ? "bg-corp-green text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {openIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function BlogSection() {
  return (
    <section className="section-padding bg-corp-offwhite">
      <div className="container-corp">
        <SectionHeader
          label="News & Insights"
          title="Latest From Hasanur Jaya"
          description="Company news, project milestones, safety campaigns, and industry insights."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {blogPosts.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <Link href="/news" className="block">
                <div
                  className="aspect-[16/9] bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500"
                  style={{ backgroundImage: `url(${post.image})` }}
                  role="img"
                  aria-label={post.title}
                />
              </Link>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-corp-green/10 text-corp-green font-medium">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                </div>
                <h3 className="font-heading text-lg font-bold text-corp-charcoal mb-2 group-hover:text-corp-green transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                <Link href="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-corp-green group-hover:gap-2 transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1920&q=60)" }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,59,16,0.95), rgba(26,26,46,0.92))" }} />
      <div className="container-corp relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Build with Hasanur Jaya?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Contact our team of experts today for a free consultation and project estimation. Let&apos;s bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Request Quotation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/25 hover:border-white/50 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
            >
              <CalendarCheck className="w-5 h-5" />
              Schedule a Meeting
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/25 hover:border-white/50 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <AboutSection />
      <ServicesSection />
      <IndustriesSection />
      <ProjectsSection />
      <WhyChooseUsSection />
      <SafetyQualitySection />
      <ProcessSection />
      <EppmSection />
      <ClientsSection />
      <TestimonialsSection />
      <FAQSection />
      <BlogSection />
      <CTASection />
    </>
  )
}
