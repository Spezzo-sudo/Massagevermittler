import type { SupabaseClient } from '@supabase/supabase-js';

import type { Coordinates } from './maps';

type TherapistCandidate = {
  therapist_id: string;
  travel_radius_km: number;
  avg_rating: number;
  latitude: number;
  longitude: number;
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

/**
 * Finds the best available therapist for a booking based on:
 * - Service availability
 * - Distance from booking location
 * - Travel radius
 * - Rating
 */
export async function findTherapistForBooking(
  supabase: SupabaseClient,
  coordinates: Coordinates,
  serviceId: number
): Promise<string | null> {
  // Query therapists who:
  // 1. Offer the requested service (therapist_services)
  // 2. Are active and approved (profiles + therapist_profiles)
  // 3. Have location coordinates set
  const { data, error } = await supabase
    .from('therapist_services')
    .select(`
      therapist_id,
      therapist_profiles!inner(
        travel_radius_km,
        avg_rating,
        latitude,
        longitude,
        is_active
      ),
      profiles!inner(
        onboarding_status
      )
    `)
    .eq('service_id', serviceId)
    .eq('active', true)
    .eq('therapist_profiles.is_active', true)
    .eq('profiles.onboarding_status', 'approved')
    .not('therapist_profiles.latitude', 'is', null)
    .not('therapist_profiles.longitude', 'is', null);

  if (error) {
    console.error('[Matching] Query error:', error);
    return null;
  }

  if (!data?.length) {
    console.warn('[Matching] No therapists found for service', serviceId);
    return null;
  }

  // Transform nested data structure
  const candidates: (TherapistCandidate & { distance: number })[] = data
    .map((row: any) => {
      const profile = row.therapist_profiles;
      return {
        therapist_id: row.therapist_id,
        travel_radius_km: profile.travel_radius_km || 10,
        avg_rating: profile.avg_rating || 0,
        latitude: profile.latitude,
        longitude: profile.longitude,
        distance: distanceInKm(coordinates, { lat: profile.latitude, lng: profile.longitude })
      };
    })
    .filter((candidate) => candidate.distance <= candidate.travel_radius_km);

  if (candidates.length === 0) {
    console.warn('[Matching] No therapists within travel radius');
    return null;
  }

  // Sort by distance (closer first), then by rating (higher first)
  const sorted = candidates.sort((a, b) => {
    const distanceDiff = a.distance - b.distance;
    if (distanceDiff !== 0) return distanceDiff;
    return b.avg_rating - a.avg_rating;
  });

  console.info('[Matching] Found therapist:', {
    therapist_id: sorted[0].therapist_id,
    distance: sorted[0].distance,
    rating: sorted[0].avg_rating
  });

  return sorted[0].therapist_id;
}
