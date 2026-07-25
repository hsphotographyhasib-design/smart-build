import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/analytics — Super Admin get analytics config (find or create default)
export async function GET() {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analytics = await db.analyticsConfig.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[GET /api/cms/analytics]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/cms/analytics — Super Admin update or create analytics config
export async function PUT(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      googleAnalytics,
      googleTagManager,
      microsoftClarity,
      metaPixel,
      linkedinInsight,
      facebookDomainVerification,
      headScripts,
      bodyScripts,
    } = body;

    const analytics = await db.analyticsConfig.upsert({
      where: { id: 'default' },
      update: {
        googleAnalytics: googleAnalytics ?? undefined,
        googleTagManager: googleTagManager ?? undefined,
        microsoftClarity: microsoftClarity ?? undefined,
        metaPixel: metaPixel ?? undefined,
        linkedinInsight: linkedinInsight ?? undefined,
        facebookDomainVerification: facebookDomainVerification ?? undefined,
        headScripts: headScripts ?? undefined,
        bodyScripts: bodyScripts ?? undefined,
      },
      create: {
        id: 'default',
        googleAnalytics: googleAnalytics ?? null,
        googleTagManager: googleTagManager ?? null,
        microsoftClarity: microsoftClarity ?? null,
        metaPixel: metaPixel ?? null,
        linkedinInsight: linkedinInsight ?? null,
        facebookDomainVerification: facebookDomainVerification ?? null,
        headScripts: headScripts ?? null,
        bodyScripts: bodyScripts ?? null,
      },
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[PUT /api/cms/analytics]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
