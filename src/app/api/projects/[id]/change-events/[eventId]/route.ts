import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, eventId } = await params
    const { status } = await request.json()

    if (!status) return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })

    const event = await db.changeEvent.update({
      where: { id: eventId, projectId },
      data: {
        status,
        ...(status === 'approved' ? { approvedById: user.id } : {}),
        ...(status === 'rejected' ? { reviewedById: user.id } : {}),
        ...(status === 'review' ? { reviewedById: user.id } : {}),
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}