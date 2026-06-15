import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, requireRole } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!requireRole(user, ['admin'])) {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
  }

  const flags = await db.featureFlag.findMany({ orderBy: { module: 'asc' } })
  return NextResponse.json({ success: true, data: flags })
}

export async function PUT(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!requireRole(user, ['admin'])) {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
  }

  const body = await request.json()
  const { id, enabled, isBeta } = body

  if (!id) {
    return NextResponse.json({ success: false, error: 'Flag ID required' }, { status: 400 })
  }

  const flag = await db.featureFlag.update({
    where: { id },
    data: { enabled: enabled ?? undefined, isBeta: isBeta ?? undefined },
  })

  return NextResponse.json({ success: true, data: flag })
}