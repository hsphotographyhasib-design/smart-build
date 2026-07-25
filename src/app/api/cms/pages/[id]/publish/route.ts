import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/cms/pages/[id]/publish — toggle published/draft, snapshot on publish
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.cmsPage.findUnique({
      where: { id },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Toggle: if currently published → unpublish, otherwise → publish
    const isCurrentlyPublished = existing.publishedAt !== null;

    if (isCurrentlyPublished) {
      // Unpublish
      const page = await db.cmsPage.update({
        where: { id },
        data: {
          publishedAt: null,
          status: 'draft',
        },
      });

      return NextResponse.json({
        data: page,
        message: 'Page unpublished successfully',
      });
    }

    // Publish — create a version snapshot first
    const version = await db.cmsPageVersion.create({
      data: {
        pageId: id,
        version: (existing.version ?? 0) + 1,
        data: {
          title: existing.title,
          slug: existing.slug,
          path: existing.path,
          description: existing.description,
          locale: existing.locale,
          seoTitle: existing.seoTitle,
          seoDescription: existing.seoDescription,
          seoKeywords: existing.seoKeywords,
          ogImage: existing.ogImage,
          canonicalUrl: existing.canonicalUrl,
          schemaMarkup: existing.schemaMarkup,
          isHomePage: existing.isHomePage,
          sections: existing.sections.map((section) => ({
            type: section.type,
            name: section.name,
            order: section.order,
            visible: section.visible,
            config: section.config,
            styles: section.styles,
          })),
        },
      },
    });

    const page = await db.cmsPage.update({
      where: { id },
      data: {
        publishedAt: new Date(),
        status: 'published',
      },
    });

    return NextResponse.json({
      data: page,
      version,
      message: 'Page published successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
