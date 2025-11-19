'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type AuthCardProps = {
  mode: 'sign-in' | 'sign-up';
  targetRole?: 'customer' | 'therapist' | 'admin';
  redirectTo?: string;
  onModeChange?: (newMode: 'sign-in' | 'sign-up') => void;
  signUpLink?: string;
  signInLink?: string;
};

export function AuthCard({ mode, targetRole, redirectTo, onModeChange, signUpLink, signInLink }: AuthCardProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // 1. Supabase Auth Anfrage
      const { data: authData, error } = mode === 'sign-up'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (!authData.session) {
        setMessage('Bitte bestätige deine E-Mail-Adresse.');
        setIsLoading(false);
        return;
      }

      const token = authData.session.access_token;

      // 2. Profil in DB sicherstellen (Wichtig für neue User)
      if (mode === 'sign-up') {
        setMessage('Erstelle Profil...');
        await fetch('/api/auth/ensure-profile', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: targetRole })
        });
      }

      // 3. WICHTIG: Rolle abfragen, damit das Cookie gesetzt wird!
      // Ohne diesen Schritt blockiert die Middleware den Zugriff.
      setMessage('Anmeldung wird abgeschlossen...');
      await fetch('/api/auth/role', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 4. Erfolgreich -> Weiterleitung
      setMessage('Erfolgreich! Du wirst weitergeleitet...');

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh(); // Wichtig: Lädt Server-Komponenten neu (Header Status etc.)
      } else {
        // Fallback
        router.push('/');
      }

    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Invalid login credentials')) {
        setMessage('E-Mail oder Passwort falsch.');
      } else if (errorMessage.includes('User already registered')) {
        setMessage('Diese E-Mail ist bereits registriert.');
      } else {
        setMessage(errorMessage); // Fallback für andere Fehler
      }
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-slate-900">
        {mode === 'sign-in' ? 'Willkommen zurück' : 'Konto erstellen'}
      </h1>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-700">E-Mail</label>
        <input
          type="email"
          autoComplete="username"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-700">Passwort</label>
        <input
          type="password"
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
      </div>

      <button
        className="w-full rounded-full bg-brand-500 py-3 font-semibold text-white shadow-md hover:bg-brand-600 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        disabled={isLoading}
      >
        {isLoading ? 'Einen Moment...' : mode === 'sign-in' ? 'Anmelden' : 'Registrieren'}
      </button>

      {message && (
        <div className={`text-sm p-3 rounded-lg text-center ${message.includes('Erfolgreich') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
          {message}
        </div>
      )}

      <div className="border-t border-slate-100 pt-4 mt-2">
        <p className="text-center text-sm text-slate-500">
          {mode === 'sign-in' ? 'Noch kein Konto? ' : 'Bereits registriert? '}
          {signUpLink ? (
            <Link href={signUpLink} className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Jetzt registrieren
            </Link>
          ) : signInLink ? (
            <Link href={signInLink} className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Anmelden
            </Link>
          ) : onModeChange ? (
            <button
              type="button"
              onClick={() => onModeChange(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              {mode === 'sign-in' ? 'Jetzt registrieren' : 'Anmelden'}
            </button>
          ) : null}
        </p>
      </div>
    </form>
  );
}
