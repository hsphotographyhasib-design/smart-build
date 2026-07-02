"use client"

import { motion } from "framer-motion"
import { Award, Brain, Users, Heart, CheckCircle, MapPin, Quote, Building2 } from "lucide-react"
import { company } from "@/lib/corporate-data"
import SectionHeader from "@/components/corporate/section-header"
import StatCounter from "@/components/corporate/stat-counter"

const valueIcons: Record<string, React.ReactNode> = {
  "Safety First": <Award className="w-8 h-8" />,
  "Quality Focused": <CheckCircle className="w-8 h-8" />,
  Integrity: <Heart className="w-8 h-8" />,
  Innovation: <Brain className="w-8 h-8" />,
}

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
}

export default function AboutPage() {
  const { about, stats } = company

  return (
    <>
      {/* Hero */}
      <section className="relative py-28 lg:py-36 bg-corp-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/about-hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-corp-charcoal/80 via-corp-charcoal/60 to-corp-charcoal" />
        <div className="relative container-corp text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-corp-gold mb-4">
              Since {company.founded}
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              About{" "}
              <span className="text-corp-gold">{company.shortName}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {company.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* History */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp}>
              <SectionHeader
                label="Our Story"
                title="A Legacy of Building Excellence"
                description={about.history}
                center={false}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-corp-green/30 to-corp-charcoal/30 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <Building2 className="w-20 h-20 text-corp-green/40 mx-auto mb-4" />
                  <p className="text-corp-charcoal/40 font-heading text-2xl font-bold">
                    {company.founded} — Present
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-corp-gold/10 rounded-2xl -z-10" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-corp-green/10 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="container-corp">
          <SectionHeader
            label="Our Purpose"
            title="What Drives Us"
            description="Our mission and vision form the foundation of everything we build."
          />
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl bg-corp-green p-8 md:p-10 text-white"
            >
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mb-6">
                <Quote className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-200 leading-relaxed text-base">{about.mission}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl bg-corp-gold p-8 md:p-10 text-white"
            >
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-white/85 leading-relaxed text-base">{about.vision}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <SectionHeader
            label="Core Values"
            title="The Principles That Guide Us"
            description="Our values are embedded in every project we undertake."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl bg-white border border-gray-100 p-8 hover:shadow-xl hover:shadow-corp-green/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-5">
                  {valueIcons[value.title] || <Award className="w-8 h-8" />}
                </div>
                <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-padding bg-white">
        <div className="container-corp">
          <SectionHeader
            label="Leadership"
            title="Meet Our Leadership Team"
            description="Experienced leaders driving our vision forward with expertise and dedication."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.leadership.map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group text-center"
              >
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-corp-green/20 to-corp-charcoal/20 flex items-center justify-center mb-5 overflow-hidden">
                  <Users className="w-16 h-16 text-corp-green/30 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-heading text-lg font-bold text-corp-charcoal">{person.name}</h3>
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-corp-gold">{person.title}</span>
                <p className="text-sm text-gray-500 mt-1">{person.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Personnel */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <SectionHeader
            label="Key Personnel"
            title="Our Dedicated Team"
            description="Skilled professionals committed to delivering excellence on every project."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {about.team.map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group text-center"
              >
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-corp-gold/20 to-corp-charcoal/20 flex items-center justify-center mb-5 overflow-hidden">
                  <Users className="w-16 h-16 text-corp-gold/30 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-heading text-lg font-bold text-corp-charcoal">{person.name}</h3>
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-corp-gold">{person.title}</span>
                <p className="text-sm text-gray-500 mt-1">{person.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-20 bg-corp-charcoal">
        <div className="container-corp">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
