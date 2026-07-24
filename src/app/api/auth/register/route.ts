import { NextRequest, NextResponse } from 'next/server'  
import { db } from '@/lib/db'  
import { hashPassword, issueSession, logLogin } from '@/lib/auth-server'  
import { incrementTenantCount } from '@/lib/tenant'  
  
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/  
  
// This is a simplified register for creating users within an existing tenant.  
// Public self-service registration (new tenant) should use /api/register instead.  
export async function POST(req: NextRequest) {  
  let body: { name?: string; email?: string; password?: string; tenantId?: string; branchId?: string }  
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }  
  
  const email = body.email?.trim().toLowerCase()  
  const password = body.password ?? ''  
  const name = body.name?.trim() || (email ? email.split('@')[0] : '')  
  const tenantId = body.tenantId  
  
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })  
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })  
  if (!tenantId) return NextResponse.json({ error: 'tenantId is required' }, { status: 400 })  
  
  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })  
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })  
  if (tenant.status !== 'Active') return NextResponse.json({ error: 'Tenant is not active' }, { status: 403 })  
  
  const existing = await db.appUser.findFirst({ where: { email, tenantId } })  
  if (existing) return NextResponse.json({ error: 'Email already exists in this tenant' }, { status: 409 })  
  
  const user = await db.appUser.create({  
    data: {  
      name, email, passwordHash: await hashPassword(password),  
      role: 'Employee', roleLevel: 20, provider: 'email',  
      tenantId, branchId: body.branchId || tenant.branches[0]?.id,  
    },  
  })  
  
  await incrementTenantCount(tenantId, 'currentUsers')  
  await issueSession({ id: user.id, email: user.email, name: user.name, role: user.role, roleLevel: user.roleLevel, provider: user.provider, tenantId: user.tenantId, tenantSlug: tenant.slug, branchId: user.branchId })  
  await logLogin({ id: user.id, name: user.name, tenantId: user.tenantId })  
  
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId } }, { status: 201 })  
}  
