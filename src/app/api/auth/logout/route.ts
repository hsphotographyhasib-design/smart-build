import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, revokeSession, createAuditLog } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    await revokeSession(token)

    await createAuditLog({
      userId: user.id,
      action: 'LOGOUT',
      entity: 'Session',
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Logged out successfully' },
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}