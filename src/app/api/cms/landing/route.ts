import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/landing — PUBLIC (no auth) fetch landing page data in parallel
export async function GET() {
  try {
    const [
      page,
      testimonials,
      faqs,
      partners,
      plans,
      menu,
    ] = await Promise.all([
      // Published home page with visible sections ordered
      db.cmsPage.findFirst({
        where: {
          slug: 'home',
          status: 'PUBLISHED',
        },
        include: {
          sections: {
            where: { visible: true },
            orderBy: { order: 'asc' },
          },
        },
      }),

      // Published testimonials ordered
      db.testimonial.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { order: 'asc' },
      }),

      // Published FAQs ordered
      db.faq.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { order: 'asc' },
      }),

      // Active partners ordered
      db.partner.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { order: 'asc' },
      }),

      // Active subscription plans ordered
      db.subscriptionPlan.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { order: 'asc' },
      }),

      // Main menu items — 3 levels deep, visible only
      db.menuItem.findMany({
        where: {
          menu: 'main',
          locale: 'en',
          parentId: null,
          visible: true,
        },
        include: {
          children: {
            where: {
              visible: true,
            },
            include: {
              children: {
                where: {
                  visible: true,
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      }),
    ]);

    return NextResponse.json({
      page,
      testimonials,
      faqs,
      partners,
      plans,
      menu,
    });
  } catch (error) {
    console.error('[GET /api/cms/landing]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
