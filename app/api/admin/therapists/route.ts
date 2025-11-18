import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Session ungültig' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Keine Admin-Rechte' }, { status: 403 });

    const { data, error: listError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, onboarding_status, role')
      .eq('role', 'therapist')
      .order('created_at', { ascending: false });

    if (listError) return NextResponse.json({ error: listError.message }, { status: 400 });
    return NextResponse.json({ therapists: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
