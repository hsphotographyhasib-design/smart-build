import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        leaveRequests: { orderBy: { createdAt: 'desc' } },
        loans: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: employee })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch employee'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin', 'hr_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const existing = await db.employee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    if (body.empCode?.trim() && body.empCode.trim() !== existing.empCode) {
      const codeExists = await db.employee.findUnique({ where: { empCode: body.empCode.trim() } })
      if (codeExists) {
        return NextResponse.json({ success: false, error: 'Employee code already exists' }, { status: 409 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (body.empCode !== undefined) updateData.empCode = body.empCode.trim()
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.email !== undefined) updateData.email = body.email?.trim() || null
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null
    if (body.department !== undefined) updateData.department = body.department?.trim() || null
    if (body.designation !== undefined) updateData.designation = body.designation?.trim() || null
    if (body.joinDate !== undefined) updateData.joinDate = body.joinDate ? new Date(body.joinDate) : null
    if (body.basicSalary !== undefined) updateData.basicSalary = parseFloat(body.basicSalary) || 0
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const employee = await db.employee.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'Employee',
      entityId: id,
      oldValues: existing,
      newValues: employee,
    })

    return NextResponse.json({ success: true, data: employee })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update employee'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin', 'hr_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.employee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    await db.employee.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'Employee',
      entityId: id,
      oldValues: existing,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete employee'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}