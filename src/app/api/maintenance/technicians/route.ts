import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const availabilityStatus = searchParams.get('availabilityStatus')
    const specialization = searchParams.get('specialization')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (availabilityStatus) where.availabilityStatus = availabilityStatus
    if (specialization) {
      where.specializations = { contains: specialization }
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { phone: { contains: search } } },
      ]
    }

    const technicians = await db.technicianProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, role: true } },
        employee: { select: { id: true, department: true, designation: true } },
        _count: {
          select: {
            tickets: {
              where: { status: { notIn: ['closed', 'completed', 'customer_verification'] } },
            },
            pmSchedules: { where: { isActive: true } },
          },
        },
      },
      orderBy: { rating: 'desc' },
    })

    const data = technicians.map((t) => ({
      ...JSON.parse(JSON.stringify(t)),
      activeJobs: t._count.tickets,
      activePMSchedules: t._count.pmSchedules,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch technicians'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { userId, employeeId, specializations, certifications, maxJobsPerDay, availabilityStatus, latitude, longitude, currentLocation } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    // প্রোফাইল আগে থেকেই আছে কিনা যাচাই করা হচ্ছে
    const existing = await db.technicianProfile.findUnique({ where: { userId } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Technician profile already exists for this user' }, { status: 400 })
    }

    const technician = await db.technicianProfile.create({
      data: {
        userId,
        employeeId: employeeId || null,
        specializations: JSON.stringify(specializations || []),
        certifications: JSON.stringify(certifications || []),
        maxJobsPerDay: maxJobsPerDay || 5,
        availabilityStatus: availabilityStatus || 'available',
        latitude: latitude || null,
        longitude: longitude || null,
        currentLocation: currentLocation || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'TechnicianProfile',
      entityId: technician.id,
      newValues: { userId },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(technician)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create technician profile'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}