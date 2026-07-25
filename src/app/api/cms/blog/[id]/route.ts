import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/cms/blog/[id] — single blog post with relations
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const post = await db.cmsBlogPost.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        postTags: { include: { tag: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ data: post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/cms/blog/[id] — update blog post (reconnect categories & tags)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

    // If categoryIds or tagIds provided, delete old relations and reconnect
    if (categoryIds !== undefined) {
      await db.cmsBlogPostCategory.deleteMany({ where: { postId: id } });
    }
    if (tagIds !== undefined) {
      await db.cmsBlogPostTag.deleteMany({ where: { postId: id } });
    }

    const post = await db.cmsBlogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(locale !== undefined && { locale }),
        ...(status !== undefined && { status }),
        ...(featured !== undefined && { featured }),
        ...(categoryIds !== undefined && {
          categories: {
            create: categoryIds.map((categoryId: string) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        }),
        ...(tagIds !== undefined && {
          postTags: {
            create: tagIds.map((tagId: string) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
      },
      include: {
        categories: { include: { category: true } },
        postTags: { include: { tag: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ data: post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/cms/blog/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Clean up relations
    await db.cmsBlogPostCategory.deleteMany({ where: { postId: id } });
    await db.cmsBlogPostTag.deleteMany({ where: { postId: id } });
    await db.cmsBlogComment.deleteMany({ where: { postId: id } });

    await db.cmsBlogPost.delete({ where: { id } });

    return NextResponse.json({ data: { id }, message: 'Blog post deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
