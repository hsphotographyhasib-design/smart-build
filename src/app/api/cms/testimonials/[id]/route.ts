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
    const { name, position, company, content, avatar, featured, status, order } = body;

    const testimonial = await db.cmsTestimonial.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(position !== undefined && { position }),
        ...(company !== undefined && { company }),
        ...(content !== undefined && { content }),
        ...(avatar !== undefined && { avatar }),
        ...(featured !== undefined && { featured }),
        ...(status !== undefined && { status }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(testimonial);
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

    await db.cmsTestimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
