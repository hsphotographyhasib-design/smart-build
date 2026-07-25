import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth-server'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await db.appUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, roleLevel: true, active: true, tenantId: true, branchId: true, avatar: true, createdAt: true },
  })
  return NextResponse.json({ users })
}
