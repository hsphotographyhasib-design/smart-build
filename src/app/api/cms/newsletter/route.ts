import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/newsletter — Super Admin list all subscribers
export async function GET() {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscribers = await db.cmsNewsletter.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('[GET /api/cms/newsletter]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/cms/newsletter — PUBLIC (no auth) subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const subscriber = await db.cmsNewsletter.upsert({
      where: { email },
      update: { email },
      create: { email },
    });

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error: unknown) {
    console.error('[POST /api/cms/newsletter]', error);

    // Prisma unique constraint violation — already subscribed
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'This email is already subscribed', code: 'P2002' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
