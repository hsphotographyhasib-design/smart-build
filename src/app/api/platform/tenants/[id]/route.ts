import { NextRequest, NextResponse } from 'next/server'
import { getSuperAdminUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/tenant'
import { headers } from 'next/headers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const tenant = await db.tenant.findUnique({ where: { id }, include: { settings: true, branding: true, subscription: { include: { plan: true } }, features: true, domains: true, _count: { select: { users: true, branches: true, portfolios: true } } } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ tenant })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const hdrs = await headers()
  const existing = await db.tenant.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { status, tier, maxUsers, maxProjects, maxStorage, maxBranches, name, email, phone, address } = body
  const data: Record<string, unknown> = {}
  if (status !== undefined) data.status = status
  if (tier) data.tier = tier
  if (maxUsers) data.maxUsers = maxUsers
  if (maxProjects) data.maxProjects = maxProjects
  if (maxStorage) data.maxStorage = maxStorage
  if (maxBranches) data.maxBranches = maxBranches
  if (name) data.name = name
  if (email) data.email = email
  if (phone) data.phone = phone
  if (address) data.address = address

  const tenant = await db.tenant.update({ where: { id }, data, include: { settings: true, subscription: { include: { plan: true } } } })
  await createAuditLog({ userId: admin.id, userName: admin.name, action: 'update', resource: 'tenant', resourceId: id, details: JSON.stringify(body), ipAddress: hdrs.get('x-forwarded-for') ?? null, userAgent: hdrs.get('user-agent') ?? null, level: 'security' })
  return NextResponse.json({ tenant })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const hdrs = await headers()
  const existing = await db.tenant.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.tenant.delete({ where: { id } })
  await createAuditLog({ userId: admin.id, userName: admin.name, action: 'delete', resource: 'tenant', resourceId: id, details: JSON.stringify({ name: existing.name, slug: existing.slug }), ipAddress: hdrs.get('x-forwarded-for') ?? null, userAgent: hdrs.get('user-agent') ?? null, level: 'security' })
  return NextResponse.json({ message: 'Tenant deleted' })
}
