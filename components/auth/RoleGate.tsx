'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type RoleGateProps = {
  allowed: Array<'customer' | 'therapist' | 'admin'>;
  fallback?: string;
  children: React.ReactNode;
};

/** Client-side role gate to prevent rendering when role is missing/wrong. */
export function RoleGate({ allowed, fallback = '/customer/login', children }: RoleGateProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [canView, setCanView] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        router.replace(fallback as any);
        return;
      }
      const profile = await fetch('/api/auth/role', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .catch(() => ({ role: null }));
      if (!profile?.role || !allowed.includes(profile.role)) {
        router.replace(fallback as any);
        return;
      }
      setCanView(true);
    });
  }, [allowed, fallback, router, supabase]);

  if (!canView) {
    return null;
  }
  return <>{children}</>;
}
