import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (employeeId) where.employeeId = employeeId

    const loans = await db.loan.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, empCode: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: loans })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch loans'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { employeeId, amount, interestRate, tenureMonths, emiAmount, startDate } = body

    if (!employeeId || !amount || !startDate) {
      return NextResponse.json({ success: false, error: 'employeeId, amount, and startDate are required' }, { status: 400 })
    }

    const employee = await db.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    const loan = await db.loan.create({
      data: {
        employeeId,
        amount: parseFloat(amount) || 0,
        interestRate: parseFloat(interestRate) || 0,
        tenureMonths: parseInt(tenureMonths, 10) || 0,
        emiAmount: parseFloat(emiAmount) || 0,
        startDate: new Date(startDate),
        status: 'active',
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Loan',
      entityId: loan.id,
      newValues: loan,
    })

    return NextResponse.json({ success: true, data: loan }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create loan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}