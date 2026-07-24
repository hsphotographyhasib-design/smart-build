import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth-server'
import { isSuperAdminRole } from '@/lib/auth'

const ASSIGNABLE_ROLES = [
  'Super Admin', 'Tenant Admin', 'Manager', 'Supervisor', 'Employee', 'Customer', 'Vendor',
]

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  let body: { role?: string; active?: boolean }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const target = await db.appUser.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const superAdmin = isSuperAdminRole(admin.role)
  if (!superAdmin && (body.role === 'Super Admin' || isSuperAdminRole(target.role))) {
    return NextResponse.json({ error: 'Only a Super Admin can manage Super Admin accounts' }, { status: 403 })
  }
  if (target.id === admin.id && (body.role !== undefined || body.active === false)) {
    return NextResponse.json({ error: 'You cannot change your own role or disable yourself' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (body.role !== undefined) {
    if (!ASSIGNABLE_ROLES.includes(body.role)) return NextResponse.json({ error: 'Unknown role' }, { status: 400 })
    data.role = body.role
    const level = { 'Super Admin': 100, 'Tenant Admin': 80, 'Manager': 60, 'Supervisor': 40, 'Employee': 20, 'Customer': 10, 'Vendor': 5 }
    data.roleLevel = level[body.role] ?? 10
  }
  if (body.active !== undefined) data.active = body.active
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const updated = await db.appUser.update({ where: { id }, data })
  return NextResponse.json({ user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role, roleLevel: updated.roleLevel, active: updated.active } })
}
