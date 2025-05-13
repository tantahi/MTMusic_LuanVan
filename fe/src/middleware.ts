import { NextRequest, NextResponse } from 'next/server';
import { getCookie, parseJSON } from '@/lib/utils';
import type { NextMiddleware } from 'next/server';

export const middleware: NextMiddleware = async (req: NextRequest) => {
  const cookies = req.headers.get('cookie') || '';
  const token = getCookie(cookies, 'token');
  const user = parseJSON(getCookie(cookies, 'user'));

  // If no token or user data, redirect to login
  if (!token || !user || !user.role) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Check if the request is for the sign-in page
  if (req.nextUrl.pathname === '/admin/auth/signin') {
    return NextResponse.next();
  }

  // Allow admin and staff to access all routes
  if (user.role === 'Admin' || user.role === 'Staff') {
    return NextResponse.next();
  } else {
    // For other roles, redirect to home if trying to access admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Continue to the requested page for all other cases
  return NextResponse.next();
};

export const config = {
  matcher: ['/admin/:path*'],
};