'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';

import { RoleGate } from '@/components/auth/RoleGate';
import { AvailabilityCalendar } from '@/components/therapist/AvailabilityCalendar';
import { RecurringPatterns } from '@/components/therapist/RecurringPatterns';
import { TherapistProfileForm } from '@/components/therapist/TherapistProfileForm';
import { TherapistServiceSelector } from '@/components/therapist/TherapistServiceSelector';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { massageServices } from '@/features/booking/constants';

type Booking = {
  id: string;
  start_time: string;
  status: string;
  price: number;
  service_id: number;
  notes: string | null;
};

const serviceMap = Object.fromEntries(
  massageServices.map(s => [s.id, s])
);

/** Therapist portal overview with onboarding modules and request list. */
export default function TherapistDashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      try {
        const token = data.session?.access_token;
        if (!token) return;
        const res = await fetch('/api/therapist/bookings', { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json?.bookings) setBookings(json.bookings);
      } finally {
        setLoading(false);
      }
    });
  }, [supabase]);

  const updateStatus = async (id: string, status: string, actionName: string) => {
    const confirmMessage = status === 'rejected'
      ? 'Möchten Sie diese Buchung wirklich ablehnen?'
      : `Möchten Sie diese Buchung wirklich ${actionName}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

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
    setMessage(`Buchung erfolgreich ${actionName}.`);
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
        <RecurringPatterns />
        <AvailabilityCalendar />
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Anfragen & Buchungen</h2>
            <span className="text-xs uppercase text-slate-400">Realtime (Demo)</span>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Lade Anfragen...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-slate-500">Keine Anfragen.</p>
          ) : (
            bookings.map((booking) => {
              const service = serviceMap[booking.service_id];
              return (
                <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {service?.name ?? `Service #${booking.service_id}`} · {new Date(booking.start_time).toLocaleString('de-DE')}
                    </p>
                    <p className="text-xs text-slate-500">
                      Dauer: {service?.durationMinutes ?? '–'} Min · Preis: {booking.price} THB · Status: {booking.status}
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-slate-500 mt-1">Hinweise: {booking.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 text-sm">
                    {booking.status === 'pending' ? (
                      <>
                        <button
                          className="rounded-full border border-brand-200 px-3 py-1 text-brand-600 hover:bg-brand-50 transition-colors"
                          onClick={() => updateStatus(booking.id, 'accepted', 'angenommen')}
                        >
                          Annehmen
                        </button>
                        <button
                          className="rounded-full border border-rose-200 px-3 py-1 text-rose-600 hover:bg-rose-50 transition-colors"
                          onClick={() => updateStatus(booking.id, 'rejected', 'abgelehnt')}
                        >
                          Ablehnen
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">Keine Aktionen</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {message ? <p className="text-sm text-brand-600">{message}</p> : null}
        </div>
      </div>
    </RoleGate>
  );
}
