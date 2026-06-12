import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ['acknowledged', 'closed'],
  acknowledged: ['investigating', 'closed'],
  investigating: ['resolving', 'open', 'closed'],
  resolving: ['resolved', 'investigating', 'closed'],
  resolved: ['closed'],
  closed: [],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const complaint = await db.clientComplaint.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(complaint)),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
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
    const body = await request.json()
    const { status, resolution, assignedTo, subject, description, category, severity } = body

    const existing = await db.clientComplaint.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 })
    }

    // Validate status transition
    if (status && status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status] || []
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid transition from '${existing.status}' to '${status}'` },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (subject !== undefined) updateData.subject = subject
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (severity !== undefined) updateData.severity = severity
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (status !== undefined) updateData.status = status

    // If resolving or closing, set resolution info
    if (resolution !== undefined) {
      updateData.resolution = resolution
      updateData.resolvedById = user.id
      updateData.resolutionDate = new Date()
    }
    if (status === 'resolved' || status === 'closed') {
      if (!updateData.resolvedById) {
        updateData.resolvedById = user.id
        updateData.resolutionDate = new Date()
      }
    }

    const complaint = await db.clientComplaint.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(complaint)),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
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

    const complaint = await db.clientComplaint.findUnique({ where: { id } })
    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 })
    }

    // Only open complaints can be deleted
    if (complaint.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'Only open complaints can be deleted' },
        { status: 400 }
      )
    }

    await db.clientComplaint.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { message: 'Complaint deleted successfully' },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}
