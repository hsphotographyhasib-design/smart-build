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

    const log = await db.productivityLog.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    if (!log) {
      return NextResponse.json({ success: false, error: 'Productivity log not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(log)) })
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

    const existing = await db.productivityLog.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Productivity log not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      projectId,
      date,
      resourceType,
      resourceId,
      crewId,
      resourceName,
      task,
      outputUnit,
      outputQty,
      hoursWorked,
      cost,
      quality,
      notes,
    } = body

    const result = await db.productivityLog.update({
      where: { id },
      data: {
        ...(projectId && { projectId }),
        ...(date && { date: new Date(date) }),
        ...(resourceType && { resourceType }),
        ...(resourceId !== undefined && { resourceId }),
        ...(crewId !== undefined && { crewId }),
        ...(resourceName !== undefined && { resourceName }),
        ...(task !== undefined && { task }),
        ...(outputUnit !== undefined && { outputUnit }),
        ...(outputQty !== undefined && { outputQty }),
        ...(hoursWorked !== undefined && { hoursWorked }),
        ...(cost !== undefined && { cost }),
        ...(quality !== undefined && { quality }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'ProductivityLog',
      entityId: id,
      oldValues: { outputQty: existing.outputQty, cost: existing.cost },
      newValues: { outputQty: result.outputQty, cost: result.cost },
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

    const existing = await db.productivityLog.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Productivity log not found' }, { status: 404 })
    }

    await db.productivityLog.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'ProductivityLog',
      entityId: id,
      oldValues: { resourceType: existing.resourceType, date: existing.date },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}