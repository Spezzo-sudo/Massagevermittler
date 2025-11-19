'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type AuthCardProps = {
  mode: 'sign-in' | 'sign-up';
  targetRole?: 'customer' | 'therapist' | 'admin';
  redirectTo?: string;
  onModeChange?: (newMode: 'sign-in' | 'sign-up') => void;
  signUpLink?: string;
  signInLink?: string;
};

/** Email + Passwort Auth powered by Supabase. */
export function AuthCard({ mode, targetRole, redirectTo, onModeChange, signUpLink, signInLink }: AuthCardProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(mode === 'sign-up' ? 'Account wird erstellt ...' : 'Anmeldung läuft ...');

    try {
      if (mode === 'sign-up') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account erstellt. Du bist jetzt eingeloggt.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Erfolgreich angemeldet.');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      // Improve error messages for common cases
      if (errorMessage.includes('User already registered')) {
        setMessage(
          mode === 'sign-up'
            ? 'Diese E-Mail ist bereits registriert. Bitte logge dich ein oder verwende eine andere E-Mail.'
            : 'Falsche Anmeldedaten.'
        );
      } else if (errorMessage.includes('Invalid login credentials')) {
        setMessage('E-Mail oder Passwort falsch. Bitte überprüfe deine Eingaben.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setMessage('Bitte bestätige zuerst deine E-Mail-Adresse.');
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }

    // ensure profile + role
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      await fetch('/api/auth/ensure-profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: targetRole })
      }).catch(() => null);
    }

    if (redirectTo) {
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 300);
    }
  };

  return (
    <form className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-slate-900">
        {mode === 'sign-in' ? 'Willkommen zurück' : 'Account erstellen'}
      </h1>
      <p className="text-sm text-slate-600">
        Wir nutzen Supabase Auth mit E-Mail und Passwort. Du kannst später zusätzlich Social Login ergänzen.
      </p>
      <label className="block space-y-2 text-sm">
        <span className="font-semibold text-slate-700">E-Mail</span>
        <input
          type="email"
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="font-semibold text-slate-700">Passwort</span>
        <input
          type="password"
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <button className="w-full rounded-full bg-brand-500 py-3 font-semibold text-white disabled:opacity-60" disabled={isLoading}>
        {isLoading ? 'Bitte warten...' : mode === 'sign-in' ? 'Einloggen' : 'Registrieren'}
      </button>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      <div className="border-t border-slate-200 pt-4">
        <p className="text-center text-sm text-slate-600">
          {mode === 'sign-in' ? (
            <>
              Noch kein Account?{' '}
              {signUpLink ? (
                <Link href={signUpLink} className="font-semibold text-brand-600 hover:underline">
                  Jetzt registrieren
                </Link>
              ) : onModeChange ? (
                <button
                  type="button"
                  onClick={() => onModeChange('sign-up')}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  Jetzt registrieren
                </button>
              ) : null}
            </>
          ) : (
            <>
              Bereits registriert?{' '}
              {signInLink ? (
                <Link href={signInLink} className="font-semibold text-brand-600 hover:underline">
                  Einloggen
                </Link>
              ) : onModeChange ? (
                <button
                  type="button"
                  onClick={() => onModeChange('sign-in')}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  Einloggen
                </button>
              ) : null}
            </>
          )}
        </p>
      </div>
    </form>
  );
}
