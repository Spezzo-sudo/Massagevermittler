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
      await fetch('/api/auth/ensure-profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      // fetch role to persist it in cookie for middleware gating
      await fetch('/api/auth/role', { headers: { Authorization: `Bearer ${token}` } });
      setDone(true);
    });
  }, [done, supabase]);

  return null;
}
