import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle SSO callback redirects
  if (request.nextUrl.pathname.includes('/sso-callback')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }
  
  // All other routes continue normally
  return new NextResponse();
}

export const config = {
  matcher: ['/sign-in/sso-callback(.*)', '/sign-up/sso-callback(.*)'],
}; 