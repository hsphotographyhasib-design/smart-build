import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; rfiId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { rfiId } = await params
    const { content } = await request.json()

    if (!content?.trim()) return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })

    const comment = await db.rFIComment.create({
      data: { rfiId, userId: user.id, content },
      include: { user: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ success: true, data: { ...comment, userName: comment.user.name } }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}