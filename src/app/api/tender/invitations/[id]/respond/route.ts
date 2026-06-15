import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { action, declinedReason } = body

    if (!action || !['accepted', 'declined'].includes(action)) {
      return NextResponse.json({ success: false, error: 'action must be "accepted" or "declined"' }, { status: 400 })
    }

    const invitation = await db.tenderInvitation.findUnique({ where: { id } })
    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 })
    }

    if (!['sent', 'opened'].includes(invitation.status)) {
      return NextResponse.json({ success: false, error: `Invitation cannot be ${action} in current status: ${invitation.status}` }, { status: 400 })
    }

    const updated = await db.tenderInvitation.update({
      where: { id },
      data: {
        status: action,
        respondedAt: new Date(),
        declinedReason: action === 'declined' ? (declinedReason || null) : null,
      },
      include: {
        package: { select: { id: true, packageNo: true, name: true } },
        vendor: { select: { id: true, companyName: true, email: true } },
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to respond to invitation'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}