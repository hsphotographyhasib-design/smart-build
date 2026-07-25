import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/landing — PUBLIC: fetch all landing page data in one call
export async function GET() {
  try {
    const [page, testimonials, faqs, partners, plans, menu, blogPosts, caseStudies] = await Promise.all([
      // Published home page with visible sections ordered
      db.cmsPage.findFirst({
        where: { slug: 'home', status: 'PUBLISHED' },
        include: { sections: { where: { visible: true }, orderBy: { order: 'asc' } } },
      }),
      // Published testimonials
      db.cmsTestimonial.findMany({
        where: { status: 'published' },
        orderBy: { order: 'asc' },
      }),
      // Published FAQs
      db.cmsFaq.findMany({
        where: { status: 'published' },
        orderBy: { order: 'asc' },
      }),
      // Active partners
      db.cmsPartner.findMany({
        where: { status: 'active' },
        orderBy: { order: 'asc' },
      }),
      // Active subscription plans
      db.subscriptionPlan.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { order: 'asc' },
      }),
      // Main menu items — 2 levels deep
      db.cmsMenuItem.findMany({
        where: { menu: 'main', locale: 'en', parentId: null, visible: true },
        include: {
          children: {
            where: { visible: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      }),
      // Published blog posts (latest 6)
      db.cmsBlogPost.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 6,
      }),
      // Published case studies
      db.cmsCaseStudy.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 6,
      }),
    ]);

    return NextResponse.json({
      page,
      testimonials,
      faqs,
      partners,
      plans,
      menu,
      blogPosts,
      caseStudies,
    });
  } catch (error) {
    console.error('[GET /api/cms/landing]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
