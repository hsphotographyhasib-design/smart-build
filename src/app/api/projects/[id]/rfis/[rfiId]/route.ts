import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; rfiId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, rfiId } = await params
    const body = await request.json()
    const { status } = body

    if (!status) return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })

    const rfi = await db.rFI.update({
      where: { id: rfiId, projectId },
      data: {
        status,
        ...(status === 'answered' ? { answeredById: user.id, answeredAt: new Date() } : {}),
        ...(status === 'closed' ? { closedAt: new Date() } : {}),
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}