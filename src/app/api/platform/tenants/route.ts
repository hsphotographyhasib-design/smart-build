import { NextRequest, NextResponse } from 'next/server'
import { getSuperAdminUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { createAuditLog, getSubscriptionLimits } from '@/lib/tenant'
import { headers } from 'next/headers'

// GET /api/platform/tenants — list all tenants
export async function GET() {
  const admin = await getSuperAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenants = await db.tenant.findMany({
    include: {
      settings: { select: { defaultTimezone: true, currency: true, enableRegistration: true } },
      subscription: { include: { plan: { select: { name: true, priceMonthly: true } } } },
      _count: { select: { users: true, branches: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ tenants })
}

// POST /api/platform/tenants — create tenant
export async function POST(req: NextRequest) {
  const admin = await getSuperAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, slug, email, phone, address, tier, planId, approve } = body

  if (!name || !slug || !email) {
    return NextResponse.json({ error: 'Name, slug, and email required' }, { status: 400 })
  }

  const existing = await db.tenant.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })

  const plan = planId ? await db.subscriptionPlan.findUnique({ where: { id: planId } }) : await db.subscriptionPlan.findUnique({ where: { name: tier || 'Free Trial' } })
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 400 })

  const hdrs = await headers()

  const tenant = await db.tenant.create({
    data: {
      name, slug, email, phone: phone || null, address: address || null,
      status: approve ? 'Active' : 'Pending',
      tier: plan.name,
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      maxStorage: plan.maxStorage,
      maxBranches: plan.maxBranches,
      approvedBy: approve ? admin.id : null,
      approvedAt: approve ? new Date() : null,
      trialEndsAt: plan.name === 'Free Trial' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
      settings: { create: { defaultLanguage: 'en', defaultTimezone: 'Asia/Singapore', currency: 'MYR' } },
      branding: { create: { primaryColor: '#0B2345', accentColor: '#F5A623', loginBgColor: '#0B2345' } },
      subscription: {
        create: {
          planId: plan.id,
          status: 'Active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialStart: plan.name === 'Free Trial' ? new Date() : null,
          trialEnd: plan.name === 'Free Trial' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
        },
      },
      branches: { create: { name: 'Main Office', code: 'HQ' } },
    },
    include: { branches: true, subscription: true },
  })

  // Enable default features for plan
  let planFeatures: string[] = []
  try { planFeatures = JSON.parse(plan.features) } catch { /* */ }
  for (const mod of planFeatures) {
    await db.tenantFeature.create({ data: { tenantId: tenant.id, module: mod, enabled: true } })
  }

  // Create default roles
  const roleData = [
    { name: 'Tenant Admin', level: 80, isSystem: true },
    { name: 'Manager', level: 60, isSystem: true },
    { name: 'Supervisor', level: 40, isSystem: true },
    { name: 'Employee', level: 20, isSystem: true },
    { name: 'Customer', level: 10, isSystem: true },
  ]
  const roles: Record<string, string> = {}
  for (const r of roleData) {
    const role = await db.role.create({ data: { ...r, tenantId: tenant.id } })
    roles[r.name] = role.id
  }

  // Full permissions for Tenant Admin
  const allResources = ['project', 'portfolio', 'program', 'activity', 'resource', 'risk', 'document', 'report', 'maintenance', 'complaint', 'work-order', 'equipment', 'inventory', 'procurement', 'hr', 'finance', 'settings', 'user', 'branch', 'department']
  for (const res of allResources) {
    for (const act of ['create', 'read', 'update', 'delete', 'approve', 'manage']) {
      await db.permission.create({ data: { roleId: roles['Tenant Admin'], resource: res, action: act, scope: 'all' } })
    }
  }

  await createAuditLog({
    userId: admin.id, userName: admin.name,
    action: 'create', resource: 'tenant', resourceId: tenant.id,
    details: JSON.stringify({ name, slug, plan: plan.name }),
    ipAddress: hdrs.get('x-forwarded-for') ?? null,
    userAgent: hdrs.get('user-agent') ?? null,
    level: 'security',
  })

  return NextResponse.json({ tenant, message: 'Tenant created successfully' }, { status: 201 })
}