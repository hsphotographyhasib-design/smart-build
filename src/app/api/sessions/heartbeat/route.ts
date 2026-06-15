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

    // Extract token from Authorization header to find the current session
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

    // Build update data
    const updateData: Record<string, unknown> = {
      lastActivityAt: new Date(),
    }

    // If session was idle, reactivate it
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