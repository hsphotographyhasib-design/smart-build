import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getUserNotifications } from '@/lib/notifications'

/**
 * GET /api/v1/notifications
 * Fetch current user's notifications from database with pagination and filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true' || searchParams.get('unreadOnly') === 'true'
    const module = searchParams.get('module') || undefined

    const result = await getUserNotifications({
      userId: user.id,
      page,
      limit,
      unreadOnly,
      module,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('[API v1 GET /notifications] Error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
