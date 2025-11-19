import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Konfiguration der geschützten Bereiche
const protectedPaths = {
  customer: '/(dashboard)/customer',
  therapist: '/(dashboard)/therapist',
  admin: '/admin',
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 1. Performance: Statische Dateien und API sofort durchlassen
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path.includes('.') // Dateien wie robots.txt, favicon.ico
  ) {
    return NextResponse.next();
  }

  // 2. Rolle aus dem Cookie lesen
  const role = request.cookies.get('sb-role')?.value;

  // 3. Prüfen, ob wir auf einer geschützten Route sind
  const isCustomerArea = path.startsWith(protectedPaths.customer);
  const isTherapistArea = path.startsWith(protectedPaths.therapist);
  const isAdminArea = path.startsWith(protectedPaths.admin);
  const isBooking = path.startsWith('/book');

  // Hilfsfunktion für Redirects, um Code zu sparen
  const redirect = (target: string) => {
    // Verhindert Redirect Loops: Wenn wir schon da sind, nichts tun
    if (path === target) return NextResponse.next();
    url.pathname = target;
    return NextResponse.redirect(url);
  };

  // 4. Regeln anwenden

  // Kunde versucht auf Kundenbereich zuzugreifen, ist aber kein Kunde
  if (isCustomerArea && role !== 'customer') {
    return redirect('/customer/login');
  }

  // Mitarbeiter versucht auf Mitarbeiterbereich zuzugreifen
  if (isTherapistArea && role !== 'therapist') {
    return redirect('/therapist/login');
  }

  // Admin Bereich Schutz
  if (isAdminArea && role !== 'admin') {
    // Nicht-Admins schicken wir sicherheitshalber zum Kunden-Login
    return redirect('/customer/login');
  }

  // Booking Seite erfordert irgendeinen Login
  if (isBooking && !role) {
    return redirect('/customer/login');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
