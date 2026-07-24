// =============================================================
// SmartBuild Multi-Tenant Utilities (Server-Side Only)
// =============================================================
import { db } from '@/lib/db'

// ---------- Types ----------
export interface TenantWithRelations {
  id: string
  slug: string
  name: string
  domain: string | null
  email: string
  phone: string | null
  address: string | null
  logoUrl: string | null
  faviconUrl: string | null
  status: string
  tier: string
  maxUsers: number
  maxProjects: number
  maxStorage: number
  maxBranches: number
  currentUsers: number
  currentProjects: number
  currentStorage: number
  trialEndsAt: Date | null
  expiresAt: Date | null
  approvedBy: string | null
  approvedAt: Date | null
  createdAt: Date
  updatedAt: Date
  settings: TenantSettingsData | null
  subscription: TenantSubscriptionData | null
  branding: TenantBrandingData | null
  features: TenantFeatureData[]
}

export interface TenantSettingsData {
  id: string
  defaultLanguage: string
  defaultTimezone: string
  dateFormat: string
  currency: string
  fiscalYearStart: number
  smtpHost: string | null
  smtpPort: number | null
  smtpFrom: string | null
  enableRegistration: boolean
  requireApproval: boolean
}

export interface TenantSubscriptionData {
  id: string
  status: string
  billingCycle: string
  currentPeriodEnd: Date | null
  planId: string
  plan: {
    name: string
    maxUsers: number
    maxProjects: number
    maxStorage: number
    maxBranches: number
    maxApiCalls: number
    aiCredits: number
    mobileAccess: boolean
    apiAccess: boolean
    integrations: boolean
    customDomain: boolean
    prioritySupport: boolean
    features: string
  }
}

export interface TenantBrandingData {
  id: string
  primaryColor: string
  accentColor: string
  textColor: string | null
  sidebarColor: string | null
  loginBgColor: string | null
  fontFamily: string | null
  logoUrl: string | null
  logoDarkUrl: string | null
  logoLightUrl: string | null
  iconUrl: string | null
}

export interface TenantFeatureData {
  module: string
  enabled: boolean
  config: string | null
}

export type SubscriptionLimits = {
  maxUsers: number
  maxProjects: number
  maxStorage: number
  maxBranches: number
  maxApiCalls: number
  aiCredits: number
  mobileAccess: boolean
  apiAccess: boolean
  integrations: boolean
  customDomain: boolean
  prioritySupport: boolean
  planFeatures: string[]
}

// ---------- Tenant Fetchers ----------
export async function getTenantById(tenantId: string): Promise<TenantWithRelations | null> {
  return db.tenant.findUnique({
    where: { id: tenantId },
    include: {
      settings: true,
      subscription: { include: { plan: true } },
      branding: true,
      features: true,
    },
  }) as unknown as TenantWithRelations | null
}

export async function getTenantBySlug(slug: string): Promise<TenantWithRelations | null> {
  return db.tenant.findUnique({
    where: { slug },
    include: {
      settings: true,
      subscription: { include: { plan: true } },
      branding: true,
      features: true,
    },
  }) as unknown as TenantWithRelations | null
}

export async function getTenantByDomain(domain: string): Promise<TenantWithRelations | null> {
  const td = await db.tenantDomain.findUnique({
    where: { domain },
    include: { tenant: { include: { settings: true, subscription: { include: { plan: true } }, branding: true, features: true } } },
  })
  return td ? (td.tenant as unknown as TenantWithRelations) : null
}

export async function resolveTenantFromEmail(email: string) {
  const user = await db.appUser.findFirst({
    where: { email, active: true, tenantId: { not: null } },
    select: { tenantId: true, tenant: { select: { id: true, slug: true, name: true, status: true } } },
  })
  return user?.tenant ?? null
}

export async function getAllTenants() {
  return db.tenant.findMany({
    include: {
      settings: true,
      subscription: { include: { plan: true } },
      _count: { select: { users: true, branches: true, projects: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ---------- Features ----------
export async function getTenantFeatures(tenantId: string): Promise<Map<string, boolean>> {
  const feats = await db.tenantFeature.findMany({ where: { tenantId } })
  const map = new Map<string, boolean>()
  for (const f of feats) map.set(f.module, f.enabled)
  return map
}

export async function isFeatureEnabled(tenantId: string, module: string): Promise<boolean> {
  const f = await db.tenantFeature.findUnique({ where: { tenantId_module: { tenantId, module } } })
  return f?.enabled ?? false
}

// ---------- Subscription ----------
export async function getSubscriptionLimits(tenantId: string): Promise<SubscriptionLimits> {
  const sub = await db.tenantSubscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  })
  const plan = sub?.plan
  let planFeatures: string[] = []
  try { planFeatures = plan?.features ? JSON.parse(plan.features) : [] } catch { /* empty */ }
  return {
    maxUsers: plan?.maxUsers ?? 5,
    maxProjects: plan?.maxProjects ?? 3,
    maxStorage: plan?.maxStorage ?? 500,
    maxBranches: plan?.maxBranches ?? 1,
    maxApiCalls: plan?.maxApiCalls ?? 1000,
    aiCredits: plan?.aiCredits ?? 0,
    mobileAccess: plan?.mobileAccess ?? false,
    apiAccess: plan?.apiAccess ?? false,
    integrations: plan?.integrations ?? false,
    customDomain: plan?.customDomain ?? false,
    prioritySupport: plan?.prioritySupport ?? false,
    planFeatures,
  }
}

export async function checkSubscriptionActive(tenantId: string): Promise<{ active: boolean; reason?: string }> {
  const tenant = await db.tenant.findUnique({ where: { id: tenantId }, include: { subscription: true } })
  if (!tenant) return { active: false, reason: 'Tenant not found' }
  if (tenant.status === 'Suspended') return { active: false, reason: 'Tenant suspended' }
  if (tenant.status === 'Expired') return { active: false, reason: 'Subscription expired' }
  if (tenant.status === 'Archived') return { active: false, reason: 'Tenant archived' }
  const sub = tenant.subscription
  if (!sub) return { active: false, reason: 'No subscription' }
  if (sub.status === 'Cancelled') return { active: false, reason: 'Subscription cancelled' }
  if (sub.status === 'PastDue') return { active: true, reason: 'Payment past due' }
  if (sub.status === 'Expired') return { active: false, reason: 'Subscription expired' }
  if (sub.currentPeriodEnd && new Date() > sub.currentPeriodEnd) {
    return { active: false, reason: 'Billing period ended' }
  }
  if (tenant.tier === 'Trial' && tenant.trialEndsAt && new Date() > tenant.trialEndsAt) {
    return { active: false, reason: 'Trial expired' }
  }
  return { active: true }
}

// ---------- Tenant Counters ----------
export async function incrementTenantCount(tenantId: string, field: 'currentUsers' | 'currentProjects') {
  await db.tenant.update({ where: { id: tenantId }, data: { [field]: { increment: 1 } } })
}
export async function decrementTenantCount(tenantId: string, field: 'currentUsers' | 'currentProjects') {
  await db.tenant.update({ where: { id: tenantId }, data: { [field]: { decrement: 1 } } })
}

// ---------- Audit Logging ----------
export async function createAuditLog(params: {
  tenantId?: string
  userId?: string
  userName?: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
  level?: string
}) {
  await db.auditLog.create({
    data: {
      tenantId: params.tenantId ?? null,
      userId: params.userId ?? null,
      userName: params.userName ?? null,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId ?? null,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      level: params.level ?? 'info',
    },
  })
}

export async function getAuditLogs(tenantId: string, opts?: { page?: number; limit?: number; action?: string; resource?: string }) {
  const page = opts?.page ?? 1
  const limit = opts?.limit ?? 50
  const where: Record<string, unknown> = { tenantId }
  if (opts?.action) where.action = opts.action
  if (opts?.resource) where.resource = opts.resource
  const [items, total] = await Promise.all([
    db.auditLog.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
    }),
    db.auditLog.count({ where }),
  ])
  return { items, total, pages: Math.ceil(total / limit) }
}

// ---------- Tenant Scoped Queries ----------
export function tenantWhere(tenantId: string, branchId?: string) {
  const where: Record<string, unknown> = { tenantId }
  if (branchId) where.branchId = branchId
  return where
}

export async function getTenantProjects(tenantId: string, branchId?: string) {
  return db.project.findMany({
    where: tenantWhere(tenantId, branchId),
    include: { portfolio: true, program: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getTenantProjectCount(tenantId: string) {
  return db.project.count({ where: { tenantId } })
}

export async function getTenantUserCount(tenantId: string) {
  return db.appUser.count({ where: { tenantId, active: true } })
}

// ---------- Default Feature Modules ----------
export const DEFAULT_FEATURES = [
  'dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt',
  'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints',
  'procurement', 'inventory', 'hr', 'equipment', 'fleet', 'work-orders',
  'hse', 'quality', 'costs', 'evm', 'cashflow', 'baselines', 'changes',
  'ai-planner', 'integrations', 'workflow-engine', 'accounts', 'tender',
  'submittals', 'closeout', 'commissioning', 'site-progress', 'lookahead',
  'exec-reports', 'security', 'support', 'portals', 'notifications',
] as const

export const PLAN_FEATURE_MAP: Record<string, string[]> = {
  'Free Trial': ['dashboard', 'projects', 'maintenance', 'complaints'],
  'Starter': ['dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt', 'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints', 'work-orders'],
  'Professional': ['dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt', 'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints', 'work-orders', 'procurement', 'inventory', 'hr', 'equipment', 'fleet', 'hse', 'quality', 'costs', 'evm', 'cashflow', 'baselines', 'changes', 'submittals', 'closeout', 'commissioning', 'site-progress', 'lookahead', 'accounts', 'tender', 'exec-reports', 'notifications'],
  'Enterprise': DEFAULT_FEATURES as unknown as string[],
  'Custom': DEFAULT_FEATURES as unknown as string[],
}
