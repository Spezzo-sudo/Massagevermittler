'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { siteConfig } from '@/config/site';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/book', label: 'Booking' },
  { href: '/shop', label: 'Shop' },
  { href: '/customer/dashboard', label: 'Kundenbereich' },
  { href: '/therapist/dashboard', label: 'Mitarbeiter' }
];

type UserState = {
  email: string | null;
  role: string | null;
};

/** Global navigation bar with auth-aware links. */
export function Header() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userState, setUserState] = useState<UserState>({ email: null, role: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const profile = await fetch('/api/auth/role', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .catch(() => ({ role: null }));
      setUserState({
        email: data.session?.user?.email ?? null,
        role: profile?.role ?? null
      });
    });
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => null);
    window.location.href = '/';
  };

  const roleLabel = userState.role ? userState.role : 'Gast';

  return (
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm text-white">IM</span>
          {siteConfig.name}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex">
          {userState.email ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600">
                {roleLabel} · {userState.email}
              </span>
              <button onClick={handleLogout} className="rounded-full bg-slate-900 px-4 py-2 text-white">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/customer/login" className="text-slate-600 hover:text-slate-900">
                Login (Kunde)
              </Link>
              <Link href="/therapist/login" className="rounded-full bg-brand-500 px-4 py-2 text-white">
                Login (Mitarbeiter)
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <nav className="flex flex-col px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-700 hover:text-brand-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              {userState.email ? (
                <>
                  <div className="text-xs text-slate-500">
                    {roleLabel} · {userState.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/customer/login"
                    className="block w-full rounded-full border border-slate-200 px-4 py-2 text-center text-sm text-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login (Kunde)
                  </Link>
                  <Link
                    href="/therapist/login"
                    className="block w-full rounded-full bg-brand-500 px-4 py-2 text-center text-sm text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login (Mitarbeiter)
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
