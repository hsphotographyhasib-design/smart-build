import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/menus — Get menu items nested 2 levels deep
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menu = searchParams.get('menu') || 'main';
    const locale = searchParams.get('locale') || 'en';

    const items = await db.cmsMenuItem.findMany({
      where: {
        menu,
        locale,
        parentId: null,
      },
      include: {
        children: {
          where: { parentId: { not: null } },
          include: {
            children: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('[GET /api/cms/menus]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/cms/menus — Super Admin create a menu item
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { label, url, type, parentId, icon, target, order, visible, locale, menu } = body;

    if (!label) {
      return NextResponse.json({ error: 'label is required' }, { status: 400 });
    }

    const item = await db.cmsMenuItem.create({
      data: {
        label,
        url: url ?? null,
        type: type ?? 'LINK',
        parentId: parentId ?? null,
        icon: icon ?? null,
        target: target ?? '_self',
        order: order ?? 0,
        visible: visible ?? true,
        locale: locale ?? 'en',
        menu: menu ?? 'main',
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cms/menus]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
