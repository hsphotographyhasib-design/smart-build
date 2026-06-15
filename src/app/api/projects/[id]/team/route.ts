import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, requireRole } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const members = await db.projectTeamMember.findMany({
      where: { projectId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(members)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!requireRole(user, ['admin','supervisor'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }
    const { id: projectId } = await params
    const body = await request.json()
    const { name, role, company, phone, email } = body

    if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })

    const member = await db.projectTeamMember.create({
      data: {
        projectId, name,
        role: role || 'supervisor',
        company: company || null,
        phone: phone || null,
        email: email || null,
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(member)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}