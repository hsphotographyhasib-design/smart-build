import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

const VALID_STATUSES = ['new', 'acknowledged', 'actioned', 'dismissed']

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const insight = await db.aIInsight.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    })

    if (!insight) {
      return NextResponse.json({ success: false, error: 'Insight not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...JSON.parse(JSON.stringify(insight)),
        recommendations: JSON.parse(insight.recommendations),
        affectedEntities: insight.affectedEntities ? JSON.parse(insight.affectedEntities) : [],
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, confidence, severity, status, recommendations, affectedEntities } = body

    const existing = await db.aIInsight.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Insight not found' }, { status: 404 })
    }

    // স্ট্যাটাস পরিবর্তন যাচাই করা হচ্ছে
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (confidence !== undefined) updateData.confidence = confidence
    if (severity !== undefined) updateData.severity = severity
    if (status !== undefined) updateData.status = status
    if (recommendations !== undefined) updateData.recommendations = JSON.stringify(recommendations)
    if (affectedEntities !== undefined) updateData.affectedEntities = JSON.stringify(affectedEntities)

    const updated = await db.aIInsight.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...JSON.parse(JSON.stringify(updated)),
        recommendations: JSON.parse(updated.recommendations),
        affectedEntities: updated.affectedEntities ? JSON.parse(updated.affectedEntities) : [],
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.aIInsight.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Insight not found' }, { status: 404 })
    }

    await db.aIInsight.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Insight deleted' } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}