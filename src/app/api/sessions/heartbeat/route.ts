import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // বর্তমান সেশন খুঁজে পেতে Authorization হেডার থেকে টোকেন বের করা হচ্ছে
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Session token required' },
        { status: 401 }
      )
    }

    const session = await db.session.findUnique({
      where: { token },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // আপডেট ডেটা তৈরি করা হচ্ছে
    const updateData: Record<string, unknown> = {
      lastActivityAt: new Date(),
    }

    // সেশন নিষ্ক্রিয় থাকলে পুনরায় সক্রিয় করা হচ্ছে
    if (session.status === 'idle') {
      updateData.status = 'active'
    }

    await db.session.update({
      where: { id: session.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Heartbeat recorded' },
    })
  } catch (error) {
    console.error('Session heartbeat error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}