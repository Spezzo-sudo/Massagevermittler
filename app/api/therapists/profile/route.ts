import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
  }

  try {
    const supabase = createSupabaseRouteClient();
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
    }

    const payload = {
      therapist_id: user.id,
      bio: body.bio ?? null,
      languages: Array.isArray(body.languages) ? body.languages : [],
      experience_years: body.experienceYears ?? null,
      travel_radius_km: body.travelRadiusKm ?? null,
      payout_method: body.payoutMethod ?? null,
      payout_details: body.payoutDetails ?? null,
      portfolio_url: body.portfolioUrl ?? null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('therapist_profiles')
      .upsert(payload, { onConflict: 'therapist_id' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase
      .from('profiles')
      .update({ onboarding_status: 'pending_review' })
      .eq('id', user.id);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
