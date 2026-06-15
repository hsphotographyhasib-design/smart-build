import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET - বর্তমান ব্যবহারকারীর বিজ্ঞপ্তি সংগ্রহ করা হচ্ছে
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = { userId: user.id }
    if (unreadOnly) {
      where.isRead = false
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        data: true,
        isRead: true,
        createdAt: true,
      },
    })

    const unreadCount = await db.notification.count({
      where: { userId: user.id, isRead: false },
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - বিজ্ঞপ্তি পড়া হয়েছে হিসেবে চিহ্নিত করা হচ্ছে
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, markAll } = body

    if (markAll) {
      // সবগুলো পড়া হয়েছে হিসেবে চিহ্নিত করা হচ্ছে
      await db.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json({
        success: true,
        data: { message: 'All notifications marked as read' },
      })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID or markAll is required' },
        { status: 400 }
      )
    }

    const notification = await db.notification.findFirst({
      where: { id, userId: user.id },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      data: { id, isRead: true },
    })
  } catch (error) {
    console.error('Mark notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - একটি বিজ্ঞপ্তি মুছে ফেলা হচ্ছে
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const notification = await db.notification.findFirst({
      where: { id, userId: user.id },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    await db.notification.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { message: 'Notification deleted' },
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}