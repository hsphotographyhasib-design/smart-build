import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (status) where.status = status
    if (severity) where.severity = severity
    if (projectId) where.projectId = projectId

    const complaints = await db.clientComplaint.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(complaints)),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { projectId, clientName, subject, description, category, severity } = body

    if (!projectId || !subject || !description || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const complaint = await db.clientComplaint.create({
      data: {
        projectId,
        clientName: clientName || user.name,
        subject,
        description,
        category,
        severity: severity || 'medium',
        createdById: user.id,
      },
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
