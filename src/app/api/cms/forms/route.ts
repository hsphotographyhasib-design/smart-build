import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/forms — Super Admin list all forms with submission count
export async function GET() {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const forms = await db.cmsForm.findMany({
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('[GET /api/cms/forms]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/cms/forms — Super Admin create a new form
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, config, successMsg, errorMsg, notifyEmail, status } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const form = await db.cmsForm.create({
      data: {
        name,
        slug,
        description: description ?? null,
        config: config ?? {},
        successMsg: successMsg ?? null,
        errorMsg: errorMsg ?? null,
        notifyEmail: notifyEmail ?? null,
        status: status ?? 'DRAFT',
      },
      include: { _count: { select: { submissions: true } } },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cms/forms]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
