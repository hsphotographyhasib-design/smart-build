import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const featured = searchParams.get('featured');

    const where: Record<string, unknown> = {};

    if (industry) {
      where.industry = industry;
    }

    if (featured !== null) {
      where.featured = featured === 'true';
    }

    const caseStudies = await db.cmsCaseStudy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(caseStudies);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSuperAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, client, industry, summary, content, coverImage, featured, publishedAt } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const caseStudy = await db.cmsCaseStudy.create({
      data: {
        title,
        slug,
        client: client ?? null,
        industry: industry ?? null,
        summary: summary ?? null,
        content: content ?? null,
        coverImage: coverImage ?? null,
        featured: featured ?? false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });

    return NextResponse.json(caseStudy, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
