'use client';

import { useMemo, useState, useTransition } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type TherapistProfileFormProps = {
  initialBio?: string;
  initialLanguages?: string[];
  initialExperienceYears?: number;
  initialTravelRadiusKm?: number;
  initialPayoutMethod?: string;
  initialPayoutDetails?: string;
  initialPortfolioUrl?: string;
};

const payoutOptions = ['promptpay', 'bank_transfer', 'cash'];

/** Collects bio, languages and payout details for therapist onboarding. */
export function TherapistProfileForm({
  initialBio = '',
  initialLanguages = [],
  initialExperienceYears = 1,
  initialTravelRadiusKm = 5,
  initialPayoutMethod = 'promptpay',
  initialPayoutDetails = '',
  initialPortfolioUrl = ''
}: TherapistProfileFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [bio, setBio] = useState(initialBio);
  const [languages, setLanguages] = useState(initialLanguages.join(', '));
  const [experienceYears, setExperienceYears] = useState(initialExperienceYears);
  const [travelRadiusKm, setTravelRadiusKm] = useState(initialTravelRadiusKm);
  const [payoutMethod, setPayoutMethod] = useState(initialPayoutMethod);
  const [payoutDetails, setPayoutDetails] = useState(initialPayoutDetails);
  const [portfolioUrl, setPortfolioUrl] = useState(initialPortfolioUrl);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      bio,
      languages: languages
        .split(',')
        .map((lang) => lang.trim())
        .filter(Boolean),
      experienceYears,
      travelRadiusKm,
      payoutMethod,
      payoutDetails,
      portfolioUrl
    };

    startTransition(async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setStatus('Bitte zuerst einloggen.');
        return;
      }

      const response = await fetch('/api/therapists/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const text = await response.text();
        setStatus(text || 'Fehler beim Speichern.');
        return;
      }
      setStatus('Profil gespeichert – Admin prüft jetzt deine Angaben.');
    });
  };

  return (
    <form className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Dein Profil</h2>
        <p className="text-sm text-slate-500">Bio, Sprachen und Arbeitsradius helfen beim Matching.</p>
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        Bio
        <textarea className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Sprachen (durch Komma trennen)
        <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={languages} onChange={(event) => setLanguages(event.target.value)} placeholder="Deutsch, Englisch, Thai" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Erfahrung (Jahre)
          <input type="number" min={0} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={experienceYears} onChange={(event) => setExperienceYears(Number(event.target.value))} />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Reise-Radius (km)
          <input type="number" min={1} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={travelRadiusKm} onChange={(event) => setTravelRadiusKm(Number(event.target.value))} />
        </label>
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        Portfolio URL (optional)
        <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} placeholder="https://instagram.com/deinprofil" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Auszahlungsmethode
          <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)}>
            {payoutOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Auszahlung Details
          <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={payoutDetails} onChange={(event) => setPayoutDetails(event.target.value)} placeholder="z.B. PromptPay +6691..." />
        </label>
      </div>
      <button type="submit" className="w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white shadow disabled:opacity-60" disabled={isPending}>
        {isPending ? 'Speichere...' : 'Profil speichern'}
      </button>
      {status ? <p className="text-sm text-slate-500">{status}</p> : null}
    </form>
  );
}
