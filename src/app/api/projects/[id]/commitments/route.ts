import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const commitments = await db.projectCommitment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(commitments)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params
    const body = await request.json()
    const { type, vendor, description, contractValue, committedCost } = body

    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor is required' }, { status: 400 })

    const contractVal = Number(contractValue) || 0
    const committed = Number(committedCost) || 0

    const commitment = await db.projectCommitment.create({
      data: {
        projectId,
        type: type || 'purchase_order',
        vendor,
        description: description || null,
        contractValue: contractVal,
        committedCost: committed,
        remainingCost: contractVal - committed,
        status: 'active',
      },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(commitment)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}