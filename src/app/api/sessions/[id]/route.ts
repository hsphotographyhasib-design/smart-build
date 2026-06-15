import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole, createAuditLog } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const session = await db.session.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isActive: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // প্রশাসক ছাড়া অন্যান্য ব্যবহারকারীরা শুধুমাত্র নিজেদের সেশন দেখতে পারবে
    if (!requireRole(user, ['admin']) && session.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // সেশনের সময়কাল হিসাব করা হচ্ছে
    const end =
      session.revokedAt ||
      (session.status === 'expired' ? session.expiresAt : null)
    const duration =
      end && end.getTime() > session.createdAt.getTime()
        ? Math.round((end.getTime() - session.createdAt.getTime()) / 1000)
        : null

    return NextResponse.json({
      success: true,
      data: {
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
        activitySummary: {
          totalDurationSeconds: duration,
          lastSeenAgoMs: Math.round(
            Date.now() - session.lastActivityAt.getTime()
          ),
          isExpired: new Date() > session.expiresAt,
          isRevoked: !!session.revokedAt,
        },
      },
    })
  } catch (error) {
    console.error('Session detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !requireRole(user, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined

    const session = await db.session.findUnique({ where: { id } })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.revokedAt) {
      return NextResponse.json(
        { success: false, error: 'Session already terminated' },
        { status: 400 }
      )
    }

    const now = new Date()

    await db.session.update({
      where: { id },
      data: {
        status: 'forced_logout',
        revokedAt: now,
      },
    })

    // অডিট লগ তৈরি করা হচ্ছে
    await createAuditLog({
      userId: user.id,
      action: 'FORCE_LOGOUT',
      entity: 'Session',
      entityId: id,
      oldValues: { status: session.status },
      newValues: { status: 'forced_logout', revokedAt: now.toISOString() },
      ipAddress: ip,
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Session terminated successfully' },
    })
  } catch (error) {
    console.error('Session force-terminate error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}