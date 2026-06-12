import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (category) where.category = category

    const skills = await db.skill.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(skills)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, category, description } = body

    if (!name) return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 })

    // Check for duplicate
    const existing = await db.skill.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Skill with this name already exists' }, { status: 400 })
    }

    const result = await db.skill.create({
      data: {
        name,
        category: category || null,
        description: description || null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Skill',
      entityId: result.id,
      newValues: { name, category: result.category },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}