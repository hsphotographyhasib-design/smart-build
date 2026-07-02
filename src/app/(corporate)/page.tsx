"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, Play, ChevronRight, Building2, CheckCircle, Phone, Mail,
  MapPin, Quote, Star, Plus, Minus, ChevronLeft, Award, Users,
  Clock, Leaf, HardHat, ShieldCheck, Layout
} from "lucide-react"
import { company } from "@/lib/corporate-data"
import StatCounter from "@/components/corporate/stat-counter"
import ServiceCard from "@/components/corporate/service-card"
import ProjectCard from "@/components/corporate/project-card"
import SectionHeader from "@/components/corporate/section-header"

const heroSlides = [
  {
    image: "bg-gradient-to-br from-corp-green-dark via-corp-charcoal to-corp-charcoal",
    overlay: "hero-overlay",
    tagline: "Building Excellence Since 1995",
    title: "We Build Your Dream",
    subtitle: "Delivering construction, infrastructure, renovation, engineering, and maintenance solutions with quality, integrity, and innovation.",
    cta1: { label: "Get a Quote", href: "/contact" },
    cta2: { label: "Learn More", href: "/about" },
  },
  {
    image: "bg-gradient-to-tl from-corp-charcoal via-corp-green-dark to-corp-charcoal",
    overlay: "hero-overlay",
    tagline: "Brunei's Premier Builder",
    title: "Quality Construction You Can Trust",
    subtitle: "From luxury residential to large-scale commercial and infrastructure projects — we deliver excellence every time.",
    cta1: { label: "View Projects", href: "/projects" },
    cta2: { label: "Our Services", href: "/services" },
  },
  {
    image: "bg-gradient-to-tr from-corp-charcoal via-corp-charcoal-light to-corp-green-dark",
    overlay: "hero-overlay",
    tagline: "Innovation Meets Craftsmanship",
    title: "Engineering a Better Tomorrow",
    subtitle: "Sustainable building practices, cutting-edge design, and unmatched attention to detail on every project.",
    cta1: { label: "Contact Us", href: "/contact" },
    cta2: { label: "About Us", href: "/about" },
  },
]

const faqs = [
  {
    q: "What types of projects does Hasanur Jaya undertake?",
    a: "We handle a wide range of projects including luxury residential villas, commercial buildings, infrastructure development (roads, drainage, bridges), renovations, and industrial facilities. Our team has extensive experience across government, private, and hospitality sectors.",
  },
  {
    q: "How long has Hasanur Jaya been in business?",
    a: "Hasanur Jaya Sdn Bhd has been operating in Brunei since 1995, bringing over 28 years of experience in the construction and development industry.",
  },
  {
    q: "What areas does Hasanur Jaya serve?",
    a: "We are based in Bandar Seri Begawan, Brunei, and serve clients throughout Brunei Darussalam, including Kuala Belait, Seria, Gadong, and all other districts.",
  },
  {
    q: "What certifications and safety standards do you follow?",
    a: "We strictly comply with Brunei's Workplace Safety and Health regulations. Our safety policies include comprehensive risk assessments, regular training, zero-harm philosophy, and continuous monitoring. We also maintain rigorous quality assurance processes.",
  },
  {
    q: "How can I request a quotation for my project?",
    a: "You can request a free quotation by contacting us via phone at +673 123 4567, email at hanasur@gmail.com, or by filling out the contact form on our website. Our team will respond promptly to discuss your project needs.",
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
  },
  {
    title: "5 Key Factors to Consider When Building Your Dream Home",
    excerpt: "A comprehensive guide to planning and executing your residential construction project successfully.",
    date: "Dec 10, 2025",
    category: "Residential",
  },
  {
    title: "Understanding Waterproofing Solutions for Tropical Climates",
    excerpt: "Why proper waterproofing is critical for buildings in Brunei's tropical climate and how to choose the right system.",
    date: "Nov 5, 2025",
    category: "Materials",
  },
]

const teamMembers = [
  { name: "Haji Hassan", role: "Managing Director", image: "bg-gradient-to-br from-corp-gold/80 to-corp-gold" },
  { name: "Dayang Siti", role: "Creative Director", image: "bg-gradient-to-br from-corp-green to-corp-green-light" },
  { name: "Ahmad Jaya", role: "Technical Director", image: "bg-gradient-to-br from-corp-charcoal to-corp-charcoal-light" },
  { name: "Mohammad Ali", role: "Operations Director", image: "bg-gradient-to-br from-corp-gold/60 to-corp-gold/80" },
]

const clientLogos = [1, 2, 3, 4, 5, 6]

const projectCategories = ["All", "House", "Building", "Office", "Garden", "Interior"]

function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 ${heroSlides[current].image} ${heroSlides[current].overlay}`}
        />
      </AnimatePresence>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative container-corp w-full pt-36 pb-20 lg:pt-44 lg:pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${current}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.25em] uppercase mb-6 bg-white/5 px-4 py-2 rounded-full border border-corp-gold/20">
              {heroSlides[current].tagline}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-6">
              {heroSlides[current].title}
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
              {heroSlides[current].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={heroSlides[current].cta1.href}
                className="inline-flex items-center justify-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-10 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-xl shadow-corp-gold/25 hover:shadow-2xl hover:shadow-corp-gold/30 hover:-translate-y-0.5"
              >
                {heroSlides[current].cta1.label}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={heroSlides[current].cta2.href}
                className="inline-flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/40 text-white px-10 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                {heroSlides[current].cta2.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Navigation */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? "w-10 bg-corp-gold" : "w-3 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hidden lg:flex"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % heroSlides.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hidden lg:flex"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
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
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-corp-green/10 to-corp-charcoal/10 flex items-center justify-center overflow-hidden border border-gray-200">
                <Building2 className="w-32 h-32 text-corp-green/20" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { icon: Building2, label: "Building", color: "text-amber-600 bg-amber-50" },
                  { icon: HardHat, label: "Renovation", color: "text-blue-600 bg-blue-50" },
                  { icon: Building2, label: "Digging", color: "text-orange-600 bg-orange-50" },
                  { icon: Layout, label: "Interior", color: "text-purple-600 bg-purple-50" },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                ))}
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
              Leading the Way in Modern <span className="text-corp-green">Construction</span>
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
          description="Comprehensive construction and development services delivered with engineering excellence."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {company.services.map((service, i) => (
            <ServiceCard key={service.id} {...service} index={i} />
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
            className="group inline-flex items-center gap-2 text-corp-green font-semibold hover:gap-3 transition-all"
          >
            View All Services <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="section-padding bg-white">
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

function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("All")

  return (
    <section className="section-padding bg-corp-offwhite">
      <div className="container-corp">
        <SectionHeader
          label="Our Portfolio"
          title="Latest Projects"
          description="Showcasing our commitment to quality, innovation, and precision in every project we deliver."
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {projectCategories.map((cat) => (
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
          {company.projects.map((project, i) => (
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

function CounterSection() {
  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-corp-green via-corp-green-dark to-corp-charcoal" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "40px 40px",
      }} />
      <div className="container-corp relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {company.stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                {stat.label === "Projects Completed" && <Building2 className="w-8 h-8 text-corp-gold" />}
                {stat.label === "Employees" && <Users className="w-8 h-8 text-corp-gold" />}
                {stat.label === "Awards" && <Award className="w-8 h-8 text-corp-gold" />}
                {stat.label === "Happy Clients" && <Users className="w-8 h-8 text-corp-gold" />}
              </div>
              <div className="font-heading text-4xl md:text-5xl font-bold text-white mb-1">
                <StatCounter value={stat.value} suffix={stat.suffix} label="" />
              </div>
              <div className="text-sm font-medium text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
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
          description="What sets Hasanur Jaya apart from other construction firms in Brunei."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[
            { title: "Best Quality", description: "We use the finest materials and employ skilled craftsmen to ensure every project meets the highest standards.", icon: Award },
            { title: "Integrity", description: "Transparency and honesty are at the heart of our business. We build trust through our actions and clear communication.", icon: ShieldCheck },
            { title: "Strategy", description: "Every project is carefully planned and executed with a clear strategic approach, ensuring efficiency and cost-effectiveness.", icon: Building2 },
            { title: "Safety", description: "We prioritize the safety of our workers and the public above all else, maintaining rigorous safety standards on every site.", icon: HardHat },
            { title: "Community", description: "We are committed to giving back to the communities where we work, supporting local employment and development.", icon: Users },
            { title: "Sustainability", description: "Committed to environmentally responsible building practices and materials for a better tomorrow.", icon: Leaf },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-5 group-hover:bg-corp-green group-hover:text-white transition-all duration-300">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-corp-charcoal mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
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

function TeamSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-corp">
        <SectionHeader
          label="Our Team"
          title="Meet Our Leadership"
          description="Our experienced leadership team brings decades of combined expertise to every project."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group text-center"
            >
              <div className={`w-40 h-40 rounded-full ${member.image} mx-auto mb-5 flex items-center justify-center shadow-lg`}>
                <div className="text-white text-6xl font-bold opacity-30">{member.name.charAt(0)}</div>
              </div>
              <h3 className="font-heading text-lg font-bold text-corp-charcoal">{member.name}</h3>
              <p className="text-sm text-corp-gold font-medium">{member.role}</p>
            </motion.div>
          ))}
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
          label="Latest News"
          title="From Our Blog"
          description="Stay updated with the latest industry insights, company news, and project highlights."
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
              <div className="aspect-[16/9] bg-gradient-to-br from-corp-green/20 to-corp-charcoal/20 flex items-center justify-center">
                <Building2 className="w-14 h-14 text-corp-green/30" />
              </div>
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
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-corp-green group-hover:gap-2 transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClientLogosSection() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container-corp">
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-40">
          {clientLogos.map((i) => (
            <div key={i} className="h-8 lg:h-10 flex items-center">
              <div className="w-24 lg:w-28 h-8 lg:h-10 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400 font-medium">
                Client {i}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-corp-green via-corp-green-dark to-corp-charcoal" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "40px 40px",
      }} />
      <div className="container-corp relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Build Your Dream?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Contact our team of experts today for a free consultation and project estimation. Let&apos;s bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <Phone className="w-5 h-5" />
              Get a Free Quote
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
            >
              Explore Our Projects
              <ArrowRight className="w-5 h-5" />
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
      <FAQSection />
      <ProjectsSection />
      <CounterSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <TeamSection />
      <BlogSection />
      <ClientLogosSection />
      <CTASection />
    </>
  )
}
