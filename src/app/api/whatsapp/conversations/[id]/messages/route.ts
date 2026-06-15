import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

const WA_SOCKET_PORT = 3096

async function emitEvent(event: string, data: unknown) {
  try {
    await fetch(`http://localhost:${WA_SOCKET_PORT}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    })
  } catch {
    // Socket service may not be running
  }
}

// GET — List messages in conversation (paginated)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const skip = (page - 1) * limit

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const [messages, total] = await Promise.all([
      db.whatsAppMessage.findMany({
        where: { conversationId: id, isDeleted: false },
        include: {
          sentBy: { select: { id: true, name: true, avatar: true } },
          contactSender: { select: { id: true, name: true, pushName: true, profilePicUrl: true } },
          attachments: true,
          repliedTo: { select: { id: true, content: true, messageType: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.whatsAppMessage.count({
        where: { conversationId: id, isDeleted: false },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: messages.reverse(), // Return in ascending order
      total,
      page,
      limit,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get messages'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// POST — Send message via WhatsApp API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { content, messageType = 'text', repliedToId } = body

    if (!content && messageType === 'text') {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 })
    }

    const conversation = await db.whatsAppConversation.findUnique({
      where: { id },
      include: { contact: true, account: true },
    })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    if (!conversation.account?.accessToken) {
      return NextResponse.json({ success: false, error: 'WhatsApp not configured' }, { status: 400 })
    }

    // Build WhatsApp API payload
    const waPayload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      to: conversation.contact.phone,
      type: 'text',
      text: { body: content },
    }

    // Send via WhatsApp Business API
    let waMessageId: string | null = null
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${conversation.account.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${conversation.account.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(waPayload),
        }
      )
      const result = await response.json()
      if (result.messages?.[0]?.id) {
        waMessageId = result.messages[0].id as string
      }
    } catch {
      // Store message even if WhatsApp API fails
    }

    // Store message in DB
    const message = await db.whatsAppMessage.create({
      data: {
        conversationId: id,
        waMessageId,
        direction: 'outgoing',
        messageType,
        content,
        senderType: 'agent',
        sentById: authUser.id,
        repliedToId: repliedToId || null,
        isDelivered: !!waMessageId,
      },
    })

    // Update conversation
    await db.whatsAppConversation.update({
      where: { id },
      data: {
        lastMessageText: content,
        lastMessageAt: new Date(),
        lastMessageDir: 'outgoing',
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'send_message',
      entity: 'WhatsAppMessage',
      entityId: message.id,
    })

    await emitEvent('new_message', {
      conversationId: id,
      messageId: message.id,
      direction: 'outgoing',
    })

    return NextResponse.json({ success: true, data: message })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send message'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}