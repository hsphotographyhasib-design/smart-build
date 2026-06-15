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

    const contract = await db.aMCContract.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    if (!contract) {
      return NextResponse.json({ success: false, error: 'AMC contract not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(contract)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch AMC contract'
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

    const existing = await db.aMCContract.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'AMC contract not found' }, { status: 404 })
    }

    const {
      name, description, startDate, endDate,
      totalVisits, usedVisits, visitFrequency,
      coveredEquipment, annualValue, slaPriority,
      status, renewalDate, autoRenew, notes,
    } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = new Date(endDate)
    if (totalVisits !== undefined) updateData.totalVisits = totalVisits
    if (usedVisits !== undefined) updateData.usedVisits = usedVisits
    if (visitFrequency !== undefined) updateData.visitFrequency = visitFrequency
    if (coveredEquipment !== undefined) updateData.coveredEquipment = JSON.stringify(coveredEquipment)
    if (annualValue !== undefined) updateData.annualValue = annualValue
    if (slaPriority !== undefined) updateData.slaPriority = slaPriority
    if (status !== undefined) updateData.status = status
    if (renewalDate !== undefined) updateData.renewalDate = renewalDate ? new Date(renewalDate) : null
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew
    if (notes !== undefined) updateData.notes = notes

    const contract = await db.aMCContract.update({
      where: { id },
      data: updateData as any,
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'UPDATE',
      entity: 'AMCContract',
      entityId: id,
      newValues: updateData,
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(contract)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update AMC contract'
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

    const existing = await db.aMCContract.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'AMC contract not found' }, { status: 404 })
    }

    await db.aMCContract.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'AMCContract',
      entityId: id,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete AMC contract'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}