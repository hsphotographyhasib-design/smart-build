import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const crews = await db.crew.findMany({
      where: { isActive: true },
      include: {
        members: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // সদস্য গণনা যোগ করা হচ্ছে
    const data = crews.map((crew) => ({
      ...crew,
      memberCount: crew.members.length,
    }))

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(data)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, type, leaderName, leaderId, leaderType, description, members } = body

    if (!name) return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 })
    if (!type) return NextResponse.json({ success: false, error: 'type is required' }, { status: 400 })

    const result = await db.crew.create({
      data: {
        name,
        type,
        leaderName: leaderName || null,
        leaderId: leaderId || null,
        leaderType: leaderType || null,
        description: description || null,
        members: members && members.length > 0
          ? {
              create: members.map((m: { workerType: string; workerId: string; workerName: string; role?: string }) => ({
                workerType: m.workerType,
                workerId: m.workerId,
                workerName: m.workerName,
                role: m.role || 'member',
              })),
            }
          : undefined,
      },
      include: {
        members: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Crew',
      entityId: result.id,
      newValues: { name, type, memberCount: result.members.length },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(result)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}