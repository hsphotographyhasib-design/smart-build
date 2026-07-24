import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { markNotificationRead } from '@/lib/notifications'

/**
 * PATCH /api/v1/notifications/{id}/read
 * Marks notification as read in DB, updates unread count, writes audit log, broadcasts SSE.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(context.params)
    const notificationId = resolvedParams.id

    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'Notification ID is required' }, { status: 400 })
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const browser = request.headers.get('user-agent') || 'Unknown'
    const deviceId = request.headers.get('x-device-id') || null

    const result = await markNotificationRead({
      id: notificationId,
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
    console.error('[API v1 PATCH /notifications/:id/read] Error:', error)
    const status = error?.message?.includes('not found') ? 404 : 500
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status }
    )
  }
}

// Also accept POST for flexibility
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  return PATCH(request, context)
}
