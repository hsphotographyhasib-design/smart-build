import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType')

    const activity = await db.scheduleActivity.findUnique({ where: { id } })
    if (!activity) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { activityId: id }
    if (resourceType) where.resourceType = resourceType

    const resources = await db.scheduleResourceAssignment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Compute total cost
    const totalCost = resources.reduce((sum, r) => sum + r.totalCost, 0)

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(resources)),
      totalCost,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch resource assignments'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const activity = await db.scheduleActivity.findUnique({ where: { id } })
    if (!activity) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    const body = await request.json()
    const { resourceType, resourceId, resourceName, quantity, unit, costPerUnit, startDate, endDate, notes } = body

    if (!resourceType || !resourceId || !resourceName) {
      return NextResponse.json(
        { success: false, error: 'resourceType, resourceId, and resourceName are required' },
        { status: 400 }
      )
    }

    const totalCost = (quantity || 1) * (costPerUnit || 0)

    const assignment = await db.scheduleResourceAssignment.create({
      data: {
        scheduleId: activity.scheduleId,
        activityId: id,
        resourceType,
        resourceId,
        resourceName,
        quantity: quantity || 1,
        unit: unit || 'ea',
        costPerUnit: costPerUnit || 0,
        totalCost,
        startDate: startDate ? new Date(startDate) : activity.startDate,
        endDate: endDate ? new Date(endDate) : activity.finishDate,
        notes: notes || null,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'ScheduleResourceAssignment',
      entityId: assignment.id,
      newValues: { resourceType, resourceName, quantity: quantity || 1, activityId: id },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(assignment)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create resource assignment'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}