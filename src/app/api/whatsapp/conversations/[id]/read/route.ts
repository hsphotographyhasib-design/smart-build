import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

const WA_SOCKET_PORT = 3096

async function emitEvent(event: string, data: unknown) {
  try {
    await fetch(`http://localhost:${WA_SOCKET_PORT}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    })
  } catch {
    // Socket সার্ভিস চলছে না হতে পারে
  }
}

// POST — কথোপকথন পড়া হয়েছে হিসেবে চিহ্নিত করা হচ্ছে
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

    // সব মেসেজ পড়া হয়েছে হিসেবে চিহ্নিত করা হচ্ছে
    await db.whatsAppMessage.updateMany({
      where: {
        conversationId: id,
        direction: 'incoming',
        isRead: false,
      },
      data: { isRead: true, receivedById: authUser.id },
    })

    // অপঠিত গণনা রিসেট করা হচ্ছে
    const updated = await db.whatsAppConversation.update({
      where: { id },
      data: { unreadCount: 0 },
    })

    await emitEvent('conversation_read', { conversationId: id, userId: authUser.id })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark as read'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}