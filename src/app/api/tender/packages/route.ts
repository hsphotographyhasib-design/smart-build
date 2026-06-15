import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (projectId) where.projectId = projectId
    if (category) where.categoryId = category
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { packageNo: { contains: search } },
      ]
    }

    const [packages, total] = await Promise.all([
      db.tenderBidPackage.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
          category: { select: { id: true, name: true, code: true } },
          invitations: { select: { id: true, vendorId: true, status: true } },
          bidItems: { select: { id: true, itemNo: true, description: true, amount: true } },
          award: { select: { id: true, awardAmount: true, status: true } },
          _count: { select: { bids: true, documents: true, questions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tenderBidPackage.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(packages)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load packages'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      name, projectId, categoryId, description, scopeOfWork,
      bidDueDate, tenderClosingDate, estimatedBudget, currency,
      boqId, status, evaluationMethod, autoReminder,
      requireTechnicalProposal, requireCommercialProposal, requireBoqPricing,
    } = body

    if (!name || !projectId) {
      return NextResponse.json({ success: false, error: 'name and projectId are required' }, { status: 400 })
    }

    // Auto-generate packageNo: BID-YYYY-000001
    const year = new Date().getFullYear()
    const prefix = `BID-${year}-`
    const lastPackage = await db.tenderBidPackage.findFirst({
      where: { packageNo: { startsWith: prefix } },
      orderBy: { packageNo: 'desc' },
      select: { packageNo: true },
    })
    let nextNum = 1
    if (lastPackage) {
      const numPart = lastPackage.packageNo.replace(prefix, '')
      nextNum = (parseInt(numPart) || 0) + 1
    }
    const packageNo = `${prefix}${String(nextNum).padStart(6, '0')}`

    const pkg = await db.tenderBidPackage.create({
      data: {
        packageNo,
        name,
        projectId,
        categoryId: categoryId || null,
        description: description || null,
        scopeOfWork: scopeOfWork || null,
        bidDueDate: bidDueDate ? new Date(bidDueDate) : null,
        tenderClosingDate: tenderClosingDate ? new Date(tenderClosingDate) : null,
        estimatedBudget: estimatedBudget || 0,
        currency: currency || 'SGD',
        boqId: boqId || null,
        status: status || 'draft',
        evaluationMethod: evaluationMethod || 'weighted',
        autoReminder: autoReminder !== false,
        requireTechnicalProposal: requireTechnicalProposal !== false,
        requireCommercialProposal: requireCommercialProposal !== false,
        requireBoqPricing: requireBoqPricing !== false,
        createdById: authUser.id,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        category: true,
      },
    })

    // If publishing immediately, create approval steps
    if (pkg.status === 'published') {
      await db.tenderApprovalStep.createMany({
        data: [
          { packageId: pkg.id, stepOrder: 1, stepType: 'vendor_invitation', status: 'pending' },
          { packageId: pkg.id, stepOrder: 2, stepType: 'bid_submission', status: 'pending' },
          { packageId: pkg.id, stepOrder: 3, stepType: 'technical_review', status: 'pending' },
          { packageId: pkg.id, stepOrder: 4, stepType: 'commercial_review', status: 'pending' },
          { packageId: pkg.id, stepOrder: 5, stepType: 'management_approval', status: 'pending' },
          { packageId: pkg.id, stepOrder: 6, stepType: 'award_recommendation', status: 'pending' },
        ],
      })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(pkg)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create package'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}