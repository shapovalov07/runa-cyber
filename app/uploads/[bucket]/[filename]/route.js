import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
  '.ogv': 'video/ogg',
};

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const isValidSegment = (value) => /^[a-z0-9._-]+$/i.test(value);

const resolveContentType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
};

export async function GET(_request, { params }) {
  const routeParams = await params;
  const bucket = getText(routeParams?.bucket);
  const filename = getText(routeParams?.filename);

  if (!isValidSegment(bucket) || !isValidSegment(filename)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
  const filePath = path.resolve(uploadsRoot, bucket, filename);

  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': resolveContentType(filename),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
