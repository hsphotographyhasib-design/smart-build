import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/translations — Get translations with optional locale/context filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || undefined;
    const context = searchParams.get('context') || undefined;

    const where: Record<string, unknown> = {};
    if (locale) where.locale = locale;
    if (context) where.context = context;

    const translations = await db.translation.findMany({
      where,
    });

    // Build a flat key→value map
    const map: Record<string, string> = {};
    for (const t of translations) {
      map[t.key] = t.value;
    }

    return NextResponse.json({ translations, map });
  } catch (error) {
    console.error('[GET /api/cms/translations]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/cms/translations — Super Admin batch upsert translations
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { translations } = body as {
      translations: { key: string; locale: string; value: string; context?: string }[];
    };

    if (!translations || !Array.isArray(translations)) {
      return NextResponse.json({ error: 'translations array is required' }, { status: 400 });
    }

    const results = await Promise.all(
      translations.map((t) =>
        db.translation.upsert({
          where: {
            key_locale: { key: t.key, locale: t.locale },
          },
          update: {
            value: t.value,
            context: t.context ?? null,
          },
          create: {
            key: t.key,
            locale: t.locale,
            value: t.value,
            context: t.context ?? null,
          },
        })
      )
    );

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cms/translations]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/cms/translations — Super Admin batch update translations by locale/context
export async function PUT(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { locale, context, translations } = body as {
      locale: string;
      context?: string;
      translations: Record<string, string>;
    };

    if (!locale || !translations) {
      return NextResponse.json({ error: 'locale and translations are required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { locale };
    if (context) where.context = context;

    const results = await Promise.all(
      Object.entries(translations).map(([key, value]) =>
        db.translation.upsert({
          where: {
            key_locale: { key, locale },
          },
          update: { value },
          create: {
            key,
            locale,
            value,
            context: context ?? null,
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('[PUT /api/cms/translations]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
