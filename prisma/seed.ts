import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('Seeding SmartBuild Multi-Tenant SaaS Platform...')

  // 1. Create Super Admin (platform-level, no tenant)
  const superAdminHash = await bcrypt.hash('admin123', 10)
  let superAdmin = await db.appUser.findFirst({ where: { email: 'admin@smartbuild.app' } })
  if (!superAdmin) {
    superAdmin = await db.appUser.create({
      data: {
        name: 'Platform Super Admin',
        email: 'admin@smartbuild.app',
        passwordHash: superAdminHash,
        role: 'Super Admin',
        roleLevel: 100,
        provider: 'email',
        active: true,
      },
    })
  }
  console.log('✓ Super Admin created:', superAdmin.email)

  // 2. Create Subscription Plans
  const plans = [
    {
      name: 'Free Trial',
      description: '14-day free trial with basic features',
      priceMonthly: 0,
      priceAnnual: 0,
      maxUsers: 5,
      maxProjects: 3,
      maxStorage: 500,
      maxBranches: 1,
      maxApiCalls: 500,
      aiCredits: 0,
      mobileAccess: false,
      apiAccess: false,
      integrations: false,
      customDomain: false,
      prioritySupport: false,
      features: JSON.stringify(['dashboard', 'projects', 'maintenance', 'complaints']),
      sortOrder: 0,
    },
    {
      name: 'Starter',
      description: 'For small teams getting started',
      priceMonthly: 99,
      priceAnnual: 948,
      maxUsers: 15,
      maxProjects: 10,
      maxStorage: 5000,
      maxBranches: 3,
      maxApiCalls: 2000,
      aiCredits: 10,
      mobileAccess: true,
      apiAccess: false,
      integrations: false,
      customDomain: false,
      prioritySupport: false,
      features: JSON.stringify([
        'dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt',
        'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints', 'work-orders',
      ]),
      sortOrder: 1,
    },
    {
      name: 'Professional',
      description: 'For growing construction companies',
      priceMonthly: 299,
      priceAnnual: 2868,
      maxUsers: 50,
      maxProjects: 50,
      maxStorage: 25000,
      maxBranches: 10,
      maxApiCalls: 10000,
      aiCredits: 100,
      mobileAccess: true,
      apiAccess: true,
      integrations: true,
      customDomain: false,
      prioritySupport: true,
      features: JSON.stringify([
        'dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt',
        'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints',
        'work-orders', 'procurement', 'inventory', 'hr', 'equipment', 'fleet',
        'hse', 'quality', 'costs', 'evm', 'cashflow', 'baselines', 'changes',
        'submittals', 'closeout', 'commissioning', 'site-progress', 'lookahead',
        'accounts', 'tender', 'exec-reports', 'notifications',
      ]),
      sortOrder: 2,
    },
    {
      name: 'Enterprise',
      description: 'For large enterprises with advanced needs',
      priceMonthly: 799,
      priceAnnual: 7670,
      maxUsers: 500,
      maxProjects: 500,
      maxStorage: 100000,
      maxBranches: 50,
      maxApiCalls: 100000,
      aiCredits: 1000,
      mobileAccess: true,
      apiAccess: true,
      integrations: true,
      customDomain: true,
      prioritySupport: true,
      features: JSON.stringify([
        'dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt',
        'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints',
        'work-orders', 'procurement', 'inventory', 'hr', 'equipment', 'fleet',
        'hse', 'quality', 'costs', 'evm', 'cashflow', 'baselines', 'changes',
        'submittals', 'closeout', 'commissioning', 'site-progress', 'lookahead',
        'accounts', 'tender', 'exec-reports', 'notifications', 'ai-planner',
        'integrations', 'workflow-engine', 'security', 'support', 'portals',
      ]),
      sortOrder: 3,
    },
    {
      name: 'Custom',
      description: 'Tailored for enterprise with specific requirements',
      priceMonthly: 0,
      priceAnnual: 0,
      maxUsers: 9999,
      maxProjects: 9999,
      maxStorage: 1000000,
      maxBranches: 999,
      maxApiCalls: 999999,
      aiCredits: 9999,
      mobileAccess: true,
      apiAccess: true,
      integrations: true,
      customDomain: true,
      prioritySupport: true,
      features: JSON.stringify([
        'dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt',
        'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints',
        'work-orders', 'procurement', 'inventory', 'hr', 'equipment', 'fleet',
        'hse', 'quality', 'costs', 'evm', 'cashflow', 'baselines', 'changes',
        'submittals', 'closeout', 'commissioning', 'site-progress', 'lookahead',
        'accounts', 'tender', 'exec-reports', 'notifications', 'ai-planner',
        'integrations', 'workflow-engine', 'security', 'support', 'portals',
      ]),
      sortOrder: 4,
    },
  ]

  for (const p of plans) {
    await db.subscriptionPlan.upsert({ where: { name: p.name }, update: {}, create: p })
  }
  console.log('✓ Subscription plans created')

  // 3. Create demo tenant (Hasanur Jaya)
  const tenantSlug = 'hasanur-jaya'
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)

  const tenant = await db.tenant.create({
    data: {
      slug: tenantSlug,
      name: 'Hasanur Jaya Sdn. Bhd.',
      email: 'info@hasanurjaya.com',
      phone: '+60 12-345 6789',
      address: 'Level 5, Menara A, Jalan Teknologi, 63000 Cyberjaya, Selangor',
      status: 'Active',
      tier: 'Professional',
      maxUsers: 50,
      maxProjects: 50,
      maxStorage: 25000,
      maxBranches: 10,
      approvedBy: superAdmin.id,
      approvedAt: new Date(),
      trialEndsAt: trialEnd,
      settings: {
        create: {
          defaultLanguage: 'en',
          defaultTimezone: 'Asia/Singapore',
          currency: 'MYR',
          enableRegistration: true,
          requireApproval: false,
        },
      },
      branding: {
        create: {
          primaryColor: '#0B2345',
          accentColor: '#F5A623',
          loginBgColor: '#0B2345',
          fontFamily: 'Inter',
        },
      },
      subscription: {
        create: {
          planId: (await db.subscriptionPlan.findUnique({ where: { name: 'Professional' } }))!.id,
          status: 'Active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      branches: {
        create: {
          name: 'Head Office',
          code: 'HQ',
          address: 'Level 5, Menara A, Jalan Teknologi, 63000 Cyberjaya',
        },
      },
    },
    include: { branches: true },
  })
  console.log('✓ Demo tenant created:', tenant.name, `(${tenant.slug})`)

  // 4. Create default roles for tenant
  const roleData = [
    { name: 'Tenant Admin', level: 80, isSystem: true, description: 'Full tenant control' },
    { name: 'Manager', level: 60, isSystem: true, description: 'Branch/department management' },
    { name: 'Supervisor', level: 40, isSystem: true, description: 'Team supervision' },
    { name: 'Employee', level: 20, isSystem: true, description: 'Standard user' },
    { name: 'Customer', level: 10, isSystem: true, description: 'External client access' },
  ]
  const createdRoles: Record<string, string> = {}
  for (const r of roleData) {
    const role = await db.role.create({ data: { ...r, tenantId: tenant.id } })
    createdRoles[r.name] = role.id
    console.log(`  ✓ Role: ${r.name} (level ${r.level})`)
  }

  // 5. Grant full permissions to Tenant Admin role
  const resources = [
    'project', 'portfolio', 'program', 'activity', 'resource', 'risk', 'document',
    'report', 'maintenance', 'complaint', 'work-order', 'equipment', 'inventory',
    'procurement', 'hr', 'finance', 'settings', 'user', 'branch', 'department',
  ]
  const actions = ['create', 'read', 'update', 'delete', 'approve', 'manage']
  for (const resource of resources) {
    for (const action of actions) {
      await db.permission.create({
        data: { roleId: createdRoles['Tenant Admin'], resource, action, scope: 'all' },
      })
    }
  }
  console.log('  ✓ Tenant Admin permissions granted')

  // Manager gets all except settings/user/branch management
  for (const resource of resources.filter(r => !['settings', 'user', 'branch', 'department'].includes(r))) {
    for (const action of actions.filter(a => a !== 'manage')) {
      await db.permission.create({
        data: { roleId: createdRoles['Manager'], resource, action, scope: 'branch' },
      })
    }
  }
  console.log('  ✓ Manager permissions granted')

  // Employee: read + create own
  for (const resource of resources.filter(r => ['project', 'activity', 'document', 'maintenance', 'complaint', 'work-order'].includes(r))) {
    await db.permission.create({ data: { roleId: createdRoles['Employee'], resource, action: 'read', scope: 'own' } })
    await db.permission.create({ data: { roleId: createdRoles['Employee'], resource, action: 'create', scope: 'own' } })
  }
  console.log('  ✓ Employee permissions granted')

  // 6. Create default features for tenant
  const proPlan = await db.subscriptionPlan.findUnique({ where: { name: 'Professional' } })
  let planFeatures: string[] = []
  if (proPlan) { try { planFeatures = JSON.parse(proPlan.features) } catch { /* */ } }
  for (const mod of planFeatures) {
    await db.tenantFeature.create({ data: { tenantId: tenant.id, module: mod, enabled: true } })
  }
  console.log(`✓ ${planFeatures.length} features enabled for tenant`)

  // 7. Create tenant admin user
  const tenantAdminHash = await bcrypt.hash('tenant123', 10)
  const hqBranch = tenant.branches[0]
  const tenantAdmin = await db.appUser.create({
    data: {
      name: 'Hasanur Admin',
      email: 'admin@hasanurjaya.com',
      passwordHash: tenantAdminHash,
      role: 'Tenant Admin',
      roleLevel: 80,
      provider: 'email',
      active: true,
      tenantId: tenant.id,
      branchId: hqBranch.id,
      roleId: createdRoles['Tenant Admin'],
    },
  })
  console.log('✓ Tenant Admin created:', tenantAdmin.email)

  // 8. Create demo data
  const portfolios = await Promise.all([
    db.portfolio.create({ data: { tenantId: tenant.id, branchId: hqBranch.id, code: 'PF-001', name: 'Infrastructure 2025', status: 'Active', health: 'Green', budget: 500_000_000, startDate: new Date('2025-01-01'), managerId: tenantAdmin.id, createdBy: tenantAdmin.id, updatedBy: tenantAdmin.id } }),
    db.portfolio.create({ data: { tenantId: tenant.id, branchId: hqBranch.id, code: 'PF-002', name: 'Commercial Buildings', status: 'Active', health: 'Yellow', budget: 300_000_000, startDate: new Date('2025-03-01'), managerId: tenantAdmin.id, createdBy: tenantAdmin.id, updatedBy: tenantAdmin.id } }),
    db.portfolio.create({ data: { tenantId: tenant.id, branchId: hqBranch.id, code: 'PF-003', name: 'MEP & Fit-Out', status: 'Active', health: 'Green', budget: 180_000_000, startDate: new Date('2025-02-15'), managerId: tenantAdmin.id, createdBy: tenantAdmin.id, updatedBy: tenantAdmin.id } }),
  ])

  const programs = await Promise.all([
    db.program.create({ data: { tenantId: tenant.id, branchId: hqBranch.id, code: 'PG-001', name: 'Highway Extension', status: 'Active', health: 'Green', budget: 250_000_000, portfolioId: portfolios[0].id, startDate: new Date('2025-01-15'), managerId: tenantAdmin.id, createdBy: tenantAdmin.id, updatedBy: tenantAdmin.id } }),
    db.program.create({ data: { tenantId: tenant.id, branchId: hqBranch.id, code: 'PG-002', name: 'Office Tower Project', status: 'Active', health: 'Yellow', budget: 150_000_000, portfolioId: portfolios[1].id, startDate: new Date('2025-04-01'), managerId: tenantAdmin.id, createdBy: tenantAdmin.id, updatedBy: tenantAdmin.id } }),
  ])

  const projectNames = [
    { code: 'PRJ-001', name: 'Bukit Jalil Highway Upgrade', cat: 'Infrastructure', budget: 120_000_000, prog: programs[0].id, port: portfolios[0].id },
    { code: 'PRJ-002', name: 'Cyberjaya Smart Office Tower', cat: 'Building', budget: 85_000_000, prog: programs[1].id, port: portfolios[1].id },
    { code: 'PRJ-003', name: 'KLCC Parking Structure', cat: 'Building', budget: 45_000_000, prog: null, port: portfolios[1].id },
    { code: 'PRJ-004', name: 'Putrajaya Bridge Repair', cat: 'Infrastructure', budget: 18_000_000, prog: null, port: portfolios[0].id },
    { code: 'PRJ-005', name: 'Bangsar Mall MEP', cat: 'MEP', budget: 32_000_000, prog: null, port: portfolios[2].id },
    { code: 'PRJ-006', name: 'Shah Alam Hospital Wing', cat: 'Building', budget: 95_000_000, prog: null, port: portfolios[1].id },
  ]

  for (const p of projectNames) {
    await db.project.create({
      data: {
        tenantId: tenant.id, branchId: hqBranch.id, code: p.code, name: p.name,
        category: p.cat, budget: p.budget, status: 'Active', health: 'Green',
        progress: Math.random() * 80, actualCost: p.budget * Math.random() * 0.6,
        startDate: new Date('2025-01-01'), finishDate: new Date('2026-06-30'),
        portfolioId: p.port, programId: p.prog, managerId: tenantAdmin.id,
        client: 'Government of Malaysia', location: 'Klang Valley',
        createdBy: tenantAdmin.id, updatedBy: tenantAdmin.id,
      },
    })
  }

  await db.tenant.update({
    where: { id: tenant.id },
    data: { currentUsers: 1, currentProjects: 6 },
  })

  console.log('\n✅ Seed complete!')
  console.log('\n--- Login Credentials ---')
  console.log('Super Admin:  admin@smartbuild.app / admin123')
  console.log('Tenant Admin: admin@hasanurjaya.com / tenant123')
  console.log('------------------------\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
