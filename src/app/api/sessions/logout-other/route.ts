import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

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
    const { sessionIds, allOthers } = body as {
      sessionIds?: string[]
      allOthers?: boolean
    }

    if (!allOthers && (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Provide sessionIds array or set allOthers to true' },
        { status: 400 }
      )
    }

    // বর্তমান সেশন টোকেন সংগ্রহ করা হচ্ছে
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined

    const now = new Date()

    if (allOthers) {
      // বর্তমান সেশন ব্যতীত এই ব্যবহারকারীর সকল সেশন বাতিল করা হচ্ছে
      const result = await db.session.updateMany({
        where: {
          userId: user.id,
          token: { not: token },
          revokedAt: null,
        },
        data: {
          status: 'forced_logout',
          revokedAt: now,
        },
      })

      await createAuditLog({
        userId: user.id,
        action: 'LOGOUT_OTHER_DEVICES',
        entity: 'Session',
        newValues: { revokedCount: result.count },
        ipAddress: ip,
      })

      return NextResponse.json({
        success: true,
        data: { message: `Revoked ${result.count} other session(s)` },
      })
    }

    // নির্দিষ্ট সেশন ID বাতিল করা হচ্ছে (এই ব্যবহারকারীর হতে হবে)
    const result = await db.session.updateMany({
      where: {
        id: { in: sessionIds },
        userId: user.id,
        token: { not: token }, // নিজের বর্তমান সেশন বাতিল করতে দেওয়া হবে না
        revokedAt: null,
      },
      data: {
        status: 'forced_logout',
        revokedAt: now,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'LOGOUT_OTHER_DEVICES',
      entity: 'Session',
      entityId: sessionIds?.join(','),
      newValues: { revokedCount: result.count, sessionIds },
      ipAddress: ip,
    })

    return NextResponse.json({
      success: true,
      data: { message: `Revoked ${result.count} session(s)` },
    })
  } catch (error) {
    console.error('Logout other devices error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}