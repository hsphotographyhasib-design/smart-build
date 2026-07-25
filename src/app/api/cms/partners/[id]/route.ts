import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSuperAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, logo, url, category, order } = body;

    const partner = await db.cmsPartner.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(logo !== undefined && { logo }),
        ...(url !== undefined && { url }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(partner);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSuperAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.cmsPartner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
