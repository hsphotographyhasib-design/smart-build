import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const isApproved = searchParams.get('isApproved')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = { isActive: true }
    if (isApproved !== null && isApproved !== '') {
      where.isApproved = isApproved === 'true'
    }
    if (category) where.categoryId = category
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { registrationNo: { contains: search } },
      ]
    }

    const [vendors, total] = await Promise.all([
      db.tenderVendor.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, code: true } },
          _count: {
            select: {
              invitations: true,
              bids: true,
              awards: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tenderVendor.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(vendors)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load vendors'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      companyName, registrationNo, contactPerson, email, phone,
      address, country, tradeSpecialization, categoryId, website,
      taxRegistration, pastPerformance, certifications, insuranceInfo,
      licenses, isApproved, rating, notes,
    } = body

    if (!companyName || !contactPerson || !email || !phone) {
      return NextResponse.json({ success: false, error: 'companyName, contactPerson, email, and phone are required' }, { status: 400 })
    }

    const vendor = await db.tenderVendor.create({
      data: {
        companyName,
        registrationNo: registrationNo || null,
        contactPerson,
        email,
        phone,
        address: address || null,
        country: country || null,
        tradeSpecialization: tradeSpecialization || null,
        categoryId: categoryId || null,
        website: website || null,
        taxRegistration: taxRegistration || null,
        pastPerformance: pastPerformance ? JSON.stringify(pastPerformance) : null,
        certifications: certifications ? JSON.stringify(certifications) : null,
        insuranceInfo: insuranceInfo ? JSON.stringify(insuranceInfo) : null,
        licenses: licenses ? JSON.stringify(licenses) : null,
        isApproved: isApproved || false,
        rating: rating || 0,
        totalBids: 0,
        totalAwarded: 0,
        successRate: 0,
        notes: notes || null,
        createdById: authUser.id,
      },
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(vendor)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create vendor'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}