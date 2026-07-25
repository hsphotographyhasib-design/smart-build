import { db } from '@/lib/db';
import { getSuperAdminUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'cms');

// GET /api/cms/media — list media with filters
export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') ?? undefined;
    const folder = searchParams.get('folder') ?? undefined;
    const search = searchParams.get('search') ?? undefined;

    const media = await db.cmsMedia.findMany({
      where: {
        ...(type && { type }),
        ...(folder && { folder }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { alt: { contains: search } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: media });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/cms/media — upload a file
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) ?? '';
    const alt = (formData.get('alt') as string) ?? '';
    const tags = (formData.get('tags') as string) ?? '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure upload directory exists
    const dirPath = path.join(UPLOAD_DIR, folder);
    await mkdir(dirPath, { recursive: true });

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename to avoid collisions
    const ext = path.extname(file.name) || '';
    const baseName = path.basename(file.name, ext);
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(dirPath, uniqueName);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Build public URL
    const publicPath = `/cms/${folder ? `${folder}/` : ''}${uniqueName}`;

    // Determine media type
    const mime = file.type;
    let type: 'image' | 'video' | 'document' | 'other' = 'other';
    if (mime.startsWith('image/')) type = 'image';
    else if (mime.startsWith('video/')) type = 'video';
    else if (
      mime.includes('pdf') ||
      mime.includes('document') ||
      mime.includes('sheet') ||
      mime.includes('text')
    ) {
      type = 'document';
    }

    // Parse tags
    const parsedTags = tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Create database record
    const media = await db.cmsMedia.create({
      data: {
        name: file.name,
        url: publicPath,
        type,
        mimeType: mime,
        size: buffer.length,
        folder: folder || '/',
        alt: alt || null,
        tags: parsedTags.length > 0 ? JSON.stringify(parsedTags) : '[]',
      },
    });

    return NextResponse.json({ data: media }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
