'use client';

import { useEffect, useMemo, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

/** Simple availability manager with list + quick add. */
export function TherapistAvailability() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/therapist/availability/get', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json?.slots) setSlots(json.slots);
    });
  }, [supabase]);

  const addSlot = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch('/api/therapists/availability', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: [{ start, end }] })
    });
    if (!res.ok) {
      const text = await res.text();
      setMessage(text || 'Slot konnte nicht angelegt werden.');
      return;
    }
    setSlots((prev) => [...prev, { id: crypto.randomUUID(), start_time: start, end_time: end, is_booked: false }]);
    setStart('');
    setEnd('');
    setMessage('Slot angelegt.');
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Termine & Verfügbarkeit</h2>
        <p className="text-sm text-slate-500">
          Plane Zeitslots, damit wir keine Doppelbuchungen erzeugen. Slots werden automatisch auf „gebucht“ gesetzt, sobald du eine Anfrage annimmst.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
        {slots.length === 0 ? (
          <p className="text-sm text-slate-500">Noch keine Slots. Füge einen neuen hinzu.</p>
        ) : (
          <ul className="space-y-2">
            {slots.map((slot) => (
              <li key={slot.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span>
                  {new Date(slot.start_time).toLocaleString()} – {new Date(slot.end_time).toLocaleTimeString()}
                </span>
                <span className={`text-xs font-semibold ${slot.is_booked ? 'text-rose-500' : 'text-brand-500'}`}>
                  {slot.is_booked ? 'Gebucht' : 'Verfügbar'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-slate-700">Start</p>
          <input type="datetime-local" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700">Ende</p>
          <input type="datetime-local" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <button type="button" className="w-full rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700" onClick={addSlot}>
        + Slot hinzufügen
      </button>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
