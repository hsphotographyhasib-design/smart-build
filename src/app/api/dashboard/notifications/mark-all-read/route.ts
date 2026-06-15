import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// POST - Mark all notifications as read for current user
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await db.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true, data: { message: 'All notifications marked as read' } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}