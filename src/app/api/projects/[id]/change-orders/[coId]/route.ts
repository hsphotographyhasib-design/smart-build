import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; coId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, coId } = await params
    const { status } = await request.json()

    if (!status) return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })

    const co = await db.changeOrder.update({
      where: { id: coId, projectId },
      data: {
        status,
        ...(status === 'approved' ? { approvedById: user.id } : {}),
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify()) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}