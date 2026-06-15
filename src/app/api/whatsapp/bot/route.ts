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
    return true
  } catch {
    return false
  }
}

async function storeBotMessage(conversationId: string, content: string, sentById?: string) {
  return db.whatsAppMessage.create({
    data: {
      conversationId,
      direction: 'outgoing',
      messageType: 'text',
      content,
      senderType: 'bot',
      sentById: sentById || null,
      isDelivered: true,
    },
  })
}

// POST — বট কমান্ড প্রক্রিয়া করা হচ্ছে
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { conversationId, command, payload } = body

    if (!conversationId || !command) {
      return NextResponse.json(
        { success: false, error: 'conversationId and command are required' },
        { status: 400 }
      )
    }

    const conversation = await db.whatsAppConversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        account: true,
        ticket: true,
        complaintLinks: {
          include: { ticket: true },
        },
      },
    })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    if (!conversation.account?.accessToken) {
      return NextResponse.json({ success: false, error: 'WhatsApp not configured' }, { status: 400 })
    }

    const { account, contact } = conversation
    let reply: string | null = null
    let botAction: string | null = null

    switch (command) {
      case 'menu': {
        reply = `🏠 *SmartBuild Help Center*\n\nPlease choose an option:\n1️⃣ Report a Complaint\n2️⃣ Check Status (Reply "STATUS")\n3️⃣ Service Request\n4️⃣ Talk to Agent\n5️⃣ AMC Information\n\n_Reply with a number or type your message._`
        break
      }

      case 'menu_selection': {
        const selection = payload?.selection || payload
        switch (selection) {
          case '1':
            reply = `📝 *Report a Complaint*\n\nPlease describe your issue in detail. Include:\n- Location/Building/Floor\n- Type of problem (AC, Electrical, Plumbing, etc.)\n- Urgency level\n\nOur team will create a ticket immediately.`
            botAction = 'awaiting_complaint'
            break
          case '2':
            // স্ট্যাটাস কুয়েরি — ওয়েবহুক দ্বারা পরিচালিত
            reply = `To check your ticket status, please reply: STATUS`
            break
          case '3':
            reply = `🔧 *Service Request*\n\nPlease describe the service you need:\n- Type of service\n- Preferred date/time\n- Location\n\nWe'll arrange it for you.`
            botAction = 'awaiting_service_request'
            break
          case '4':
            reply = `👋 An agent will be with you shortly. Thank you for your patience.\n\nIn the meantime, feel free to describe your issue.`
            // এজেন্ট নিতে পারে তাই বট কথোপকথন হিসেবে চিহ্নিত করা হচ্ছে না
            await db.whatsAppConversation.update({
              where: { id: conversationId },
              data: { isBotConversation: false },
            })
            break
          case '5':
            reply = `📋 *AMC (Annual Maintenance Contract)*\n\nOur AMC packages include:\n- 🔧 Preventive maintenance visits\n- ⚡ Priority response\n- 📞 24/7 support\n\nFor AMC details, please contact our sales team or reply with your interest.`
            break
          default:
            reply = `❌ Invalid selection. Please choose a number from 1 to 5.`
        }
        break
      }

      case 'status_query': {
        const activeTicket = conversation.ticket || conversation.complaintLinks?.[0]?.ticket
        if (activeTicket) {
          reply = `📋 *Ticket Status Update*\n\n🎫 Ticket: ${activeTicket.ticketNo}\n📌 Subject: ${activeTicket.subject}\n📊 Status: ${activeTicket.status.replace(/_/g, ' ').toUpperCase()}\n🔥 Priority: ${activeTicket.priority}\n📅 Created: ${activeTicket.createdAt.toLocaleDateString()}\n\n_Thank you for your patience._`
        } else {
          reply = `🔍 No active ticket found for your number.\n\nTo report a new issue, please describe your problem.`
        }
        break
      }

      case 'create_complaint': {
        const { subject, description, category, priority } = payload || {}

        if (!subject || !description) {
          reply = `❌ Please provide a subject and description for the complaint.`
          break
        }

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

        // createdById-এর জন্য একজন ইউজার খুঁজে বের করা হচ্ছে
        let systemUser = await db.user.findFirst()
        if (!systemUser) {
          reply = `❌ System error. Please try again later.`
          break
        }

        const ticket = await db.maintenanceTicket.create({
          data: {
            ticketNo,
            type: 'complaint',
            category: category || 'general_maintenance',
            priority: priority || 'medium',
            status: 'new',
            subject,
            description,
            customerId: contact.customerId,
            contactPhone: contact.phone,
            contactPerson: contact.name || undefined,
            createdById: systemUser.id,
          },
        })

        // লিংক তৈরি করা হচ্ছে
        await db.complaintWhatsAppLink.create({
          data: {
            ticketId: ticket.id,
            conversationId,
            autoCreated: true,
          },
        })

        await db.whatsAppConversation.update({
          where: { id: conversationId },
          data: { ticketId: ticket.id },
        })

        reply = `✅ *Complaint Registered*\n\n🎫 Ticket: ${ticketNo}\n📌 ${subject}\n📊 Priority: ${(priority || 'medium').toUpperCase()}\n\nOur team will review shortly. Reply "STATUS" for updates.`
        botAction = 'ticket_created'

        await emitEvent('ticket_auto_created', {
          conversationId,
          ticketId: ticket.id,
          ticketNo,
        })
        break
      }

      default:
        reply = `🤖 I didn't understand that command. Please choose an option from the menu or type your message.`
    }

    if (reply) {
      await sendWhatsAppMessage(account.phoneNumberId, account.accessToken, contact.phone, reply)
      const msg = await storeBotMessage(conversationId, reply, authUser.id)

      // কথোপকথন আপডেট করা হচ্ছে
      await db.whatsAppConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageText: reply,
          lastMessageAt: new Date(),
          lastMessageDir: 'outgoing',
        },
      })

      await emitEvent('bot_response', {
        conversationId,
        messageId: msg.id,
        command,
        botAction,
      })
    }

    return NextResponse.json({
      success: true,
      data: { reply, botAction, command },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bot processing failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}