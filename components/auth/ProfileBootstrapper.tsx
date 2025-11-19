'use client';

import { useEffect, useMemo, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

/** Ensures a profiles-Eintrag existiert, sobald eine Session vorhanden ist. */
export function ProfileBootstrapper() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        return;
      }
      // Only fetch role and set cookie - do NOT create profile here
      // Profile creation should only happen during registration via AuthCard
      await fetch('/api/auth/role', { headers: { Authorization: `Bearer ${token}` } });
      setDone(true);
    });
  }, [done, supabase]);

  return null;
}
