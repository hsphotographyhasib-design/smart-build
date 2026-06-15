import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
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

async function storeBotMessage(conversationId: string, contactId: string, accountId: string, content: string, senderName?: string) {
  return db.whatsAppMessage.create({
    data: {
      conversationId,
      contactId,
      sentByAccountId: accountId,
      direction: 'outgoing',
      messageType: 'text',
      content,
      senderName: senderName || 'Bot',
    },
  })
}

// POST — Process bot commands using OpenWA for sending
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
        complaintLink: true,
      },
    })
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    }

    if (!conversation.account?.sessionId || conversation.account.status !== 'connected') {
      return NextResponse.json({ success: false, error: 'WhatsApp not connected' }, { status: 400 })
    }

    const account = conversation.account
    const contact = conversation.contact
    const sessionId = account.sessionId
    const accountId = account.id
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
            reply = `To check your complaint status, please reply: STATUS`
            break
          case '3':
            reply = `🔧 *Service Request*\n\nPlease describe the service you need:\n- Type of service\n- Preferred date/time\n- Location\n\nWe'll arrange it for you.`
            botAction = 'awaiting_service_request'
            break
          case '4':
            reply = `👋 An agent will be with you shortly. Thank you for your patience.\n\nIn the meantime, feel free to describe your issue.`
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
        const activeLink = conversation.complaintLink
        if (activeLink) {
          reply = `📋 *Complaint Status Update*\n\n🔖 Complaint ID: ${activeLink.complaintId}\n📊 Linked to your conversation\n🔗 Linked at: ${activeLink.linkedAt.toLocaleDateString()}\n\n_Thank you for your patience._`
        } else {
          reply = `🔍 No active complaint found for your number.\n\nTo report a new issue, please describe your problem.`
        }
        break
      }

      case 'create_complaint': {
        const { subject, description } = payload || {}

        if (!subject || !description) {
          reply = `❌ Please provide a subject and description for the complaint.`
          break
        }

        // Generate complaint ID
        const complaintId = `CMP-${Date.now()}`

        // Create complaint link
        await db.complaintWhatsAppLink.create({
          data: {
            complaintId,
            conversationId,
          },
        })

        reply = `✅ *Complaint Registered*\n\n🔖 Complaint ID: ${complaintId}\n📌 ${subject}\n\nOur team will review shortly. Reply "STATUS" for updates.`
        botAction = 'complaint_created'

        await emitEvent(`conversation:${conversationId}`, 'complaint_created', {
          conversationId,
          complaintId,
        })
        await emitEvent('whatsapp', 'complaint_created', {
          conversationId,
          complaintId,
        })
        break
      }

      default:
        reply = `🤖 I didn't understand that command. Please choose an option from the menu or type your message.`
    }

    if (reply && sessionId) {
      // Send via OpenWA
      let sent = false
      try {
        await sendTextMessage(sessionId, contact.waId, reply)
        sent = true
      } catch {
        // Send failed, still store the message
      }

      const msg = await storeBotMessage(conversationId, contact.id, accountId, reply, authUser.name)

      // Update conversation
      await db.whatsAppConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageText: reply,
          lastMessageAt: new Date(),
          lastMessageType: 'text',
          updatedAt: new Date(),
        },
      })

      await emitEvent(`conversation:${conversationId}`, 'bot_response', {
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