import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: discussionId } = await params

    const comments = await db.discussionComment.findMany({
      where: { discussionId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(comments)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: discussionId } = await params

    const discussion = await db.discussion.findUnique({ where: { id: discussionId } })
    if (!discussion) return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 })

    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Comment content is required' }, { status: 400 })
    }

    const comment = await db.discussionComment.create({
      data: {
        discussionId,
        userId: user.id,
        content: content.trim(),
      },
    })

    // Update the discussion's updatedAt
    await db.discussion.update({
      where: { id: discussionId },
      data: { updatedAt: new Date() },
    })

    await createAuditLog({ userId: user.id, action: 'CREATE', entity: 'DiscussionComment', entityId: comment.id })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(comment)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to add comment' }, { status: 500 })
  }
}