import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}