import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedCustomerPaths = ['/customer/dashboard'];
const protectedTherapistPaths = ['/therapist/dashboard'];
const protectedAdminPaths = ['/admin'];
const requireLoginPaths = ['/book']; // Booking nur für eingeloggte Nutzer

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // only guard protected paths; allow API and static assets
  if (path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/fonts') || path.startsWith('/public')) {
    return NextResponse.next();
  }

  const role = request.cookies.get('sb-role')?.value;
  const isCustomerArea = protectedCustomerPaths.some((p) => path.startsWith(p));
  const isTherapistArea = protectedTherapistPaths.some((p) => path.startsWith(p));
  const isAdminArea = protectedAdminPaths.some((p) => path.startsWith(p));

  if (isCustomerArea && role !== 'customer') {
    url.pathname = '/customer/login';
    return NextResponse.redirect(url);
  }

  if (isTherapistArea && role !== 'therapist') {
    url.pathname = '/therapist/login';
    return NextResponse.redirect(url);
  }

  if (isAdminArea && role !== 'admin') {
    url.pathname = '/customer/login';
    return NextResponse.redirect(url);
  }

  if (requireLoginPaths.some((p) => path.startsWith(p)) && !role) {
    url.pathname = '/customer/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico|.*\\..*).*)']
};
