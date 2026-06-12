import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const resourceType = searchParams.get('resourceType')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (projectId) where.projectId = projectId
    if (resourceType && resourceType !== 'all') where.resourceType = resourceType

    const requests = await db.resourceRequest.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(requests)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      projectId,
      resourceType,
      resourceName,
      quantity,
      trade,
      requiredSkills,
      startDate,
      endDate,
      shift,
      priority,
      reason,
      notes,
      status,
    } = body

    if (!projectId) return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 })
    if (!resourceType) return NextResponse.json({ success: false, error: 'resourceType is required' }, { status: 400 })

    // Verify project exists
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 400 })
    }

    // Auto-generate requestNo using format "RR-" + timestamp
    const requestNo = `RR-${Date.now()}`

    const result = await db.resourceRequest.create({
      data: {
        projectId,
        requestNo,
        resourceType,
        resourceName: resourceName || null,
        quantity: quantity || 1,
        trade: trade || null,
        requiredSkills: requiredSkills || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        shift: shift || 'day',
        priority: priority || 'medium',
        reason: reason || null,
        status: status || 'pending',
        requestedById: user.id,
        notes: notes || null,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'ResourceRequest',
      entityId: result.id,
      newValues: { requestNo: result.requestNo, projectId, resourceType, status: result.status },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}