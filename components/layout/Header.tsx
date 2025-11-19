'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { siteConfig } from '@/config/site';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/book', label: 'Buchen' },
  { href: '/shop', label: 'Shop' },
];

type UserState = {
  email: string | null;
  role: string | null;
};

export function Header() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userState, setUserState] = useState<UserState>({ email: null, role: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;

      // Wir holen die Rolle direkt vom API Endpoint, da Cookies im Client manchmal laggen
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
    try {
      await Promise.all([
        supabase.auth.signOut(),
        fetch('/api/auth/signout', { method: 'POST' })
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/';
    }
  };

  // Übersetzter Rollenname für die Anzeige
  const roleDisplay = userState.role === 'therapist' ? 'Therapeut:in' :
                      userState.role === 'admin' ? 'Admin' : 'Kunde';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-200">
            IM
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-600 transition-colors">
              {link.label}
            </Link>
          ))}
          {/* Dashboard Links basierend auf Rolle einblenden */}
          {userState.role === 'customer' && (
            <Link href="/(dashboard)/customer" className="hover:text-brand-600 transition-colors">Mein Bereich</Link>
          )}
          {userState.role === 'therapist' && (
            <Link href="/(dashboard)/therapist" className="hover:text-brand-600 transition-colors">Cockpit</Link>
          )}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {userState.email ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-semibold text-slate-900">{roleDisplay}</p>
                <p className="text-[10px] text-slate-500 max-w-[120px] truncate">{userState.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors px-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Partner Login: Dezent */}
              <Link
                href="/therapist/login"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 px-3 py-2 transition-colors"
              >
                Partner Login
              </Link>

              {/* Kunden Login: Auffällig (Call to Action) */}
              <Link
                href="/customer/login"
                className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-200 hover:bg-brand-600 hover:shadow-md transition-all transform active:scale-95"
              >
                Login / Registrieren
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-slate-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Menü</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4 shadow-xl absolute w-full">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-100 pt-4">
            {userState.email ? (
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-rose-600 font-medium">
                Logout ({userState.email})
              </button>
            ) : (
              <div className="grid gap-3 px-4">
                <Link href="/customer/login" className="flex justify-center items-center w-full rounded-xl bg-brand-500 py-3 text-white font-semibold">
                  Kunden Login
                </Link>
                <Link href="/therapist/login" className="flex justify-center items-center w-full rounded-xl border border-slate-200 py-3 text-slate-600 font-medium">
                  Partner Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
