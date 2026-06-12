import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const assignment = await db.resourceAssignment.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(assignment)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.resourceAssignment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 })
    }

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
      status,
      dailyCost,
      hourlyCost,
      notes,
    } = body

    const result = await db.resourceAssignment.update({
      where: { id },
      data: {
        ...(projectId && { projectId }),
        ...(resourceType && { resourceType }),
        ...(resourceId && { resourceId }),
        ...(resourceName && { resourceName }),
        ...(role !== undefined && { role }),
        ...(shift && { shift }),
        ...(location !== undefined && { location }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status && { status }),
        ...(dailyCost !== undefined && { dailyCost }),
        ...(hourlyCost !== undefined && { hourlyCost }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'ResourceAssignment',
      entityId: id,
      oldValues: { status: existing.status, resourceType: existing.resourceType },
      newValues: { status: result.status, resourceType: result.resourceType },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.resourceAssignment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 })
    }

    await db.resourceAssignment.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'ResourceAssignment',
      entityId: id,
      oldValues: { resourceType: existing.resourceType, resourceName: existing.resourceName },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}