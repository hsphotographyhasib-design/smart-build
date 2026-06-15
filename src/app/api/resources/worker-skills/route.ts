import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const workerType = searchParams.get('workerType')
    const workerId = searchParams.get('workerId')

    const where: Record<string, unknown> = {}
    if (workerType) where.workerType = workerType
    if (workerId) where.workerId = workerId

    const workerSkills = await db.workerSkill.findMany({
      where,
      include: {
        skill: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(workerSkills)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { skillId, workerType, workerId, proficiency } = body

    if (!skillId) return NextResponse.json({ success: false, error: 'skillId is required' }, { status: 400 })
    if (!workerType) return NextResponse.json({ success: false, error: 'workerType is required' }, { status: 400 })
    if (!workerId) return NextResponse.json({ success: false, error: 'workerId is required' }, { status: 400 })

    // দক্ষতা বিদ্যমান কিনা যাচাই করা হচ্ছে
    const skill = await db.skill.findUnique({ where: { id: skillId } })
    if (!skill) {
      return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 400 })
    }

    const result = await db.workerSkill.create({
      data: {
        skillId,
        workerType,
        workerId,
        proficiency: proficiency || 'intermediate',
      },
      include: {
        skill: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'WorkerSkill',
      entityId: result.id,
      newValues: { skillId, workerType, workerId, proficiency: result.proficiency },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}