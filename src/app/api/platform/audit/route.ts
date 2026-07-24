import { NextRequest, NextResponse } from 'next/server'
import { getSuperAdminUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const admin = await getSuperAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const tenantId = url.searchParams.get('tenantId')
  const action = url.searchParams.get('action')
  const resource = url.searchParams.get('resource')
  const where: Record<string, unknown> = {}
  if (tenantId) where.tenantId = tenantId
  if (action) where.action = action
  if (resource) where.resource = resource
  const [items, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    db.auditLog.count({ where }),
  ])
  return NextResponse.json({ items, total, pages: Math.ceil(total / limit) })
}