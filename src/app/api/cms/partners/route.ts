import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    const partners = await db.cmsPartner.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(partners);
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
    const { name, logo, url, category, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const partner = await db.cmsPartner.create({
      data: {
        name,
        logo: logo ?? null,
        url: url ?? null,
        category: category ?? 'client',
        order: order ?? 0,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
