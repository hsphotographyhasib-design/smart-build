'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ClipboardList,
  ShoppingCart,
  Package,
  DollarSign,
  Target,
  UserCog,
  Wallet,
  Wrench,
  CalendarRange,
  Building,
  Smartphone,
  BarChart3,
  Brain,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Settings2,
  TrendingUp,
  ShieldCheck,
  Zap,
  ListChecks,
  BarChart2,
  FileText,
  Bell,
  Layers,
  type LucideIcon,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Icon & colour maps                                                 */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, LucideIcon> = {
  'project-management': LayoutDashboard,
  'resource-management': Users,
  'complaint-management': MessageSquare,
  'work-orders': ClipboardList,
  'preventive-maintenance': CalendarRange,
  procurement: ShoppingCart,
  inventory: Package,
  finance: DollarSign,
  'cost-control': Target,
  hr: UserCog,
  payroll: Wallet,
  'asset-management': Wrench,
  scheduling: CalendarRange,
  'client-portal': Building,
  'mobile-app': Smartphone,
  reporting: BarChart3,
  'ai-assistant': Brain,
}

const colorMap: Record<string, string> = {
  'project-management': 'bg-amber-100 text-amber-600',
  'resource-management': 'bg-emerald-100 text-emerald-600',
  'complaint-management': 'bg-orange-100 text-orange-600',
  'work-orders': 'bg-teal-100 text-teal-600',
  'preventive-maintenance': 'bg-amber-100 text-amber-600',
  procurement: 'bg-emerald-100 text-emerald-600',
  inventory: 'bg-orange-100 text-orange-600',
  finance: 'bg-teal-100 text-teal-600',
  'cost-control': 'bg-amber-100 text-amber-600',
  hr: 'bg-emerald-100 text-emerald-600',
  payroll: 'bg-orange-100 text-orange-600',
  'asset-management': 'bg-teal-100 text-teal-600',
  scheduling: 'bg-amber-100 text-amber-600',
  'client-portal': 'bg-emerald-100 text-emerald-600',
  'mobile-app': 'bg-orange-100 text-orange-600',
  reporting: 'bg-teal-100 text-teal-600',
  'ai-assistant': 'bg-amber-100 text-amber-600',
}

/* ------------------------------------------------------------------ */
/*  Feature data (6 detailed + 11 generic)                             */
/* ------------------------------------------------------------------ */

interface KeyFeature {
  icon: LucideIcon
  title: string
  description: string
}

interface Benefit {
  title: string
  description: string
}

interface WorkflowStep {
  step: number
  title: string
  description: string
}

interface FAQItem {
  question: string
  answer: string
}

interface FeatureInfo {
  title: string
  metaTitle: string
  metaDescription: string
  overview: string[]
  keyFeatures: KeyFeature[]
  benefits: Benefit[]
  workflow: WorkflowStep[]
  faq: FAQItem[]
}

const featureData: Record<string, FeatureInfo> = {
  /* ===== DETAILED ===== */

  'project-management': {
    title: 'Project Management',
    metaTitle: 'SmartBuild Project Management - End-to-End Construction Project Tracking',
    metaDescription:
      'Manage every phase of your construction projects with SmartBuild. From planning and budgeting to execution and closeout.',
    overview: [
      'SmartBuild Project Management gives you complete visibility into every phase of your construction projects. Whether you are managing a single residential build or a portfolio of commercial developments, our module adapts to your workflow and keeps every stakeholder aligned.',
      'Create detailed project plans with milestones, tasks, and dependencies. Assign resources, set deadlines, and track progress in real time through interactive Gantt charts and Kanban boards. Automatic notifications ensure that nothing falls through the cracks.',
      'With integrated document management, daily logs, and change order tracking, all project information lives in one place. This eliminates siloed spreadsheets, reduces miscommunication, and keeps your team focused on delivering projects on time and within budget.',
    ],
    keyFeatures: [
      {
        icon: ListChecks,
        title: 'Task & Milestone Tracking',
        description:
          'Break projects into tasks, set dependencies, and monitor progress with visual Gantt charts and Kanban boards.',
      },
      {
        icon: Layers,
        title: 'Multi-Project Dashboard',
        description:
          'See the status of all active projects at a glance with real-time KPIs, health scores, and timeline indicators.',
      },
      {
        icon: FileText,
        title: 'Document Management',
        description:
          'Upload, version, and share drawings, contracts, and specifications linked directly to project milestones.',
      },
      {
        icon: Bell,
        title: 'Automated Notifications',
        description:
          'Get alerts for upcoming deadlines, overdue tasks, and status changes to keep projects on track.',
      },
      {
        icon: Settings2,
        title: 'Custom Workflows',
        description:
          'Configure approval chains, stage gates, and status transitions that match your company\'s processes.',
      },
      {
        icon: TrendingUp,
        title: 'Progress Reporting',
        description:
          'Generate earned-value, status, and progress reports for stakeholders and clients in one click.',
      },
    ],
    benefits: [
      {
        title: 'Reduce Project Overruns by 30%',
        description:
          'Proactive scheduling and resource planning help you catch delays early and keep projects on budget.',
      },
      {
        title: 'Improve Team Collaboration',
        description:
          'Centralized communication, task assignments, and file sharing keep everyone aligned and accountable.',
      },
      {
        title: 'Faster Decision-Making',
        description:
          'Real-time dashboards and automated alerts give managers the data they need to act quickly.',
      },
      {
        title: 'Complete Audit Trail',
        description:
          'Every change, comment, and status update is logged, providing full traceability for compliance.',
      },
    ],
    workflow: [
      {
        step: 1,
        title: 'Plan Your Project',
        description:
          'Define scope, set milestones, assign resources, and create a detailed project schedule with dependencies.',
      },
      {
        step: 2,
        title: 'Execute & Track',
        description:
          'Teams update task progress daily. Managers monitor dashboards and receive automated alerts for at-risk items.',
      },
      {
        step: 3,
        title: 'Report & Close',
        description:
          'Generate completion reports, archive documents, and capture lessons learned for continuous improvement.',
      },
    ],
    faq: [
      {
        question: 'Can I manage multiple projects simultaneously?',
        answer:
          'Absolutely. SmartBuild supports unlimited projects with a unified portfolio dashboard that shows progress, budget health, and resource allocation across all active work.',
      },
      {
        question: 'Does it integrate with other modules like finance and procurement?',
        answer:
          'Yes — Project Management is deeply integrated with Finance, Procurement, Resource Management, and Cost Control. Budget items link directly to purchase orders, and resource allocation syncs with HR and equipment modules.',
      },
      {
        question: 'Can clients view project progress?',
        answer:
          'Through the Client Portal, clients can see real-time progress, milestones, and documents that you choose to share — all without needing a full license.',
      },
      {
        question: 'Is there a limit on the number of tasks per project?',
        answer:
          'No. SmartBuild is designed to handle projects of any size, from small renovations with dozens of tasks to large infrastructure projects with thousands.',
      },
    ],
  },

  'resource-management': {
    title: 'Resource Management',
    metaTitle: 'SmartBuild Resource Management - Workforce, Equipment & Material Optimization',
    metaDescription:
      'Optimize your construction workforce, equipment, and materials with SmartBuild Resource Management for maximum efficiency.',
    overview: [
      'SmartBuild Resource Management provides a unified platform to plan, allocate, and track all your construction resources — labour, equipment, vehicles, and tools — across every project in your portfolio.',
      'With resource-loaded scheduling, you can visualize capacity constraints before they become bottlenecks. Drag-and-drop planning lets you quickly reassign resources when priorities shift, while real-time utilization dashboards highlight underused or over-allocated assets.',
      'The module integrates seamlessly with HR, Payroll, and Procurement so that resource plans stay in sync with actual availability, costs, and procurement lead times. The result is fewer idle resources, lower costs, and faster project delivery.',
    ],
    keyFeatures: [
      {
        icon: Users,
        title: 'Workforce Planning',
        description:
          'View all employees and labour groups by skill, availability, and project assignment in a single calendar.',
      },
      {
        icon: Wrench,
        title: 'Equipment & Vehicle Tracking',
        description:
          'Track heavy equipment, vehicles, and tools with maintenance schedules, utilization rates, and GPS location.',
      },
      {
        icon: BarChart2,
        title: 'Utilization Dashboards',
        description:
          'Monitor resource utilization in real time with heat maps and charts that highlight over- or under-allocation.',
      },
      {
        icon: Clock,
        title: 'Resource Forecasting',
        description:
          'Predict future resource needs based on project pipelines, seasonal patterns, and historical utilization.',
      },
      {
        icon: Zap,
        title: 'Quick Reassignment',
        description:
          'Drag-and-drop interface lets you reassign resources between projects when priorities change.',
      },
    ],
    benefits: [
      {
        title: 'Up to 25% Higher Utilization',
        description:
          'Identify idle resources and redistribute them where they\'re needed most with data-driven insights.',
      },
      {
        title: 'Eliminate Double-Booking',
        description:
          'Conflict detection prevents assigning the same person or piece of equipment to overlapping tasks.',
      },
      {
        title: 'Lower Equipment Downtime',
        description:
          'Integrated maintenance scheduling ensures equipment is serviced before it fails on-site.',
      },
      {
        title: 'Data-Driven Hiring Decisions',
        description:
          'Forecasting reports show exactly when you need more crew members based on upcoming project demand.',
      },
    ],
    workflow: [
      {
        step: 1,
        title: 'Define Resource Pool',
        description:
          'Register all workforce, equipment, and tools with their skills, certifications, and availability windows.',
      },
      {
        step: 2,
        title: 'Allocate to Projects',
        description:
          'Use drag-and-drop planning to assign resources to project tasks, with automatic conflict detection.',
      },
      {
        step: 3,
        title: 'Monitor & Optimize',
        description:
          'Track utilization, productivity, and costs in real time. Adjust allocations as conditions change.',
      },
    ],
    faq: [
      {
        question: 'How does resource management connect to payroll?',
        answer:
          'Attendance data from resource assignments flows directly into Payroll, so hours worked on each project are automatically accounted for in salary calculations.',
      },
      {
        question: 'Can I track equipment GPS location?',
        answer:
          'Yes. SmartBuild supports GPS integration for vehicles and heavy equipment, showing real-time locations on an interactive map.',
      },
      {
        question: 'What happens when resources are over-allocated?',
        answer:
          'The system highlights conflicts visually and sends alerts to managers, allowing quick reassignment before it impacts the schedule.',
      },
      {
        question: 'Does it support subcontractor resources?',
        answer:
          'Yes. Subcontractor crews can be added to the resource pool with their own availability, skills, and cost rates.',
      },
    ],
  },

  'complaint-management': {
    title: 'Complaint Management',
    metaTitle: 'SmartBuild Complaint Management - Automated Workflows & SLA Tracking',
    metaDescription:
      'Handle client complaints efficiently with automated workflows, SLA tracking, and escalation rules in SmartBuild.',
    overview: [
      'SmartBuild Complaint Management transforms how construction companies handle client issues. Instead of scattered emails and phone calls, every complaint is captured in a structured workflow with automatic SLA tracking, escalation rules, and resolution timelines.',
      'Clients can submit complaints through the Client Portal, WhatsApp, or directly through their account manager. Each complaint is assigned a ticket number, categorized by type and severity, and routed to the appropriate team based on configurable rules.',
      'Real-time dashboards show complaint volumes, resolution rates, and SLA compliance. Managers can identify recurring issues and take corrective action, turning complaints into opportunities for continuous improvement.',
    ],
    keyFeatures: [
      {
        icon: MessageSquare,
        title: 'Multi-Channel Intake',
        description:
          'Accept complaints via the Client Portal, WhatsApp integration, email, or manual entry from your team.',
      },
      {
        icon: Clock,
        title: 'SLA Tracking & Escalation',
        description:
          'Define response and resolution SLAs per complaint type. Automatic escalation when deadlines are at risk.',
      },
      {
        icon: Bell,
        title: 'Real-Time Notifications',
        description:
          'Instant alerts for new complaints, status changes, and SLA breaches keep your team responsive.',
      },
      {
        icon: TrendingUp,
        title: 'Analytics & Trends',
        description:
          'Dashboards show complaint volumes by category, resolution times, and customer satisfaction scores.',
      },
      {
        icon: ShieldCheck,
        title: 'Audit Trail',
        description:
          'Every action on a complaint is logged — from assignment to resolution — for full accountability.',
      },
    ],
    benefits: [
      {
        title: 'Faster Resolution Times',
        description:
          'Automated routing and SLA enforcement reduce average resolution time by up to 40%.',
      },
      {
        title: 'Higher Client Satisfaction',
        description:
          'Transparent tracking and proactive communication keep clients informed throughout the resolution process.',
      },
      {
        title: 'Identify Recurring Issues',
        description:
          'Trend analytics surface patterns so you can fix root causes, not just individual complaints.',
      },
      {
        title: 'Compliance & Accountability',
        description:
          'Complete audit trails and escalation records ensure every complaint is handled according to policy.',
      },
    ],
    workflow: [
      {
        step: 1,
        title: 'Submit Complaint',
        description:
          'Client submits a complaint through the portal, WhatsApp, or via a team member on their behalf.',
      },
      {
        step: 2,
        title: 'Assign & Investigate',
        description:
          'The system auto-assigns the ticket based on rules. The responsible team investigates and updates the timeline.',
      },
      {
        step: 3,
        title: 'Resolve & Close',
        description:
          'After resolution, the client is notified and can rate the service. Data feeds into analytics for improvement.',
      },
    ],
    faq: [
      {
        question: 'Can clients submit complaints via WhatsApp?',
        answer:
          'Yes. SmartBuild integrates with WhatsApp Business API, allowing clients to send complaints as messages that are automatically converted into tickets.',
      },
      {
        question: 'How are SLAs configured?',
        answer:
          'You can define different SLA templates for each complaint type, specifying first-response time, resolution time, and escalation tiers.',
      },
      {
        question: 'Is there a client satisfaction survey?',
        answer:
          'Yes. After a complaint is resolved, clients can rate the service on a 1-5 scale. These ratings feed into your quality dashboards.',
      },
    ],
  },

  finance: {
    title: 'Finance',
    metaTitle: 'SmartBuild Finance - Invoicing, Payments & Cashflow Management',
    metaDescription:
      'Streamline construction financial management with invoicing, payment tracking, cashflow forecasting, and daybook accounting in SmartBuild.',
    overview: [
      'SmartBuild Finance gives construction companies complete control over their financial operations. From invoicing and payment collection to cashflow forecasting and daybook accounting, every financial transaction is captured and organized in one place.',
      'The module supports multiple invoice types — progress claims, retention invoices, and final invoices — with configurable approval workflows. Automated payment reminders reduce outstanding receivables, while real-time cashflow dashboards give CFOs the visibility they need to make informed decisions.',
      'Deep integration with Project Management and Procurement means that every cost is automatically linked to the right project and cost code, eliminating manual reconciliation and giving you accurate, up-to-date financial reporting.',
    ],
    keyFeatures: [
      {
        icon: FileText,
        title: 'Invoice Management',
        description:
          'Create progress, retention, and final invoices with approval workflows, tax calculations, and batch generation.',
      },
      {
        icon: DollarSign,
        title: 'Payment Tracking',
        description:
          'Record payments, set up reminders for overdue amounts, and reconcile bank transactions automatically.',
      },
      {
        icon: BarChart2,
        title: 'Cashflow Forecasting',
        description:
          'Project future cash inflows and outflows based on contract values, payment terms, and scheduled expenses.',
      },
      {
        icon: ListChecks,
        title: 'Daybook Accounting',
        description:
          'Maintain a comprehensive daybook of all financial transactions with search, filter, and export capabilities.',
      },
      {
        icon: Layers,
        title: 'Bill of Quantities (BOQ)',
        description:
          'Create and manage BOQs linked to project budgets, with unit-rate pricing and variance tracking.',
      },
      {
        icon: ShieldCheck,
        title: 'Tax & Compliance',
        description:
          'Automatic tax calculations, TDS deductions, and compliance-ready reports simplify your financial reporting.',
      },
    ],
    benefits: [
      {
        title: 'Reduce Receivables Cycle by 20%',
        description:
          'Automated reminders and online payment options help you get paid faster.',
      },
      {
        title: 'Accurate Project Costing',
        description:
          'Every financial transaction is linked to projects and cost codes, giving you true project profitability.',
      },
      {
        title: 'Better Cashflow Visibility',
        description:
          'Real-time dashboards and forecasts help you avoid cash crunches and plan capital expenditures.',
      },
      {
        title: 'Audit-Ready Records',
        description:
          'Complete transaction history, approval trails, and exportable reports simplify year-end audits.',
      },
    ],
    workflow: [
      {
        step: 1,
        title: 'Set Up Financial Structure',
        description:
          'Configure chart of accounts, cost codes, tax rates, and approval workflows for your organization.',
      },
      {
        step: 2,
        title: 'Process Transactions',
        description:
          'Create invoices, record payments, manage expenses, and track procurement — all linked to projects.',
      },
      {
        step: 3,
        title: 'Analyze & Report',
        description:
          'Generate P&L statements, cashflow reports, and project profitability analyses for stakeholders.',
      },
    ],
    faq: [
      {
        question: 'Does SmartBuild support multi-currency?',
        answer:
          'The finance module tracks transactions in your base currency. Multi-currency support is available for projects with international suppliers or clients.',
      },
      {
        question: 'Can I generate statutory reports?',
        answer:
          'Yes. SmartBuild produces tax summaries, TDS reports, and other compliance-ready financial reports that can be exported for filing.',
      },
      {
        question: 'How does finance connect to procurement?',
        answer:
          'Purchase orders and goods receipts flow directly into accounts payable. Invoices can be matched against POs for three-way reconciliation.',
      },
      {
        question: 'Can clients view their invoices online?',
        answer:
          'Yes. Through the Client Portal, clients can view invoices, download PDFs, and see payment history — reducing your accounts receivable calls.',
      },
    ],
  },

  procurement: {
    title: 'Procurement',
    metaTitle: 'SmartBuild Procurement - Purchase Orders, Suppliers & Delivery Tracking',
    metaDescription:
      'Streamline construction procurement with SmartBuild. Manage purchase requests, purchase orders, supplier relationships, and delivery tracking.',
    overview: [
      'SmartBuild Procurement covers the entire purchasing lifecycle — from requisition to delivery — with full traceability and approval controls. Whether you are ordering bulk materials, hiring subcontractors, or renting equipment, every step is tracked in one system.',
      'Purchase requests can be raised from any project or department, routed through configurable approval chains, and automatically converted into purchase orders. Supplier management features let you maintain a database of vendors, compare quotes, and track delivery performance.',
      'Integration with Inventory ensures that received goods update stock levels automatically, while integration with Finance ensures that POs flow seamlessly into accounts payable. The result is a streamlined procurement process that reduces cycle times and prevents unauthorized spending.',
    ],
    keyFeatures: [
      {
        icon: ShoppingCart,
        title: 'Purchase Request & Approval',
        description:
          'Raise requests from projects, route through multi-level approvals, and convert to POs with one click.',
      },
      {
        icon: FileText,
        title: 'Purchase Order Management',
        description:
          'Create, send, and track POs with line-item details, delivery schedules, and terms and conditions.',
      },
      {
        icon: Users,
        title: 'Supplier Management',
        description:
          'Maintain a vendor database with contact info, ratings, past orders, and performance scorecards.',
      },
      {
        icon: Package,
        title: 'Goods Receipt & Inspection',
        description:
          'Record deliveries, perform quality inspections, and automatically update inventory stock levels.',
      },
      {
        icon: BarChart2,
        title: 'Spend Analytics',
        description:
          'Track procurement spend by category, project, and supplier with visual dashboards and trend reports.',
      },
    ],
    benefits: [
      {
        title: 'Cut Procurement Cycle Time',
        description:
          'Automated approval workflows and PO templates reduce the time from request to order by up to 50%.',
      },
      {
        title: 'Prevent Maverick Spending',
        description:
          'All purchases must go through approved workflows, ensuring compliance with budgets and policies.',
      },
      {
        title: 'Better Supplier Relationships',
        description:
          'Performance tracking and communication tools help you build stronger vendor partnerships.',
      },
      {
        title: 'Accurate Cost Tracking',
        description:
          'Every PO is linked to a project and cost code, so procurement costs are always reflected in project budgets.',
      },
    ],
    workflow: [
      {
        step: 1,
        title: 'Raise a Request',
        description:
          'A project team member creates a purchase request with material details, quantities, and required dates.',
      },
      {
        step: 2,
        title: 'Approve & Order',
        description:
          'The request goes through approval chains. Once approved, it becomes a PO sent to the selected supplier.',
      },
      {
        step: 3,
        title: 'Receive & Reconcile',
        description:
          'Goods are received on-site, inspected for quality, and the receipt updates inventory and triggers payment.',
      },
    ],
    faq: [
      {
        question: 'Can I compare quotes from multiple suppliers?',
        answer:
          'Yes. You can attach quotes from multiple vendors to a purchase request and compare pricing before converting to a PO.',
      },
      {
        question: 'Does it support partial deliveries?',
        answer:
          'Absolutely. Record partial deliveries against a PO, and the system tracks remaining quantities for follow-up.',
      },
      {
        question: 'How does procurement connect to inventory?',
        answer:
          'When goods are received via the procurement module, inventory stock levels are updated automatically. No manual entry required.',
      },
      {
        question: 'Can suppliers access a vendor portal?',
        answer:
          'The supplier portal (coming soon) will allow vendors to view POs, submit invoices, and update delivery statuses online.',
      },
    ],
  },

  hr: {
    title: 'HR Management',
    metaTitle: 'SmartBuild HR Management - Employee Records, Leave & Workforce Administration',
    metaDescription:
      'Manage your construction workforce with SmartBuild HR. Employee records, leave management, onboarding, and compliance in one platform.',
    overview: [
      'SmartBuild HR Management is built for the unique demands of the construction industry. Managing a mobile, project-based workforce requires more than a traditional HR system — you need tools that handle site transfers, shift rotations, and compliance requirements specific to construction.',
      'The module maintains comprehensive employee records including personal details, qualifications, certifications, and employment history. Leave management supports multiple leave types with configurable accrual rules, and all requests route through the appropriate approval chain.',
      'Integration with Attendance, Payroll, and Resource Management ensures that HR data flows seamlessly across the platform. Managers can view workforce availability, track training expiry, and ensure compliance with labour regulations — all from a single dashboard.',
    ],
    keyFeatures: [
      {
        icon: Users,
        title: 'Employee Database',
        description:
          'Comprehensive employee profiles with personal info, qualifications, certifications, employment history, and documents.',
      },
      {
        icon: CalendarRange,
        title: 'Leave Management',
        description:
          'Multiple leave types, accrual rules, holiday calendars, and multi-level approval workflows.',
      },
      {
        icon: Bell,
        title: 'Compliance Tracking',
        description:
          'Track certification expiry, safety training renewals, and visa/work permit deadlines with automated reminders.',
      },
      {
        icon: ShieldCheck,
        title: 'Onboarding & Offboarding',
        description:
          'Structured checklists for new hire onboarding and employee exit processes, including document collection.',
      },
      {
        icon: BarChart2,
        title: 'Workforce Analytics',
        description:
          'Dashboards showing headcount, turnover rates, attendance trends, and workforce demographics.',
      },
    ],
    benefits: [
      {
        title: 'Centralized Employee Data',
        description:
          'One source of truth for all employee information eliminates scattered records and reduces admin time.',
      },
      {
        title: 'Never Miss a Certification Expiry',
        description:
          'Automated alerts for expiring certifications and training keep your workforce compliant and safe.',
      },
      {
        title: 'Streamlined Leave Processing',
        description:
          'Self-service leave requests with auto-approval rules reduce HR workload and improve employee satisfaction.',
      },
      {
        title: 'Better Workforce Planning',
        description:
          'Integration with Resource Management gives HR visibility into project demands for proactive hiring.',
      },
    ],
    workflow: [
      {
        step: 1,
        title: 'Set Up Your Workforce',
        description:
          'Import or enter employee records, define leave policies, and configure approval workflows.',
      },
      {
        step: 2,
        title: 'Manage Day-to-Day HR',
        description:
          'Process leave requests, track attendance, update records, and handle compliance requirements.',
      },
      {
        step: 3,
        title: 'Analyze & Improve',
        description:
          'Use workforce analytics to identify trends, plan hiring, and improve retention strategies.',
      },
    ],
    faq: [
      {
        question: 'Does it handle site transfers?',
        answer:
          'Yes. You can transfer employees between sites or projects while maintaining their full employment history and benefits continuity.',
      },
      {
        question: 'Can employees self-serve for leave requests?',
        answer:
          'Yes. Employees can submit leave requests through the mobile app or web portal. Approvals route to their manager automatically.',
      },
      {
        question: 'How does HR connect to payroll?',
        answer:
          'Employee salary details, leave balances, and attendance data flow directly into the Payroll module for accurate salary computation.',
      },
      {
        question: 'Is there a document management feature?',
        answer:
          'Yes. Upload and manage employee documents like ID proofs, contracts, certificates, and photographs with version control.',
      },
    ],
  },

  /* ===== GENERIC (remaining 11) ===== */

  'work-orders': {
    title: 'Work Orders',
    metaTitle: 'SmartBuild Work Orders - Generate, Assign & Track Work Orders',
    metaDescription:
      'Efficiently generate, assign, and track work orders from creation to completion with SmartBuild.',
    overview: [
      'SmartBuild Work Orders provides a streamlined system for creating, assigning, and tracking work orders across your organization. Whether it is a maintenance repair, an inspection task, or a service request, every work order follows a structured lifecycle from creation to completion.',
      'The module integrates with scheduling, resource management, and inventory to ensure that work orders are assigned to the right people with the right materials at the right time. Real-time status tracking and automated notifications keep everyone informed.',
      'With detailed reporting and analytics, managers can identify recurring issues, measure response times, and optimize their maintenance and service operations for maximum efficiency.',
    ],
    keyFeatures: [
      { icon: ClipboardList, title: 'Work Order Creation', description: 'Quickly create work orders with all required details including priority, location, and assigned team.' },
      { icon: Users, title: 'Team Assignment', description: 'Assign work orders to individuals or crews based on skills, availability, and location.' },
      { icon: Clock, title: 'Status Tracking', description: 'Track work order status in real time with configurable stages from open to completed.' },
      { icon: Bell, title: 'Notifications', description: 'Automated alerts for new assignments, status changes, and overdue work orders.' },
    ],
    benefits: [
      { title: 'Faster Turnaround', description: 'Automated assignment and tracking reduce the time from request to resolution.' },
      { title: 'Full Traceability', description: 'Every work order has a complete history of actions, notes, and time logs.' },
      { title: 'Better Resource Usage', description: 'Integration with scheduling ensures optimal allocation of people and materials.' },
    ],
    workflow: [
      { step: 1, title: 'Create Request', description: 'Submit a work order with details about the task, location, and priority level.' },
      { step: 2, title: 'Assign & Execute', description: 'System assigns based on rules. The assigned team executes and updates progress.' },
      { step: 3, title: 'Complete & Review', description: 'Work is verified, marked complete, and data feeds into maintenance analytics.' },
    ],
    faq: [
      { question: 'Can work orders be created from mobile?', answer: 'Yes. Field teams can create and update work orders directly from the SmartBuild mobile app.' },
      { question: 'Can I set up recurring work orders?', answer: 'Yes. Create recurring schedules for routine maintenance tasks that auto-generate work orders at defined intervals.' },
      { question: 'How does it connect to inventory?', answer: 'Materials used on a work order can be drawn from inventory, automatically updating stock levels.' },
    ],
  },

  'preventive-maintenance': {
    title: 'Preventive Maintenance',
    metaTitle: 'SmartBuild Preventive Maintenance - Schedule & Automate Maintenance',
    metaDescription:
      'Reduce equipment downtime with SmartBuild Preventive Maintenance. Schedule, automate, and track maintenance activities.',
    overview: [
      'SmartBuild Preventive Maintenance helps construction companies move from reactive to proactive maintenance strategies. By scheduling regular maintenance activities based on time intervals, usage meters, or condition triggers, you can significantly reduce unexpected equipment failures and downtime.',
      'The module supports flexible scheduling with calendar-based and meter-based triggers. Maintenance tasks are automatically generated, assigned to technicians, and tracked through completion. Integration with Asset Management ensures that maintenance history is always accessible.',
      'Analytics dashboards show maintenance compliance rates, mean time between failures, and cost comparisons between preventive and corrective maintenance — helping you optimize your maintenance strategy over time.',
    ],
    keyFeatures: [
      { icon: CalendarRange, title: 'Automated Scheduling', description: 'Create maintenance schedules based on time, usage, or condition triggers with automatic task generation.' },
      { icon: Wrench, title: 'Asset Integration', description: 'Link maintenance schedules to specific assets with full history and cost tracking.' },
      { icon: BarChart2, title: 'Compliance Dashboards', description: 'Track maintenance completion rates and identify overdue or missed tasks at a glance.' },
      { icon: TrendingUp, title: 'Cost Analysis', description: 'Compare preventive vs. corrective maintenance costs to optimize your maintenance budget.' },
    ],
    benefits: [
      { title: 'Reduce Downtime by 35%', description: 'Proactive maintenance prevents costly equipment breakdowns on active construction sites.' },
      { title: 'Extend Asset Lifespan', description: 'Regular maintenance keeps equipment in peak condition, delaying costly replacements.' },
      { title: 'Lower Maintenance Costs', description: 'Preventive maintenance is consistently cheaper than emergency repairs and project delays.' },
    ],
    workflow: [
      { step: 1, title: 'Define Schedules', description: 'Create maintenance plans for each asset with frequency, tasks, and required materials.' },
      { step: 2, title: 'Auto-Generate Tasks', description: 'The system generates work orders automatically when schedules are due.' },
      { step: 3, title: 'Execute & Record', description: 'Technicians complete maintenance, record findings, and the history is saved for future reference.' },
    ],
    faq: [
      { question: 'Can I set maintenance based on equipment usage hours?', answer: 'Yes. SmartBuild supports meter-based triggers so maintenance is scheduled based on actual usage, not just calendar time.' },
      { question: 'Does it integrate with asset management?', answer: 'Yes. All maintenance records are linked to the asset profile, giving you a complete history in one place.' },
      { question: 'Can I get alerts for overdue maintenance?', answer: 'Absolutely. The system sends notifications for upcoming, due, and overdue maintenance tasks.' },
    ],
  },

  inventory: {
    title: 'Inventory',
    metaTitle: 'SmartBuild Inventory - Real-Time Material & Equipment Tracking',
    metaDescription:
      'Track construction materials, equipment, and tools with real-time stock levels using SmartBuild Inventory.',
    overview: [
      'SmartBuild Inventory provides real-time visibility into your material and equipment stock levels across all warehouses and project sites. From cement and steel to power tools and safety gear, every item is tracked from receipt to consumption.',
      'The module supports multiple warehouses, stock transfer between sites, and automatic stock updates when goods are received through procurement or consumed through work orders. Low-stock alerts and reorder point management ensure you never run out of critical materials.',
      'With barcode/QR code support and batch/lot tracking, you can trace every item back to its supplier and delivery batch — essential for quality control and compliance on construction projects.',
    ],
    keyFeatures: [
      { icon: Package, title: 'Multi-Warehouse Support', description: 'Manage inventory across multiple warehouses and project sites with inter-site transfers.' },
      { icon: Bell, title: 'Low-Stock Alerts', description: 'Configure reorder points and get automatic alerts when stock falls below minimum levels.' },
      { icon: Layers, title: 'Batch & Lot Tracking', description: 'Trace every item to its supplier batch for quality control and warranty management.' },
      { icon: BarChart2, title: 'Consumption Reports', description: 'Track material consumption by project, compare planned vs. actual usage, and identify waste.' },
    ],
    benefits: [
      { title: 'Eliminate Stockouts', description: 'Automated reorder alerts ensure critical materials are always available when needed.' },
      { title: 'Reduce Material Waste', description: 'Consumption tracking identifies over-usage and helps you optimize material planning.' },
      { title: 'Faster Receiving', description: 'Procurement integration auto-updates stock when goods are received, reducing manual entry.' },
    ],
    workflow: [
      { step: 1, title: 'Set Up Inventory', description: 'Define warehouses, item categories, units of measure, and reorder points.' },
      { step: 2, title: 'Track Movements', description: 'Record receipts, issues, transfers, and returns with automatic stock level updates.' },
      { step: 3, title: 'Report & Reorder', description: 'Generate consumption reports and use reorder alerts to maintain optimal stock levels.' },
    ],
    faq: [
      { question: 'Does it support barcode scanning?', answer: 'Yes. SmartBuild supports barcode and QR code scanning for fast receiving, issuing, and stock-taking.' },
      { question: 'Can I transfer stock between sites?', answer: 'Yes. Inter-warehouse and inter-site transfers are fully supported with approval workflows.' },
      { question: 'How does it connect to procurement?', answer: 'Goods received through purchase orders automatically update inventory quantities.' },
    ],
  },

  'cost-control': {
    title: 'Cost Control',
    metaTitle: 'SmartBuild Cost Control - Budget Tracking, Cost Forecasting & Change Orders',
    metaDescription:
      'Monitor budgets, track costs, forecast expenses, and manage change orders with SmartBuild Cost Control.',
    overview: [
      'SmartBuild Cost Control gives project managers and finance teams the tools to keep construction projects within budget. With real-time cost tracking against planned budgets, you can identify cost overruns early and take corrective action before they become critical.',
      'The module supports hierarchical budget structures with cost codes, allowing you to track spending at any level — from the overall project down to individual tasks or material categories. Budget change orders are managed through approval workflows with full traceability.',
      'Forecasting tools project final costs based on current spending trends, earned value analysis shows project health at a glance, and variance reports highlight where actual costs deviate from the plan.',
    ],
    keyFeatures: [
      { icon: Target, title: 'Budget Management', description: 'Create hierarchical budgets with cost codes and track actual spending against planned amounts.' },
      { icon: TrendingUp, title: 'Cost Forecasting', description: 'Project final costs based on current trends with earned value analysis and estimate-at-completion.' },
      { icon: Settings2, title: 'Change Order Management', description: 'Submit, approve, and track budget change orders with full impact analysis and approval trails.' },
      { icon: BarChart2, title: 'Variance Analysis', description: 'Identify cost variances at any level with drill-down reports showing root causes.' },
    ],
    benefits: [
      { title: 'Catch Overruns Early', description: 'Real-time tracking alerts you to budget deviations before they become unmanageable.' },
      { title: 'Accurate Project Profitability', description: 'Know your true project costs at any point, enabling better pricing and bidding decisions.' },
      { title: 'Controlled Change Orders', description: 'Formal approval workflows prevent unauthorized budget changes and maintain financial discipline.' },
    ],
    workflow: [
      { step: 1, title: 'Set Budgets', description: 'Define project budgets with detailed cost codes aligned to your estimating methodology.' },
      { step: 2, title: 'Track & Monitor', description: 'Actual costs from procurement, payroll, and expenses are automatically tracked against budgets.' },
      { step: 3, title: 'Forecast & Control', description: 'Use forecasting tools to predict final costs and manage change orders through approval.' },
    ],
    faq: [
      { question: 'How granular can budget tracking be?', answer: 'You can track costs at any level — project, phase, task, or individual cost code — with drill-down capability.' },
      { question: 'Does it support earned value management?', answer: 'Yes. SmartBuild calculates EVM metrics including CPI, SPI, EAC, and TCPI for project health assessment.' },
      { question: 'Can I see cost forecasts in real time?', answer: 'Yes. The forecasting engine updates in real time as actual costs are recorded from connected modules.' },
    ],
  },

  payroll: {
    title: 'Payroll',
    metaTitle: 'SmartBuild Payroll - Automated Payroll Processing with Attendance Integration',
    metaDescription:
      'Automate payroll processing with attendance integration, overtime calculations, and compliance reporting in SmartBuild.',
    overview: [
      'SmartBuild Payroll automates the complex process of paying construction workers — from daily-wage labourers to salaried project managers. With deep integration with Attendance and HR, the module pulls in actual hours worked, leave records, and overtime to calculate accurate pay every cycle.',
      'The system handles multiple pay structures including hourly, daily, weekly, and monthly. Overtime, allowances, deductions, and statutory contributions are calculated automatically based on configurable rules. Payslips are generated digitally and can be accessed by employees through the mobile app.',
      'Compliance reports for tax filings, labour department submissions, and internal audits are generated with one click. The result is a payroll process that is faster, more accurate, and fully auditable.',
    ],
    keyFeatures: [
      { icon: Wallet, title: 'Multi-Pay Structure', description: 'Support for hourly, daily, weekly, and monthly pay structures with configurable rules.' },
      { icon: Clock, title: 'Attendance Integration', description: 'Automatic pull of attendance data for accurate hour-based pay calculations.' },
      { icon: FileText, title: 'Digital Payslips', description: 'Generate and distribute payslips digitally. Employees can access them from the mobile app.' },
      { icon: ShieldCheck, title: 'Compliance Reports', description: 'One-click generation of tax, statutory, and labour compliance reports for filing.' },
    ],
    benefits: [
      { title: 'Save Hours Every Pay Cycle', description: 'Automation eliminates manual calculations, reducing payroll processing time by up to 70%.' },
      { title: 'Eliminate Payroll Errors', description: 'Rules-based calculations and attendance integration ensure accurate, consistent pay every time.' },
      { title: 'Employee Self-Service', description: 'Employees view payslips, tax forms, and leave balances through the app, reducing HR inquiries.' },
    ],
    workflow: [
      { step: 1, title: 'Configure Pay Rules', description: 'Set up pay structures, overtime rules, allowances, deductions, and statutory contributions.' },
      { step: 2, title: 'Process Payroll', description: 'The system pulls attendance, calculates pay, applies deductions, and generates payslips.' },
      { step: 3, title: 'Disburse & Report', description: 'Approve payroll, process disbursements, and generate compliance reports for filing.' },
    ],
    faq: [
      { question: 'Does it handle overtime automatically?', answer: 'Yes. Overtime is calculated based on attendance records and configurable overtime rules per employee category.' },
      { question: 'Can employees view their payslips online?', answer: 'Yes. Employees can access current and past payslips through the SmartBuild mobile app or web portal.' },
      { question: 'What compliance reports are available?', answer: 'SmartBuild generates tax summaries, TDS reports, labour welfare contributions, and other statutory reports.' },
    ],
  },

  'asset-management': {
    title: 'Asset Management',
    metaTitle: 'SmartBuild Asset Management - Track & Manage Assets Throughout Their Lifecycle',
    metaDescription:
      'Track and manage all company assets throughout their lifecycle with SmartBuild Asset Management.',
    overview: [
      'SmartBuild Asset Management provides a comprehensive system for tracking and managing all company assets — from heavy construction equipment and vehicles to small tools and IT equipment. Every asset is registered with its details, location, maintenance history, and current status.',
      'The module tracks assets throughout their lifecycle: from acquisition and deployment to maintenance and eventual disposal. GPS integration shows real-time locations for mobile assets, while maintenance integration ensures that service schedules are never missed.',
      'Depreciation tracking, insurance management, and cost analysis help you understand the true total cost of ownership for each asset, enabling better capital expenditure decisions.',
    ],
    keyFeatures: [
      { icon: Wrench, title: 'Asset Register', description: 'Maintain a complete register of all assets with details, images, documents, and current location.' },
      { icon: Clock, title: 'Maintenance Integration', description: 'Link assets to preventive maintenance schedules and track repair history.' },
      { icon: BarChart2, title: 'Depreciation Tracking', description: 'Automatic depreciation calculations with multiple methods for financial reporting.' },
      { icon: TrendingUp, title: 'Cost Analysis', description: 'Track total cost of ownership including purchase, maintenance, fuel, and disposal costs.' },
    ],
    benefits: [
      { title: 'Prevent Asset Loss', description: 'GPS tracking and check-out/check-in processes reduce equipment theft and misplacement.' },
      { title: 'Optimize Utilization', description: 'Identify underutilized assets and redeploy them where they add the most value.' },
      { title: 'Extend Asset Life', description: 'Integrated maintenance scheduling keeps assets in good condition and extends their useful life.' },
    ],
    workflow: [
      { step: 1, title: 'Register Assets', description: 'Enter all assets with details, specifications, purchase information, and assign to locations.' },
      { step: 2, title: 'Track & Maintain', description: 'Monitor usage, schedule maintenance, and track repairs through the integrated work order system.' },
      { step: 3, title: 'Analyze & Decide', description: 'Review utilization, costs, and maintenance data to make informed decisions about repair or replacement.' },
    ],
    faq: [
      { question: 'Can I track assets across multiple sites?', answer: 'Yes. Assets can be assigned to any site or warehouse, and transfers between locations are fully tracked.' },
      { question: 'Does it support GPS tracking for vehicles?', answer: 'Yes. GPS integration shows real-time locations of vehicles and mobile equipment on an interactive map.' },
      { question: 'How does it connect to maintenance?', answer: 'Assets link directly to the Preventive Maintenance module for automated scheduling of service tasks.' },
    ],
  },

  scheduling: {
    title: 'Scheduling',
    metaTitle: 'SmartBuild Scheduling - Gantt Charts, Critical Path & Resource-Loaded Scheduling',
    metaDescription:
      'Plan construction schedules with Gantt charts, critical path analysis, and resource-loaded scheduling in SmartBuild.',
    overview: [
      'SmartBuild Scheduling provides powerful tools for planning and managing construction project timelines. With interactive Gantt charts, critical path analysis, and resource-loaded scheduling, project managers can create realistic schedules that account for task dependencies and resource constraints.',
      'The module supports multiple scheduling methodologies including task-based, milestone-based, and location-based scheduling. Drag-and-drop functionality makes it easy to adjust timelines, while automatic dependency recalculation ensures schedule integrity after any change.',
      'Integration with Resource Management means schedules are always resource-feasible, and integration with Project Management ensures that schedule changes are reflected in task assignments and deadline tracking across the platform.',
    ],
    keyFeatures: [
      { icon: CalendarRange, title: 'Interactive Gantt Charts', description: 'Visualize project timelines with interactive Gantt charts that support drag-and-drop editing.' },
      { icon: Target, title: 'Critical Path Analysis', description: 'Automatically identify the critical path and understand which tasks drive the project end date.' },
      { icon: Users, title: 'Resource-Loaded Schedules', description: 'Assign resources to tasks and see resource loading across the timeline to prevent over-allocation.' },
      { icon: TrendingUp, title: 'Baseline Comparison', description: 'Compare actual progress against the original baseline to identify schedule variances.' },
    ],
    benefits: [
      { title: 'Realistic Project Timelines', description: 'Resource-loaded schedules prevent over-optimistic planning that leads to missed deadlines.' },
      { title: 'Quick Schedule Adjustments', description: 'Drag-and-drop editing with automatic recalculation lets you respond to changes in minutes.' },
      { title: 'Early Delay Detection', description: 'Critical path analysis highlights at-risk tasks before they impact the project end date.' },
    ],
    workflow: [
      { step: 1, title: 'Build the Schedule', description: 'Define tasks, set dependencies, assign resources, and establish the project timeline.' },
      { step: 2, title: 'Monitor Progress', description: 'Track actual progress against the plan with real-time updates from field teams.' },
      { step: 3, title: 'Adjust & Communicate', description: 'Modify the schedule as needed and share updated timelines with all stakeholders.' },
    ],
    faq: [
      { question: 'Can I import schedules from Microsoft Project?', answer: 'SmartBuild supports import of project schedules through standard file formats for easy migration.' },
      { question: 'Does scheduling show resource conflicts?', answer: 'Yes. Resource loading views highlight over-allocated periods, allowing you to resolve conflicts proactively.' },
      { question: 'Can clients see the project schedule?', answer: 'Yes. Through the Client Portal, clients can view high-level milestones and progress without seeing internal resource details.' },
    ],
  },

  'client-portal': {
    title: 'Client Portal',
    metaTitle: 'SmartBuild Client Portal - Project Progress, Invoices & Document Sharing',
    metaDescription:
      'Give clients visibility into project progress, invoices, and documents with the SmartBuild Client Portal.',
    overview: [
      'The SmartBuild Client Portal provides a secure, branded space where your clients can stay informed about their projects without needing to call or email your team. From project progress and milestones to invoices and documents, clients have self-service access to the information they need.',
      'The portal shows project timelines, photo galleries, and progress updates that you control. Clients can view and download invoices, access shared documents, and even submit service requests or complaints — all from a clean, mobile-friendly interface.',
      'By giving clients direct access to information, you reduce routine communication overhead, improve transparency, and build stronger client relationships. The portal is fully configurable so you control exactly what each client can see.',
    ],
    keyFeatures: [
      { icon: Building, title: 'Project Dashboard', description: 'Clients see a personalized dashboard with their project progress, upcoming milestones, and recent updates.' },
      { icon: FileText, title: 'Invoice Access', description: 'Clients can view, download, and track payment status for all their project invoices.' },
      { icon: Package, title: 'Document Sharing', description: 'Share drawings, reports, and other documents with clients through a secure, organized file library.' },
      { icon: MessageSquare, title: 'Communication Hub', description: 'Clients can submit inquiries, complaints, and service requests directly through the portal.' },
    ],
    benefits: [
      { title: 'Reduce Communication Overhead', description: 'Clients self-serve for routine information, freeing up your team for higher-value work.' },
      { title: 'Build Client Trust', description: 'Transparency and easy access to information build confidence and strengthen client relationships.' },
      { title: 'Faster Invoice Payments', description: 'When clients can easily view and download invoices, payment cycles tend to shorten.' },
    ],
    workflow: [
      { step: 1, title: 'Set Up Client Access', description: 'Create client accounts, assign them to projects, and configure what information they can see.' },
      { step: 2, title: 'Share Updates', description: 'Publish progress updates, documents, and invoices that clients can access at any time.' },
      { step: 3, title: 'Engage & Collaborate', description: 'Clients view progress, ask questions, and submit requests — all through the portal.' },
    ],
    faq: [
      { question: 'Can I customize what each client sees?', answer: 'Yes. You have full control over which projects, documents, and data each client account can access.' },
      { question: 'Is the portal mobile-friendly?', answer: 'Yes. The client portal is fully responsive and works beautifully on phones, tablets, and desktops.' },
      { question: 'Can clients make payments through the portal?', answer: 'Clients can view invoices and track payment status. Online payment integration is available for supported payment gateways.' },
    ],
  },

  'mobile-app': {
    title: 'Mobile App',
    metaTitle: 'SmartBuild Mobile App - Offline Support, GPS Tracking & Field Management',
    metaDescription:
      'Manage construction on the go with the SmartBuild mobile app featuring offline support, GPS tracking, and field management.',
    overview: [
      'The SmartBuild Mobile App brings the full power of the platform to your field teams. Whether they are on a construction site, at a supplier yard, or traveling between projects, your team has everything they need to stay productive — even without an internet connection.',
      'The app supports offline data capture for attendance, daily logs, work order updates, and site photos. When connectivity is restored, all data syncs automatically. GPS tracking provides real-time location data for field staff, vehicles, and equipment.',
      'With push notifications, camera integration for photo documentation, and a clean mobile-optimized interface, the app is designed for the realities of construction fieldwork — where conditions are tough and connectivity is unreliable.',
    ],
    keyFeatures: [
      { icon: Smartphone, title: 'Offline Support', description: 'Capture data without internet. Everything syncs automatically when you are back online.' },
      { icon: Clock, title: 'Field Attendance', description: 'Mark attendance with GPS verification and facial recognition directly from the field.' },
      { icon: Package, title: 'Photo Documentation', description: 'Capture and upload site photos with automatic location and timestamp tagging.' },
      { icon: Bell, title: 'Push Notifications', description: 'Receive instant alerts for task assignments, approvals, and important project updates.' },
    ],
    benefits: [
      { title: 'Productive Anywhere', description: 'Offline support means field teams can work productively regardless of connectivity.' },
      { title: 'Real-Time Visibility', description: 'GPS tracking and instant data sync give managers real-time visibility into field operations.' },
      { title: 'Faster Reporting', description: 'Field teams submit daily logs, photos, and updates from site, eliminating paperwork delays.' },
    ],
    workflow: [
      { step: 1, title: 'Install & Login', description: 'Download the app, log in with your SmartBuild credentials, and your data is ready.' },
      { step: 2, title: 'Work Offline or Online', description: 'Capture attendance, update tasks, take photos — the app works with or without internet.' },
      { step: 3, title: 'Auto-Sync', description: 'When you reconnect, all data syncs automatically to the central system.' },
    ],
    faq: [
      { question: 'Does the app work offline?', answer: 'Yes. The app caches your project data and allows full offline functionality. Changes sync when connectivity returns.' },
      { question: 'Is GPS tracking always on?', answer: 'GPS is used for specific actions like attendance marking and location tagging. Battery-optimized tracking respects device settings.' },
      { question: 'Is the app available for both iOS and Android?', answer: 'Yes. The SmartBuild mobile app is available for both iOS and Android platforms.' },
    ],
  },

  reporting: {
    title: 'Reporting & Analytics',
    metaTitle: 'SmartBuild Reporting & Analytics - Custom Reports, PDF/Excel Export & Dashboards',
    metaDescription:
      'Generate custom reports with PDF/Excel export and real-time dashboards with SmartBuild Reporting & Analytics.',
    overview: [
      'SmartBuild Reporting & Analytics transforms your construction data into actionable insights. With a library of pre-built reports and a powerful custom report builder, you can create exactly the views you need — from project profitability summaries to detailed resource utilization analyses.',
      'All reports support PDF and Excel export, scheduled delivery via email, and interactive drill-down for deeper analysis. Real-time dashboards give executives and managers instant visibility into key performance indicators across all modules.',
      'The analytics engine combines data from Project Management, Finance, HR, Procurement, and other modules to provide cross-functional insights that are impossible to get from siloed systems.',
    ],
    keyFeatures: [
      { icon: BarChart3, title: 'Custom Report Builder', description: 'Create reports with drag-and-drop fields, filters, grouping, and calculated columns.' },
      { icon: FileText, title: 'PDF & Excel Export', description: 'Export any report to professionally formatted PDF or Excel with one click.' },
      { icon: TrendingUp, title: 'Real-Time Dashboards', description: 'Interactive dashboards with charts, KPIs, and drill-downs that update in real time.' },
      { icon: Bell, title: 'Scheduled Reports', description: 'Set up automatic report generation and delivery via email on daily, weekly, or monthly schedules.' },
    ],
    benefits: [
      { title: 'Data-Driven Decisions', description: 'Move from gut feelings to data-backed decisions with comprehensive cross-module analytics.' },
      { title: 'Save Reporting Time', description: 'Pre-built templates and automated scheduling eliminate manual report compilation.' },
      { title: 'Share Insights Easily', description: 'Export and share reports with stakeholders, clients, and auditors in standard formats.' },
    ],
    workflow: [
      { step: 1, title: 'Choose or Create', description: 'Select a pre-built report or use the builder to create a custom report from any module.' },
      { step: 2, title: 'Filter & Analyze', description: 'Apply filters, group data, and drill down into details to find exactly what you need.' },
      { step: 3, title: 'Export & Share', description: 'Export to PDF/Excel or schedule automatic delivery to stakeholders via email.' },
    ],
    faq: [
      { question: 'Can I create my own custom reports?', answer: 'Yes. The report builder lets you select fields, apply filters, add calculations, and save custom templates for reuse.' },
      { question: 'Are reports real-time?', answer: 'Yes. Dashboard widgets and on-demand reports pull the latest data. Scheduled reports can also be configured for real-time data.' },
      { question: 'Can reports combine data from multiple modules?', answer: 'Absolutely. Cross-module reports can combine data from projects, finance, HR, procurement, and other modules.' },
    ],
  },

  'ai-assistant': {
    title: 'AI Assistant',
    metaTitle: 'SmartBuild AI Assistant - AI-Powered Insights, Predictions & Recommendations',
    metaDescription:
      'Leverage AI-powered insights, predictions, and automated recommendations to optimize construction operations with SmartBuild.',
    overview: [
      'The SmartBuild AI Assistant brings artificial intelligence to your construction operations. Powered by machine learning models trained on construction industry data, it provides intelligent insights, predictions, and recommendations that help you make better decisions, faster.',
      'From predicting project delays and cost overruns to recommending optimal resource allocations and identifying maintenance risks, the AI Assistant analyzes patterns across your data that would be impossible for humans to detect manually. It learns from your historical data and continuously improves its recommendations.',
      'The AI Assistant is integrated throughout the platform — you will find AI-powered suggestions in Project Management, Finance, Resource Management, and Maintenance, providing contextual intelligence exactly where and when you need it.',
    ],
    keyFeatures: [
      { icon: Brain, title: 'Predictive Analytics', description: 'AI models predict project delays, cost overruns, and resource bottlenecks before they happen.' },
      { icon: TrendingUp, title: 'Smart Recommendations', description: 'Get actionable recommendations for resource allocation, scheduling, and cost optimization.' },
      { icon: BarChart2, title: 'Anomaly Detection', description: 'AI identifies unusual patterns in costs, attendance, or productivity that may indicate problems.' },
      { icon: Zap, title: 'Natural Language Queries', description: 'Ask questions in plain language and get instant answers from your construction data.' },
    ],
    benefits: [
      { title: 'Proactive Problem Solving', description: 'Predict issues before they become problems, allowing you to take corrective action early.' },
      { title: 'Faster Decision-Making', description: 'AI-powered insights reduce the time spent analyzing data and building reports manually.' },
      { title: 'Continuous Improvement', description: 'The AI learns from your data over time, providing increasingly accurate and relevant recommendations.' },
    ],
    workflow: [
      { step: 1, title: 'Data Collection', description: 'The AI continuously analyzes data from all SmartBuild modules to build understanding of your operations.' },
      { step: 2, title: 'Insight Generation', description: 'AI models identify patterns, predict outcomes, and generate actionable recommendations.' },
      { step: 3, title: 'Action & Learn', description: 'You act on AI recommendations, and the system learns from outcomes to improve future predictions.' },
    ],
    faq: [
      { question: 'How does the AI learn from my data?', answer: 'The AI analyzes your historical project data, costs, schedules, and outcomes to build models specific to your operations.' },
      { question: 'Is my data secure?', answer: 'Yes. All AI processing happens within your SmartBuild instance. Your data is never shared with third parties.' },
      { question: 'Can I ask questions in natural language?', answer: 'Yes. The AI Assistant supports natural language queries — just type your question and get an instant, data-backed answer.' },
    ],
  },
}

/* ------------------------------------------------------------------ */
/*  Fallback for unknown slugs                                         */
/* ------------------------------------------------------------------ */

const fallbackFeature: FeatureInfo = {
  title: 'Feature',
  metaTitle: 'SmartBuild Feature',
  metaDescription: 'Learn more about this SmartBuild feature.',
  overview: [
    'This SmartBuild module provides powerful capabilities to streamline your construction operations. Designed with industry best practices, it helps you manage this aspect of your business more efficiently.',
    'With intuitive interfaces, automated workflows, and deep integration with other SmartBuild modules, this feature eliminates manual processes and provides real-time visibility into your operations.',
    'Whether you are a small contractor or a large construction firm, this module scales to meet your needs and helps you deliver projects more effectively.',
  ],
  keyFeatures: [
    { icon: CheckCircle2, title: 'Comprehensive Management', description: 'Full-featured tools to manage all aspects of this module.' },
    { icon: Zap, title: 'Automation', description: 'Automated workflows reduce manual effort and human error.' },
    { icon: BarChart2, title: 'Reporting', description: 'Built-in reports and dashboards provide real-time insights.' },
    { icon: ShieldCheck, title: 'Integration', description: 'Seamlessly connects with other SmartBuild modules for end-to-end visibility.' },
  ],
  benefits: [
    { title: 'Increased Efficiency', description: 'Automation and streamlined processes save time and reduce errors.' },
    { title: 'Better Visibility', description: 'Real-time dashboards give you instant insight into operations.' },
    { title: 'Scalable', description: 'Works for projects and organizations of all sizes.' },
  ],
  workflow: [
    { step: 1, title: 'Configure', description: 'Set up the module to match your organization\'s requirements and workflows.' },
    { step: 2, title: 'Operate', description: 'Your team uses the module daily, with data flowing automatically between integrated systems.' },
    { step: 3, title: 'Optimize', description: 'Use reports and analytics to identify improvements and continuously refine processes.' },
  ],
  faq: [
    { question: 'Is this module included in my plan?', answer: 'This module is available on all SmartBuild plans. Contact sales for specific pricing details.' },
    { question: 'Does it integrate with other modules?', answer: 'Yes. This module integrates deeply with all other SmartBuild modules for seamless data flow.' },
  ],
}

/* ------------------------------------------------------------------ */
/*  All valid slugs (for navigation)                                   */
/* ------------------------------------------------------------------ */

const allSlugs = [
  'project-management',
  'resource-management',
  'complaint-management',
  'work-orders',
  'preventive-maintenance',
  'procurement',
  'inventory',
  'finance',
  'cost-control',
  'hr',
  'payroll',
  'asset-management',
  'scheduling',
  'client-portal',
  'mobile-app',
  'reporting',
  'ai-assistant',
]

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function FeatureDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const data = featureData[slug] || { ...fallbackFeature, title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }
  const Icon = iconMap[slug] || LayoutDashboard
  const color = colorMap[slug] || 'bg-amber-100 text-amber-600'

  const currentIndex = allSlugs.indexOf(slug)
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null
  const nextSlug = currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-400" aria-label="Breadcrumb">
            <Link href="/features" className="transition-colors hover:text-white">
              Features
            </Link>
            <span>/</span>
            <span className="text-white">{data.title}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${color}`}>
              <Icon className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {data.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Overview</h2>
          <div className="mt-6 space-y-4 text-neutral-600 leading-relaxed">
            {data.overview.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Key Features</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.keyFeatures.map((f, i) => {
              const FIcon = f.icon
              return (
                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
                    <FIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-neutral-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Benefits</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.benefits.map((b, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-neutral-900">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">How It Works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {data.workflow.map((w) => (
              <div key={w.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-lg font-bold text-white">
                  {w.step}
                </div>
                <h3 className="font-semibold text-neutral-900">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-6">
            {data.faq.map((item, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900">{item.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Try {data.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            See how SmartBuild can transform your construction operations. Schedule a personalized demo today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/request-demo"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              Request a Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-8 py-3.5 text-sm font-semibold text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              View All Features
            </Link>
          </div>
        </div>
      </section>

      {/* Prev / Next Navigation */}
      <section className="border-t border-neutral-100 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {prevSlug ? (
            <Link
              href={`/features/${prevSlug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {featureData[prevSlug]?.title || prevSlug}
            </Link>
          ) : (
            <div />
          )}
          {nextSlug ? (
            <Link
              href={`/features/${nextSlug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {featureData[nextSlug]?.title || nextSlug}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>
    </div>
  )
}