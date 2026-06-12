import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

const VALID_TYPES = ['cost_anomaly', 'schedule_risk', 'resource_optimization', 'budget_forecast', 'quality_alert', 'safety_risk']
const VALID_SEVERITIES = ['info', 'warning', 'critical']
const VALID_STATUSES = ['new', 'acknowledged', 'actioned', 'dismissed']

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const insightType = searchParams.get('insightType')
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (insightType && VALID_TYPES.includes(insightType)) where.insightType = insightType
    if (severity && VALID_SEVERITIES.includes(severity)) where.severity = severity
    if (status && VALID_STATUSES.includes(status)) where.status = status

    const [insights, total] = await Promise.all([
      db.aIInsight.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.aIInsight.count({ where }),
    ])

    const formatted = insights.map(ins => ({
      ...ins,
      recommendations: JSON.parse(ins.recommendations),
      affectedEntities: ins.affectedEntities ? JSON.parse(ins.affectedEntities) : [],
    }))

    return NextResponse.json({
      success: true,
      data: {
        insights: JSON.parse(JSON.stringify(formatted)),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, insightType, title, description, confidence, severity, recommendations, affectedEntities } = body

    if (!insightType || !VALID_TYPES.includes(insightType)) {
      return NextResponse.json({ success: false, error: 'Invalid insightType' }, { status: 400 })
    }
    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Title and description are required' }, { status: 400 })
    }
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json({ success: false, error: 'Invalid severity' }, { status: 400 })
    }

    const insight = await db.aIInsight.create({
      data: {
        projectId: projectId || null,
        insightType,
        title,
        description,
        confidence: confidence ?? 0,
        severity: severity || 'info',
        recommendations: JSON.stringify(recommendations || []),
        affectedEntities: affectedEntities ? JSON.stringify(affectedEntities) : null,
        createdById: user.id,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...JSON.parse(JSON.stringify(insight)),
        recommendations: recommendations || [],
        affectedEntities: affectedEntities || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}