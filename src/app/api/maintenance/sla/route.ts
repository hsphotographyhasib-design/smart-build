import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const templates = await db.sLATemplate.findMany({
      where,
      orderBy: { responseTimeMinutes: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(templates)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch SLA templates'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, priority, responseTimeMinutes, resolutionTimeMinutes, description } = body

    if (!priority || responseTimeMinutes === undefined || resolutionTimeMinutes === undefined) {
      return NextResponse.json({ success: false, error: 'Priority, response and resolution times are required' }, { status: 400 })
    }

    const validPriorities = ['emergency', 'high', 'medium', 'low', 'preventive']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ success: false, error: `Priority must be one of: ${validPriorities.join(', ')}` }, { status: 400 })
    }

    // Check uniqueness
    const existing = await db.sLATemplate.findUnique({ where: { priority } })
    if (existing) {
      return NextResponse.json({ success: false, error: `SLA template for priority '${priority}' already exists` }, { status: 400 })
    }

    const template = await db.sLATemplate.create({
      data: {
        name: name || `${priority.charAt(0).toUpperCase() + priority.slice(1)} SLA`,
        priority,
        responseTimeMinutes,
        resolutionTimeMinutes,
        description: description || null,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'SLATemplate',
      entityId: template.id,
      newValues: { priority, responseTimeMinutes, resolutionTimeMinutes },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(template)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create SLA template'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}