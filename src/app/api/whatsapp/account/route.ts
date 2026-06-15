import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import {
  createSession as openwaCreateSession,
  getSessionStatus,
  getQRCode,
  stopSession,
  deleteSession as openwaDeleteSession,
} from '@/lib/openwa-client'

// GET — WhatsApp account info with OpenWA session status
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const account = await db.whatsAppAccount.findFirst()
    if (!account) {
      return NextResponse.json({ success: true, data: null })
    }

    // Poll OpenWA for live session status
    let liveStatus: string | null = null
    let liveQr: string | null = null
    if (account.sessionId) {
      try {
        const statusResult = await getSessionStatus(account.sessionId)
        liveStatus = statusResult?.status || null

        // If scanning, fetch the latest QR code
        if (liveStatus === 'SCANNING' || liveStatus === 'SCAN_QR_CODE') {
          try {
            const qrResult = await getQRCode(account.sessionId)
            liveQr = qrResult?.qr || qrResult?.base64 || null
            if (liveQr) {
              await db.whatsAppAccount.update({
                where: { id: account.id },
                data: { qrCode: liveQr, status: 'scanning', updatedAt: new Date() },
              })
            }
          } catch {
            // QR fetch failed, use stored QR
          }
        }

        // Sync status to DB
        const mappedStatus = mapOpenWAStatus(liveStatus)
        if (mappedStatus !== account.status) {
          await db.whatsAppAccount.update({
            where: { id: account.id },
            data: { status: mappedStatus, updatedAt: new Date(), lastSyncAt: new Date() },
          })
        }
      } catch {
        // OpenWA service not available, return stored status
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...account,
        liveStatus,
        liveQr: liveQr || account.qrCode,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get account'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// POST — Create a new OpenWA session and return QR code
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { phoneNumber, name, businessName } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Session name is required' },
        { status: 400 }
      )
    }

    // Check for existing account
    const existing = await db.whatsAppAccount.findFirst()

    // If existing session is connected, stop it first
    if (existing?.sessionId) {
      try {
        await stopSession(existing.sessionId)
      } catch {
        // Session may already be stopped
      }
    }

    // Create OpenWA session
    const sessionResult = await openwaCreateSession(name)
    const sessionId = sessionResult?.id || sessionResult?.session || name

    // Poll for QR code
    let qrCode: string | null = null
    let attempts = 0
    while (attempts < 10 && !qrCode) {
      try {
        const qrResult = await getQRCode(sessionId)
        qrCode = qrResult?.qr || qrResult?.base64 || null
      } catch {
        // QR not ready yet
      }
      if (!qrCode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      attempts++
    }

    const accountData = {
      phoneNumber: phoneNumber || '',
      name,
      sessionId,
      status: qrCode ? 'scanning' : 'disconnected',
      qrCode,
      isActive: true,
      businessName: businessName || 'SmartBuild',
      updatedAt: new Date(),
    }

    let account
    if (existing) {
      account = await db.whatsAppAccount.update({
        where: { id: existing.id },
        data: accountData,
      })
    } else {
      account = await db.whatsAppAccount.create({ data: accountData })
    }

    await createAuditLog({
      userId: authUser.id,
      action: existing ? 'reconnect' : 'create_session',
      entity: 'WhatsAppAccount',
      entityId: account.id,
    })

    return NextResponse.json({ success: true, data: account })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create session'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// PUT — Update account settings
export async function PUT(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, maxDailyMessages, isActive, businessName } = body

    const existing = await db.whatsAppAccount.findFirst()
    if (!existing) {
      return NextResponse.json({ success: false, error: 'WhatsApp account not configured' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (name !== undefined) updateData.name = name
    if (maxDailyMessages !== undefined) updateData.maxDailyMessages = maxDailyMessages
    if (isActive !== undefined) updateData.isActive = isActive
    if (businessName !== undefined) updateData.businessName = businessName

    const account = await db.whatsAppAccount.update({
      where: { id: existing.id },
      data: updateData,
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'update_settings',
      entity: 'WhatsAppAccount',
      entityId: account.id,
      newValues: updateData,
    })

    return NextResponse.json({ success: true, data: account })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update settings'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// DELETE — Disconnect and delete OpenWA session
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const account = await db.whatsAppAccount.findFirst()
    if (!account) {
      return NextResponse.json({ success: false, error: 'WhatsApp account not configured' }, { status: 404 })
    }

    // Stop and delete OpenWA session
    if (account.sessionId) {
      try {
        await stopSession(account.sessionId)
      } catch {
        // Session may already be stopped
      }
      try {
        await openwaDeleteSession(account.sessionId)
      } catch {
        // Session deletion may fail, continue with DB cleanup
      }
    }

    // Reset account in DB but keep the record
    const updated = await db.whatsAppAccount.update({
      where: { id: account.id },
      data: {
        sessionId: null,
        status: 'disconnected',
        qrCode: null,
        pushName: null,
        lastSyncAt: null,
        updatedAt: new Date(),
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'disconnect',
      entity: 'WhatsAppAccount',
      entityId: account.id,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to disconnect account'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// Map OpenWA session status to our internal status
function mapOpenWAStatus(openwaStatus: string | null | undefined): string {
  if (!openwaStatus) return 'disconnected'
  const s = openwaStatus.toUpperCase()
  if (s === 'CONNECTED' || s === 'WORKING') return 'connected'
  if (s === 'SCANNING' || s === 'SCAN_QR_CODE' || s === 'UNPAIRED') return 'scanning'
  if (s === 'STARTING' || s === 'INITIALIZING') return 'scanning'
  return 'disconnected'
}