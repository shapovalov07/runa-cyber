import { NextResponse } from 'next/server';

const FRANCHISE_HOSTS = new Set(['franchise.runa-cyber.ru']);

const isAssetPath = (pathname) =>
  pathname.startsWith('/_next') ||
  pathname.startsWith('/api') ||
  pathname.startsWith('/images') ||
  pathname.startsWith('/uploads') ||
  pathname === '/favicon.ico' ||
  pathname === '/robots.txt' ||
  pathname === '/sitemap.xml';

export function proxy(request) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase() || '';
  const { pathname } = request.nextUrl;

  if (!FRANCHISE_HOSTS.has(host) || isAssetPath(pathname) || pathname === '/franchise') {
    return NextResponse.next();
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/franchise';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
