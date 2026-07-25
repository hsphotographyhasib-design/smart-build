import { NextResponse } from 'next/server'
import { getSuperAdminUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET() {
  const admin = await getSuperAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const plans = await db.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ plans })
}
