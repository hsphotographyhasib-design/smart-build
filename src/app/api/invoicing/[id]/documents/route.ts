import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const documents = await db.invoiceDocument.findMany({
      where: { invoiceId: id },
      include: { uploadedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    console.error('Invoice documents GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { fileName, fileType, fileSize, fileUrl, category } = body

    if (!fileName || !fileType || !fileUrl) {
      return NextResponse.json({ success: false, error: 'fileName, fileType, and fileUrl are required' }, { status: 400 })
    }

    const invoice = await db.invoice.findUnique({ where: { id } })
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    const document = await db.invoiceDocument.create({
      data: {
        invoiceId: id,
        fileName,
        fileType,
        fileSize: fileSize || 0,
        fileUrl,
        category: category || 'invoice',
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ success: true, data: document }, { status: 201 })
  } catch (error) {
    console.error('Invoice documents POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload document' }, { status: 500 })
  }
}