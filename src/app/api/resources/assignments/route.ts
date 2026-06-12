import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (resourceType && resourceType !== 'all') where.resourceType = resourceType
    if (projectId) where.projectId = projectId
    if (status && status !== 'all') where.status = status

    const assignments = await db.resourceAssignment.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(assignments)) })
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
      resourceId,
      resourceName,
      role,
      shift,
      location,
      startDate,
      endDate,
      dailyCost,
      hourlyCost,
      notes,
      status,
    } = body

    if (!projectId) return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 })
    if (!resourceType) return NextResponse.json({ success: false, error: 'resourceType is required' }, { status: 400 })
    if (!resourceId) return NextResponse.json({ success: false, error: 'resourceId is required' }, { status: 400 })
    if (!resourceName) return NextResponse.json({ success: false, error: 'resourceName is required' }, { status: 400 })
    if (!startDate) return NextResponse.json({ success: false, error: 'startDate is required' }, { status: 400 })

    const result = await db.resourceAssignment.create({
      data: {
        projectId,
        resourceType,
        resourceId,
        resourceName,
        role: role || null,
        shift: shift || 'day',
        location: location || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'active',
        dailyCost: dailyCost || 0,
        hourlyCost: hourlyCost || 0,
        notes: notes || null,
        createdById: user.id,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'ResourceAssignment',
      entityId: result.id,
      newValues: { projectId, resourceType, resourceId, resourceName, status: result.status },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}