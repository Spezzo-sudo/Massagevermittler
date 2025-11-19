import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';
import type { PublicTherapistProfile } from '@/lib/types/therapist';

/**
 * GET /api/therapists
 * Returns all approved and active therapists with their profiles and services.
 * This endpoint is public and does not require authentication.
 */
export async function GET() {
  const supabase = createSupabaseRouteClient();

  // Fetch all approved and active therapists
  const { data: therapists, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      therapist_profiles!inner(
        bio,
        experience_years,
        languages,
        avg_rating,
        total_bookings,
        portfolio_url,
        certifications_url,
        is_active
      )
    `)
    .eq('role', 'therapist')
    .eq('onboarding_status', 'approved')
    .eq('therapist_profiles.is_active', true);

  if (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json({ error: 'Failed to fetch therapists' }, { status: 500 });
  }

  if (!therapists || therapists.length === 0) {
    return NextResponse.json([]);
  }

  // Get therapist IDs to fetch their services
  const therapistIds = therapists.map((t) => t.id);

  const { data: therapistServices, error: servicesError } = await supabase
    .from('therapist_services')
    .select(`
      therapist_id,
      service_id,
      services(name)
    `)
    .in('therapist_id', therapistIds)
    .eq('active', true);

  if (servicesError) {
    console.error('Error fetching therapist services:', servicesError);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }

  // Map services to therapists
  const publicProfiles: PublicTherapistProfile[] = (therapists as any[]).map((therapist: any) => {
    const profile = therapist.therapist_profiles;
    const services = (therapistServices || [])
      .filter((ts: any) => ts.therapist_id === therapist.id)
      .map((ts: any) => ({
        service_id: ts.service_id,
        service_name: ts.services?.name || `Service #${ts.service_id}`,
      }));

    return {
      id: therapist.id,
      full_name: therapist.full_name,
      avatar_url: therapist.avatar_url,
      bio: profile.bio,
      experience_years: profile.experience_years,
      languages: profile.languages,
      avg_rating: profile.avg_rating || 0,
      total_bookings: profile.total_bookings || 0,
      portfolio_url: profile.portfolio_url,
      certifications_url: profile.certifications_url,
      services,
    };
  });

  return NextResponse.json(publicProfiles);
}
