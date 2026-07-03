"use client"

import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { motion } from "framer-motion"
import { Building2, Palette, ClipboardCheck, RefreshCw, Route, Leaf, CheckCircle, ArrowRight, Compass, Zap, Wrench, Frame, Flame, Landmark } from "lucide-react"
import { company } from "@/lib/corporate-data"
import SectionHeader from "@/components/corporate/section-header"

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-10 h-10" />,
  Palette: <Palette className="w-10 h-10" />,
  ClipboardCheck: <ClipboardCheck className="w-10 h-10" />,
  RefreshCw: <RefreshCw className="w-10 h-10" />,
  Route: <Route className="w-10 h-10" />,
  Leaf: <Leaf className="w-10 h-10" />,
  Compass: <Compass className="w-10 h-10" />,
  Zap: <Zap className="w-10 h-10" />,
  Wrench: <Wrench className="w-10 h-10" />,
  Frame: <Frame className="w-10 h-10" />,
  Flame: <Flame className="w-10 h-10" />,
  Landmark: <Landmark className="w-10 h-10" />,
}

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
}

export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const service = company.services.find((s) => s.slug === slug)

  if (!service) {
    notFound()
  }

  const relatedServices = company.services.filter((s) => s.slug !== slug).slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative py-28 lg:py-36 bg-corp-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/service-detail-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-corp-charcoal/80 via-corp-charcoal/60 to-corp-charcoal" />
        <div className="relative container-corp text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-corp-gold mb-4">
              {service.category}
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              {service.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {service.shortDesc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="section-padding bg-white">
        <div className="container-corp">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-start">
            <motion.div {...fadeUp} className="lg:col-span-3">
              <SectionHeader
                label="Overview"
                title={service.title}
                description={service.fullDesc}
                center={false}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl bg-corp-offwhite border border-gray-100 p-8">
                <div className="w-16 h-16 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-5">
                  {iconMap[service.icon] || <Building2 className="w-10 h-10" />}
                </div>
                <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-2">{service.title}</h3>
                <p className="text-sm text-gray-500 mb-6">{service.category}</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-corp-green hover:bg-corp-green-light text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  Inquire About This Service
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <SectionHeader
            label="Capabilities"
            title="What We Deliver"
            description="Our comprehensive capabilities ensure every aspect of your project is covered with expertise."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {service.capabilities.map((cap, i) => (
              <motion.div
                key={cap}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-start gap-3 bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-corp-green/20 transition-all duration-300"
              >
                <CheckCircle className="w-5 h-5 text-corp-green mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-corp-charcoal">{cap}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-corp">
            <SectionHeader
              label="Related Services"
              title="Explore Other Services"
              description="Discover our full range of construction and development solutions."
            />
            <div className="grid md:grid-cols-3 gap-8">
              {relatedServices.map((related, i) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href={`/services/${related.slug}`} className="group block h-full">
                    <div className="h-full rounded-2xl bg-corp-offwhite border border-gray-100 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-corp-green/5 hover:-translate-y-1 hover:border-corp-green/20">
                      <div className="w-14 h-14 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-5 group-hover:bg-corp-green group-hover:text-white transition-all duration-300">
                        {iconMap[related.icon] || <Building2 className="w-7 h-7" />}
                      </div>
                      <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-3 group-hover:text-corp-green transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-5">
                        {related.shortDesc}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-corp-green group-hover:gap-2.5 transition-all duration-300">
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding bg-corp-charcoal">
        <div className="container-corp text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Need {service.title} Services?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
              Our team is ready to discuss your project requirements and provide a tailored solution.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-corp-gold/25"
            >
              Contact Us Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
