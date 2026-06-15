import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // বর্তমান সেশন টোকেন সংগ্রহ করা হচ্ছে
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''

    // এই ব্যবহারকারীর সকল সেশন সর্বশেষ প্রথম ক্রমে সংগ্রহ করা হচ্ছে
    const allSessions = await db.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    // বর্তমান সেশন খোঁজা হচ্ছে
    const currentSession = token
      ? allSessions.find((s) => s.token === token)
      : null

    // অন্যান্য সক্রিয়/নিষ্ক্রিয় সেশন এবং সেশন ইতিহাসে পৃথক করা হচ্ছে
    const otherSessions = allSessions.filter(
      (s) => s.id !== currentSession?.id && !s.revokedAt && new Date(s.expiresAt) > new Date()
    )

    const sessionHistory = allSessions.map((s) => {
      const end =
        s.revokedAt ||
        (s.status === 'expired' ? s.expiresAt : null)
      const duration =
        end && end.getTime() > s.createdAt.getTime()
          ? Math.round((end.getTime() - s.createdAt.getTime()) / 1000)
          : null

      return {
        id: s.id,
        device: s.device,
        ipAddress: s.ipAddress,
        browser: s.browser,
        deviceType: s.deviceType,
        operatingSystem: s.operatingSystem,
        country: s.country,
        city: s.city,
        status: s.status,
        lastActivityAt: s.lastActivityAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        revokedAt: s.revokedAt?.toISOString() || null,
        sessionDuration: duration,
        isCurrent: s.id === currentSession?.id,
      }
    })

    const formatSession = (s: (typeof allSessions)[0]) => {
      const end =
        s.revokedAt ||
        (s.status === 'expired' ? s.expiresAt : null)
      const duration =
        end && end.getTime() > s.createdAt.getTime()
          ? Math.round((end.getTime() - s.createdAt.getTime()) / 1000)
          : null

      return {
        id: s.id,
        device: s.device,
        ipAddress: s.ipAddress,
        browser: s.browser,
        deviceType: s.deviceType,
        operatingSystem: s.operatingSystem,
        country: s.country,
        city: s.city,
        status: s.status,
        lastActivityAt: s.lastActivityAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        revokedAt: s.revokedAt?.toISOString() || null,
        sessionDuration: duration,
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currentSession: currentSession
          ? formatSession(currentSession)
          : null,
        otherSessions: otherSessions.map(formatSession),
        sessionHistory,
      },
    })
  } catch (error) {
    console.error('Self sessions error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}