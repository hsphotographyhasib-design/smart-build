import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole } from '@/lib/auth'

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
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
    const search = searchParams.get('search')?.trim()

    // Non-admin users can only view their own sessions unless userId matches
    if (!requireRole(user, ['admin']) && userId && userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // If userId not provided for non-admin, default to own sessions
    const effectiveUserId = !requireRole(user, ['admin']) && !userId ? user.id : userId

    // Build where clause
    const where: Record<string, unknown> = {}
    if (effectiveUserId) {
      where.userId = effectiveUserId
    }
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { ipAddress: { contains: search } },
        { browser: { contains: search } },
        { deviceType: { contains: search } },
        { operatingSystem: { contains: search } },
      ]
    }

    const [sessions, total] = await Promise.all([
      db.session.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.session.count({ where }),
    ])

    // Calculate session duration for completed/expired sessions
    const sessionsWithDuration = sessions.map((session) => {
      const end =
        session.revokedAt ||
        (session.status === 'expired' ? session.expiresAt : null)
      const duration =
        end && end.getTime() > session.createdAt.getTime()
          ? Math.round((end.getTime() - session.createdAt.getTime()) / 1000)
          : null

      return {
        id: session.id,
        userId: session.userId,
        device: session.device,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        browser: session.browser,
        deviceType: session.deviceType,
        operatingSystem: session.operatingSystem,
        country: session.country,
        city: session.city,
        status: session.status,
        lastActivityAt: session.lastActivityAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
        revokedAt: session.revokedAt?.toISOString() || null,
        sessionDuration: duration,
        user: session.user,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessionsWithDuration,
        total,
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Sessions list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}