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

    const req = await db.resourceRequest.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    if (!req) {
      return NextResponse.json({ success: false, error: 'Resource request not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(req)) })
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

    const existing = await db.resourceRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Resource request not found' }, { status: 404 })
    }

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
      status,
      notes,
    } = body

    const result = await db.resourceRequest.update({
      where: { id },
      data: {
        ...(projectId && { projectId }),
        ...(resourceType && { resourceType }),
        ...(resourceName !== undefined && { resourceName }),
        ...(quantity !== undefined && { quantity }),
        ...(trade !== undefined && { trade }),
        ...(requiredSkills !== undefined && { requiredSkills }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(shift && { shift }),
        ...(priority && { priority }),
        ...(reason !== undefined && { reason }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'ResourceRequest',
      entityId: id,
      oldValues: { status: existing.status, priority: existing.priority },
      newValues: { status: result.status, priority: result.priority },
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

    const existing = await db.resourceRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Resource request not found' }, { status: 404 })
    }

    await db.resourceRequest.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'ResourceRequest',
      entityId: id,
      oldValues: { requestNo: existing.requestNo, resourceType: existing.resourceType },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}