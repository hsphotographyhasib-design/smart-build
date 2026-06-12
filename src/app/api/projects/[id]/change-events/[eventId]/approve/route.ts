import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, eventId } = await params

    const existing = await db.changeEvent.findFirst({ where: { id: eventId, projectId } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const item = await db.changeEvent.update({
      where: { id: eventId },
      data: { status: 'approved', approvedById: user.id },
    })

    await createAuditLog({ userId: user.id, action: 'APPROVE', entity: 'ChangeEvent', entityId: eventId, oldValues: existing, newValues: item, ipAddress: request.headers.get('x-forwarded-for') || undefined })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}