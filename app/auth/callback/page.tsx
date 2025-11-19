'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [message, setMessage] = useState('Prüfe Magic Link ...');

  useEffect(() => {
    if (!code) {
      setMessage('Kein Code gefunden. Bitte Link erneut öffnen.');
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage('Erfolgreich angemeldet. Weiterleitung ...');
        router.replace(next as any);
      })
      .catch((error) => setMessage(error.message));
  }, [code, next, router, supabase]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow">
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}
