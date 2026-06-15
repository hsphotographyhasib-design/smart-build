import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

// GET — মেসেজ টেমপ্লেটের তালিকা
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (isActive === 'true') where.isActive = true
    if (isActive === 'false') where.isActive = false

    const templates = await db.whatsAppMessageTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: templates })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get templates'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// POST — টেমপ্লেট তৈরি করা হচ্ছে
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, displayName, category, language, bodyText, headerType, headerText, footerText, buttons } = body

    if (!name || !displayName || !category || !bodyText) {
      return NextResponse.json(
        { success: false, error: 'name, displayName, category, and bodyText are required' },
        { status: 400 }
      )
    }

    // অ্যাকাউন্ট পাওয়া বা যাচাই করা হচ্ছে
    const account = await db.whatsAppAccount.findFirst()
    if (!account) {
      return NextResponse.json({ success: false, error: 'WhatsApp account not configured' }, { status: 400 })
    }

    const template = await db.whatsAppMessageTemplate.create({
      data: {
        accountId: account.id,
        name,
        displayName,
        category,
        language: language || 'en',
        bodyText,
        headerType: headerType || null,
        headerText: headerText || null,
        footerText: footerText || null,
        buttons: buttons ? JSON.stringify(buttons) : null,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'create',
      entity: 'WhatsAppMessageTemplate',
      entityId: template.id,
    })

    return NextResponse.json({ success: true, data: template })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create template'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// PUT — টেমপ্লেট আপডেট করা হচ্ছে
export async function PUT(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, displayName, category, language, bodyText, headerType, headerText, footerText, buttons, isActive, isApproved } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Template id is required' }, { status: 400 })
    }

    const existing = await db.whatsAppMessageTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (displayName !== undefined) updateData.displayName = displayName
    if (category !== undefined) updateData.category = category
    if (language !== undefined) updateData.language = language
    if (bodyText !== undefined) updateData.bodyText = bodyText
    if (headerType !== undefined) updateData.headerType = headerType
    if (headerText !== undefined) updateData.headerText = headerText
    if (footerText !== undefined) updateData.footerText = footerText
    if (buttons !== undefined) updateData.buttons = JSON.stringify(buttons)
    if (isActive !== undefined) updateData.isActive = isActive
    if (isApproved !== undefined) updateData.isApproved = isApproved

    const template = await db.whatsAppMessageTemplate.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'update',
      entity: 'WhatsAppMessageTemplate',
      entityId: id,
    })

    return NextResponse.json({ success: true, data: template })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update template'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// DELETE — টেমপ্লেট মুছে ফেলা হচ্ছে
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Template id is required' }, { status: 400 })
    }

    const existing = await db.whatsAppMessageTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })
    }

    await db.whatsAppMessageTemplate.delete({ where: { id } })

    await createAuditLog({
      userId: authUser.id,
      action: 'delete',
      entity: 'WhatsAppMessageTemplate',
      entityId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete template'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}