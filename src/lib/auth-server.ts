// Node-only auth helpers (bcrypt, prisma, cookie). Never import from middleware.  
import { cookies, headers } from 'next/headers'  
import bcrypt from 'bcryptjs'  
import { db } from '@/lib/db'  
import {   
  SESSION_COOKIE,   
  SESSION_MAX_AGE,   
  verifySession,   
  signSession,   
  isSuperAdminRole,   
  type SessionPayload,  
} from '@/lib/auth'  
import { createAuditLog } from '@/lib/tenant'  
  
export async function hashPassword(plain: string): Promise<string> {   
  return bcrypt.hash(plain, 10)  
}  
  
export async function comparePassword(plain: string, hash: string): Promise<boolean> {   
  return bcrypt.compare(plain, hash)  
}  
  
const cookieOptions = {   
  httpOnly: true,   
  sameSite: 'lax' as const,   
  secure: process.env.NODE_ENV === 'production',   
  path: '/',   
  maxAge: SESSION_MAX_AGE,  
}  
  
/** Issue a session cookie for a user. */  
export async function issueSession(user: {   
  id: string   
  email: string   
  name: string   
  role: string   
  roleLevel: number   
  provider: string   
  tenantId?: string | null   
  tenantSlug?: string | null   
  branchId?: string | null  
}): Promise<void> {   
  const token = await signSession({   
    sub: user.id,   
    email: user.email,   
    name: user.name,   
    role: user.role,   
    roleLevel: user.roleLevel,   
    provider: user.provider,   
    ...(user.tenantId ? { tenantId: user.tenantId } : {}),   
    ...(user.tenantSlug ? { tenantSlug: user.tenantSlug } : {}),   
    ...(user.branchId ? { branchId: user.branchId } : {}),   
  })  
  const store = await cookies()   
  store.set(SESSION_COOKIE, token, cookieOptions)  
}  
  
export async function clearSession(): Promise<void> {   
  const store = await cookies()   
  store.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 })  
}  
  
/** Decode session from cookie (no DB). */  
export async function getSessionPayload(): Promise<SessionPayload | null> {   
  const store = await cookies()   
  return verifySession(store.get(SESSION_COOKIE)?.value)  
}  
  
/** Fresh user from DB. */  
export async function getSessionUser() {   
  const payload = await getSessionPayload()   
  if (!payload?.sub) return null   
  const user = await db.appUser.findUnique({   
    where: { id: payload.sub },   
    include: {   
      tenant: { select: { id: true, slug: true, name: true, status: true, tier: true } },   
      branch: { select: { id: true, name: true, code: true } },   
      role: { select: { id: true, name: true, level: true, permissions: true } },   
    },   
  })  
  if (!user || !user.active) return null   
  if (user.tenant && user.tenant.status !== 'Active' && !isSuperAdminRole(payload.role)) return null   
  return user  
}  
  
/** Returns the Super Admin user, or null. */  
export async function getSuperAdminUser() {   
  const payload = await getSessionPayload()   
  if (!payload?.sub || !isSuperAdminRole(payload.role)) return null   
  return db.appUser.findUnique({ where: { id: payload.sub } })  
}  
  
/** Get IP and User-Agent for audit. */  
export async function getRequestMeta() {   
  const hdrs = await headers()   
  return {   
    ipAddress: hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? null,   
    userAgent: hdrs.get('user-agent') ?? null,   
  }  
}  
  
/** Log a login event. */  
export async function logLogin(user: { id: string; name: string; tenantId?: string | null }) {   
  const meta = await getRequestMeta()   
  await createAuditLog({   
    tenantId: user.tenantId ?? undefined,   
    userId: user.id,   
    userName: user.name,   
    action: 'login',   
    resource: 'session',   
    ...meta,   
  })  
  await db.appUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })  
}  
  
/** Log a logout event. */  
export async function logLogout(user: { id: string; name: string; tenantId?: string | null }) {   
  const meta = await getRequestMeta()   
  await createAuditLog({   
    tenantId: user.tenantId ?? undefined,   
    userId: user.id,   
    userName: user.name,   
    action: 'logout',   
    resource: 'session',   
    ...meta,   
  })  
}