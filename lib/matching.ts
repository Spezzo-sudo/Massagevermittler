import type { SupabaseClient } from '@supabase/supabase-js';

import type { Coordinates } from './maps';

type TherapistCandidateRow = {
  id: string;
  radius_km: number;
  rating: number;
  lat: number;
  lng: number;
};

/** Calculates the Haversine distance between two geo points in kilometers. */
export function distanceInKm(a: Coordinates, b: Coordinates) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const aa = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return Math.round(R * c * 10) / 10;
}

/** Naive placeholder that picks the closest therapist candidate via SQL view. */
export async function findTherapistForBooking(
  supabase: SupabaseClient,
  coordinates: Coordinates,
  serviceId: number
) {
  const { data, error } = await supabase
    .from('therapist_candidates')
    .select('id, radius_km, rating, lat, lng')
    .eq('service_id', serviceId)
    .eq('is_active', true);

  if (error || !data?.length) {
    return null;
  }

  const enriched = data.map((candidate: TherapistCandidateRow) => ({
    ...candidate,
    distance: distanceInKm(coordinates, { lat: candidate.lat, lng: candidate.lng })
  }));

  const sorted = enriched
    .filter((candidate) => candidate.distance <= candidate.radius_km)
    .sort((a, b) => a.distance - b.distance || b.rating - a.rating);

  return sorted[0]?.id ?? null;
}
