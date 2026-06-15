import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // ক্লায়েন্ট পোর্টাল অ্যাক্সেস নিয়ন্ত্রণ
    if (!['client', 'super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Access denied. Client portal only.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (user.role === 'client') {
      // ক্লায়েন্ট ভূমিকার জন্য, তাদের নিজের প্রজেক্ট দিয়ে ফিল্টার করা হচ্ছে
      where.project = { clientId: user.id }
    }
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

    // ক্লায়েন্ট পোর্টাল অ্যাক্সেস নিয়ন্ত্রণ
    if (!['client', 'super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Access denied. Client portal only.' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId, clientName, subject, description, category, severity } = body

    if (!projectId || !subject || !description || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // ক্লায়েন্ট ভূমিকার জন্য, প্রজেক্টটি তাদের নিজের কিনা যাচাই করা হচ্ছে
    if (user.role === 'client') {
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { clientId: true },
      })
      if (!project || project.clientId !== user.id) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
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
