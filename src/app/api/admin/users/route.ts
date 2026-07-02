import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth-server'
import { publicUser } from '@/lib/user'

// List all users — Admin / Super Admin only.
export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await db.appUser.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ users: users.map(publicUser) })
}
