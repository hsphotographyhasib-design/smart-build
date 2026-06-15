import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !requireRole(user, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const now = new Date()

    // Count active sessions (not revoked, not expired)
    const [activeCount, idleCount] = await Promise.all([
      db.session.count({
        where: {
          status: 'active',
          revokedAt: null,
          expiresAt: { gt: now },
        },
      }),
      db.session.count({
        where: {
          status: 'idle',
          revokedAt: null,
          expiresAt: { gt: now },
        },
      }),
    ])

    // Get last 10 login sessions with user info
    const recentLogins = await db.session.findMany({
      where: {
        revokedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const formattedRecentLogins = recentLogins.map((s) => ({
      id: s.id,
      userId: s.userId,
      browser: s.browser,
      deviceType: s.deviceType,
      operatingSystem: s.operatingSystem,
      country: s.country,
      city: s.city,
      ipAddress: s.ipAddress,
      status: s.status,
      lastActivityAt: s.lastActivityAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      user: s.user,
    }))

    return NextResponse.json({
      success: true,
      data: {
        activeCount,
        idleCount,
        totalOnline: activeCount + idleCount,
        recentLogins: formattedRecentLogins,
      },
    })
  } catch (error) {
    console.error('Active sessions error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}