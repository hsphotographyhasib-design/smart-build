import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, issueSession, logLogin } from '@/lib/auth-server'
import { getTenantById, checkSubscriptionActive } from '@/lib/tenant'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await db.appUser.findFirst({
      where: { email, active: true },
      include: {
        tenant: { select: { id: true, slug: true, name: true, status: true } },
        branch: { select: { id: true, name: true, code: true } },
      },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Super Admin check — no tenant required
    if (user.role === 'Super Admin') {
      await issueSession({
        id: user.id, email: user.email, name: user.name,
        role: user.role, roleLevel: user.roleLevel, provider: user.provider,
      })
      await logLogin({ id: user.id, name: user.name })
      return NextResponse.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        redirect: '/platform',
      })
    }

    // Tenant user — verify tenant active
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant assigned. Contact support.' }, { status: 403 })
    }

    const sub = await checkSubscriptionActive(user.tenantId)
    if (!sub.active) {
      return NextResponse.json({ error: `Tenant inactive: ${sub.reason}` }, { status: 403 })
    }

    await issueSession({
      id: user.id, email: user.email, name: user.name,
      role: user.role, roleLevel: user.roleLevel, provider: user.provider,
      tenantId: user.tenantId, tenantSlug: user.tenant?.slug, branchId: user.branchId,
    })
    await logLogin({ id: user.id, name: user.name, tenantId: user.tenantId })

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, tenantName: user.tenant?.name },
      redirect: '/app',
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
