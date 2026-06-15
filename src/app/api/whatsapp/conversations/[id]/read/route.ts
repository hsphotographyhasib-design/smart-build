import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

const REALTIME_BRIDGE_URL = 'http://localhost:3096/api/events'

async function emitEvent(room: string, event: string, data: unknown) {
  try {
    await fetch(REALTIME_BRIDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, event, data }),
    })
  } catch {
    // Realtime service not available, non-blocking
  }
}

// POST — Mark messages as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    // Mark all unread incoming messages as read
    await db.whatsAppMessage.updateMany({
      where: {
        conversationId: id,
        direction: 'incoming',
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    // Reset unread count
    const updated = await db.whatsAppConversation.update({
      where: { id },
      data: { unreadCount: 0, updatedAt: new Date() },
    })

    await emitEvent(`conversation:${id}`, 'conversation_read', {
      conversationId: id,
      userId: authUser.id,
    })

    await emitEvent('whatsapp', 'conversation_read', {
      conversationId: id,
      userId: authUser.id,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark as read'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}