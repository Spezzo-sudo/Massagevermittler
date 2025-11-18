'use client';

import { useEffect, useMemo, useState } from 'react';

import { RoleGate } from '@/components/auth/RoleGate';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type TherapistRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  onboarding_status: string;
};

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [therapists, setTherapists] = useState<TherapistRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/admin/therapists', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json?.therapists) setTherapists(json.therapists);
    });
  }, [supabase]);

  const approve = async (id: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch(`/api/admin/therapists/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const text = await res.text();
      setMessage(text || 'Fehler beim Freischalten.');
      return;
    }
    setTherapists((prev) => prev.map((t) => (t.id === id ? { ...t, onboarding_status: 'approved' } : t)));
    setMessage('Freigeschaltet.');
  };

  return (
    <RoleGate allowed={['admin']} fallback="/customer/login">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div>
          <p className="text-sm uppercase text-slate-400">Admin Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">Therapeut:innen prüfen</h1>
        </div>
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow">
          {therapists.length === 0 ? (
            <p className="text-sm text-slate-500">Keine Bewerbungen.</p>
          ) : (
            therapists.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.full_name ?? 'ohne Namen'}</p>
                  <p className="text-xs text-slate-500">Status: {t.onboarding_status}</p>
                  <p className="text-xs text-slate-500">{t.phone}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  {t.onboarding_status !== 'approved' ? (
                    <button className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-600" onClick={() => approve(t.id)}>
                      Freischalten
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Bereits freigeschaltet</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      </div>
    </RoleGate>
  );
}
