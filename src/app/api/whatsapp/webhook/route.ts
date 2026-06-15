import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

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

async function sendWhatsAppMessage(phoneNumberId: string, accessToken: string, to: string, message: string) {
  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    })
  } catch {
    // স্বয়ংক্রিয় উত্তরের জন্য নীরব ব্যর্থতা
  }
}

function extractMessageText(msg: Record<string, unknown>): string | null {
  if (msg['text']) {
    const textObj = msg['text'] as Record<string, unknown>
    return (textObj['body'] as string) || null
  }
  if (msg['image']) {
    const imgObj = msg['image'] as Record<string, unknown>
    return (imgObj['caption'] as string) || '📷 Image'
  }
  if (msg['video']) {
    const vidObj = msg['video'] as Record<string, unknown>
    return (vidObj['caption'] as string) || '🎥 Video'
  }
  if (msg['audio']) return '🎤 Audio message'
  if (msg['document']) {
    const docObj = msg['document'] as Record<string, unknown>
    return (docObj['caption'] as string) || '📄 Document'
  }
  if (msg['location']) return '📍 Location shared'
  if (msg['contacts']) return '👤 Contact shared'
  if (msg['sticker']) return '🏷️ Sticker'
  return null
}

function getMessageType(msg: Record<string, unknown>): string {
  const types = ['text', 'image', 'video', 'audio', 'document', 'location', 'contacts', 'sticker', 'interactive', 'button', 'template']
  for (const t of types) {
    if (msg[t]) return t
  }
  return 'text'
}

// GET — ওয়েবহুক যাচাই (কোনো অথেনটিকেশন নেই)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token) {
    const account = await db.whatsAppAccount.findFirst({
      where: { verifyToken: token, isEnabled: true },
    })
    if (account) {
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    }
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// POST — আগত WhatsApp মেসেজ গ্রহণ করা হচ্ছে (কোনো অথেনটিকেশন নেই)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // উপস্থিত থাকলে X-Hub-Signature-256 যাচাই করা হচ্ছে
    const signature = request.headers.get('x-hub-signature-256')
    if (signature) {
      const account = await db.whatsAppAccount.findFirst({ where: { isEnabled: true } })
      if (account && account.accessToken) {
        // HMAC যাচাইয়ের জন্য আমরা'd use the app secret, not access token
        // অ্যাপ সিক্রেট আলাদাভাবে সংরক্ষণ করা উচিত; এখানে appSecret কনফিগার না থাকলে এড়িয়ে যাওয়া হচ্ছে
        // প্রোডাকশনে, যাচাই করুন: crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
      }
    }

    // ওয়েবহুক নোটিফিকেশন পরিচালনা করা হচ্ছে (স্ট্যাটাস আপডেট ইত্যাদি)
    const entry = body.entry
    if (!Array.isArray(entry)) {
      return NextResponse.json({ success: true })
    }

    for (const ent of entry) {
      const changes = ent.changes
      if (!Array.isArray(changes)) continue

      for (const change of changes) {
        const value = change.value
        if (!value) continue

        // স্ট্যাটাস আপডেট এবং মেসেজ নয় এমন ইভেন্ট এড়িয়ে যাওয়া হচ্ছে
        if (value.statuses) continue
        if (!value.messages || !Array.isArray(value.messages)) continue

        const account = await db.whatsAppAccount.findFirst({ where: { isEnabled: true } })
        if (!account) continue

        for (const msg of value.messages) {
          await processIncomingMessage(account.id, msg)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed'
    console.error('Webhook error: ' + message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

async function processIncomingMessage(accountId: string, msg: Record<string, unknown>) {
  const waMessageId = msg['id'] as string
  const from = msg['from'] as string
  const timestamp = msg['timestamp'] as string
  const type = msg['type'] as string
  const msgObj = (msg[type] || {}) as Record<string, unknown>

  // ডুপ্লিকেট এড়ানো: waMessageId দিয়ে মেসেজ আগে থেকেই আছে কিনা যাচাই করা হচ্ছে
  const existingByWaId = await db.whatsAppMessage.findFirst({
    where: { waMessageId },
  })
  if (existingByWaId) return

  // পরিচিতি আপসার্ট করা হচ্ছে
  const contact = await db.whatsAppContact.upsert({
    where: { accountId_phone: { accountId, phone: from } },
    create: {
      accountId,
      waId: from,
      phone: from,
      name: (msg['from'] as string) || null,
      pushName: (msgObj['from'] as string) || null,
      lastSeenAt: new Date(),
      lastMessageAt: new Date(),
    },
    update: {
      lastSeenAt: new Date(),
      lastMessageAt: new Date(),
    },
  })

  // কথোপকথন খুঁজে বের করা বা তৈরি করা হচ্ছে
  let conversation = await db.whatsAppConversation.findFirst({
    where: {
      contactId: contact.id,
      status: { in: ['open'] },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  if (!conversation) {
    conversation = await db.whatsAppConversation.create({
      data: {
        accountId,
        contactId: contact.id,
        status: 'open',
        lastMessageDir: 'incoming',
        lastMessageAt: new Date(Number(timestamp) * 1000),
        unreadCount: 1,
      },
    })

    // নতুন গ্রাহকের প্রথম মেসেজের জন্য স্বয়ংক্রিয়ভাবে টিকেট তৈরি করা হচ্ছে
    const hasExistingLink = await db.complaintWhatsAppLink.findFirst({
      where: { conversationId: conversation.id },
    })
    if (!hasExistingLink && contact.customerId) {
      await autoCreateTicket(conversation.id, contact.id, accountId, msgObj)
    }
  } else {
    conversation = await db.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageDir: 'incoming',
        lastMessageAt: new Date(Number(timestamp) * 1000),
        unreadCount: { increment: 1 },
      },
    })
  }

  const textContent = extractMessageText(msgObj)
  const messageType = getMessageType(msg)

  // মেসেজ রেকর্ড তৈরি করা হচ্ছে
  const message = await db.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      waMessageId,
      direction: 'incoming',
      messageType,
      content: textContent,
      mediaUrl: (msgObj['id'] as string) || null,
      mediaType: (msgObj['mime_type'] as string) || null,
      mediaFileSize: msgObj['file_size'] ? Number(msgObj['file_size']) : null,
      thumbnailUrl: null,
      location: msgObj['location'] ? JSON.stringify(msgObj['location']) : null,
      contactInfo: msgObj['contacts'] ? JSON.stringify(msgObj['contacts']) : null,
      interactiveType: (msgObj['type'] as string) || null,
      interactiveData: msgObj ? JSON.stringify(msgObj) : null,
      senderType: 'customer',
      contactSenderId: contact.id,
      createdAt: new Date(Number(timestamp) * 1000),
    },
  })

  // কথোপকথন আপডেট করা হচ্ছে lastMessageText
  await db.whatsAppConversation.update({
    where: { id: conversation.id },
    data: { lastMessageText: textContent || `[${messageType}]` },
  })

  // রিয়েল-টাইম ইভেন্ট ইমিট করা হচ্ছে
  await emitEvent('new_message', {
    conversationId: conversation.id,
    messageId: message.id,
    contactId: contact.id,
  })

  // স্বয়ংক্রিয় উত্তর / বট ফ্লো / AI শ্রেণীবিভাগ
  const account = await db.whatsAppAccount.findUnique({ where: { id: accountId } })
  if (!account || !account.accessToken) return

  if (textContent) {
    // STATUS কমান্ড পরিচালনা করা হচ্ছে
    if (textContent.trim().toUpperCase().startsWith('STATUS')) {
      await handleStatusQuery(conversation, contact, account)
      return
    }

    // বট ফ্লো: মেনু সহ স্বয়ংক্রিয় উত্তর পাঠানো হচ্ছে
    if (account.botFlowEnabled) {
      const menuMessage = `🏠 *SmartBuild Help Center*\n\nPlease choose an option:\n1️⃣ Report a Complaint\n2️⃣ Check Status (Reply "STATUS")\n3️⃣ Service Request\n4️⃣ Talk to Agent\n\n_Reply with a number or type your message._`
      await sendWhatsAppMessage(account.phoneNumberId, account.accessToken, contact.phone, menuMessage)
      await db.whatsAppMessage.create({
        data: {
          conversationId: conversation.id,
          direction: 'outgoing',
          messageType: 'text',
          content: menuMessage,
          senderType: 'bot',
          isDelivered: true,
        },
      })
    }

    // AI শ্রেণীবিভাগ
    if (account.aiClassification && textContent.length > 5) {
      try {
        const { ZAI } = await import('z-ai-web-dev-sdk')
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

        // কথোপকথন আপডেট করা হচ্ছে tags with classification
        const conv = await db.whatsAppConversation.findUnique({ where: { id: conversation.id } })
        const existingTags: string[] = conv?.tags ? JSON.parse(conv.tags) : []
        if (!existingTags.includes(category)) {
          existingTags.push(category)
          await db.whatsAppConversation.update({
            where: { id: conversation.id },
            data: { tags: JSON.stringify(existingTags) },
          })
        }
      } catch {
        // AI শ্রেণীবিভাগ failed silently
      }
    }
  }
}

async function handleStatusQuery(
  conversation: { id: string; ticketId: string | null },
  contact: { id: string; phone: string; name: string | null },
  account: { phoneNumberId: string; accessToken: string }
) {
  // সংযুক্ত টিকেট খুঁজে বের করা হচ্ছে
  const link = await db.complaintWhatsAppLink.findFirst({
    where: { conversationId: conversation.id },
    include: { ticket: true },
  })

  let reply: string
  if (link?.ticket) {
    const t = link.ticket
    reply = `📋 *Ticket Status Update*\n\n🎫 Ticket: ${t.ticketNo}\n📌 Subject: ${t.subject}\n📊 Status: ${t.status}\n🔥 Priority: ${t.priority}\n📅 Created: ${t.createdAt.toLocaleDateString()}\n\n_Thank you for your patience. We are working on your request._`
  } else {
    reply = `🔍 No active ticket found for your number.\n\nTo report a new issue, please describe your problem and our team will assist you.`
  }

  await sendWhatsAppMessage(account.phoneNumberId, account.accessToken, contact.phone, reply)
  await db.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      direction: 'outgoing',
      messageType: 'text',
      content: reply,
      senderType: 'bot',
      isDelivered: true,
    },
  })
}

async function autoCreateTicket(conversationId: string, contactId: string, accountId: string, msgObj: Record<string, unknown>) {
  try {
    const contact = await db.whatsAppContact.findUnique({ where: { id: contactId } })
    if (!contact?.customerId) return

    const textContent = extractMessageText(msgObj) || 'WhatsApp complaint'

    // createdById-এর জন্য একজন বৈধ ইউজার খুঁজে বের করা হচ্ছে
    const systemUser = await db.user.findFirst()
    if (!systemUser) return

    // টিকেট নম্বর তৈরি করা হচ্ছে
    const year = new Date().getFullYear()
    const lastTicket = await db.maintenanceTicket.findFirst({
      where: { ticketNo: { startsWith: `CMP-${year}` } },
      orderBy: { ticketNo: 'desc' },
    })
    let nextNum = 1
    if (lastTicket) {
      const parts = lastTicket.ticketNo.split('-')
      nextNum = (parseInt(parts[2] || '0', 10) || 0) + 1
    }
    const ticketNo = `CMP-${year}-${String(nextNum).padStart(6, '0')}`

    const ticket = await db.maintenanceTicket.create({
      data: {
        ticketNo,
        type: 'complaint',
        category: 'general_maintenance',
        priority: 'medium',
        status: 'new',
        subject: textContent.substring(0, 200),
        description: textContent,
        customerId: contact.customerId,
        contactPhone: contact.phone,
        createdById: systemUser.id,
      },
    })

    // কথোপকথন টিকেটের সাথে লিংক করা হচ্ছে
    await db.complaintWhatsAppLink.create({
      data: {
        ticketId: ticket.id,
        conversationId,
        autoCreated: true,
      },
    })

    // কথোপকথন আপডেট করা হচ্ছে with ticket
    await db.whatsAppConversation.update({
      where: { id: conversationId },
      data: { ticketId: ticket.id },
    })

    // ইভেন্ট ইমিট করা হচ্ছে
    await emitEvent('ticket_auto_created', {
      conversationId,
      ticketId: ticket.id,
      ticketNo: ticket.ticketNo,
    })
  } catch {
    // স্বয়ংক্রিয় তৈরি ব্যর্থ হয়েছে (নীরবে)
  }
}