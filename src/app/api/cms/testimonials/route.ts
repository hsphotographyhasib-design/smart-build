import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import getSuperAdminUser from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    if (featured !== null) {
      where.featured = featured === 'true';
    }

    if (status) {
      where.status = status;
    }

    const testimonials = await db.testimonial.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(testimonials);
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
    const { name, role, company, content, avatar, featured, status, order } = body;

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        name,
        role: role ?? null,
        company: company ?? null,
        content,
        avatar: avatar ?? null,
        featured: featured ?? false,
        status: status ?? 'published',
        order: order ?? 0,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
