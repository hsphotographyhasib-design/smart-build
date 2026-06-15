import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { sendTextMessage, sendMediaMessage, sendDocument } from '@/lib/openwa-client'

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

// GET — Paginated messages for a conversation
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
    const skip = (page - 1) * limit

    const conversation = await db.whatsAppConversation.findUnique({ where: { id } })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const [messages, total] = await Promise.all([
      db.whatsAppMessage.findMany({
        where: { conversationId: id, isDeleted: false },
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

// POST — Send a message in a conversation via OpenWA
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const {
      text,
      content,
      messageType = 'text',
      mediaType,
      mediaUrl,
      caption,
      fileName,
      base64,
      repliedToId,
    } = body

    const messageText = text || content

    if (!messageText && messageType === 'text') {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 })
    }

    const conversation = await db.whatsAppConversation.findUnique({
      where: { id },
      include: { contact: true, account: true },
    })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    const account = conversation.account
    if (!account?.sessionId || account.status !== 'connected') {
      return NextResponse.json({ success: false, error: 'WhatsApp not connected' }, { status: 400 })
    }

    const chatId = conversation.waChatId
    let waMessageId: string | null = null

    // Send via OpenWA
    try {
      if (mediaType && (mediaUrl || base64)) {
        if (mediaType === 'document' || fileName) {
          const result = await sendDocument(
            account.sessionId,
            chatId,
            {
              url: mediaUrl || undefined,
              base64: base64 || undefined,
              mimetype: guessMimeType(mediaType, mediaUrl, fileName),
            },
            fileName || 'document',
            caption || messageText || undefined
          )
          waMessageId = result?.id || result?.key?.id || null
        } else {
          const result = await sendMediaMessage(
            account.sessionId,
            chatId,
            mediaType,
            {
              url: mediaUrl || undefined,
              base64: base64 || undefined,
              mimetype: guessMimeType(mediaType, mediaUrl),
            },
            caption || undefined
          )
          waMessageId = result?.id || result?.key?.id || null
        }
      } else if (messageText) {
        const result = await sendTextMessage(account.sessionId, chatId, messageText)
        waMessageId = result?.id || result?.key?.id || null
      }
    } catch {
      // OpenWA send failed, still save the message
    }

    // Save message to DB
    const message = await db.whatsAppMessage.create({
      data: {
        conversationId: id,
        contactId: conversation.contactId,
        waMessageId,
        sentByAccountId: account.id,
        direction: 'outgoing',
        messageType: mediaType || messageType,
        content: messageText,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType ? guessMimeType(mediaType, mediaUrl) : null,
        caption: caption || null,
        fileName: fileName || null,
        repliedToId: repliedToId || null,
        senderName: authUser.name,
      },
    })

    // Update conversation
    await db.whatsAppConversation.update({
      where: { id },
      data: {
        lastMessageText: messageText || `[${mediaType || messageType}]`,
        lastMessageAt: new Date(),
        lastMessageType: mediaType || messageType,
        updatedAt: new Date(),
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'send_message',
      entity: 'WhatsAppMessage',
      entityId: message.id,
    })

    await emitEvent(`conversation:${id}`, 'new_message', {
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

function guessMimeType(mediaType?: string, url?: string, fileName?: string): string {
  if (mediaType) {
    if (mediaType.includes('/')) return mediaType
    const map: Record<string, string> = {
      image: 'image/jpeg',
      video: 'video/mp4',
      audio: 'audio/mp3',
      sticker: 'image/webp',
    }
    return map[mediaType] || 'application/octet-stream'
  }
  if (url) {
    const ext = url.split('.').pop()?.toLowerCase()
    const extMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
      mp4: 'video/mp4', avi: 'video/avi',
      mp3: 'audio/mp3', ogg: 'audio/ogg', aac: 'audio/aac',
      pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    if (ext && extMap[ext]) return extMap[ext]
  }
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'application/pdf'
    if (ext === 'doc' || ext === 'docx') return 'application/msword'
  }
  return 'application/octet-stream'
}