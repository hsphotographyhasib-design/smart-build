import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendTextMessage } from '@/lib/openwa-client'

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

// GET — Health check for OpenWA webhook verification
export async function GET() {
  return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
}

// POST — Receive messages/events from OpenWA webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>

    // OpenWA webhook payloads vary. Handle common formats:
    // Format 1: { event: 'message', data: { ... } }
    // Format 2: Direct message object from OpenWA
    // Format 3: Array of events
    const events: Array<Record<string, unknown>> = []
    if (Array.isArray(body)) {
      for (const item of body) {
        if (item && typeof item === 'object') events.push(item as Record<string, unknown>)
      }
    } else if (body.event === 'message' || body.event === 'messages.upsert') {
      events.push(body)
    } else if (body.data && typeof body.data === 'object' && body.data !== null) {
      events.push(body.data as Record<string, unknown>)
    } else {
      events.push(body)
    }

    const account = await db.whatsAppAccount.findFirst({ where: { isActive: true } })
    if (!account) {
      return NextResponse.json({ success: true })
    }

    for (const evt of events) {
      // Extract message from various payload formats
      const msg = extractMessage(evt)
      if (!msg) continue

      await processIncomingMessage(account.id, msg, evt)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed'
    console.error('Webhook error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function extractMessage(evt: Record<string, unknown>): Record<string, unknown> | null {
  // OpenWA webhook message formats
  if (evt.messages && Array.isArray(evt.messages) && evt.messages.length > 0) {
    return evt.messages[0] as Record<string, unknown>
  }

  // Direct message object (has key or from field)
  if ((evt.key || evt.from || evt.id) && (evt.message || evt.body || evt.conversation)) {
    return evt
  }

  // whatsapp-web.js message format
  if (evt.id && evt.from && evt.body !== undefined) {
    return evt
  }

  return null
}

async function processIncomingMessage(
  accountId: string,
  msg: Record<string, unknown>,
  rawEvt: Record<string, unknown>
) {
  // Extract message fields from various formats
  const key = msg.key as Record<string, unknown> | undefined
  const waMessageId = (msg['id'] || (key && key['id']) || rawEvt['id']) as string | null
  if (!waMessageId) return

  // Skip duplicates
  const existingByWaId = await db.whatsAppMessage.findFirst({
    where: { waMessageId },
  })
  if (existingByWaId) return

  // Extract sender/recipient
  const from = (key?.['remoteJid'] || msg['from'] || msg['chatId']) as string | undefined
  if (!from) return

  const isGroup = !!(key?.['remoteJid'] && String(key['remoteJid']).endsWith('@g.us'))

  // Extract message content
  const messageObj = (msg['message'] || msg['msg'] || {}) as Record<string, unknown>
  const textContent = extractTextContent(msg, messageObj)
  const messageType = extractMessageType(msg, messageObj)

  // Skip status broadcasts and system messages
  if (messageType === 'system' || (key?.['fromMe'] === true && messageType === 'reaction')) return

  const timestamp = extractTimestamp(msg)
  const pushName = (msg['pushName'] || msg['notifyName'] || key?.['pushName']) as string | null
  const senderPhone = from.replace('@s.whatsapp.net', '').replace('@g.us', '')

  // Upsert contact
  const contact = await db.whatsAppContact.upsert({
    where: { waId: from },
    create: {
      waId: from,
      phoneNumber: senderPhone,
      name: pushName,
      pushName,
      lastSeenAt: timestamp,
      updatedAt: timestamp,
    },
    update: {
      name: pushName || undefined,
      pushName: pushName || undefined,
      lastSeenAt: timestamp,
      updatedAt: timestamp,
    },
  })

  // Find or create conversation
  const waChatId = from
  let conversation = await db.whatsAppConversation.findFirst({
    where: {
      waChatId,
      accountId,
      status: { in: ['open', 'pending'] },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  const groupName = isGroup ? String(msg['chatName'] || key?.['remoteJid'] || '') : null

  if (!conversation) {
    conversation = await db.whatsAppConversation.create({
      data: {
        waChatId,
        contactId: contact.id,
        accountId,
        status: 'open',
        isGroup,
        groupName,
        lastMessageAt: timestamp,
        lastMessageText: textContent || `[${messageType}]`,
        lastMessageType: messageType,
        unreadCount: 1,
        updatedAt: timestamp,
      },
    })
  } else {
    conversation = await db.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: timestamp,
        lastMessageText: textContent || `[${messageType}]`,
        lastMessageType: messageType,
        unreadCount: { increment: 1 },
      },
    })
  }

  // Extract media info
  const mediaInfo = extractMediaInfo(messageObj)

  // Save message
  const message = await db.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      contactId: contact.id,
      receivedByAccountId: accountId,
      waMessageId,
      direction: 'incoming',
      messageType,
      content: textContent,
      mediaUrl: mediaInfo.url,
      mediaType: mediaInfo.mimeType,
      fileName: mediaInfo.fileName,
      fileSize: mediaInfo.fileSize,
      caption: mediaInfo.caption,
      thumbnailUrl: null,
      location: mediaInfo.location,
      contactVcard: mediaInfo.vcard,
      senderName: pushName || contact.name || null,
      senderPhone,
      waTimestamp: timestamp,
      createdAt: timestamp,
    },
  })

  // Emit realtime event to conversation room
  await emitEvent(`conversation:${conversation.id}`, 'new_message', {
    conversationId: conversation.id,
    messageId: message.id,
    contactId: contact.id,
  })

  // Also emit to global room for badge counts
  await emitEvent('whatsapp', 'new_message', {
    conversationId: conversation.id,
    messageId: message.id,
  })

  // Handle auto-features
  const account = await db.whatsAppAccount.findUnique({ where: { id: accountId } })
  if (!account || account.status !== 'connected' || !account.sessionId) return

  // ── Bot command routing (before AI classification) ────────────
  if (textContent) {
    const trimmed = textContent.trim().toUpperCase()
    const isBotCommand =
      trimmed.startsWith('STATUS') ||
      trimmed.startsWith('MY REQUESTS') ||
      trimmed === 'MYREQUESTS' ||
      trimmed === 'HELP' ||
      trimmed === 'HELP ' ||
      trimmed === 'AMC' ||
      trimmed === 'AMC ' ||
      trimmed === 'SCHEDULE' ||
      trimmed === 'SCHEDULE '

    if (isBotCommand) {
      try {
        const { processBotCommand } = await import('@/app/api/whatsapp/bot-commands/route')
        await processBotCommand({
          sessionId: account.sessionId,
          conversationId: conversation.id,
          contactId: contact.id,
          contactWaId: contact.waId,
          contactPhone: senderPhone,
          message: textContent,
        })
      } catch (err) {
        console.error('Bot command processing failed:', err instanceof Error ? err.message : err)
      }
      return // Bot handled it, skip AI classification
    }
  }

  // ── AI classification ─────────────────────────────────────────
  if (textContent && textContent.length > 5) {
    try {
      const sdk = await import('z-ai-web-dev-sdk')
      const ZAI = (sdk as Record<string, unknown>).ZAI as { new (): { chat: (opts: { messages: Array<{ role: string; content: string }> }) => Promise<{ content?: string }> } }
      const ai = new ZAI()
      const classification = await ai.chat({
        messages: [
          {
            role: 'system',
            content: 'Classify this WhatsApp message into one of these categories: complaint, service_request, general_inquiry, feedback, status_query, emergency. Reply with ONLY the category name, nothing else.',
          },
          { role: 'user', content: textContent },
        ],
      })
      const category = classification?.content?.trim().toLowerCase() || 'general_inquiry'

      // Update contact tags
      const existingTags: string[] = contact.tags ? JSON.parse(contact.tags) : []
      if (!existingTags.includes(category)) {
        existingTags.push(category)
        await db.whatsAppContact.update({
          where: { id: contact.id },
          data: { tags: JSON.stringify(existingTags), updatedAt: new Date() },
        })
      }

      // ── Auto-ticket creation for complaints and emergencies ───
      if (category === 'complaint' || category === 'emergency') {
        try {
          await autoCreateTicket({
            sessionId: account.sessionId,
            accountId: account.id,
            conversationId: conversation.id,
            contactId: contact.id,
            contactWaId: contact.waId,
            contactPhone: senderPhone,
            contactName: pushName || contact.name,
            messageText: textContent,
            messageType: category === 'emergency' ? 'emergency' : 'complaint',
            messageId: message.id,
          })
        } catch (err) {
          console.error('Auto-ticket creation failed:', err instanceof Error ? err.message : err)
        }
      }
    } catch {
      // AI classification failed silently
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Auto-ticket creation using LLM extraction
// ─────────────────────────────────────────────────────────────────

interface AutoTicketParams {
  sessionId: string
  accountId: string
  conversationId: string
  contactId: string
  contactWaId: string
  contactPhone: string
  contactName: string | null
  messageText: string
  messageType: 'complaint' | 'emergency'
  messageId: string
}

async function autoCreateTicket(params: AutoTicketParams): Promise<void> {
  const {
    sessionId, accountId, conversationId, contactId,
    contactWaId, contactPhone, contactName, messageText,
    messageType,
  } = params

  // Use LLM to extract structured fields from the complaint message
  let extracted: {
    subject: string
    description: string
    category: string
    priority: string
    location: string
  }

  try {
    const sdk = await import('z-ai-web-dev-sdk')
    const ZAI = (sdk as Record<string, unknown>).ZAI as { new (): { chat: (opts: { messages: Array<{ role: string; content: string }> }) => Promise<{ content?: string }> } }
    const ai = new ZAI()

    const extractionResult = await ai.chat({
      messages: [
        {
          role: 'system',
          content: `Extract maintenance complaint details from this message. Return JSON with:
- subject: brief subject line (max 100 chars)
- description: full description of the issue
- category: one of (air_conditioning, electrical, plumbing, fire_protection, mechanical, civil, cleaning, security, it, general_maintenance)
- priority: one of (emergency, high, medium, low)
- location: location mentioned or empty string

Reply with ONLY valid JSON, no markdown, no explanation.`,
        },
        { role: 'user', content: messageText },
      ],
    })

    const rawContent = extractionResult?.content?.trim() || ''
    // Strip markdown code fences if present
    const jsonStr = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    extracted = JSON.parse(jsonStr) as typeof extracted
  } catch {
    // Fallback: use the message text directly as subject and description
    extracted = {
      subject: messageText.length > 100 ? messageText.substring(0, 97) + '...' : messageText,
      description: messageText,
      category: 'general_maintenance',
      priority: messageType === 'emergency' ? 'emergency' : 'medium',
      location: '',
    }
  }

  // Validate extracted fields
  const validCategories = [
    'air_conditioning', 'electrical', 'plumbing', 'fire_protection',
    'mechanical', 'civil', 'cleaning', 'security', 'it', 'general_maintenance',
  ]
  if (!validCategories.includes(extracted.category)) {
    extracted.category = 'general_maintenance'
  }

  const validPriorities = ['emergency', 'high', 'medium', 'low']
  if (!validPriorities.includes(extracted.priority)) {
    extracted.priority = messageType === 'emergency' ? 'emergency' : 'medium'
  }

  // Generate ticket number: CMP-{year}-{6-digit padded count}
  const year = new Date().getFullYear()
  const ticketCount = await db.maintenanceTicket.count()
  const ticketNo = `CMP-${year}-${String(ticketCount + 1).padStart(6, '0')}`

  // Find a system user to set as createdById
  const systemUser = await db.user.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  })

  const createdById = systemUser?.id || '00000000-0000-0000-0000-000000000000'

  // Create the maintenance ticket
  const ticket = await db.maintenanceTicket.create({
    data: {
      ticketNo,
      type: messageType,
      category: extracted.category,
      priority: extracted.priority,
      subject: extracted.subject,
      description: extracted.description,
      status: 'new',
      source: 'whatsapp',
      location: extracted.location || undefined,
      contactPerson: contactName || undefined,
      contactPhone,
      whatsappConversationId: conversationId,
      whatsappContactId: contactId,
      createdById,
      updatedAt: new Date(),
    },
  })

  // Create initial timeline entry
  await db.maintenanceTimeline.create({
    data: {
      ticketId: ticket.id,
      action: 'new',
      description: `Ticket created via WhatsApp. Original message: ${messageText.length > 200 ? messageText.substring(0, 197) + '...' : messageText}`,
      performedById: systemUser?.id || null,
      metadata: JSON.stringify({
        source: 'whatsapp',
        contactPhone,
        contactWaId,
        autoGenerated: true,
      }),
    },
  })

  // Format category for display
  const categoryDisplay = extracted.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  // Send ticket confirmation to customer
  const replyText = [
    `✅ *Complaint Registered*`,
    `Ticket: ${ticket.ticketNo}`,
    `Status: New`,
    `Category: ${categoryDisplay}`,
    `Priority: ${extracted.priority.charAt(0).toUpperCase() + extracted.priority.slice(1)}`,
    ``,
    `_Our team will review and assign a technician shortly._`,
  ].join('\n')

  try {
    await sendTextMessage(sessionId, contactWaId, replyText)
  } catch {
    // Send failed — non-blocking
  }

  // Save confirmation as outgoing message
  try {
    await db.whatsAppMessage.create({
      data: {
        conversationId,
        contactId,
        direction: 'outgoing',
        messageType: 'text',
        content: replyText,
        senderName: 'Bot',
      },
    })
  } catch {
    // DB save failed — non-blocking
  }

  // Save bot log entry
  try {
    await db.whatsAppBotLog.create({
      data: {
        sessionId,
        conversationId,
        contactId,
        command: 'AUTO_TICKET',
        inputMessage: messageText,
        responseMessage: replyText,
      },
    })
  } catch {
    // DB save failed — non-blocking
  }

  // Emit realtime event for new ticket
  await emitEvent('maintenance', 'ticket_created', {
    ticketId: ticket.id,
    ticketNo: ticket.ticketNo,
    conversationId,
    contactId,
    source: 'whatsapp',
  })

  // Also emit to the conversation room
  await emitEvent(`conversation:${conversationId}`, 'ticket_created', {
    ticketId: ticket.id,
    ticketNo: ticket.ticketNo,
  })
}

// ─────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────

function getNestedString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return null
    }
  }
  return typeof current === 'string' ? current : null
}

function getNestedObj(obj: Record<string, unknown>, ...keys: string[]): Record<string, unknown> | null {
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return null
    }
  }
  return current && typeof current === 'object' ? (current as Record<string, unknown>) : null
}

function extractTextContent(msg: Record<string, unknown>, messageObj: Record<string, unknown>): string | null {
  // Direct body/conversation field (whatsapp-web.js format)
  if (typeof msg['body'] === 'string') return msg['body']
  if (typeof msg['conversation'] === 'string') return msg['conversation']

  // Nested message object format (OpenWA webhook)
  const text = getNestedString(messageObj, 'conversation')
  if (text) return text

  const extText = getNestedString(messageObj, 'extendedTextMessage', 'text')
  if (extText) return extText

  const imgCaption = getNestedString(messageObj, 'imageMessage', 'caption')
  if (imgCaption) return imgCaption

  const vidCaption = getNestedString(messageObj, 'videoMessage', 'caption')
  if (vidCaption) return vidCaption

  const docCaption = getNestedString(messageObj, 'documentMessage', 'caption')
  if (docCaption) return docCaption

  const dwcCaption = getNestedString(messageObj, 'documentWithCaptionMessage', 'message', 'documentMessage', 'caption')
  if (dwcCaption) return dwcCaption

  // Check for presence (return placeholder text)
  if (messageObj['stickerMessage']) return '🏷️ Sticker'
  if (messageObj['audioMessage']) return '🎤 Audio message'
  if (messageObj['videoMessage']) return '🎥 Video message'
  if (messageObj['imageMessage']) return '📷 Image'
  if (messageObj['documentMessage']) return '📄 Document'
  if (messageObj['locationMessage']) return '📍 Location shared'
  if (messageObj['contactMessage']) return '👤 Contact shared'
  if (messageObj['reactionMessage']) return null // Skip reactions

  return null
}

function extractMessageType(msg: Record<string, unknown>, messageObj: Record<string, unknown>): string {
  // Check for message sub-objects to determine type
  const typeKeys = [
    'conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage',
    'audioMessage', 'documentMessage', 'documentWithCaptionMessage',
    'stickerMessage', 'locationMessage', 'contactMessage', 'reactionMessage',
    'buttonsResponseMessage', 'listResponseMessage', 'templateButtonReplyMessage',
  ]

  for (const typeKey of typeKeys) {
    if (messageObj[typeKey]) {
      if (typeKey === 'reactionMessage') return 'reaction'
      if (typeKey === 'conversation' || typeKey === 'extendedTextMessage') return 'text'
      if (typeKey === 'documentMessage' || typeKey === 'documentWithCaptionMessage') return 'document'
      if (typeKey === 'imageMessage') return 'image'
      if (typeKey === 'videoMessage') return 'video'
      if (typeKey === 'audioMessage') return 'audio'
      if (typeKey === 'stickerMessage') return 'sticker'
      if (typeKey === 'locationMessage') return 'location'
      if (typeKey === 'contactMessage') return 'contact'
      return typeKey.replace('Message', '').toLowerCase()
    }
  }

  // Fallback: check if it looks like a text message
  if (msg['body'] || msg['conversation'] || msg['text']) return 'text'

  return 'text'
}

function extractTimestamp(msg: Record<string, unknown>): Date {
  const ts = msg['messageTimestamp'] || msg['timestamp'] || msg['t']
  if (ts) {
    const num = typeof ts === 'number' ? ts : parseInt(String(ts), 10)
    if (!isNaN(num)) {
      // WhatsApp timestamps are in seconds
      const ms = num > 1e12 ? num : num * 1000
      return new Date(ms)
    }
  }
  return new Date()
}

function extractMediaInfo(
  messageObj: Record<string, unknown>
): { url?: string; mimeType?: string; fileName?: string; fileSize?: number; caption?: string; location?: string | null; vcard?: string | null } {
  const mediaMsgTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage']

  for (const type of mediaMsgTypes) {
    const m = getNestedObj(messageObj, type)
    if (m) {
      return {
        url: getNestedString(m, 'url') || getNestedString(m, 'fileUrl') || undefined,
        mimeType: getNestedString(m, 'mimetype') || undefined,
        fileName: getNestedString(m, 'fileName') || undefined,
        fileSize: m['fileLength'] ? Number(m['fileLength']) : (m['fileSize'] ? Number(m['fileSize']) : undefined),
        caption: getNestedString(m, 'caption') || undefined,
        location: null,
        vcard: null,
      }
    }
  }

  // Document with caption wrapper
  const innerDoc = getNestedObj(messageObj, 'documentWithCaptionMessage', 'message', 'documentMessage')
  if (innerDoc) {
    return {
      url: getNestedString(innerDoc, 'url') || getNestedString(innerDoc, 'fileUrl') || undefined,
      mimeType: getNestedString(innerDoc, 'mimetype') || undefined,
      fileName: getNestedString(innerDoc, 'fileName') || undefined,
      fileSize: innerDoc['fileLength'] ? Number(innerDoc['fileLength']) : undefined,
      caption: getNestedString(innerDoc, 'caption') || undefined,
      location: null,
      vcard: null,
    }
  }

  // Location
  const locMsg = getNestedObj(messageObj, 'locationMessage')
  if (locMsg) {
    const loc = {
      lat: locMsg['degreesLatitude'],
      lng: locMsg['degreesLongitude'],
      address: locMsg['address'] || null,
    }
    return { location: JSON.stringify(loc) }
  }

  // Contact / vCard
  const contactMsg = getNestedObj(messageObj, 'contactMessage')
  if (contactMsg) {
    return { vcard: getNestedString(contactMsg, 'vcard') || undefined }
  }

  return { location: null, vcard: null }
}
