'use client';

import { useEffect, useMemo, useState } from 'react';

import { RoleGate } from '@/components/auth/RoleGate';
import { TherapistAvailability } from '@/components/therapist/TherapistAvailability';
import { TherapistProfileForm } from '@/components/therapist/TherapistProfileForm';
import { TherapistServiceSelector } from '@/components/therapist/TherapistServiceSelector';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type Booking = {
  id: string;
  start_time: string;
  status: string;
  price: number;
  service_id: number;
  notes: string | null;
};

/** Therapist portal overview with onboarding modules and request list. */
export default function TherapistDashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/therapist/bookings', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json?.bookings) setBookings(json.bookings);
    });
  }, [supabase]);

  const updateStatus = async (id: string, status: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch(`/api/therapist/bookings/${id}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const text = await res.text();
      setMessage(text || 'Fehler beim Updaten.');
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  return (
    <RoleGate allowed={['therapist']} fallback="/therapist/login">
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
        <div>
          <p className="text-sm uppercase text-slate-400">Therapist Portal</p>
          <h1 className="text-3xl font-semibold text-slate-900">Profil, Services und Anfragen verwalten.</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <TherapistProfileForm />
          <TherapistServiceSelector />
        </div>
        <TherapistAvailability />
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Anfragen & Buchungen</h2>
            <span className="text-xs uppercase text-slate-400">Realtime (Demo)</span>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-500">Keine Anfragen.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Service #{booking.service_id} · {new Date(booking.start_time).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">Status: {booking.status}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  {booking.status === 'pending' ? (
                    <>
                      <button className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-600" onClick={() => updateStatus(booking.id, 'accepted')}>
                        Annehmen
                      </button>
                      <button className="rounded-full border border-rose-200 px-3 py-1 text-rose-600" onClick={() => updateStatus(booking.id, 'rejected')}>
                        Ablehnen
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">Keine Aktionen</span>
                  )}
                </div>
              </div>
            ))
          )}
          {message ? <p className="text-sm text-slate-500">{message}</p> : null}
        </div>
      </div>
    </RoleGate>
  );
}
