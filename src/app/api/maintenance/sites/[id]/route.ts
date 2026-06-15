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

    const site = await db.maintenanceSite.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        tickets: {
          where: { status: { not: 'closed' } },
          include: {
            assignedTechnician: { select: { id: true, user: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        pmSchedules: { where: { isActive: true }, orderBy: { nextVisitDate: 'asc' } },
        _count: { select: { tickets: true, pmSchedules: true } },
      },
    })

    if (!site) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(site)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch site'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const existing = await db.maintenanceSite.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 })
    }

    const { name, address, latitude, longitude, contactPerson, contactPhone, description, isActive } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (address !== undefined) updateData.address = address
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    const site = await db.maintenanceSite.update({
      where: { id },
      data: updateData as any,
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'MaintenanceSite',
      entityId: id,
      newValues: updateData,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(site)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update site'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.maintenanceSite.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 })
    }

    await db.maintenanceSite.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'MaintenanceSite',
      entityId: id,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete site'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}