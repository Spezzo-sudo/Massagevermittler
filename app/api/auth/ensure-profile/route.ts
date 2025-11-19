import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Kein Token' }, { status: 401 });
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'User unbekannt' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedRole: 'customer' | 'therapist' | 'admin' | undefined = body?.role;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      return NextResponse.json({ status: 'exists', role: profile.role });
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      role: requestedRole ?? 'customer',
      full_name: user.email,
      onboarding_status: 'incomplete'
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'created', role: requestedRole ?? 'customer' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
