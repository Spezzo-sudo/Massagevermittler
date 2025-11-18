import { useEffect, useMemo, useState } from 'react';

import { RoleGate } from '@/components/auth/RoleGate';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type Booking = {
  id: string;
  service_id: number;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  price: number;
  notes: string | null;
};

export default function CustomerDashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/customer/bookings', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json?.bookings) setBookings(json.bookings);
      setLoading(false);
    });
  }, [supabase]);

  const cancelBooking = async (id: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch(`/api/customer/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const text = await res.text();
      setMessage(text || 'Konnte nicht stornieren.');
      return;
    }
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setMessage('Buchung storniert.');
  };

  return (
    <RoleGate allowed={['customer']} fallback="/customer/login">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div>
          <p className="text-sm uppercase text-slate-400">Customer Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">Deine Buchungen</h1>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Lade Buchungen...</p>
        ) : (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-500">Keine Buchungen. Starte eine unter /book.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Service #{booking.service_id} · {new Date(booking.start_time).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">Status: {booking.status}</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      {booking.status === 'pending' || booking.status === 'confirmed' ? (
                        <button
                          className="rounded-full border border-rose-200 px-3 py-1 text-rose-600"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Stornieren
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </RoleGate>
  );
}
