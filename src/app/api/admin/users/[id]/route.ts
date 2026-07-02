import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth-server'
import { ROLES, isSuperAdminRole } from '@/lib/auth'
import { publicUser } from '@/lib/user'

// Roles an admin may assign. Extend as needed.
const ASSIGNABLE_ROLES = [
  ROLES.CUSTOMER,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  'Portfolio Director',
  'Project Manager',
  'Planning Manager',
  'Project Controls Manager',
  'Scheduler',
  'Site Engineer',
  'Quantity Surveyor',
]

// Change a user's role or active status — Admin / Super Admin only.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  let body: { role?: string; active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const target = await db.appUser.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const superAdmin = isSuperAdminRole(admin.role)

  // Only a Super Admin may grant the Super Admin role or modify another Super Admin.
  if (!superAdmin && (body.role === ROLES.SUPER_ADMIN || isSuperAdminRole(target.role))) {
    return NextResponse.json({ error: 'Only a Super Admin can manage Super Admin accounts' }, { status: 403 })
  }
  // Prevent locking yourself out.
  if (target.id === admin.id && (body.role !== undefined || body.active === false)) {
    return NextResponse.json({ error: 'You cannot change your own role or disable yourself' }, { status: 400 })
  }

  const data: { role?: string; active?: boolean } = {}
  if (body.role !== undefined) {
    if (!ASSIGNABLE_ROLES.includes(body.role)) {
      return NextResponse.json({ error: 'Unknown role' }, { status: 400 })
    }
    data.role = body.role
  }
  if (body.active !== undefined) data.active = body.active

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const updated = await db.appUser.update({ where: { id }, data })
  return NextResponse.json({ user: publicUser(updated) })
}
