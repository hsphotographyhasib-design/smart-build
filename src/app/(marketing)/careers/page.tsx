'use client'

import Link from 'next/link'
import { Briefcase, MapPin, Clock, Heart, Zap, GraduationCap, DollarSign, Globe, Users, ArrowRight, CheckCircle, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const openPositions = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Austin, TX',
    type: 'Full-time',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Austin, TX',
    type: 'Full-time',
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'New York, NY',
    type: 'Full-time',
  },
  {
    title: 'Technical Writer',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Enterprise Account Executive',
    department: 'Sales',
    location: 'Chicago, IL',
    type: 'Full-time',
  },
  {
    title: 'Data Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Construction Industry Specialist',
    department: 'Product',
    location: 'Austin, TX',
    type: 'Hybrid',
  },
]

const departmentColors: Record<string, string> = {
  Engineering: 'bg-emerald-50 text-emerald-700',
  Design: 'bg-amber-50 text-amber-700',
  Infrastructure: 'bg-stone-100 text-stone-700',
  'Customer Success': 'bg-rose-50 text-rose-700',
  Product: 'bg-violet-50 text-violet-700',
  Sales: 'bg-orange-50 text-orange-700',
}

export default function CareersPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" />
            We&apos;re Hiring
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4">
            Build the Future of Construction Tech
          </h1>
          <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto">
            Join a team of passionate engineers, designers, and construction experts working to transform how the built world comes together. Your work will impact millions of construction professionals worldwide.
          </p>
        </div>
      </section>

      {/* Why SmartBuild */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 text-center">Why SmartBuild?</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: DollarSign, title: 'Competitive Compensation', desc: 'Top-of-market salary, equity grants, and annual performance bonuses. We believe in paying fairly for exceptional talent.' },
            { icon: Heart, title: 'Comprehensive Benefits', desc: 'Premium health, dental, and vision insurance. 401(k) with 6% match, unlimited PTO, and $5,000 annual learning stipend.' },
            { icon: Globe, title: 'Flexible Work', desc: 'Hybrid and fully remote options. Work from our Austin HQ, your home office, or anywhere with a reliable internet connection.' },
            { icon: Zap, title: 'Cutting-Edge Tech', desc: 'Work with modern technologies including Next.js, TypeScript, Prisma, PostgreSQL, AWS, and AI/ML-powered features.' },
            { icon: Users, title: 'Incredible Team', desc: 'Collaborate with former Google, Meta, and Stripe engineers alongside industry veterans with decades of construction experience.' },
            { icon: GraduationCap, title: 'Growth Opportunities', desc: 'Clear career paths, mentorship programs, conference budget, and internal tech talks. We promote from within.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-5 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900">Open Positions</h2>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-sm px-3 py-1">
            {openPositions.length} positions
          </Badge>
        </div>
        <div className="space-y-4">
          {openPositions.map((position) => (
            <div
              key={position.title}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-stone-200 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-stone-900 text-lg group-hover:text-emerald-700 transition-colors">
                    {position.title}
                  </h3>
                  <Badge variant="secondary" className={`${departmentColors[position.department] || 'bg-stone-100 text-stone-700'} text-xs`}>
                    {position.department}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {position.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {position.type}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={() => {}}
              >
                Apply
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-sm text-stone-400 text-center mt-6">
          Don&apos;t see a role that fits? We&apos;re always looking for talented people.{' '}
          <a href="mailto:careers@smartbuild.com" className="text-emerald-600 hover:text-emerald-700 underline font-medium">
            Send us your resume
          </a>
        </p>
      </section>

      {/* Our Culture */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 text-center">Our Culture</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Build Together',
                desc: 'Construction is inherently collaborative, and so are we. We believe the best products are built by diverse teams who communicate openly, share knowledge freely, and support each other through every challenge.',
              },
              {
                title: 'Owner Mentality',
                desc: 'Every team member is an owner. We take initiative, make decisions, and own the outcomes. If you see something broken, fix it. If you see an opportunity, seize it. We trust each other to do the right thing.',
              },
              {
                title: 'Impact Over Ego',
                desc: 'We measure success by the impact we have on our customers and the construction industry. We stay humble, remain curious, and always prioritize delivering real value over looking busy or chasing prestige.',
              },
            ].map((culture) => (
              <div key={culture.title} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-stone-900 text-lg mb-3">{culture.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{culture.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 text-center">Application Process</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Apply Online', desc: 'Submit your application with your resume and a brief cover letter explaining why SmartBuild excites you.' },
            { step: '2', title: 'Initial Screen', desc: 'A 30-minute phone call with our recruiting team to discuss your background and mutual fit.' },
            { step: '3', title: 'Technical Interview', desc: 'A hands-on session with the hiring team. We focus on real-world problems, not algorithmic puzzles.' },
            { step: '4', title: 'Final Round', desc: 'Meet the team, discuss culture fit, and ask your questions. We move fast — offers typically go out within 48 hours.' },
          ].map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">Ready to Build With Us?</h2>
          <p className="text-stone-500 text-lg mb-8 max-w-xl mx-auto">
            Join a team that&apos;s reshaping the construction industry through technology. We can&apos;t wait to meet you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:careers@smartbuild.com"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Your Resume
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-700 px-6 py-3 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Learn About SmartBuild
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}