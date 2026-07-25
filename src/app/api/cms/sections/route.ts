import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/cms/sections — create a new section
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pageId, type, name, order, visible, config, styles } = body;

    // Verify the page exists
    const page = await db.cmsPage.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const section = await db.cmsSection.create({
      data: {
        pageId,
        type,
        name: name ?? null,
        order: order ?? 0,
        visible: visible ?? true,
        config: config ?? undefined,
        styles: styles ?? undefined,
      },
    });

    return NextResponse.json({ data: section }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
