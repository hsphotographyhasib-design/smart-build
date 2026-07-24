import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { markAllNotificationsRead } from '@/lib/notifications'

/**
 * PATCH /api/v1/notifications/read-all
 * Marks all unread notifications for current user as read in DB.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const browser = request.headers.get('user-agent') || 'Unknown'
    const deviceId = request.headers.get('x-device-id') || null

    const result = await markAllNotificationsRead({
      userId: user.id,
      ipAddress,
      browser,
      deviceId,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('[API v1 PATCH /notifications/read-all] Error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return PATCH(request)
}
