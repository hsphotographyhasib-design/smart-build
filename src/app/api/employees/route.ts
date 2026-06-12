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
    const search = searchParams.get('search')
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { empCode: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }
    if (department && department !== 'all') where.department = department
    if (status === 'active') where.isActive = true
    else if (status === 'inactive') where.isActive = false

    const employees = await db.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: employees })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch employees'
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
    const { empCode, name, email, phone, department, designation, joinDate, basicSalary } = body

    if (!empCode?.trim() || !name?.trim()) {
      return NextResponse.json({ success: false, error: 'Employee code and name are required' }, { status: 400 })
    }

    const existing = await db.employee.findUnique({ where: { empCode: empCode.trim() } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Employee code already exists' }, { status: 409 })
    }

    const employee = await db.employee.create({
      data: {
        empCode: empCode.trim(),
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        department: department?.trim() || null,
        designation: designation?.trim() || null,
        joinDate: joinDate ? new Date(joinDate) : null,
        basicSalary: parseFloat(basicSalary) || 0,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Employee',
      entityId: employee.id,
      newValues: employee,
    })

    return NextResponse.json({ success: true, data: employee }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create employee'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}