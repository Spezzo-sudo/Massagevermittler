'use client';

import { useMemo, useState, useTransition } from 'react';

import { massageServices } from '@/features/booking/constants';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type TherapistServiceSelectorProps = {
  initialSelections?: number[];
};

/** Allows a therapist to toggle which services they offer. */
export function TherapistServiceSelector({ initialSelections = [] }: TherapistServiceSelectorProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set(initialSelections));
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleService = (id: number) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setStatus('Bitte einloggen, um Services zu speichern.');
        return;
      }

      const response = await fetch('/api/therapists/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ serviceIds: Array.from(selectedServices) })
      });
      if (!response.ok) {
        const text = await response.text();
        setStatus(text || 'Fehler beim Speichern.');
        return;
      }
      setStatus('Services aktualisiert – Kunden sehen jetzt deine Verfügbarkeit.');
    });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Welche Massagen bietest du an?</h2>
        <p className="text-sm text-slate-500">Kunden sehen später nur Profile, die den gewünschten Service aktiv haben.</p>
      </div>
      <div className="space-y-3">
        {massageServices.map((service) => {
          const checked = selectedServices.has(service.id);
          return (
            <label key={service.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={checked} onChange={() => toggleService(service.id)} />
              <div>
                <p className="text-sm font-semibold text-slate-800">{service.name}</p>
                <p className="text-xs text-slate-500">
                  {service.durationMinutes} Min · Basispreis {service.price} THB
                </p>
              </div>
            </label>
          );
        })}
      </div>
      <button type="button" className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow disabled:opacity-60" onClick={handleSubmit} disabled={isPending}>
        {isPending ? 'Speichere...' : 'Services speichern'}
      </button>
      {status ? <p className="text-sm text-slate-500">{status}</p> : null}
    </div>
  );
}
