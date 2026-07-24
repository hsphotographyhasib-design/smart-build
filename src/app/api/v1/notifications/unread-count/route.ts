import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getUnreadCount } from '@/lib/notifications'

/**
 * GET /api/v1/notifications/unread-count
 * Returns exact DB unread count (<100ms response time).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const unreadCount = await getUnreadCount(user.id)

    return NextResponse.json({
      success: true,
      data: { unreadCount },
    })
  } catch (error: any) {
    console.error('[API v1 GET /notifications/unread-count] Error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
