import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/blog — paginated blog list with filters
export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') ?? undefined;
    const locale = searchParams.get('locale') ?? undefined;
    const category = searchParams.get('category') ?? undefined;
    const tag = searchParams.get('tag') ?? undefined;
    const featured = searchParams.get('featured') ?? undefined;
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 10)));

    const where: Record<string, unknown> = {
      ...(status === 'published'
        ? { publishedAt: { not: null } }
        : status === 'draft'
          ? { publishedAt: null }
          : {}),
      ...(locale && { locale }),
      ...(featured === 'true' && { featured: true }),
      ...(category && {
        categories: { some: { category: { slug: category } } },
      }),
      ...(tag && {
        postTags: { some: { tag: { slug: tag } } },
      }),
    };

    const [posts, total] = await Promise.all([
      db.cmsBlogPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            include: { category: true },
          },
          postTags: {
            include: { tag: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      db.cmsBlogPost.count({ where }),
    ]);

    return NextResponse.json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/cms/blog — create a blog post
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      locale,
      status,
      featured,
      categoryIds,
      tagIds,
    } = body;

    const post = await db.cmsBlogPost.create({
      data: {
        title,
        slug,
        content: content ?? '',
        excerpt: excerpt ?? null,
        coverImage: coverImage ?? null,
        locale: locale ?? 'en',
        status: status ?? 'draft',
        featured: featured ?? false,
        ...(body.publishedAt && { publishedAt: new Date(body.publishedAt) }),
        categories: {
          create: (categoryIds ?? []).map((categoryId: string) => ({
            category: { connect: { id: categoryId } },
          })),
        },
        postTags: {
          create: (tagIds ?? []).map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        categories: { include: { category: true } },
        postTags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
