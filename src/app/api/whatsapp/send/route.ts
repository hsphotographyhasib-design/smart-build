import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { sendTextMessage, sendMediaMessage, sendDocument } from '@/lib/openwa-client'

// POST — Send text/media message via OpenWA
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      chatId,
      text,
      mediaType,
      mediaUrl,
      caption,
      fileName,
      base64,
      templateName,
      templateParams,
    } = body

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'chatId is required' },
        { status: 400 }
      )
    }

    const account = await db.whatsAppAccount.findFirst({ where: { isActive: true, status: 'connected' } })
    if (!account?.sessionId) {
      return NextResponse.json({ success: false, error: 'WhatsApp not connected. Please scan QR code first.' }, { status: 400 })
    }

    let finalText = text
    let messageType = 'text'
    let waMessageId: string | null = null
    let sendSuccess = false

    // Template resolution
    if (templateName) {
      const template = await db.whatsAppMessageTemplate.findFirst({
        where: { name: templateName, isActive: true },
      })
      if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found or inactive' }, { status: 404 })
      }

      finalText = template.content
      if (templateParams && Array.isArray(templateParams)) {
        const vars: string[] = template.variables ? JSON.parse(template.variables) : []
        templateParams.forEach((param: string, idx: number) => {
          const placeholder = vars[idx] ? `{{${vars[idx]}}}` : `{{${idx + 1}}}`
          finalText = (finalText || '').replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), param)
        })

        // Also replace numbered placeholders for backward compat
        templateParams.forEach((param: string, idx: number) => {
          finalText = (finalText || '').replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), param)
        })
      }

      messageType = 'template'
      await db.whatsAppMessageTemplate.update({
        where: { id: template.id },
        data: { usageCount: { increment: 1 } },
      })
    }

    // Ensure chatId is in WhatsApp format
    const formattedChatId = formatChatId(chatId)

    // Send via OpenWA
    try {
      if (mediaType && (mediaUrl || base64)) {
        if (mediaType === 'document' || fileName) {
          const result = await sendDocument(
            account.sessionId,
            formattedChatId,
            {
              url: mediaUrl || undefined,
              base64: base64 || undefined,
              mimetype: guessMimeType(mediaType, mediaUrl, fileName),
            },
            fileName || 'document',
            caption || finalText || undefined
          )
          waMessageId = result?.id || result?.key?.id || null
          messageType = 'document'
        } else {
          const result = await sendMediaMessage(
            account.sessionId,
            formattedChatId,
            mediaType,
            {
              url: mediaUrl || undefined,
              base64: base64 || undefined,
              mimetype: guessMimeType(mediaType, mediaUrl),
            },
            caption || undefined
          )
          waMessageId = result?.id || result?.key?.id || null
          messageType = mediaType
        }
      } else if (finalText) {
        const result = await sendTextMessage(account.sessionId, formattedChatId, finalText)
        waMessageId = result?.id || result?.key?.id || null
      }
      sendSuccess = !!waMessageId
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Send failed'
      // Still save the message to DB even if send fails
    }

    // Upsert contact
    const contact = await db.whatsAppContact.upsert({
      where: { waId: formattedChatId },
      create: {
        waId: formattedChatId,
        phoneNumber: formattedChatId.replace('@s.whatsapp.net', '').replace('@g.us', ''),
        name: null,
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Find or create conversation
    let conversation = await db.whatsAppConversation.findFirst({
      where: { contactId: contact.id, status: 'open' },
      orderBy: { lastMessageAt: 'desc' },
    })

    if (!conversation) {
      conversation = await db.whatsAppConversation.create({
        data: {
          waChatId: formattedChatId,
          contactId: contact.id,
          accountId: account.id,
          status: 'open',
          lastMessageAt: new Date(),
          lastMessageType: messageType,
          updatedAt: new Date(),
        },
      })
    }

    // Save message
    const message = await db.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        contactId: contact.id,
        waMessageId,
        sentByAccountId: account.id,
        direction: 'outgoing',
        messageType,
        content: finalText,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType ? guessMimeType(mediaType, mediaUrl) : null,
        caption: caption || null,
        fileName: fileName || null,
        senderName: authUser.name,
      },
    })

    // Update conversation
    await db.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageText: finalText || `[${messageType}]`,
        lastMessageAt: new Date(),
        lastMessageType: messageType,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'direct_send',
      entity: 'WhatsAppMessage',
      entityId: message.id,
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId: message.id,
        waMessageId,
        conversationId: conversation.id,
        delivered: sendSuccess,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send message'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function formatChatId(chatId: string): string {
  // If already in WA format, return as-is
  if (chatId.includes('@')) return chatId
  // Otherwise treat as phone number and format
  const cleaned = chatId.replace(/[^0-9]/g, '')
  return `${cleaned}@s.whatsapp.net`
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
      mp4: 'video/mp4', avi: 'video/avi', mkv: 'video/x-matroska',
      mp3: 'audio/mp3', ogg: 'audio/ogg', aac: 'audio/aac',
      pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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