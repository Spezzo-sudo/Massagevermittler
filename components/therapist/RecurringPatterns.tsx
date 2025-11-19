'use client';

import { useState, useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type Pattern = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
};

const WEEKDAYS = [
  { value: 0, label: 'Sonntag' },
  { value: 1, label: 'Montag' },
  { value: 2, label: 'Dienstag' },
  { value: 3, label: 'Mittwoch' },
  { value: 4, label: 'Donnerstag' },
  { value: 5, label: 'Freitag' },
  { value: 6, label: 'Samstag' },
];

export function RecurringPatterns() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Generate slots state
  const [generateStartDate, setGenerateStartDate] = useState('');
  const [generateEndDate, setGenerateEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const res = await fetch('/api/therapist/availability-patterns', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json?.patterns) {
      setPatterns(json.patterns);
    }
    setLoading(false);
  };

  const addPattern = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const res = await fetch('/api/therapist/availability-patterns', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        valid_from: validFrom || null,
        valid_until: validUntil || null,
      }),
    });

    if (res.ok) {
      setMessage('Muster erfolgreich hinzugefügt');
      loadPatterns();
      setTimeout(() => setMessage(null), 3000);
    } else {
      const text = await res.text();
      setMessage(text || 'Fehler beim Hinzufügen');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const deletePattern = async (patternId: string) => {
    if (!confirm('Möchten Sie dieses Muster wirklich löschen?')) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const res = await fetch('/api/therapist/availability-patterns', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ patternId }),
    });

    if (res.ok) {
      setMessage('Muster gelöscht');
      loadPatterns();
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const generateSlots = async () => {
    if (!generateStartDate || !generateEndDate) {
      setMessage('Bitte Start- und Enddatum angeben');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setGenerating(true);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setGenerating(false);
      return;
    }

    const res = await fetch('/api/therapist/availability-patterns/generate-slots', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_date: generateStartDate,
        end_date: generateEndDate,
      }),
    });

    const json = await res.json();
    setMessage(json.message || json.error || 'Slots generiert');
    setGenerating(false);
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Wiederkehrende Verfügbarkeit</h2>
        <p className="text-sm text-slate-500">
          Setze wöchentliche Muster (z.B. "Jeden Montag 9-17 Uhr") und generiere automatisch Slots.
        </p>
      </div>

      {message && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-sm text-brand-800">
          {message}
        </div>
      )}

      {/* Add Pattern Form */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-slate-900">Neues Muster hinzufügen</h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Wochentag</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
            >
              {WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start-Zeit</label>
            <input
              type="time"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End-Zeit</label>
            <input
              type="time"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gültig ab (optional)
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gültig bis (optional)
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addPattern}
          className="w-full md:w-auto px-6 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          + Muster hinzufügen
        </button>
      </div>

      {/* Existing Patterns */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Aktive Muster</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Lädt...</p>
        ) : patterns.length === 0 ? (
          <p className="text-sm text-slate-500">Noch keine Muster. Fügen Sie oben ein Muster hinzu.</p>
        ) : (
          <div className="space-y-2">
            {patterns.map((pattern) => {
              const weekday = WEEKDAYS.find((d) => d.value === pattern.day_of_week);
              return (
                <div
                  key={pattern.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-brand-300 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {weekday?.label} · {pattern.start_time.substring(0, 5)} -{' '}
                      {pattern.end_time.substring(0, 5)}
                    </p>
                    {(pattern.valid_from || pattern.valid_until) && (
                      <p className="text-xs text-slate-500 mt-1">
                        {pattern.valid_from && `Ab ${new Date(pattern.valid_from).toLocaleDateString('de-DE')}`}
                        {pattern.valid_from && pattern.valid_until && ' · '}
                        {pattern.valid_until && `Bis ${new Date(pattern.valid_until).toLocaleDateString('de-DE')}`}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePattern(pattern.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Slots */}
      {patterns.length > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900">Slots aus Mustern generieren</h3>
            <p className="text-xs text-slate-600 mt-1">
              Erstellt automatisch Verfügbarkeits-Slots basierend auf Ihren Mustern
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Startdatum</label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={generateStartDate}
                onChange={(e) => setGenerateStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enddatum (max 90 Tage)</label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={generateEndDate}
                onChange={(e) => setGenerateEndDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={generateSlots}
            disabled={generating}
            className="w-full md:w-auto px-6 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generiert...' : 'Slots generieren'}
          </button>
        </div>
      )}
    </div>
  );
}
