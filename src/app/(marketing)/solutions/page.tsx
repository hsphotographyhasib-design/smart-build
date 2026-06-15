import { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2,
  Building,
  Thermometer,
  Zap,
  Wrench,
  Home,
  Landmark,
  Settings,
  ArrowRight,
  DollarSign,
  Clock,
  ShieldCheck,
  Eye,
  TrendingDown,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'SmartBuild Solutions - Construction Management for Every Industry',
  description:
    "Discover SmartBuild's tailored solutions for construction companies, HVAC contractors, facility management, MEP contractors, and more.",
}

const industries = [
  {
    icon: Building2,
    title: 'Construction Companies',
    description:
      'Empower general contractors, builders, and developers with end-to-end project management. Track milestones, manage subcontractors, control budgets, and deliver projects on time with real-time visibility into every phase of construction.',
    color: 'bg-amber-100 text-amber-700',
    iconBg: 'bg-amber-500',
  },
  {
    icon: Building,
    title: 'Facility Management',
    description:
      'Streamline building maintenance, facility operations, and space management. Schedule preventive maintenance, track work orders, manage vendor contracts, and ensure occupant satisfaction across your entire portfolio.',
    color: 'bg-emerald-100 text-emerald-700',
    iconBg: 'bg-emerald-500',
  },
  {
    icon: Thermometer,
    title: 'HVAC Contractors',
    description:
      'Manage heating, ventilation, and air conditioning projects from quotation to completion. Track equipment installations, schedule service calls, manage technician dispatch, and maintain compliance with industry regulations.',
    color: 'bg-orange-100 text-orange-700',
    iconBg: 'bg-orange-500',
  },
  {
    icon: Zap,
    title: 'Electrical Contractors',
    description:
      'Handle electrical installation, maintenance, and repair projects with precision. Manage job scheduling, track material usage, ensure safety compliance, and deliver reliable service to residential and commercial clients.',
    color: 'bg-stone-100 text-stone-700',
    iconBg: 'bg-stone-500',
  },
  {
    icon: Wrench,
    title: 'MEP Contractors',
    description:
      'Coordinate mechanical, electrical, and plumbing trades seamlessly. Manage complex multi-discipline projects with integrated scheduling, resource allocation, and progress tracking across all MEP disciplines.',
    color: 'bg-amber-100 text-amber-700',
    iconBg: 'bg-amber-600',
  },
  {
    icon: Home,
    title: 'Property Management',
    description:
      'Simplify property maintenance and tenant management across single buildings or large portfolios. Automate work order routing, track lease-related maintenance, manage vendor relationships, and maintain property value.',
    color: 'bg-emerald-100 text-emerald-700',
    iconBg: 'bg-emerald-600',
  },
  {
    icon: Landmark,
    title: 'Government Projects',
    description:
      'Navigate public works and infrastructure projects with full regulatory compliance. Manage bidding processes, track progress against government milestones, maintain detailed audit trails, and ensure transparency at every stage.',
    color: 'bg-orange-100 text-orange-700',
    iconBg: 'bg-orange-600',
  },
  {
    icon: Settings,
    title: 'Maintenance Companies',
    description:
      'Deliver preventive maintenance and repair services efficiently. Schedule recurring maintenance, dispatch technicians based on skills and location, track service history, and build long-term client relationships through consistent quality.',
    color: 'bg-stone-100 text-stone-700',
    iconBg: 'bg-stone-600',
  },
]

const benefits = [
  {
    icon: TrendingDown,
    title: 'Reduce Costs by 30%',
    description:
      'Eliminate manual processes, reduce material waste, and optimize labor allocation. SmartBuild customers report an average 30% reduction in operational costs within the first year of adoption.',
    stat: '30%',
    statLabel: 'cost reduction',
  },
  {
    icon: Clock,
    title: 'Improve Project Delivery',
    description:
      'Streamlined workflows and automated scheduling help you complete projects faster. Real-time progress tracking ensures potential delays are identified and addressed before they impact your timeline.',
    stat: '40%',
    statLabel: 'faster delivery',
  },
  {
    icon: ShieldCheck,
    title: 'Enhance Compliance',
    description:
      'Stay ahead of regulatory requirements with built-in compliance tracking, automated documentation, and audit-ready reporting. Never miss a safety inspection or certification deadline again.',
    stat: '99%',
    statLabel: 'compliance rate',
  },
  {
    icon: Eye,
    title: 'Real-time Visibility',
    description:
      'Gain instant insight into every aspect of your operations through interactive dashboards and real-time data feeds. Make informed decisions with comprehensive analytics and customizable reports.',
    stat: '24/7',
    statLabel: 'live monitoring',
  },
]

const caseStudies = [
  {
    company: 'Pacific Coast Builders',
    project: 'Mixed-Use Commercial Development',
    results: [
      'Reduced project overruns by 45%',
      'Improved subcontractor coordination by 60%',
      'Delivered 3 weeks ahead of schedule',
    ],
    industry: 'Construction',
  },
  {
    company: 'Metro Facility Group',
    project: 'Multi-Site Facility Maintenance Program',
    results: [
      'Cut maintenance costs by 35%',
      'Achieved 98.5% SLA compliance',
      'Reduced average response time from 4 hours to 45 minutes',
    ],
    industry: 'Facility Management',
  },
  {
    company: 'National MEP Services',
    project: 'Hospital Infrastructure Upgrade',
    results: [
      'Coordinated 12 subcontractors seamlessly',
      'Zero safety incidents over 18-month project',
      'Completed under budget by $2.1M',
    ],
    industry: 'MEP Contracting',
  },
]

export default function SolutionsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-stone-900 to-stone-800 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-300 mb-6">
            <BarChart3 className="h-4 w-4" />
            Industry-Leading Solutions
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Solutions for Every{' '}
            <span className="text-amber-400">Construction Need</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-stone-300 leading-relaxed">
            From general contractors to specialized trades, SmartBuild delivers
            tailored solutions that streamline operations, reduce costs, and
            drive measurable results across the entire construction lifecycle.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-500/40"
            >
              View Features
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/request-demo"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-500 bg-stone-800/50 px-6 py-3 text-sm font-semibold text-stone-200 transition-all hover:bg-stone-700/50 hover:border-stone-400"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Industry Cards Section */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Built for Your Industry
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              SmartBuild adapts to the unique workflows and requirements of
              every segment in the construction and maintenance ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {industries.map((industry) => (
              <div
                key={industry.title}
                className="group rounded-xl border border-stone-200 bg-white p-6 transition-all hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${industry.iconBg} text-white mb-4`}
                >
                  <industry.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {industry.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  {industry.description}
                </p>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
                >
                  Learn More
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Proven Results Across Every Metric
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              SmartBuild customers consistently achieve measurable improvements
              that impact their bottom line and operational excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="relative rounded-xl border border-stone-200 bg-white p-8 overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-[3rem] w-32 h-32" />
                <div className="relative flex items-start gap-5">
                  <div className="flex-shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <benefit.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-1">
                      {benefit.title}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-extrabold text-amber-600">
                        {benefit.stat}
                      </span>
                      <span className="text-sm text-stone-500">
                        {benefit.statLabel}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Customer Success Stories
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              Real companies, real projects, real results. See how SmartBuild
              has helped organizations transform their operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((study) => (
              <div
                key={study.company}
                className="rounded-xl border border-stone-200 bg-white p-8 hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 mb-4">
                  <CheckCircle2 className="h-3 w-3" />
                  {study.industry}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-1">
                  {study.company}
                </h3>
                <p className="text-sm text-stone-500 mb-5">{study.project}</p>
                <ul className="space-y-3">
                  {study.results.map((result) => (
                    <li
                      key={result}
                      className="flex items-start gap-2 text-sm text-stone-700"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-900 via-stone-900 to-stone-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Transform Your Operations?
          </h2>
          <p className="mt-4 text-lg text-stone-400 max-w-2xl mx-auto">
            Join hundreds of construction and maintenance companies that have
            already streamlined their workflows and boosted their bottom line
            with SmartBuild.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/request-demo"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-500/40"
            >
              Request a Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-500 bg-stone-800/50 px-8 py-3.5 text-sm font-semibold text-stone-200 transition-all hover:bg-stone-700/50 hover:border-stone-400"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}