import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { getQRCode, getSessionStatus, createSession as openwaCreateSession, stopSession } from '@/lib/openwa-client'

// GET — Get QR code for the current WhatsApp session (poll OpenWA for QR)
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const account = await db.whatsAppAccount.findFirst()

    // If no account or no session, create a new session
    let sessionId: string = account?.sessionId || ''
    if (!sessionId) {
      const { searchParams } = new URL(request.url)
      const sessionName = searchParams.get('name') || 'smartbuild-wa'

      // Stop any existing sessions with the same name
      try {
        await stopSession(sessionName)
      } catch {
        // Session may not exist
      }

      const result = await openwaCreateSession(sessionName)
      sessionId = result?.id || result?.session || sessionName

      // Update or create account record
      const accountData = {
        name: 'WhatsApp Business',
        sessionId,
        status: 'scanning' as const,
        isActive: true,
        updatedAt: new Date(),
      }

      if (account) {
        await db.whatsAppAccount.update({
          where: { id: account.id },
          data: accountData,
        })
      } else {
        await db.whatsAppAccount.create({
          data: {
            ...accountData,
            phoneNumber: '',
          },
        })
      }
    }

    // Try to get QR code from OpenWA
    let qrCode: string | null = null
    let sessionStatus: string | null = null

    try {
      const statusResult = await getSessionStatus(sessionId)
      sessionStatus = statusResult?.status || null

      const mappedStatus = mapOpenWAStatus(sessionStatus)

      // If already connected, no QR needed
      if (mappedStatus === 'connected') {
        if (account) {
          await db.whatsAppAccount.update({
            where: { id: account.id },
            data: {
              status: 'connected',
              qrCode: null,
              lastSyncAt: new Date(),
              updatedAt: new Date(),
            },
          })
        }
        return NextResponse.json({
          success: true,
          data: {
            qrCode: null,
            status: 'connected',
            sessionId,
            message: 'WhatsApp is already connected',
          },
        })
      }

      // Fetch QR code
      const qrResult = await getQRCode(sessionId)
      qrCode = qrResult?.qr || qrResult?.base64 || null

      // Update DB with QR and status
      if (account) {
        await db.whatsAppAccount.update({
          where: { id: account.id },
          data: {
            status: 'scanning',
            qrCode: qrCode,
            updatedAt: new Date(),
          },
        })
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'OpenWA service unavailable'
      // If OpenWA is not reachable, return stored QR
      if (account?.qrCode) {
        qrCode = account.qrCode
      }
      return NextResponse.json({
        success: false,
        error: `OpenWA service unavailable: ${errMsg}`,
        data: {
          qrCode,
          status: account?.status || 'disconnected',
          sessionId,
        },
      }, { status: 503 })
    }

    return NextResponse.json({
      success: true,
      data: {
        qrCode,
        status: 'scanning',
        sessionId,
        message: 'Scan this QR code with your WhatsApp app',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get QR code'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function mapOpenWAStatus(openwaStatus: string | null | undefined): string {
  if (!openwaStatus) return 'disconnected'
  const s = openwaStatus.toUpperCase()
  if (s === 'CONNECTED' || s === 'WORKING') return 'connected'
  if (s === 'SCANNING' || s === 'SCAN_QR_CODE' || s === 'UNPAIRED') return 'scanning'
  if (s === 'STARTING' || s === 'INITIALIZING') return 'scanning'
  return 'disconnected'
}