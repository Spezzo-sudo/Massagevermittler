'use client';

import { useEffect, useState } from 'react';

type Therapist = {
  id: string;
  onboarding_status: string;
  bio?: string;
  travel_radius_km?: number;
  avg_rating?: number;
  languages_spoken?: string[];
  profile?: {
    full_name?: string;
    email?: string;
  };
};

/**
 * Admin panel for approving/rejecting therapist applications
 */
export function TherapistApprovalPanel() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    fetchTherapists();
  }, [filter]);

  async function fetchTherapists() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/therapists?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists);
      }
    } catch (error) {
      console.error('Failed to fetch therapists', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveTherapist(therapistId: string) {
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        setTherapists((prev) =>
          prev.map((t) => (t.id === therapistId ? { ...t, onboarding_status: 'approved' } : t))
        );
      }
    } catch (error) {
      console.error('Failed to approve therapist', error);
    }
  }

  async function rejectTherapist(therapistId: string, reason?: string) {
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        setTherapists((prev) =>
          prev.map((t) => (t.id === therapistId ? { ...t, onboarding_status: 'rejected' } : t))
        );
      }
    } catch (error) {
      console.error('Failed to reject therapist', error);
    }
  }

  const displayTherapists = therapists.filter((t) => {
    if (filter === 'all') return true;
    return t.onboarding_status === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Therapeut:innen-Verwaltung</h2>
        <p className="text-sm text-slate-500">Bewertung und Freischaltung neuer Therapeuten</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === f
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? 'Alle' : f === 'pending' ? 'Ausstehend' : f === 'approved' ? 'Freigeschaltet' : 'Abgelehnt'}
          </button>
        ))}
      </div>

      {/* Therapist List */}
      {loading ? (
        <p className="text-slate-500">Lädt...</p>
      ) : displayTherapists.length === 0 ? (
        <p className="text-slate-500">Keine Therapeuten in dieser Kategorie</p>
      ) : (
        <div className="space-y-3">
          {displayTherapists.map((therapist) => (
            <div key={therapist.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{therapist.profile?.full_name || 'Unnamed'}</h3>
                  <p className="text-xs text-slate-500">{therapist.profile?.email}</p>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p>📍 Radius: {therapist.travel_radius_km} km</p>
                    <p>⭐ Rating: {therapist.avg_rating?.toFixed(1) || 'N/A'}</p>
                    <p>🗣️ Sprachen: {therapist.languages_spoken?.join(', ') || 'N/A'}</p>
                  </div>
                  {therapist.bio && (
                    <p className="mt-2 text-sm text-slate-700">{therapist.bio.substring(0, 100)}...</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {therapist.onboarding_status === 'pending' && (
                    <>
                      <button
                        onClick={() => approveTherapist(therapist.id)}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                      >
                        ✓ Freischalten
                      </button>
                      <button
                        onClick={() => rejectTherapist(therapist.id, 'Profil unvollständig')}
                        className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
                      >
                        ✗ Ablehnen
                      </button>
                    </>
                  )}
                  {therapist.onboarding_status === 'approved' && (
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                      Freigeschaltet
                    </span>
                  )}
                  {therapist.onboarding_status === 'rejected' && (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                      Abgelehnt
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
