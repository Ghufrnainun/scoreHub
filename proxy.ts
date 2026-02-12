import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const controlMatch = pathname.match(/^\/match\/([^/]+)\/control$/);
  if (controlMatch) {
    const matchId = controlMatch[1];
    const role = searchParams.get('role');

    if (role === 'referee') {
      const url = request.nextUrl.clone();
      url.pathname = `/referee/match/${matchId}`;
      url.search = '';
      return NextResponse.redirect(url);
    }

    if (role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = `/admin/matches/${matchId}/control`;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/match/:path*'],
};
