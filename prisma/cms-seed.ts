import { db } from '../src/lib/db'

const NOW = new Date().toISOString()

/* ------------------------------------------------------------------ */
/*  Helper                                                              */
/* ------------------------------------------------------------------ */
function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/* ------------------------------------------------------------------ */
/*  CMS Page — Home                                                     */
/* ------------------------------------------------------------------ */
const HOME_PAGE_ID = uid()

const homePage = {
  id: HOME_PAGE_ID,
  slug: 'home',
  title: 'SmartBuild Enterprise Platform',
  path: '/',
  description: 'Enterprise construction & facility management platform',
  status: 'PUBLISHED',
  seoTitle: 'SmartBuild Enterprise — Construction & Facility Management Platform',
  seoDescription:
    'SmartBuild is the all-in-one enterprise platform for construction project management, facility management, EPPM, ERP, CMMS, and AI-powered analytics.',
  seoKeywords:
    'construction management, EPPM, facility management, ERP, CMMS, project scheduling, AI construction',
  ogImage: '/og-image.png',
  canonicalUrl: 'https://app.hasanurjaya.com',
  schemaMarkup: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SmartBuild Enterprise',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
  }),
  locale: 'en',
  isHomePage: true,
  publishedAt: NOW,
  version: 1,
}

/* ------------------------------------------------------------------ */
/*  20 Landing Page Sections                                           */
/* ------------------------------------------------------------------ */

const sections = [
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'header', name: 'Floating Header', order: 0, visible: true,
    config: {
      logo: '/brand/smartbuild-primary-logo.svg',
      cta: { label: 'Request Demo', url: '#contact' },
      loginLabel: 'Login',
      registerLabel: 'Register',
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'hero', name: 'Hero Section', order: 1, visible: true,
    config: {
      badge: '🚀 Enterprise Platform v3.0',
      headline: 'Build Smarter. Manage Better. Deliver Faster.',
      subheadline:
        'The all-in-one enterprise platform for construction, facility management, EPPM, ERP, and CMMS — powered by AI.',
      primaryCta: { label: 'Start Free Trial', url: '/register' },
      secondaryCta: { label: 'Watch Demo', url: '#demo' },
      stats: [
        { value: '2,500+', label: 'Projects Delivered' },
        { value: '150+', label: 'Enterprise Clients' },
        { value: '35+', label: 'Countries' },
        { value: '99.9%', label: 'Uptime SLA' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'trusted-by', name: 'Trusted By', order: 2, visible: true,
    config: {
      headline: 'Trusted by Industry Leaders Worldwide',
      logos: [
        { name: 'Petronas', url: '#' },
        { name: 'Gamuda', url: '#' },
        { name: 'UEM Sunrise', url: '#' },
        { name: 'IJM Corporation', url: '#' },
        { name: 'YTL Corporation', url: '#' },
        { name: 'Sime Darby', url: '#' },
        { name: 'Malakoff', url: '#' },
        { name: 'MMC Corp', url: '#' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'platform-overview', name: 'Platform Overview', order: 3, visible: true,
    config: {
      headline: 'One Platform. Unlimited Possibilities.',
      subheadline:
        'SmartBuild unifies your entire project lifecycle — from planning to closeout — in a single intelligent platform.',
      cards: [
        { icon: 'LayoutDashboard', title: 'Real-Time Dashboards', desc: 'Live KPIs, EVM metrics, and executive reports at your fingertips.' },
        { icon: 'Workflow', title: 'Automated Workflows', desc: 'Configurable approval chains, notifications, and business rules.' },
        { icon: 'BrainCircuit', title: 'AI-Powered Insights', desc: 'Predictive analytics, smart scheduling, and automated risk detection.' },
        { icon: 'ShieldCheck', title: 'Enterprise Security', desc: 'Role-based access, audit trails, and compliance-ready architecture.' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'features', name: 'Core Features', order: 4, visible: true,
    config: {
      headline: 'Comprehensive Feature Set',
      subheadline: 'Every tool your enterprise needs, integrated into one powerful platform.',
      modules: [
        { icon: 'FolderKanban', title: 'Projects', desc: 'Full project lifecycle management with WBS, baselines, and EVM.' },
        { icon: 'CalendarRange', title: 'Scheduling', desc: 'Gantt charts, critical path, lookahead planning, and resource loading.' },
        { icon: 'GanttChart', title: 'Gantt', desc: 'Interactive Gantt with dependencies, milestones, and progress tracking.' },
        { icon: 'FileText', title: 'Tender & Bid', desc: 'Tender management, bid analysis, and contract administration.' },
        { icon: 'Wrench', title: 'Maintenance', desc: 'Preventive & corrective maintenance with QR-based work orders.' },
        { icon: 'Settings2', title: 'CMMS', desc: 'Computerized maintenance management with asset lifecycle tracking.' },
        { icon: 'Database', title: 'ERP', desc: 'Enterprise resource planning with finance, HR, and inventory.' },
        { icon: 'DollarSign', title: 'Finance', desc: 'Budget tracking, cost control, cash flow, and financial reporting.' },
        { icon: 'Users', title: 'HR', desc: 'Workforce management, attendance, payroll integration.' },
        { icon: 'Package', title: 'Inventory', desc: 'Material tracking, warehouse management, and procurement.' },
        { icon: 'ShoppingCart', title: 'Procurement', desc: 'Purchase orders, vendor management, and supply chain.' },
        { icon: 'Building', title: 'Assets', desc: 'Asset registry, QR tagging, depreciation, and maintenance history.' },
        { icon: 'QrCode', title: 'QR', desc: 'QR code generation for assets, equipment, and work orders.' },
        { icon: 'Globe', title: 'Customer Portal', desc: 'Self-service portal for clients with real-time project visibility.' },
        { icon: 'HardHat', title: 'Technician Portal', desc: 'Mobile-first interface for field technicians and inspectors.' },
        { icon: 'Sparkles', title: 'AI Assistant', desc: 'Conversational AI for project queries, report generation, and insights.' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'industries', name: 'Industry Solutions', order: 5, visible: true,
    config: {
      headline: 'Built for Every Industry',
      subheadline: 'From construction sites to hospital corridors — SmartBuild adapts to your domain.',
      items: [
        { icon: 'Crane', title: 'Construction', desc: 'Commercial, residential, and infrastructure project management.' },
        { icon: 'Building2', title: 'Facility Management', desc: 'Integrated workplace and facility operations management.' },
        { icon: 'Cog', title: 'Engineering', desc: 'MEP, structural, and multidisciplinary engineering projects.' },
        { icon: 'Fuel', title: 'Oil & Gas', desc: 'Upstream, downstream, and pipeline project management.' },
        { icon: 'Factory', title: 'Manufacturing', desc: 'Production planning, quality control, and supply chain.' },
        { icon: 'Landmark', title: 'Government', desc: 'Public infrastructure and government project delivery.' },
        { icon: 'HeartPulse', title: 'Healthcare', desc: 'Hospital and healthcare facility management.' },
        { icon: 'GraduationCap', title: 'Education', desc: 'Campus and educational institution management.' },
        { icon: 'Hotel', title: 'Hospitality', desc: 'Hotel, resort, and hospitality operations.' },
        { icon: 'Home', title: 'Real Estate', desc: 'Property development and real estate portfolio management.' },
        { icon: 'Zap', title: 'Utilities', desc: 'Power, water, and utility infrastructure management.' },
        { icon: 'Route', title: 'Infrastructure', desc: 'Roads, bridges, rail, and transport infrastructure.' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'enterprise-modules', name: 'Enterprise Modules', order: 6, visible: true,
    config: {
      headline: 'Enterprise-Grade Modules',
      subheadline: 'Deep functionality for complex project environments.',
      modules: [
        { icon: 'BarChart3', title: 'EVM & Cost Control', desc: 'Earned Value Management with CPI, SPI, and forecast analytics.' },
        { icon: 'GitBranch', title: 'Program Management', desc: 'Multi-project portfolio and program coordination.' },
        { icon: 'FileCheck', title: 'Document Control', desc: 'Transmittals, submittals, and drawing management.' },
        { icon: 'ShieldAlert', title: 'HSE Management', desc: 'Health, Safety & Environment compliance and reporting.' },
        { icon: 'Target', title: 'Quality Assurance', desc: 'Inspection workflows, punch lists, and quality metrics.' },
        { icon: 'TriangleAlert', title: 'Risk Management', desc: 'Risk registers, mitigation plans, and Monte Carlo simulation.' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'workflow', name: 'Workflow Showcase', order: 7, visible: true,
    config: {
      headline: 'Streamlined Workflows',
      subheadline: 'From complaint to payment — every process automated and trackable.',
      steps: [
        { icon: 'MessageSquareWarning', title: 'Complaint', desc: 'Issue reported via portal, QR scan, or mobile app' },
        { icon: 'UserCheck', title: 'Assignment', desc: 'Auto-assigned based on skill, location, and workload' },
        { icon: 'ClipboardList', title: 'Work Order', desc: 'Generated with scope, priority, and required materials' },
        { icon: 'CheckCircle', title: 'Completion', desc: 'Field technician completes with photo evidence' },
        { icon: 'Receipt', title: 'Invoice', desc: 'Auto-generated invoice with time & materials' },
        { icon: 'CreditCard', title: 'Payment', desc: 'Integrated payment processing and reconciliation' },
        { icon: 'BarChart3', title: 'Reports', desc: 'Real-time dashboards and executive analytics' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'ai-features', name: 'AI Features', order: 8, visible: true,
    config: {
      headline: 'AI-Powered Intelligence',
      subheadline: 'Leverage artificial intelligence to make smarter, faster decisions.',
      features: [
        { icon: 'BrainCircuit', title: 'AI Dashboard', desc: 'Predictive KPIs and anomaly detection across all modules.' },
        { icon: 'FileBarChart', title: 'AI Reports', desc: 'Natural language report generation and automated insights.' },
        { icon: 'CalendarClock', title: 'AI Scheduling', desc: 'Intelligent resource allocation and schedule optimization.' },
        { icon: 'Search', title: 'AI Search', desc: 'Semantic search across documents, projects, and knowledge base.' },
        { icon: 'MessageCircle', title: 'AI Assistant', desc: 'Conversational AI for queries, recommendations, and actions.' },
        { icon: 'LineChart', title: 'AI Analytics', desc: 'Trend prediction, risk scoring, and performance forecasting.' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'screenshots', name: 'Platform Screenshots', order: 9, visible: true,
    config: {
      headline: 'See SmartBuild in Action',
      subheadline: 'Explore the powerful interface designed for enterprise teams.',
      items: [
        { title: 'Executive Dashboard', desc: 'Real-time KPIs and portfolio overview' },
        { title: 'Project Gantt', desc: 'Interactive scheduling with dependencies' },
        { title: 'Cost Management', desc: 'Budget tracking and EVM analytics' },
        { title: 'Mobile App', desc: 'Field operations on any device' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'testimonials', name: 'Customer Testimonials', order: 10, visible: true,
    config: {
      headline: 'What Our Clients Say',
      subheadline: 'Trusted by leading enterprises across the globe.',
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'case-studies', name: 'Case Studies', order: 11, visible: true,
    config: {
      headline: 'Success Stories',
      subheadline: 'Real results from real projects.',
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'statistics', name: 'Statistics', order: 12, visible: true,
    config: {
      headline: 'SmartBuild by the Numbers',
      stats: [
        { value: 2500, suffix: '+', label: 'Projects Managed' },
        { value: 150, suffix: '+', label: 'Enterprise Clients' },
        { value: 35, suffix: '+', label: 'Countries' },
        { value: 50000, suffix: '+', label: 'Active Users' },
        { value: 12, suffix: 'M+', label: 'Work Orders Completed' },
        { value: 99.9, suffix: '%', label: 'Platform Uptime' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'pricing', name: 'Subscription Plans', order: 13, visible: true,
    config: {
      headline: 'Plans for Every Enterprise',
      subheadline: 'Start free, scale as you grow. No hidden fees.',
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'faq', name: 'Frequently Asked Questions', order: 14, visible: true,
    config: {
      headline: 'Frequently Asked Questions',
      subheadline: 'Everything you need to know about SmartBuild.',
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'news', name: 'Latest News', order: 15, visible: true,
    config: {
      headline: 'Latest News & Updates',
      subheadline: 'Stay informed about SmartBuild developments.',
      items: [
        { title: 'SmartBuild v3.0 Launched with AI-Powered Analytics', date: '2025-01-15', excerpt: 'Introducing AI-powered dashboards, predictive scheduling, and natural language reporting.' },
        { title: 'Partnership with Malaysia\'s Top Construction Firms', date: '2025-01-08', excerpt: 'SmartBuild selected as the preferred EPPM platform for major Malaysian developers.' },
        { title: 'New CMMS Module for Facility Management', date: '2024-12-20', excerpt: 'Comprehensive maintenance management with QR-based work orders and asset tracking.' },
      ],
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'blog', name: 'Blog', order: 16, visible: true,
    config: {
      headline: 'Insights & Resources',
      subheadline: 'Expert perspectives on construction and facility management.',
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'partners', name: 'Partners', order: 17, visible: true,
    config: {
      headline: 'Our Partners',
      subheadline: 'Technology partners and industry leaders.',
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'cta', name: 'Call To Action', order: 18, visible: true,
    config: {
      headline: 'Ready to Transform Your Operations?',
      subheadline: 'Join 150+ enterprises already using SmartBuild to deliver projects on time and on budget.',
      primaryCta: { label: 'Start Free Trial', url: '/register' },
      secondaryCta: { label: 'Schedule Demo', url: '#contact' },
    },
  },
  {
    id: uid(), pageId: HOME_PAGE_ID, type: 'footer', name: 'Professional Footer', order: 19, visible: true,
    config: {
      company: 'SmartBuild Enterprise',
      tagline: 'Build Smarter. Manage Better. Deliver Faster.',
      copyright: `© ${new Date().getFullYear()} SmartBuild Enterprise. All rights reserved.`,
      address: 'Kuala Lumpur, Malaysia',
      email: 'info@smartbuild.com',
      phone: '+60 3-1234 5678',
      social: [
        { platform: 'linkedin', url: '#' },
        { platform: 'twitter', url: '#' },
        { platform: 'facebook', url: '#' },
        { platform: 'youtube', url: '#' },
      ],
      columns: [
        { title: 'Products', links: [{ label: 'EPPM', url: '#' }, { label: 'CMMS', url: '#' }, { label: 'ERP', url: '#' }, { label: 'AI Assistant', url: '#' }] },
        { title: 'Solutions', links: [{ label: 'Construction', url: '#' }, { label: 'Facility Management', url: '#' }, { label: 'Oil & Gas', url: '#' }, { label: 'Government', url: '#' }] },
        { title: 'Resources', links: [{ label: 'Documentation', url: '#' }, { label: 'Blog', url: '#' }, { label: 'Case Studies', url: '#' }, { label: 'API Reference', url: '#' }] },
        { title: 'Company', links: [{ label: 'About Us', url: '#' }, { label: 'Careers', url: '#' }, { label: 'Contact', url: '#' }, { label: 'Partners', url: '#' }] },
        { title: 'Legal', links: [{ label: 'Privacy Policy', url: '#' }, { label: 'Terms of Service', url: '#' }, { label: 'Cookie Policy', url: '#' }, { label: 'SLA', url: '#' }] },
      ],
    },
  },
]

/* ------------------------------------------------------------------ */
/*  Menu Items                                                          */
/* ------------------------------------------------------------------ */

const menuItems = [
  { id: uid(), label: 'Products', type: 'dropdown', order: 0, visible: true, locale: 'en', menu: 'main',
    children: [
      { id: uid(), label: 'EPPM', url: '#features', type: 'link', order: 0, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'CMMS', url: '#features', type: 'link', order: 1, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'ERP', url: '#features', type: 'link', order: 2, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'AI Assistant', url: '#ai-features', type: 'link', order: 3, visible: true, locale: 'en', menu: 'main' },
    ]
  },
  { id: uid(), label: 'Solutions', type: 'dropdown', order: 1, visible: true, locale: 'en', menu: 'main',
    children: [
      { id: uid(), label: 'Construction', url: '#industries', type: 'link', order: 0, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'Facility Management', url: '#industries', type: 'link', order: 1, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'Oil & Gas', url: '#industries', type: 'link', order: 2, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'Government', url: '#industries', type: 'link', order: 3, visible: true, locale: 'en', menu: 'main' },
    ]
  },
  { id: uid(), label: 'Industries', url: '#industries', type: 'link', order: 2, visible: true, locale: 'en', menu: 'main' },
  { id: uid(), label: 'Pricing', url: '#pricing', type: 'link', order: 3, visible: true, locale: 'en', menu: 'main' },
  { id: uid(), label: 'Resources', type: 'dropdown', order: 4, visible: true, locale: 'en', menu: 'main',
    children: [
      { id: uid(), label: 'Blog', url: '#blog', type: 'link', order: 0, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'Documentation', url: '#', type: 'link', order: 1, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'Case Studies', url: '#case-studies', type: 'link', order: 2, visible: true, locale: 'en', menu: 'main' },
      { id: uid(), label: 'FAQ', url: '#faq', type: 'link', order: 3, visible: true, locale: 'en', menu: 'main' },
    ]
  },
  { id: uid(), label: 'Contact', url: '#contact', type: 'link', order: 5, visible: true, locale: 'en', menu: 'main' },
]

/* ------------------------------------------------------------------ */
/*  Testimonials                                                        */
/* ------------------------------------------------------------------ */

const testimonials = [
  { id: uid(), name: 'Ahmad Razali', position: 'Project Director', company: 'Gamuda Berhad',
    content: 'SmartBuild transformed how we manage our RM2.8B township project. Real-time dashboards and AI scheduling reduced our delays by 40%.',
    rating: 5, featured: true, order: 0, status: 'published', locale: 'en' },
  { id: uid(), name: 'Sarah Chen', position: 'VP of Operations', company: 'UEM Sunrise',
    content: 'The CMMS module alone saved us 25% on maintenance costs. The QR-based work order system is a game-changer for our facility teams.',
    rating: 5, featured: true, order: 1, status: 'published', locale: 'en' },
  { id: uid(), name: 'Mohamed Hassan', position: 'CTO', company: 'IJM Corporation',
    content: 'We evaluated 12 platforms before choosing SmartBuild. The multi-tenant architecture and enterprise-grade security sealed the deal.',
    rating: 5, featured: true, order: 2, status: 'published', locale: 'en' },
  { id: uid(), name: 'David Wong', position: 'Head of PMO', company: 'YTL Construction',
    content: 'SmartBuild\'s EVM module gives us visibility we never had before. CPI and SPI tracking across 45 active projects is now effortless.',
    rating: 5, featured: false, order: 3, status: 'published', locale: 'en' },
  { id: uid(), name: 'Nurul Aina', position: 'Facility Manager', company: 'Petronas',
    content: 'From complaint to completion in under 4 hours. SmartBuild\'s automated workflow is the backbone of our facility operations.',
    rating: 5, featured: false, order: 4, status: 'published', locale: 'en' },
  { id: uid(), name: 'Raj Kumar', position: 'CEO', company: 'MRCB',
    content: 'The AI assistant feature is incredible. Our project managers get instant answers to complex scheduling questions.',
    rating: 5, featured: false, order: 5, status: 'published', locale: 'en' },
]

/* ------------------------------------------------------------------ */
/*  Case Studies                                                        */
/* ------------------------------------------------------------------ */

const caseStudies = [
  { id: uid(), title: 'Gamuda Township: RM2.8B Mega-Project Delivery', slug: 'gamuda-township',
    client: 'Gamuda Berhad', industry: 'Construction',
    summary: 'How SmartBuild helped deliver a 5,000-unit township project 3 months ahead of schedule with 15% cost savings.',
    content: 'Gamuda Berhad deployed SmartBuild across their flagship RM2.8B township development. The platform unified 12 contractors, 8 consultants, and 200+ subcontractors on a single platform. Real-time EVM dashboards provided early warning of schedule deviations, while AI scheduling optimized resource allocation across 45 work packages. The result: project delivered 3 months early with 15% cost savings and zero safety incidents.',
    results: JSON.stringify([{ metric: '15%', label: 'Cost Savings' }, { metric: '3 Months', label: 'Early Delivery' }, { metric: 'Zero', label: 'Safety Incidents' }, { metric: '200+', label: 'Subcontractors Managed' }]),
    featured: true, status: 'published', locale: 'en', publishedAt: NOW },
  { id: uid(), title: 'Petronas Facility Management: 40% Efficiency Gain', slug: 'petronas-facility',
    client: 'Petronas', industry: 'Oil & Gas',
    summary: 'SmartBuild CMMS deployment across 35 facilities achieving 40% reduction in maintenance response time.',
    content: 'Petronas selected SmartBuild to modernize facility management across 35 offshore and onshore facilities. The QR-based work order system enabled technicians to report and resolve issues 40% faster. Predictive maintenance algorithms reduced unplanned downtime by 60%.',
    results: JSON.stringify([{ metric: '40%', label: 'Faster Response' }, { metric: '60%', label: 'Less Downtime' }, { metric: '35', label: 'Facilities' }, { metric: '12K+', label: 'Work Orders/Month' }]),
    featured: true, status: 'published', locale: 'en', publishedAt: NOW },
  { id: uid(), title: 'Government Infrastructure: National Highway Project', slug: 'government-highway',
    client: 'Ministry of Works', industry: 'Government',
    summary: 'Managing a 300km highway project with SmartBuild EPPM achieving 99.7% schedule performance.',
    content: 'The Ministry of Works deployed SmartBuild for the RM8B national highway project. The platform managed 120+ contractors, 8,000+ activities, and complex multi-agency coordination.',
    results: JSON.stringify([{ metric: '99.7%', label: 'Schedule Performance' }, { metric: '120+', label: 'Contractors' }, { metric: '300km', label: 'Highway' }, { metric: 'RM8B', label: 'Project Value' }]),
    featured: false, status: 'published', locale: 'en', publishedAt: NOW },
]

/* ------------------------------------------------------------------ */
/*  FAQ                                                                 */
/* ------------------------------------------------------------------ */

const faqs = [
  { id: uid(), question: 'What is SmartBuild Enterprise?', answer: 'SmartBuild is an all-in-one enterprise platform for construction project management (EPPM), facility management, ERP, CMMS, and AI-powered analytics. It unifies your entire project lifecycle in a single platform.', category: 'General', order: 0, locale: 'en', status: 'published' },
  { id: uid(), question: 'How long does deployment take?', answer: 'SmartBuild can be deployed in as little as 2 weeks for standard configurations. Enterprise deployments with custom integrations typically take 4-8 weeks including data migration and training.', category: 'General', order: 1, locale: 'en', status: 'published' },
  { id: uid(), question: 'Is SmartBuild cloud-based or on-premise?', answer: 'SmartBuild is primarily cloud-based (SaaS) but also offers on-premise and hybrid deployment options for enterprises with specific security or compliance requirements.', category: 'Technical', order: 2, locale: 'en', status: 'published' },
  { id: uid(), question: 'Can I integrate SmartBuild with existing tools?', answer: 'Yes. SmartBuild provides REST APIs, webhooks, and pre-built integrations with popular tools like Microsoft 365, SAP, Oracle, AutoCAD, and more.', category: 'Technical', order: 3, locale: 'en', status: 'published' },
  { id: uid(), question: 'What pricing plans are available?', answer: 'We offer Free Trial, Starter, Professional, Enterprise, and Custom plans. All plans include core features with higher tiers offering advanced modules, unlimited users, and dedicated support.', category: 'Pricing', order: 4, locale: 'en', status: 'published' },
  { id: uid(), question: 'Is there a free trial?', answer: 'Yes! Our 14-day free trial includes all Professional plan features with no credit card required. You can also request a personalized demo with our solutions team.', category: 'Pricing', order: 5, locale: 'en', status: 'published' },
  { id: uid(), question: 'How does the AI Assistant work?', answer: 'SmartBuild\'s AI Assistant uses natural language processing to answer project queries, generate reports, suggest schedule optimizations, and provide predictive insights. It learns from your project data to deliver increasingly accurate recommendations.', category: 'AI', order: 6, locale: 'en', status: 'published' },
  { id: uid(), question: 'What security measures are in place?', answer: 'SmartBuild implements enterprise-grade security including AES-256 encryption, role-based access control, multi-factor authentication, audit logging, SOC 2 compliance, and regular security assessments.', category: 'Security', order: 7, locale: 'en', status: 'published' },
]

/* ------------------------------------------------------------------ */
/*  Partners                                                            */
/* ------------------------------------------------------------------ */

const partners = [
  { id: uid(), name: 'Microsoft', logo: '/brand/smartbuild-primary-logo.svg', category: 'technology', order: 0, status: 'active' },
  { id: uid(), name: 'AWS', logo: '/brand/smartbuild-primary-logo.svg', category: 'technology', order: 1, status: 'active' },
  { id: uid(), name: 'Oracle', logo: '/brand/smartbuild-primary-logo.svg', category: 'technology', order: 2, status: 'active' },
  { id: uid(), name: 'Autodesk', logo: '/brand/smartbuild-primary-logo.svg', category: 'technology', order: 3, status: 'active' },
  { id: uid(), name: 'Petronas', logo: '/brand/smartbuild-primary-logo.svg', category: 'client', order: 4, status: 'active' },
  { id: uid(), name: 'Gamuda', logo: '/brand/smartbuild-primary-logo.svg', category: 'client', order: 5, status: 'active' },
  { id: uid(), name: 'IJM Corp', logo: '/brand/smartbuild-primary-logo.svg', category: 'client', order: 6, status: 'active' },
  { id: uid(), name: 'YTL', logo: '/brand/smartbuild-primary-logo.svg', category: 'client', order: 7, status: 'active' },
  { id: uid(), name: 'UEM Sunrise', logo: '/brand/smartbuild-primary-logo.svg', category: 'client', order: 8, status: 'active' },
  { id: uid(), name: 'Sime Darby', logo: '/brand/smartbuild-primary-logo.svg', category: 'client', order: 9, status: 'active' },
]

/* ------------------------------------------------------------------ */
/*  Subscription Plans                                                  */
/* ------------------------------------------------------------------ */

const plans = [
  { id: uid(), name: 'Free Trial', slug: 'free-trial', description: 'Explore SmartBuild with full features for 14 days.',
    price: 0, billingCycle: 'monthly', currency: 'USD',
    maxUsers: 5, maxProjects: 3, maxStorage: 500,
    features: ['All core modules', '5 user accounts', '3 active projects', '500MB storage', 'Community support', 'Basic reports'],
    highlighted: false, order: 0, status: 'ACTIVE' },
  { id: uid(), name: 'Starter', slug: 'starter', description: 'Perfect for small teams getting started with project management.',
    price: 49, billingCycle: 'monthly', currency: 'USD',
    maxUsers: 15, maxProjects: 10, maxStorage: 5000,
    features: ['All core modules', '15 user accounts', '10 active projects', '5GB storage', 'Email support', 'Standard reports', 'API access'],
    highlighted: false, order: 1, status: 'ACTIVE' },
  { id: uid(), name: 'Professional', slug: 'professional', description: 'For growing companies that need advanced features.',
    price: 149, billingCycle: 'monthly', currency: 'USD',
    maxUsers: 50, maxProjects: 50, maxStorage: 50000,
    features: ['All modules including AI', '50 user accounts', '50 active projects', '50GB storage', 'Priority support', 'Advanced analytics', 'Custom workflows', 'API + Webhooks'],
    highlighted: true, order: 2, status: 'ACTIVE' },
  { id: uid(), name: 'Enterprise', slug: 'enterprise', description: 'For large organizations with complex requirements.',
    price: 399, billingCycle: 'monthly', currency: 'USD',
    maxUsers: 200, maxProjects: 200, maxStorage: 500000,
    features: ['Everything in Professional', '200 user accounts', 'Unlimited projects', '500GB storage', '24/7 dedicated support', 'Custom integrations', 'SSO & SAML', 'On-premise option'],
    highlighted: false, order: 3, status: 'ACTIVE' },
  { id: uid(), name: 'Custom', slug: 'custom', description: 'Tailored solutions for enterprise-grade requirements.',
    price: -1, billingCycle: 'monthly', currency: 'USD',
    maxUsers: -1, maxProjects: -1, maxStorage: -1,
    features: ['Everything in Enterprise', 'Unlimited users', 'Unlimited projects', 'Unlimited storage', 'Dedicated success manager', 'Custom development', 'SLA guarantee', 'Multi-region deployment'],
    highlighted: false, order: 4, status: 'ACTIVE' },
]

/* ------------------------------------------------------------------ */
/*  Blog Posts                                                          */
/* ------------------------------------------------------------------ */

const blogCategories = [
  { id: uid(), name: 'Industry Insights', slug: 'industry-insights', description: 'Analysis and trends in construction and facility management.', color: '#0B2345', order: 0 },
  { id: uid(), name: 'Product Updates', slug: 'product-updates', description: 'Latest features and improvements to SmartBuild.', color: '#F5A623', order: 1 },
  { id: uid(), name: 'Case Studies', slug: 'case-studies', description: 'Real-world success stories from SmartBuild clients.', color: '#059669', order: 2 },
  { id: uid(), name: 'Guides & Tutorials', slug: 'guides-tutorials', description: 'How-to guides and best practices.', color: '#7C3AED', order: 3 },
]

const blogTags = [
  { id: uid(), name: 'EPPM', slug: 'eppm' },
  { id: uid(), name: 'Construction', slug: 'construction' },
  { id: uid(), name: 'AI', slug: 'ai' },
  { id: uid(), name: 'CMMS', slug: 'cmms' },
  { id: uid(), name: 'Project Management', slug: 'project-management' },
]

const blogPosts = [
  { id: uid(), title: 'The Future of Construction Management: AI-Driven EPPM in 2025', slug: 'future-construction-ai-eppm-2025',
    excerpt: 'Explore how artificial intelligence is revolutionizing enterprise project portfolio management and what it means for construction firms.',
    content: '## The AI Revolution in Construction\n\nThe construction industry is undergoing a fundamental transformation. AI-powered EPPM platforms like SmartBuild are enabling project managers to predict risks before they materialize, optimize resource allocation in real-time, and deliver projects consistently on time and on budget.\n\n### Key Trends\n\n1. **Predictive Analytics**: AI models trained on historical project data can now forecast delays, cost overruns, and quality issues with 85%+ accuracy.\n2. **Natural Language Reporting**: Project stakeholders can simply ask questions in plain language and receive comprehensive reports instantly.\n3. **Automated Scheduling**: AI algorithms consider thousands of constraints to generate optimized project schedules.',
    status: 'published', featured: true, locale: 'en',
    seoTitle: 'Future of Construction Management: AI-Driven EPPM 2025',
    seoDescription: 'How AI is transforming enterprise project portfolio management in construction.',
    authorName: 'SmartBuild Team', readingTime: 8, publishedAt: NOW },
  { id: uid(), title: 'CMMS Best Practices: Reducing Maintenance Costs by 30%', slug: 'cmms-best-practices-reduce-costs',
    excerpt: 'Learn proven strategies for implementing CMMS that deliver measurable cost reductions and improved facility performance.',
    content: '## CMMS Implementation Guide\n\nA well-implemented Computerized Maintenance Management System can reduce maintenance costs by 25-35% while improving equipment uptime and extending asset lifespan.\n\n### Step 1: Asset Inventory\nBegin with a comprehensive asset registry. Every piece of equipment should be catalogued with specifications, maintenance history, and criticality ratings.\n\n### Step 2: QR Code Integration\nDeploy QR codes on all assets for instant access to maintenance history, manuals, and work order creation.',
    status: 'published', featured: true, locale: 'en',
    seoTitle: 'CMMS Best Practices: Reduce Maintenance Costs 30%',
    authorName: 'Sarah Ahmad', readingTime: 6, publishedAt: NOW },
  { id: uid(), title: 'How Gamuda Saved RM420M with SmartBuild', slug: 'gamuda-case-study-rm420m-savings',
    excerpt: 'A detailed look at how Gamuda Berhad achieved 15% cost savings on their RM2.8B township project using SmartBuild.',
    content: '## Case Study: Gamuda Township Project\n\n### Challenge\nGamuda Berhad needed a platform to manage their RM2.8B township development spanning 5,000 residential units, commercial spaces, and public infrastructure.\n\n### Solution\nSmartBuild was deployed to unify 12 main contractors, 8 consultants, and 200+ subcontractors on a single platform.\n\n### Results\n- 15% cost savings (RM420M)
- 3 months early delivery
- Zero safety incidents
- 99.2% schedule performance',
    status: 'published', featured: false, locale: 'en',
    authorName: 'SmartBuild Team', readingTime: 5, publishedAt: NOW },
]

/* ------------------------------------------------------------------ */
/*  Analytics Config                                                    */
/* ------------------------------------------------------------------ */

const analyticsConfig = {
  id: uid(),
  headScripts: '<!-- Google Analytics -->\n<!-- Microsoft Clarity -->',
  bodyScripts: '',
}

/* ------------------------------------------------------------------ */
/*  Forms                                                               */
/* ------------------------------------------------------------------ */

const forms = [
  { id: uid(), name: 'Contact Form', slug: 'contact',
    description: 'General contact form for inquiries',
    config: JSON.stringify({
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Smith' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john@company.com' },
        { name: 'company', label: 'Company', type: 'text', required: false, placeholder: 'Company Name' },
        { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'How can we help you?' },
      ],
    }),
    successMsg: 'Thank you! We\'ll get back to you within 24 hours.',
    errorMsg: 'Something went wrong. Please try again.',
    notifyEmail: 'info@smartbuild.com',
    status: 'active',
  },
  { id: uid(), name: 'Demo Request', slug: 'demo-request',
    description: 'Form for scheduling a personalized demo',
    config: JSON.stringify({
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Smith' },
        { name: 'email', label: 'Business Email', type: 'email', required: true, placeholder: 'john@company.com' },
        { name: 'company', label: 'Company Name', type: 'text', required: true, placeholder: 'Company Name' },
        { name: 'phone', label: 'Phone', type: 'tel', required: false, placeholder: '+60 12-345 6789' },
        { name: 'employees', label: 'Company Size', type: 'select', required: true, options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
        { name: 'message', label: 'Tell us about your needs', type: 'textarea', required: false, placeholder: 'Describe your use case...' },
      ],
    }),
    successMsg: 'Demo request received! Our team will contact you within 24 hours.',
    status: 'active',
  },
  { id: uid(), name: 'Newsletter', slug: 'newsletter',
    description: 'Newsletter subscription form',
    config: JSON.stringify({
      fields: [
        { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'your@email.com' },
      ],
    }),
    successMsg: 'You\'re subscribed! Check your inbox for confirmation.',
    status: 'active',
  },
]

/* ------------------------------------------------------------------ */
/*  Seed                                                                */
/* ------------------------------------------------------------------ */

async function seed() {
  console.log('🌱 Seeding CMS data...')

  // Clean existing CMS data
  await db.cmsPage.deleteMany()
  await db.cmsMenuItem.deleteMany()
  await db.cmsTestimonial.deleteMany()
  await db.cmsCaseStudy.deleteMany()
  await db.cmsFaq.deleteMany()
  await db.cmsPartner.deleteMany()
  await db.cmsBlogPost.deleteMany()
  await db.cmsBlogCategory.deleteMany()
  await db.cmsBlogTag.deleteMany()
  await db.cmsForm.deleteMany()
  await db.cmsAnalyticsConfig.deleteMany()
  await db.subscriptionPlan.deleteMany()

  // Page + Sections
  const flatMenuItems: any[] = []
  for (const mi of menuItems) {
    const { children, ...rest } = mi
    flatMenuItems.push(rest)
    if (children) {
      for (const child of children) {
        flatMenuItems.push({ ...child, parentId: mi.id })
      }
    }
  }

  await db.cmsPage.create({ data: homePage })
  for (const s of sections) {
    await db.cmsSection.create({ data: s as any })
  }
  for (const mi of flatMenuItems) {
    await db.cmsMenuItem.create({ data: mi as any })
  }
  for (const t of testimonials) {
    await db.cmsTestimonial.create({ data: t as any })
  }
  for (const cs of caseStudies) {
    await db.cmsCaseStudy.create({ data: cs as any })
  }
  for (const f of faqs) {
    await db.cmsFaq.create({ data: f as any })
  }
  for (const p of partners) {
    await db.cmsPartner.create({ data: p as any })
  }
  for (const cat of blogCategories) {
    await db.cmsBlogCategory.create({ data: cat as any })
  }
  for (const tag of blogTags) {
    await db.cmsBlogTag.create({ data: tag as any })
  }
  for (const post of blogPosts) {
    await db.cmsBlogPost.create({ data: post as any })
  }
  for (const plan of plans) {
    await db.subscriptionPlan.create({ data: plan as any })
  }
  for (const form of forms) {
    await db.cmsForm.create({ data: form as any })
  }
  await db.cmsAnalyticsConfig.create({ data: analyticsConfig as any })

  console.log('✅ CMS seeded successfully!')
  console.log(`   - 1 page with ${sections.length} sections`)
  console.log(`   - ${flatMenuItems.length} menu items`)
  console.log(`   - ${testimonials.length} testimonials`)
  console.log(`   - ${caseStudies.length} case studies`)
  console.log(`   - ${faqs.length} FAQs`)
  console.log(`   - ${partners.length} partners`)
  console.log(`   - ${blogPosts.length} blog posts`)
  console.log(`   - ${plans.length} pricing plans`)
  console.log(`   - ${forms.length} forms`)
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
