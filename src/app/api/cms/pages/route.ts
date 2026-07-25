import db from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/pages — list pages with optional filters
export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const locale = searchParams.get('locale') ?? undefined;
    const status = searchParams.get('status') ?? undefined;

    const pages = await db.cmsPage.findMany({
      where: {
        ...(locale && { locale }),
        ...(status === 'published'
          ? { publishedAt: { not: null } }
          : status === 'draft'
            ? { publishedAt: null }
            : {}),
      },
      include: {
        _count: { select: { sections: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: pages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/cms/pages — create a new page
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, locale, status, metaTitle, metaDescription, seoConfig } = body;

    const page = await db.cmsPage.create({
      data: {
        title,
        slug,
        locale: locale ?? 'en',
        status: status ?? 'draft',
        metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null,
        seoConfig: seoConfig ?? undefined,
      },
      include: {
        _count: { select: { sections: true } },
      },
    });

    return NextResponse.json({ data: page }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
