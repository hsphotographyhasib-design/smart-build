import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import getSuperAdminUser from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const locale = searchParams.get('locale');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (locale) {
      where.locale = locale;
    }

    const faqs = await db.faq.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(faqs);
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
    const { question, answer, category, locale, order } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const faq = await db.faq.create({
      data: {
        question,
        answer,
        category: category ?? null,
        locale: locale ?? null,
        order: order ?? 0,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
