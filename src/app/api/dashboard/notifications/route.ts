import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/notifications'

// GET - User notifications
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await getUserNotifications({
      userId: user.id,
      limit,
      unreadOnly,
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
      },
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Mark as read (single or all)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, markAll } = body

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const browser = request.headers.get('user-agent') || 'Unknown'
    const deviceId = request.headers.get('x-device-id') || null

    if (markAll) {
      const res = await markAllNotificationsRead({
        userId: user.id,
        ipAddress,
        browser,
        deviceId,
      })
      return NextResponse.json({
        success: true,
        data: { message: 'All notifications marked as read', ...res },
      })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID or markAll is required' },
        { status: 400 }
      )
    }

    const res = await markNotificationRead({
      id,
      userId: user.id,
      ipAddress,
      browser,
      deviceId,
    })

    return NextResponse.json({
      success: true,
      data: { id, isRead: true, unreadCount: res.unreadCount },
    })
  } catch (error: any) {
    console.error('Mark notification error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete notification
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notification ID is required' }, { status: 400 })
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const browser = request.headers.get('user-agent') || 'Unknown'

    const res = await deleteNotification({
      id,
      userId: user.id,
      ipAddress,
      browser,
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Notification deleted', ...res },
    })
  } catch (error: any) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}