import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const pkg = await db.tenderBidPackage.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        category: true,
        boq: { select: { id: true, version: true, total: true } },
        invitations: {
          include: { vendor: { select: { id: true, companyName: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
        bidItems: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        questions: {
          include: {
            vendor: { select: { id: true, companyName: true } },
            askedBy: { select: { id: true, name: true } },
            answeredBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        addenda: { orderBy: { version: 'desc' } },
        evaluations: {
          include: {
            bid: {
              include: { vendor: { select: { id: true, companyName: true } } },
            },
            evaluator: { select: { id: true, name: true } },
            reviewedBy: { select: { id: true, name: true } },
            scores: { include: { criteria: true } },
          },
          orderBy: { ranking: 'asc' },
        },
        award: {
          include: {
            bid: {
              include: { vendor: { select: { id: true, companyName: true } } },
            },
            approvedBy: { select: { id: true, name: true } },
          },
        },
        approvalSteps: { orderBy: { stepOrder: 'asc' } },
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { bids: true } },
      },
    })

    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(pkg)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load package'
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

    const existing = await db.tenderBidPackage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'categoryId', 'description', 'scopeOfWork',
      'bidDueDate', 'tenderClosingDate', 'estimatedBudget', 'currency',
      'boqId', 'evaluationMethod', 'autoReminder',
      'requireTechnicalProposal', 'requireCommercialProposal', 'requireBoqPricing',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'bidDueDate' || field === 'tenderClosingDate') {
          updateData[field] = body[field] ? new Date(body[field]) : null
        } else {
          updateData[field] = body[field]
        }
      }
    }

    // Handle status transitions
    if (body.status !== undefined && body.status !== existing.status) {
      updateData.status = body.status
    }

    const pkg = await db.tenderBidPackage.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(pkg)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update package'
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

    const existing = await db.tenderBidPackage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    // Soft delete
    const pkg = await db.tenderBidPackage.update({
      where: { id },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(pkg)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete package'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}