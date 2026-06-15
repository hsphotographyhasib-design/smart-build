import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole, createAuditLog } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    if (!requireRole(user, ['admin', 'store_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.resourceRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Resource request not found' }, { status: 404 })
    }

    if (['rejected', 'cancelled', 'assigned'].includes(existing.status)) {
      return NextResponse.json({ success: false, error: `Cannot approve a request that is already ${existing.status}` }, { status: 400 })
    }

    // ব্যবহারকারীর ভূমিকার উপর ভিত্তি করে অনুমোদন স্তর নির্ধারণ করা হচ্ছে
    let newStatus: string
    let updateData: Record<string, unknown>

    if (user.role === 'supervisor') {
      newStatus = 'supervisor_approved'
      updateData = {
        status: newStatus,
        supervisorApprovedById: user.id,
        supervisorApprovedAt: new Date(),
      }
    } else if (user.role === 'admin' || user.role === 'pm') {
      newStatus = 'pm_approved'
      updateData = {
        status: newStatus,
        pmApprovedById: user.id,
        pmApprovedAt: new Date(),
        // সুপারভাইজার এখনও অনুমোদন করেননি, সুপারভাইজার স্তরেও স্বয়ংক্রিয়ভাবে অনুমোদন করা হচ্ছে
        ...(existing.status === 'pending' && {
          supervisorApprovedById: user.id,
          supervisorApprovedAt: new Date(),
        }),
      }
    } else {
      return NextResponse.json({ success: false, error: 'Insufficient permissions to approve' }, { status: 403 })
    }

    const result = await db.resourceRequest.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'approve',
      entity: 'ResourceRequest',
      entityId: id,
      oldValues: { status: existing.status },
      newValues: { status: newStatus },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}