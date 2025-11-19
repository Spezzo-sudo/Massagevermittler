import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';
import type { PublicTherapistProfile } from '@/lib/types/therapist';

/**
 * GET /api/therapists/[id]
 * Returns a single therapist's public profile with their services.
 * This endpoint is public and does not require authentication.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseRouteClient();

  // Fetch therapist profile
  const { data: therapist, error } = await supabase
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
    .eq('id', id)
    .eq('role', 'therapist')
    .eq('onboarding_status', 'approved')
    .eq('therapist_profiles.is_active', true)
    .single();

  if (error || !therapist) {
    return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
  }

  // Fetch therapist's services
  const { data: therapistServices, error: servicesError } = await supabase
    .from('therapist_services')
    .select(`
      service_id,
      services(name)
    `)
    .eq('therapist_id', id)
    .eq('active', true);

  if (servicesError) {
    console.error('Error fetching therapist services:', servicesError);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }

  const profile = therapist.therapist_profiles as any;
  const services = (therapistServices || []).map((ts: any) => ({
    service_id: ts.service_id,
    service_name: ts.services?.name || `Service #${ts.service_id}`,
  }));

  const publicProfile: PublicTherapistProfile = {
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

  return NextResponse.json(publicProfile);
}
