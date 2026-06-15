import { Metadata } from 'next'
import Link from 'next/link'
import {
  Target,
  Eye,
  Lightbulb,
  Shield,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Smartphone,
  Cpu,
  Building2,
  Award,
  HeartHandshake,
  Sparkles,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About SmartBuild - Our Story, Mission & Vision',
  description:
    "Learn about SmartBuild's mission to revolutionize construction management with technology.",
}

const team = [
  {
    name: 'Sarah Chen',
    role: 'Co-Founder & CEO',
    initials: 'SC',
    color: 'bg-amber-500',
    bio: 'Former VP of Operations at a top-10 general contractor. 15+ years in construction management and enterprise software.',
  },
  {
    name: 'Marcus Rivera',
    role: 'Co-Founder & CTO',
    initials: 'MR',
    color: 'bg-emerald-500',
    bio: 'Ex-Google engineer with deep expertise in real-time systems and scalable SaaS architectures. Led engineering teams at two construction tech startups.',
  },
  {
    name: 'Priya Patel',
    role: 'Chief Product Officer',
    initials: 'PP',
    color: 'bg-orange-500',
    bio: 'Product leader with a decade of experience building industry-specific ERP solutions. Previously led product at Procore for 4 years.',
  },
  {
    name: 'David Okafor',
    role: 'VP of Customer Success',
    initials: 'DO',
    color: 'bg-stone-500',
    bio: 'Dedicated to customer outcomes with 12 years of enterprise account management. Manages relationships with 200+ SmartBuild clients.',
  },
]

const differentiators = [
  {
    icon: Lightbulb,
    title: 'Industry-First Innovation',
    description:
      'We were the first to introduce AI-powered project risk scoring, predictive maintenance scheduling, and automated compliance checking for the construction industry.',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Reliability',
    description:
      'Built on a microservices architecture with 99.99% uptime SLA, end-to-end encryption, and role-based access controls that meet the strictest enterprise security standards.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Decisions',
    description:
      'Every feature in SmartBuild is designed to surface actionable insights. From real-time dashboards to predictive analytics, we turn your data into your competitive advantage.',
  },
  {
    icon: Users,
    title: 'Customer-Centric Development',
    description:
      'Our product roadmap is driven entirely by customer feedback. Over 60% of our features have been directly requested and co-designed with our user community.',
  },
]

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We push boundaries relentlessly. Every sprint, every release, every interaction is an opportunity to redefine what construction management software can do.',
  },
  {
    icon: Shield,
    title: 'Reliability',
    description:
      'Construction runs on trust and dependability. We engineer our platform to be as reliable as the structures our customers build — rock-solid, always available.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description:
      'No hidden fees, no black-box algorithms, no surprises. We believe in open communication with our customers, our partners, and within our team.',
  },
  {
    icon: HeartHandshake,
    title: 'Partnership',
    description:
      'We do not sell software and walk away. We partner with our customers for the long haul, investing in their success as if it were our own.',
  },
]

const roadmap = [
  {
    year: '2020',
    title: 'Founded',
    description: 'SmartBuild was founded in New York City by Sarah Chen and Marcus Rivera, united by a shared vision to modernize construction operations.',
    icon: Rocket,
    color: 'bg-amber-500',
  },
  {
    year: '2021',
    title: 'Version 1.0 Launch',
    description: 'Released our core platform with project management, financial tracking, and resource planning. Onboarded our first 50 paying customers within 6 months.',
    icon: Sparkles,
    color: 'bg-amber-500',
  },
  {
    year: '2022',
    title: 'Mobile-First Expansion',
    description: 'Launched native mobile apps for iOS and Android, bringing field teams onto the platform. Introduced offline mode and real-time photo uploads from job sites.',
    icon: Smartphone,
    color: 'bg-emerald-500',
  },
  {
    year: '2023',
    title: 'AI & Analytics Platform',
    description: 'Integrated machine learning for project risk prediction, automated scheduling optimization, and natural language reporting. Won the Construction Tech Innovation Award.',
    icon: Cpu,
    color: 'bg-orange-500',
  },
  {
    year: '2024',
    title: 'Enterprise & Global Scale',
    description: 'Expanded to 12 countries, launched the partner ecosystem, and introduced the enterprise tier with advanced compliance, multi-entity support, and dedicated success managers.',
    icon: Building2,
    color: 'bg-emerald-600',
  },
]

const partners = [
  'ProCore Alliance',
  'Autodesk Partner',
  'Oracle NetSuite',
  'Microsoft Azure',
  'Sage Intacct',
  'Trimble',
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-stone-900 to-stone-800 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300 mb-6">
            <Award className="h-4 w-4" />
            Since 2020
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Building the Future of{' '}
            <span className="text-amber-400">Construction Management</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-stone-300 leading-relaxed">
            We started with a simple belief: the construction industry deserves
            software as sophisticated as the projects it manages. Today, that
            belief powers thousands of projects worldwide.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-8 text-center">
              Our Story
            </h2>
            <div className="space-y-6 text-stone-600 leading-relaxed">
              <p>
                SmartBuild was born from frustration. In 2019, co-founders Sarah
                Chen and Marcus Rivera met at a construction technology
                conference and discovered they shared the same observation:
                despite generating trillions of dollars in annual revenue
                globally, the construction industry was still relying on
                spreadsheets, paper forms, and disconnected software tools to
                manage complex, multi-million-dollar projects.
              </p>
              <p>
                Sarah brought 15 years of construction operations experience,
                having witnessed firsthand how poor project visibility led to
                cost overruns, missed deadlines, and strained client
                relationships. Marcus, a veteran software engineer from Google,
                understood that the technical infrastructure existed to solve
                these problems — it just had not been applied to construction
                with the rigor and attention it deserved.
              </p>
              <p>
                Together, they assembled a team of construction veterans and
                world-class engineers, raised a seed round, and set out to build
                the platform they wished they had on every project they had ever
                managed. By early 2021, SmartBuild Version 1.0 launched with
                core project management, financial tracking, and resource
                planning capabilities. Within six months, 50 construction
                companies had signed on — validating the demand and confirming
                the approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-24 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl border border-stone-200 bg-white p-8 md:p-10">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-6">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-4">
                Our Mission
              </h2>
              <p className="text-stone-600 leading-relaxed">
                To empower every construction and maintenance professional with
                intelligent, intuitive software that eliminates operational
                friction, reduces waste, and enables them to deliver exceptional
                results — on time, on budget, every time. We believe technology
                should amplify human expertise, not replace it.
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-8 md:p-10">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-6">
                <Eye className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-4">
                Our Vision
              </h2>
              <p className="text-stone-600 leading-relaxed">
                A world where every construction project — from a residential
                renovation to a billion-dollar infrastructure program — runs with
                the precision, transparency, and efficiency of the best-managed
                organizations on earth. We envision a construction industry where
                data drives every decision and waste is a thing of the past.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why SmartBuild */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Why SmartBuild
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              Four pillars that set us apart from every other construction
              management platform on the market.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {differentiators.map((item) => (
              <div key={item.title} className="flex items-start gap-5">
                <div className="flex-shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 md:py-24 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Leadership Team
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              Experienced leaders from both the construction industry and
              enterprise technology, working together to transform how the world
              builds.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-stone-200 bg-white p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div
                  className={`inline-flex h-20 w-20 items-center justify-center rounded-full ${member.color} text-white text-2xl font-bold mb-4`}
                >
                  {member.initials}
                </div>
                <h3 className="text-lg font-semibold text-stone-900">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-amber-600 mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Our Core Values
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              These principles guide every decision we make, every feature we
              build, and every interaction we have.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-stone-200 bg-white p-6 hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-20 md:py-24 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Our Journey
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              From a bold idea to a global platform — key milestones in the
              SmartBuild story.
            </p>
          </div>
          <div className="relative">
            {/* Vertical line (desktop only) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-300 hidden md:block -translate-x-px" />
            <div className="space-y-12 md:space-y-0">
              {roadmap.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex flex-col md:flex-row md:items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } md:mb-16`}
                >
                  {/* Dot on the line */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center">
                    <div
                      className={`h-12 w-12 rounded-full ${milestone.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      <milestone.icon className="h-5 w-5" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="ml-16 md:ml-0 md:w-1/2 md:px-12">
                    <span className="text-sm font-bold text-amber-600">
                      {milestone.year}
                    </span>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Trusted Partners
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              We integrate with and are certified by the leading platforms in
              construction and enterprise software.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {partners.map((partner) => (
              <div
                key={partner}
                className="flex items-center justify-center rounded-xl border border-stone-200 bg-stone-50 h-24 px-4 text-center"
              >
                <span className="text-sm font-semibold text-stone-500">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-900 via-stone-900 to-stone-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Join Us in Building Better
          </h2>
          <p className="mt-4 text-lg text-stone-400 max-w-2xl mx-auto">
            Whether you want to transform your company&apos;s operations or join
            our team to help build the future of construction technology — we
            would love to hear from you.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-500/40"
            >
              View Open Positions
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-500 bg-stone-800/50 px-8 py-3.5 text-sm font-semibold text-stone-200 transition-all hover:bg-stone-700/50 hover:border-stone-400"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}