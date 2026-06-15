import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

// GET — Get WhatsApp account settings (admin only)
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const account = await db.whatsAppAccount.findFirst()
    if (!account) {
      return NextResponse.json({ success: true, data: null })
    }

    // Don't expose the full access token in GET response
    const { accessToken: _, ...safeData } = account
    const maskedToken = account.accessToken
      ? account.accessToken.substring(0, 8) + '...' + account.accessToken.slice(-4)
      : null

    return NextResponse.json({
      success: true,
      data: { ...safeData, accessTokenMasked: maskedToken },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get account'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// POST — Create/update WhatsApp account config
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { phoneNumberId, accessToken, verifyToken, phoneNumber, businessName, webhookUrl } = body

    if (!phoneNumberId || !verifyToken) {
      return NextResponse.json(
        { success: false, error: 'phoneNumberId and verifyToken are required' },
        { status: 400 }
      )
    }

    // Check if account exists
    const existing = await db.whatsAppAccount.findFirst()

    let account
    if (existing) {
      account = await db.whatsAppAccount.update({
        where: { id: existing.id },
        data: {
          phoneNumberId,
          accessToken: accessToken || undefined,
          verifyToken,
          phoneNumber: phoneNumber || undefined,
          businessName: businessName || 'SmartBuild',
          webhookUrl: webhookUrl || undefined,
        },
      })
    } else {
      account = await db.whatsAppAccount.create({
        data: {
          phoneNumberId,
          accessToken: accessToken || null,
          verifyToken,
          phoneNumber: phoneNumber || null,
          businessName: businessName || 'SmartBuild',
          webhookUrl: webhookUrl || null,
        },
      })
    }

    await createAuditLog({
      userId: authUser.id,
      action: existing ? 'update' : 'create',
      entity: 'WhatsAppAccount',
      entityId: account.id,
    })

    const { accessToken: _, ...safeData } = account
    return NextResponse.json({ success: true, data: safeData })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save account'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// PUT — Update account settings
export async function PUT(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { isEnabled, autoReplyEnabled, botFlowEnabled, aiClassification, maxDailyMessages, businessName } = body

    const existing = await db.whatsAppAccount.findFirst()
    if (!existing) {
      return NextResponse.json({ success: false, error: 'WhatsApp account not configured' }, { status: 404 })
    }

    const account = await db.whatsAppAccount.update({
      where: { id: existing.id },
      data: {
        ...(isEnabled !== undefined && { isEnabled }),
        ...(autoReplyEnabled !== undefined && { autoReplyEnabled }),
        ...(botFlowEnabled !== undefined && { botFlowEnabled }),
        ...(aiClassification !== undefined && { aiClassification }),
        ...(maxDailyMessages !== undefined && { maxDailyMessages }),
        ...(businessName !== undefined && { businessName }),
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'update_settings',
      entity: 'WhatsAppAccount',
      entityId: account.id,
      newValues: { isEnabled, autoReplyEnabled, botFlowEnabled, aiClassification },
    })

    const { accessToken: _, ...safeData } = account
    return NextResponse.json({ success: true, data: safeData })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update settings'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}