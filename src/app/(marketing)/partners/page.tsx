'use client'

import Link from 'next/link'
import { Handshake, Cpu, Puzzle, TrendingUp, DollarSign, Users, BarChart3, Zap, ArrowRight, CheckCircle, Star, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const currentPartners = [
  { name: 'AutoDesk', category: 'Technology' },
  { name: 'Procore', category: 'Integration' },
  { name: 'Sage', category: 'Integration' },
  { name: 'Oracle', category: 'Technology' },
  { name: 'Trimble', category: 'Integration' },
  { name: 'Microsoft Azure', category: 'Technology' },
  { name: 'Viewpoint', category: 'Integration' },
  { name: 'PlanGrid', category: 'Technology' },
]

export default function PartnersPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* হিরো */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Handshake className="w-4 h-4" />
            Partner Program
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4">
            Partner with SmartBuild
          </h1>
          <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto">
            Join our growing ecosystem of technology providers, integration partners, and resellers. Together, we&apos;re building a more connected and efficient construction industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Become a Partner
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>

      {/* অংশীদার প্রোগ্রাম ওভারভিউ */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">SmartBuild Partner Program</h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Our partner program is designed to create mutually beneficial relationships that drive growth, innovation, and customer success across the construction technology landscape.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-stone-900 mb-1">200+</div>
            <p className="text-sm text-stone-500">Active Partners Worldwide</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-stone-900 mb-1">15,000+</div>
            <p className="text-sm text-stone-500">Customers Served Together</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-stone-900 mb-1">4.8/5</div>
            <p className="text-sm text-stone-500">Average Partner Satisfaction</p>
          </div>
        </div>
      </section>

      {/* অংশীদার ধরন */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 text-center">Partner Types</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Technology Partners</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Companies providing complementary technologies such as IoT sensors, drone mapping, BIM platforms, and AI/ML services that integrate with SmartBuild to deliver a unified construction experience.
              </p>
              <ul className="space-y-2">
                {['API-first integration framework', 'Co-marketing opportunities', 'Joint product development', 'Technology advisory board access'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
                <Puzzle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Integration Partners</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Software vendors and platforms in adjacent spaces like accounting (QuickBooks, Xero), ERP systems (Sage, Oracle), and specialized construction tools that create seamless data workflows with SmartBuild.
              </p>
              <ul className="space-y-2">
                {['Pre-built connector templates', 'Shared customer success stories', 'Bi-directional data sync', 'Certified integration badge'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Reseller Partners</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Value-added resellers, system integrators, and consultants who sell, implement, and support SmartBuild for construction companies in specific regions, verticals, or market segments.
              </p>
              <ul className="space-y-2">
                {['Competitive commission structure', 'Sales enablement toolkit', 'Dedicated partner success manager', 'Implementation training & certification'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* সুবিধা */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 text-center">Partner Benefits</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: DollarSign, title: 'Revenue Sharing', desc: 'Earn competitive commissions and recurring revenue share on referred customers and joint deals. Our top partners earn six-figure annual revenue through the program.' },
            { icon: Users, title: 'Co-Selling Support', desc: 'Access our sales team for joint pitches, demo support, and deal acceleration. We provide qualified leads to partners and participate in partner-sourced opportunities.' },
            { icon: BarChart3, title: 'Business Intelligence', desc: 'Gain insights into market trends, customer needs, and product roadmaps through our quarterly partner briefings and exclusive industry research reports.' },
            { icon: Zap, title: 'Priority Support', desc: 'Partners receive priority access to our technical support, dedicated API support channels, and faster response times for integration-related inquiries.' },
          ].map((benefit) => (
            <div key={benefit.title} className="flex gap-4 p-5 rounded-xl border border-stone-200">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                <benefit.icon className="w-5 h-5 text-stone-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* বর্তমান অংশীদার */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3 text-center">Trusted by Industry Leaders</h2>
          <p className="text-stone-500 text-center mb-10 max-w-xl mx-auto">
            We work with leading technology companies and service providers to deliver comprehensive solutions for the construction industry.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {currentPartners.map((partner) => (
              <div
                key={partner.name}
                className="bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-3 border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-stone-400">{partner.name[0]}</span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-stone-900 text-sm">{partner.name}</p>
                  <Badge variant="secondary" className="text-xs mt-1 bg-stone-100 text-stone-500">
                    {partner.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* অংশীদার হওয়ার CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Become a SmartBuild Partner</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-xl mx-auto">
            Whether you&apos;re a technology provider, integration specialist, or reseller, we&apos;d love to explore how we can work together to transform the construction industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Apply to Partner Program
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-stone-600 text-stone-200 hover:bg-stone-800">
              Download Partner Guide
            </Button>
          </div>
          <p className="text-stone-400 text-sm mt-6">
            Questions? Reach us at{' '}
            <a href="mailto:partners@smartbuild.com" className="text-emerald-400 hover:text-emerald-300 underline">
              partners@smartbuild.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}