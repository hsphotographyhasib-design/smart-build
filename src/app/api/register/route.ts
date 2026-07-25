import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, issueSession, logLogin } from '@/lib/auth-server'
import { createAuditLog } from '@/lib/tenant'
import { headers } from 'next/headers'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public tenant self-registration
export async function POST(req: NextRequest) {
  let body: { companyName?: string; slug?: string; adminName?: string; adminEmail?: string; adminPassword?: string; phone?: string; planId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { companyName, slug, adminName, adminEmail, adminPassword, phone, planId } = body
  const email = adminEmail?.trim().toLowerCase()
  const password = adminPassword ?? ''
  const name = adminName?.trim() || (email ? email.split('@')[0] : '')

  if (!companyName || !slug || !email || !password) {
    return NextResponse.json({ error: 'Company name, slug, admin email, and password are required' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: 'Slug must be lowercase alphanumeric with hyphens' }, { status: 400 })

  const existingSlug = await db.tenant.findUnique({ where: { slug } })
  if (existingSlug) return NextResponse.json({ error: 'This company URL is already taken' }, { status: 409 })

  const plan = planId
    ? await db.subscriptionPlan.findUnique({ where: { id: planId } })
    : await db.subscriptionPlan.findFirst({ where: { name: 'Free Trial' } })
  if (!plan) return NextResponse.json({ error: 'No plan available' }, { status: 400 })

  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  const hdrs = await headers()

  const tenant = await db.tenant.create({
    data: {
      name: companyName, slug, email, phone: phone || null,
      status: 'Active', tier: plan.name,
      maxUsers: plan.maxUsers, maxProjects: plan.maxProjects, maxStorage: plan.maxStorage, maxBranches: plan.maxBranches,
      trialEndsAt: trialEnd,
      settings: { create: { defaultLanguage: 'en', defaultTimezone: 'Asia/Singapore', currency: 'MYR' } },
      branding: { create: { primaryColor: '#0B2345', accentColor: '#F5A623', loginBgColor: '#0B2345' } },
      subscription: {
        create: {
          planId: plan.id, status: 'Active', billingCycle: 'monthly',
          currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialStart: new Date(), trialEnd: trialEnd,
        },
      },
      branches: { create: { name: 'Main Office', code: 'HQ' } },
      roles: {
        create: [
          { name: 'Tenant Admin', level: 80, isSystem: true },
          { name: 'Manager', level: 60, isSystem: true },
          { name: 'Supervisor', level: 40, isSystem: true },
          { name: 'Employee', level: 20, isSystem: true },
        ],
      },
    },
    include: { branches: true, roles: true },
  })

  // Enable features for plan
  let planFeatures: string[] = []
  try { planFeatures = JSON.parse(plan.features) } catch { /* */ }
  for (const mod of planFeatures) {
    await db.tenantFeature.create({ data: { tenantId: tenant.id, module: mod, enabled: true } })
  }

  // Create admin role permissions
  const adminRole = tenant.roles.find(r => r.name === 'Tenant Admin')
  if (adminRole) {
    const resources = ['project', 'portfolio', 'program', 'activity', 'resource', 'risk', 'document', 'report', 'maintenance', 'complaint', 'work-order', 'equipment', 'inventory', 'procurement', 'hr', 'finance', 'settings', 'user', 'branch', 'department']
    for (const res of resources) {
      for (const act of ['create', 'read', 'update', 'delete', 'approve', 'manage']) {
        await db.permission.create({ data: { roleId: adminRole.id, resource: res, action: act, scope: 'all' } })
      }
    }
  }

  // Create admin user
  const user = await db.appUser.create({
    data: {
      name, email, passwordHash: await hashPassword(password),
      role: 'Tenant Admin', roleLevel: 80, provider: 'email',
      tenantId: tenant.id, branchId: tenant.branches[0].id,
      roleId: adminRole?.id,
    },
  })

  await db.tenant.update({ where: { id: tenant.id }, data: { currentUsers: 1 } })
  await issueSession({ id: user.id, email, name, role: 'Tenant Admin', roleLevel: 80, provider: 'email', tenantId: tenant.id, tenantSlug: slug, branchId: tenant.branches[0].id })
  await logLogin({ id: user.id, name, tenantId: tenant.id })
  await createAuditLog({ tenantId: tenant.id, userId: user.id, userName: name, action: 'create', resource: 'tenant', resourceId: tenant.id, details: JSON.stringify({ name: companyName, slug, plan: plan.name }), ipAddress: hdrs.get('x-forwarded-for') ?? undefined, userAgent: hdrs.get('user-agent') ?? undefined, level: 'security' })

  return NextResponse.json({ message: 'Tenant created', tenant: { id: tenant.id, name: companyName, slug }, redirect: '/app' }, { status: 201 })
}
