import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding CMS data for SmartBuild EPPM...')

  await db.$transaction(async (tx) => {
    // =============================================================
    // 1. Create CmsPage — Home Page
    // =============================================================
    const homePage = await tx.cmsPage.create({
      data: {
        slug: 'home',
        path: '/',
        title: 'SmartBuild EPPM',
        isHomePage: true,
        status: 'published',
        locale: 'en',
        publishedAt: new Date(),
        seoTitle: 'SmartBuild EPPM — Enterprise Project Portfolio Management',
        seoDescription:
          'SmartBuild EPPM is the enterprise project portfolio management platform for construction, maintenance, and facility management. Deliver projects on time, on budget, with AI-powered analytics and real-time collaboration.',
        seoKeywords:
          'SmartBuild,EPPM,construction management,project management,Primavera,enterprise',
        ogImage: '/brand/smartbuild-primary-logo.svg',
      },
    })
    console.log('✓ CmsPage created: home (', homePage.id, ')')

    // =============================================================
    // 2. Create 20 CmsSection entries
    // =============================================================
    const sections = [
      {
        type: 'header',
        name: 'Header',
        order: 0,
        config: {
          logo: '/brand/smartbuild-primary-logo.svg',
          navigation: [],
          showRequestDemo: true,
          showLogin: true,
          showRegister: true,
          showSearch: true,
          showLanguage: true,
        },
      },
      {
        type: 'hero',
        name: 'Hero',
        order: 1,
        config: {
          badge: 'Enterprise EPPM Platform',
          headline: 'Deliver Projects On Time & On Budget',
          subheadline:
            'The all-in-one enterprise project portfolio management platform for construction, maintenance, and facility management. Powered by AI analytics and real-time collaboration.',
          primaryCta: { label: 'Start Free Trial', url: '/register' },
          secondaryCta: { label: 'Watch Demo', url: '#demo' },
          stats: [
            { value: '500+', label: 'Projects Managed' },
            { value: '50M+', label: 'Budget Tracked' },
            { value: '99.9%', label: 'Uptime' },
          ],
          videoUrl: null,
          dashboardImage: '/brand/smartbuild-app-dark.svg',
        },
      },
      {
        type: 'trusted-by',
        name: 'Trusted By',
        order: 2,
        config: {
          title: 'Trusted by Industry Leaders',
          companies: [
            { name: 'GAMUDA', logo: '/brand/gamuda.png' },
            { name: 'IJM', logo: '/brand/ijm.png' },
            { name: 'YTL', logo: '/brand/ytl.png' },
            { name: 'SUNWAY', logo: '/brand/sunway.png' },
            { name: 'UEM', logo: '/brand/uem.png' },
          ],
          autoScroll: true,
          speed: 30,
        },
      },
      {
        type: 'overview',
        name: 'Overview',
        order: 3,
        config: {
          title: 'Platform Overview',
          subtitle:
            'Everything you need to manage the full project lifecycle — from portfolio to closeout.',
          features: [
            {
              icon: 'LayoutDashboard',
              title: 'Unified Dashboard',
              description:
                'Single pane of truth for all projects, KPIs, and analytics.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Enterprise Security',
              description:
                'Multi-tenant isolation with RBAC permissions per tenant.',
            },
            {
              icon: 'BarChart3',
              title: 'Real-time Analytics',
              description:
                'Live dashboards, S-curves, and predictive analytics.',
            },
          ],
        },
      },
      {
        type: 'features',
        name: 'Features',
        order: 4,
        config: {
          title: 'Core Features',
          subtitle: 'Comprehensive tools for every phase of your project.',
          items: [
            {
              icon: 'FolderKanban',
              title: 'Projects & Portfolios',
              description:
                'Manage portfolios, programs, and projects across the enterprise.',
            },
            {
              icon: 'CalendarDays',
              title: 'Scheduling & Gantt',
              description:
                'Interactive Gantt charts and critical path analysis.',
            },
            {
              icon: 'TrendingUp',
              title: 'Resource Planning',
              description:
                'Plan and allocate resources efficiently across projects.',
            },
            {
              icon: 'DollarSign',
              title: 'Cost & EVM',
              description:
                'Earned Value Management and budget tracking.',
            },
            {
              icon: 'FileText',
              title: 'Document Control',
              description:
                'Version control for drawings, submittals, and RFIs.',
            },
            {
              icon: 'Shield',
              title: 'HSE & Quality',
              description:
                'Health, safety, and quality compliance management.',
            },
          ],
        },
      },
      {
        type: 'industries',
        name: 'Industries',
        order: 5,
        config: {
          title: 'Industry Solutions',
          subtitle: 'Built for the industries that build the world.',
          items: [
            {
              icon: 'Building2',
              title: 'Construction',
              description:
                'High-rise, infrastructure, and MEP projects.',
            },
            {
              icon: 'Settings',
              title: 'Facility Management',
              description:
                'Building maintenance, CMMS, and asset lifecycle.',
            },
            {
              icon: 'Cpu',
              title: 'Engineering',
              description:
                'Design, procurement, and commissioning.',
            },
            {
              icon: 'Fuel',
              title: 'Oil & Gas',
              description:
                'Upstream, downstream, and petrochemical.',
            },
            {
              icon: 'Factory',
              title: 'Manufacturing',
              description:
                'Production planning and quality control.',
            },
            {
              icon: 'Landmark',
              title: 'Government',
              description:
                'Public infrastructure and governance.',
            },
            {
              icon: 'Heart',
              title: 'Healthcare',
              description:
                'Hospital construction and facility management.',
            },
          ],
        },
      },
      {
        type: 'modules',
        name: 'Modules',
        order: 6,
        config: {
          title: 'Enterprise Modules',
          subtitle: '30+ integrated modules for every project need.',
          items: [
            {
              icon: 'Trello',
              title: 'Tender & Bid',
              description:
                'Manage RFPs, bid comparison, and vendor evaluation.',
            },
            {
              icon: 'Wrench',
              title: 'Maintenance & CMMS',
              description:
                'Work orders, preventive/corrective maintenance, CMMS.',
            },
            {
              icon: 'Receipt',
              title: 'Finance & ERP',
              description:
                'Invoicing, payments, cost tracking, accounts.',
            },
            {
              icon: 'Users',
              title: 'HR & Workforce',
              description:
                'Employee management, attendance, payroll, compliance.',
            },
            {
              icon: 'Package',
              title: 'Inventory',
              description:
                'Stock, warehouses, material management.',
            },
            {
              icon: 'ShoppingCart',
              title: 'Procurement',
              description:
                'Purchase orders, suppliers, goods receipt.',
            },
            {
              icon: 'Truck',
              title: 'Fleet & Assets',
              description:
                'Vehicle management, GPS tracking, maintenance.',
            },
            {
              icon: 'QrCode',
              title: 'QR & Digital',
              description:
                'QR-based inspections, asset tagging, site access.',
            },
            {
              icon: 'Globe',
              title: 'Customer Portal',
              description:
                'Client-facing project visibility and reporting.',
            },
            {
              icon: 'Headphones',
              title: 'Technician Portal',
              description:
                'Mobile-first field operations for technicians.',
            },
            {
              icon: 'Sparkles',
              title: 'AI Assistant',
              description:
                'AI-powered scheduling, reports, and analytics.',
            },
          ],
        },
      },
      {
        type: 'workflow',
        name: 'Workflow',
        order: 7,
        config: {
          title: 'How SmartBuild Works',
          subtitle: 'From complaint to completion — fully automated.',
          steps: [
            {
              step: 1,
              title: 'Complaint Received',
              description:
                'Client submits a maintenance request via the portal or mobile app.',
            },
            {
              step: 2,
              title: 'Auto-Assignment',
              description:
                'AI assigns the best technician based on skills and location.',
            },
            {
              step: 3,
              title: 'Work Order Created',
              description:
                'A structured work order is generated automatically.',
            },
            {
              step: 4,
              title: 'In Progress',
              description:
                'Technician completes the work and updates status in real-time.',
            },
            {
              step: 5,
              title: 'Completion & Sign-off',
              description:
                'Client reviews and approves the completed work.',
            },
            {
              step: 6,
              title: 'Invoice Generated',
              description:
                'Automatic invoice creation based on time and materials.',
            },
            {
              step: 7,
              title: 'Payment Processed',
              description:
                'Client pays via integrated payment gateway.',
            },
          ],
        },
      },
      {
        type: 'ai-features',
        name: 'AI Features',
        order: 8,
        config: {
          title: 'AI-Powered Intelligence',
          subtitle: 'Let AI handle the heavy lifting.',
          features: [
            {
              icon: 'Brain',
              title: 'AI Dashboard',
              description:
                'Auto-generated insights and anomaly detection.',
            },
            {
              icon: 'FileBarChart',
              title: 'AI Reports',
              description:
                'Natural language report generation from project data.',
            },
            {
              icon: 'Clock',
              title: 'AI Scheduling',
              description:
                'Intelligent resource and task scheduling.',
            },
            {
              icon: 'Search',
              title: 'AI Search',
              description:
                'Natural language search across all project data.',
            },
            {
              icon: 'MessageSquare',
              title: 'AI Assistant',
              description:
                'Chat-based AI helper for project questions.',
            },
            {
              icon: 'LineChart',
              title: 'AI Analytics',
              description:
                'Predictive analytics and forecasting.',
            },
          ],
        },
      },
      {
        type: 'screenshots',
        name: 'Screenshots',
        order: 9,
        config: {
          title: 'Platform Screenshots',
          subtitle: 'See SmartBuild in action.',
          items: [
            {
              image: '/brand/smartbuild-app-dark.svg',
              title: 'Dashboard View',
              description: 'Real-time project KPIs and analytics.',
            },
            {
              image: '/brand/smartbuild-app-dark.svg',
              title: 'Gantt Chart',
              description:
                'Interactive scheduling with drag-and-drop.',
            },
            {
              image: '/brand/smartbuild-app-dark.svg',
              title: 'Project Details',
              description:
                'Complete project information and tracking.',
            },
          ],
        },
      },
      {
        type: 'testimonials',
        name: 'Testimonials',
        order: 10,
        config: {
          title: 'What Our Clients Say',
          subtitle:
            'Trusted by leading construction and facility management companies.',
        },
      },
      {
        type: 'case-studies',
        name: 'Case Studies',
        order: 11,
        config: {
          title: 'Success Stories',
          subtitle: 'Real results from real projects.',
        },
      },
      {
        type: 'statistics',
        name: 'Statistics',
        order: 12,
        config: {
          title: 'By The Numbers',
          subtitle: 'Trusted by enterprises worldwide.',
          items: [
            { value: 500, label: 'Projects Delivered', prefix: '+', suffix: '+' },
            { value: 50, label: 'Countries', prefix: '+', suffix: '' },
            { value: 98, label: 'Client Satisfaction %', prefix: '', suffix: '%' },
            { value: 99.9, label: 'Platform Uptime %', prefix: '', suffix: '%' },
          ],
        },
      },
      {
        type: 'pricing',
        name: 'Pricing',
        order: 13,
        config: {
          title: 'Simple, Transparent Pricing',
          subtitle: 'Choose the plan that fits your organization.',
        },
      },
      {
        type: 'faq',
        name: 'FAQ',
        order: 14,
        config: {
          title: 'Frequently Asked Questions',
          subtitle: 'Everything you need to know.',
        },
      },
      {
        type: 'blog-preview',
        name: 'Blog Preview',
        order: 15,
        config: {
          title: 'Latest From SmartBuild',
          subtitle: 'News, insights, and industry updates.',
        },
      },
      {
        type: 'partners',
        name: 'Partners',
        order: 16,
        config: {
          title: 'Our Technology Partners',
          subtitle: 'Built with the best.',
        },
      },
      {
        type: 'cta',
        name: 'CTA',
        order: 17,
        config: {
          title: 'Ready to Transform Your Projects?',
          headline: 'Start your 14-day free trial today. No credit card required.',
          description:
            'Join 500+ construction companies already using SmartBuild to deliver projects faster.',
          primaryCta: { label: 'Start Free Trial', url: '/register' },
          secondaryCta: { label: 'Contact Sales', url: '/#contact' },
        },
      },
      {
        type: 'footer',
        name: 'Footer',
        order: 18,
        config: {
          companyName: 'SmartBuild',
          companyDescription: 'Enterprise Project Portfolio Management Platform',
          address:
            'Level 5, Menara A, Jalan Teknologi, 63000 Cyberjaya, Selangor',
          email: 'info@smartbuild.app',
          phone: '+60 3-0000 0000',
          socialLinks: {
            twitter: '#',
            linkedin: '#',
            youtube: '#',
            github: '#',
          },
          copyright: '2025 SmartBuild. All rights reserved.',
        },
      },
    ]

    for (const s of sections) {
      await tx.cmsSection.create({
        data: {
          pageId: homePage.id,
          type: s.type,
          name: s.name,
          order: s.order,
          visible: true,
          config: s.config,
        },
      })
    }
    console.log(`✓ ${sections.length} CmsSection entries created`)

    // =============================================================
    // 3. Create 5 CmsTestimonial entries
    // =============================================================
    const testimonials = [
      {
        name: 'Ahmad Faiz',
        position: 'COO',
        company: 'Gamuda Berhad',
        rating: 5,
        featured: true,
        order: 0,
        content:
          'SmartBuild has fundamentally changed how we manage our project portfolios. The real-time dashboarding and EVM integration replaced three separate tools we were previously using. Our project managers now have complete visibility into cost performance and schedule adherence across all active construction sites, which has reduced our average delay by 22% in the first year alone.',
      },
      {
        name: 'Siti Nurhaliza',
        position: 'Project Manager',
        company: 'IJM Corporation',
        rating: 5,
        featured: true,
        order: 1,
        content:
          'The Gantt chart and critical path analysis alone justified our investment. We run over 40 concurrent projects and SmartBuild handles the complexity without breaking a sweat. The AI-powered scheduling suggestion feature has been remarkably accurate in predicting resource conflicts before they happen, saving our team countless hours of manual rescheduling every month.',
      },
      {
        name: 'Tan Wei Ming',
        position: 'Director of Operations',
        company: 'YTL Construction',
        rating: 5,
        featured: true,
        order: 2,
        content:
          'Migrating from Primavera P6 was seamless thanks to the built-in import tool. What used to take our planning team two weeks of data cleanup now takes less than a day. The multi-tenant architecture also means our subsidiary companies each get their own secure workspace while leadership retains a consolidated portfolio view at the holding company level.',
      },
      {
        name: 'Rajesh Kumar',
        position: 'CTO',
        company: 'Sunway Group',
        rating: 5,
        featured: true,
        order: 3,
        content:
          'We evaluated six different EPPM platforms before choosing SmartBuild. The API access and webhook integrations allowed us to connect it directly to our ERP and procurement systems. The document control module with automatic versioning for drawings and submittals has virtually eliminated the RFI rework cycle that used to cost us millions in change orders annually.',
      },
      {
        name: 'Datin Dr. Amina',
        position: 'CEO',
        company: 'UEM Sunrise',
        rating: 5,
        featured: true,
        order: 4,
        content:
          'As a CEO, I need visibility without drowning in details. SmartBuild\'s executive reporting module gives me a single-page summary of all our property development projects with traffic-light health indicators and financial KPIs. The AI-generated monthly reports have replaced what our team used to spend three full days preparing, and the quality of insights has actually improved significantly.',
      },
    ]

    for (const t of testimonials) {
      await tx.cmsTestimonial.create({
        data: {
          name: t.name,
          position: t.position,
          company: t.company,
          rating: t.rating,
          featured: t.featured,
          order: t.order,
          status: 'published',
          locale: 'en',
          content: t.content,
        },
      })
    }
    console.log(`✓ ${testimonials.length} CmsTestimonial entries created`)

    // =============================================================
    // 4. Create 5 CmsPartner entries
    // =============================================================
    const partners = [
      { name: 'Procore', logo: '/brand/smartbuild-circle.svg', order: 0 },
      { name: 'Oracle', logo: '/brand/smartbuild-circle.svg', order: 1 },
      { name: 'Autodesk', logo: '/brand/smartbuild-circle.svg', order: 2 },
      { name: 'Microsoft', logo: '/brand/smartbuild-circle.svg', order: 3 },
      { name: 'Trimble', logo: '/brand/smartbuild-circle.svg', order: 4 },
    ]

    for (const p of partners) {
      await tx.cmsPartner.create({
        data: {
          name: p.name,
          logo: p.logo,
          order: p.order,
          status: 'active',
        },
      })
    }
    console.log(`✓ ${partners.length} CmsPartner entries created`)

    // =============================================================
    // 5. Create 8 CmsFaq entries
    // =============================================================
    const faqs = [
      {
        question: 'What is SmartBuild EPPM?',
        answer:
          'SmartBuild EPPM is an enterprise project portfolio management platform designed specifically for construction, maintenance, and facility management industries. It provides a unified workspace for managing portfolios, programs, projects, resources, costs, documents, and more — all powered by AI-driven analytics and real-time collaboration tools.',
        category: 'general',
        order: 0,
      },
      {
        question: 'How does the free trial work?',
        answer:
          'You get full access to the Professional plan features for 14 days with no credit card required. During the trial, you can create projects, invite team members, and explore all 30+ modules. At the end of the trial, you can choose a plan that fits your organization or extend with a custom enterprise demo.',
        category: 'billing',
        order: 1,
      },
      {
        question: 'Can I import from Primavera P6?',
        answer:
          'Yes. SmartBuild includes a built-in Primavera P6 import tool that supports XER and XML file formats. The importer maps activities, resources, relationships, and baselines automatically. Most customers complete their full migration within a single day, including data validation and cleanup.',
        category: 'integration',
        order: 2,
      },
      {
        question: 'Is my data secure?',
        answer:
          'Absolutely. SmartBuild uses AES-256 encryption at rest and TLS 1.3 in transit. The platform features multi-tenant isolation with per-tenant database separation, role-based access control (RBAC), and comprehensive audit logging. We are SOC 2 Type II compliant and undergo annual third-party penetration testing.',
        category: 'security',
        order: 3,
      },
      {
        question: 'Do you offer on-premise deployment?',
        answer:
          'Yes, on-premise and private cloud deployments are available on our Enterprise and Custom plans. Our deployment team handles the full installation, configuration, and knowledge transfer. We support Docker, Kubernetes, and bare-metal environments with ongoing maintenance and upgrade support.',
        category: 'deployment',
        order: 4,
      },
      {
        question: 'What support is included?',
        answer:
          'All plans include email support with a 24-hour response time. Professional and Enterprise plans include priority live chat and phone support. Enterprise customers also get a dedicated account manager, custom onboarding, quarterly business reviews, and access to our 24/7 emergency hotline for critical production issues.',
        category: 'support',
        order: 5,
      },
      {
        question: 'Can I customize the platform?',
        answer:
          'Yes. SmartBuild supports custom fields, custom workflows, custom report templates, and custom dashboards. Enterprise customers can also access our REST API and webhook system for deep integrations. White-labeling with custom domains, branding, and login pages is available on Enterprise and Custom plans.',
        category: 'general',
        order: 6,
      },
      {
        question: 'How does billing work?',
        answer:
          'We offer both monthly and annual billing. Annual plans receive a 20% discount. Invoicing is done at the start of each billing cycle, and you can pay via bank transfer, credit card, or direct debit. There are no hidden fees — the price you see includes all modules, hosting, backups, and standard support for your chosen plan.',
        category: 'billing',
        order: 7,
      },
    ]

    for (const f of faqs) {
      await tx.cmsFaq.create({
        data: {
          question: f.question,
          answer: f.answer,
          category: f.category,
          order: f.order,
          locale: 'en',
          status: 'published',
        },
      })
    }
    console.log(`✓ ${faqs.length} CmsFaq entries created`)

    // =============================================================
    // 6. Create CmsMenuItems for 'main' menu
    // =============================================================
    const menuItemData = [
      { label: 'Home', url: '/', type: 'link' as const, order: 0 },
      { label: 'Products', url: null, type: 'dropdown' as const, order: 1 },
      { label: 'Features', url: '/#features', type: 'link' as const, order: 2 },
      { label: 'Solutions', url: '/#solutions', type: 'link' as const, order: 3 },
      { label: 'Industries', url: '/#industries', type: 'link' as const, order: 4 },
      { label: 'Pricing', url: '/pricing', type: 'link' as const, order: 5 },
      { label: 'Blog', url: '/blog', type: 'link' as const, order: 6 },
      { label: 'Contact', url: '/#contact', type: 'link' as const, order: 7 },
      { label: 'Login', url: '/login', type: 'link' as const, order: 8 },
      { label: 'Register', url: '/register', type: 'link' as const, order: 9 },
    ]

    const createdMenuItems = []
    for (const item of menuItemData) {
      const created = await tx.cmsMenuItem.create({
        data: {
          label: item.label,
          url: item.url,
          type: item.type,
          order: item.order,
          visible: true,
          locale: 'en',
          menu: 'main',
          parentId: createdMenuItems.length > 0 ? createdMenuItems[0].id : null,
        },
      })
      createdMenuItems.push(created)
    }

    // Update 'Products' to be top-level (parentId: null)
    await tx.cmsMenuItem.update({
      where: { id: createdMenuItems[1].id },
      data: { parentId: null },
    })

    console.log(`✓ ${createdMenuItems.length} CmsMenuItem entries created`)
  })

  console.log('\n✅ CMS seed complete!')
  console.log('  - 1 CmsPage (home)')
  console.log('  - 19 CmsSection entries')
  console.log('  - 5 CmsTestimonial entries')
  console.log('  - 5 CmsPartner entries')
  console.log('  - 8 CmsFaq entries')
  console.log('  - 10 CmsMenuItem entries')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
