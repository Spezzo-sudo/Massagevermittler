/**
 * GET /api/admin/therapists/query?status=pending
 *
 * Query therapists with various filters for admin
 */

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();

  try {
    // Verify admin role
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(
      request.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (profile?.role !== 'admin') {
      return new Response('Forbidden', { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('therapist_profiles')
      .select(
        `
      id,
      user_id,
      onboarding_status,
      travel_radius_km,
      avg_rating,
      languages_spoken,
      bio,
      created_at,
      profile:profiles(full_name, email, phone)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('onboarding_status', status);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: therapists, count, error } = await query.range(from, to);

    if (error) {
      console.error('[Admin Query] Error fetching therapists', { error: error.message });
      return new Response(JSON.stringify({ error: 'Failed to fetch therapists' }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        therapists,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Admin Query GET] Error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
