import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/forms/:id/submissions — Super Admin paginated submissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      db.cmsFormSubmission.findMany({
        where: { formId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.cmsFormSubmission.count({ where: { formId: id } }),
    ]);

    return NextResponse.json({
      submissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/cms/forms/:id/submissions]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/cms/forms/:id/submissions — PUBLIC (no auth) submit a form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, source, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body;

    if (!data) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 });
    }

    const form = await db.cmsForm.findUnique({ where: { id } });
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Resolve IP address from headers
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;

    const userAgent = request.headers.get('user-agent') || null;

    const submission = await db.cmsFormSubmission.create({
      data: {
        formId: id,
        data,
        source: source ?? null,
        utmSource: utmSource ?? null,
        utmMedium: utmMedium ?? null,
        utmCampaign: utmCampaign ?? null,
        utmTerm: utmTerm ?? null,
        utmContent: utmContent ?? null,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cms/forms/:id/submissions]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
