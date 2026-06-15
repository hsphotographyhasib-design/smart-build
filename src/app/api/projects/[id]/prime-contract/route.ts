import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const contract = await db.primeContract.findUnique({ where: { projectId } })
    if (!contract) return NextResponse.json({ success: false, error: 'Prime contract not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(contract)) })
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
    const { contractNo, client, originalValue, variationOrders, retention, claims, startDate, endDate } = body

    if (!contractNo || !client) {
      return NextResponse.json({ success: false, error: 'contractNo and client are required' }, { status: 400 })
    }

    const existing = await db.primeContract.findUnique({ where: { projectId } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Prime contract already exists for this project' }, { status: 409 })
    }

    const contract = await db.primeContract.create({
      data: {
        projectId,
        contractNo,
        client,
        originalValue: originalValue || 0,
        variationOrders: variationOrders || 0,
        retention: retention || 0,
        claims: claims || 0,
        status: 'active',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    await createAuditLog({ userId: user.id, action: 'CREATE', entity: 'PrimeContract', entityId: contract.id, details: `Created prime contract for project ${projectId}`, ipAddress: request.headers.get('x-forwarded-for') || undefined })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(contract)) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params
    const body = await request.json()

    const existing = await db.primeContract.findUnique({ where: { projectId } })
    if (!existing) return NextResponse.json({ success: false, error: 'Prime contract not found' }, { status: 404 })

    const data: any = {}
    if (body.contractNo !== undefined) data.contractNo = body.contractNo
    if (body.client !== undefined) data.client = body.client
    if (body.originalValue !== undefined) data.originalValue = body.originalValue
    if (body.variationOrders !== undefined) data.variationOrders = body.variationOrders
    if (body.retention !== undefined) data.retention = body.retention
    if (body.claims !== undefined) data.claims = body.claims
    if (body.status !== undefined) data.status = body.status
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null

    const contract = await db.primeContract.update({ where: { projectId }, data })
    await createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'PrimeContract', entityId: existing.id, details: `Updated prime contract for project ${projectId}`, ipAddress: request.headers.get('x-forwarded-for') || undefined })
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(contract)) })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
