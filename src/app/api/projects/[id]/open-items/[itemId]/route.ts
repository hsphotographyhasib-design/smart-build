import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId, itemId } = await params
    const body = await request.json()
    const { status } = body

    if (!status) return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })

    const item = await db.openItem.update({
      where: { id: itemId, projectId },
      data: {
        status,
        ...(status === 'resolved' ? { resolvedDate: new Date(), resolvedById: user.id } : {}),
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(item)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}