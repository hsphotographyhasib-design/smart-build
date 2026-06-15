import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// POST - বর্তমান ব্যবহারকারীর সকল বিজ্ঞপ্তি পড়া হয়েছে হিসেবে চিহ্নিত করা হচ্ছে
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