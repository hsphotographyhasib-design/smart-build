import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

// POST — Direct message send (templates, notifications to technicians, status updates)
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { to, content, templateName, templateParams, messageType = 'text' } = body

    if (!to) {
      return NextResponse.json({ success: false, error: 'Recipient phone number is required' }, { status: 400 })
    }

    if (!content && !templateName) {
      return NextResponse.json(
        { success: false, error: 'Either content or templateName is required' },
        { status: 400 }
      )
    }

    const account = await db.whatsAppAccount.findFirst({ where: { isEnabled: true } })
    if (!account?.accessToken) {
      return NextResponse.json({ success: false, error: 'WhatsApp not configured or disabled' }, { status: 400 })
    }

    let waPayload: Record<string, unknown> | undefined
    let finalContent = content

    // Template message
    if (templateName) {
      const template = await db.whatsAppMessageTemplate.findFirst({
        where: { name: templateName, isActive: true },
      })
      if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found or inactive' }, { status: 404 })
      }

      // Replace template parameters
      finalContent = template.bodyText
      if (templateParams && Array.isArray(templateParams)) {
        templateParams.forEach((param: string, idx: number) => {
          finalContent = finalContent.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), param)
        })
      }

      if (template.waTemplateId) {
        // Use WhatsApp's native template API
        waPayload = {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: template.waTemplateId,
            language: { code: template.language },
            components: templateParams
              ? [
                  {
                    type: 'body',
                    parameters: templateParams.map((p: string) => ({ type: 'text', text: p })),
                  },
                ]
              : undefined,
          },
        }
      }
    }

    // Fallback to text message
    if (!waPayload) {
      waPayload = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: finalContent || content },
      }
    }

    // Send via WhatsApp API
    let waMessageId: string | null = null
    let sendSuccess = false
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${account.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(waPayload),
        }
      )
      const result = await response.json()
      if (result.messages?.[0]?.id) {
        waMessageId = result.messages[0].id as string
        sendSuccess = true
      } else if (result.error) {
        return NextResponse.json({
          success: false,
          error: 'WhatsApp API error: ' + (result.error.message || 'Unknown error'),
        }, { status: 400 })
      }
    } catch {
      // API call failed
    }

    // Find or create contact
    const contact = await db.whatsAppContact.upsert({
      where: { accountId_phone: { accountId: account.id, phone: to } },
      create: {
        accountId: account.id,
        waId: to,
        phone: to,
        lastMessageAt: new Date(),
      },
      update: {
        lastMessageAt: new Date(),
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
          accountId: account.id,
          contactId: contact.id,
          status: 'open',
          lastMessageDir: 'outgoing',
          lastMessageAt: new Date(),
          isBotConversation: true,
        },
      })
    }

    // Store message
    const message = await db.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        waMessageId,
        direction: 'outgoing',
        messageType: templateName ? 'template' : messageType,
        content: finalContent || content,
        templateName: templateName || null,
        templateParams: templateParams ? JSON.stringify(templateParams) : null,
        senderType: 'agent',
        sentById: authUser.id,
        isDelivered: sendSuccess,
      },
    })

    // Update conversation
    await db.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageText: finalContent || content,
        lastMessageAt: new Date(),
        lastMessageDir: 'outgoing',
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