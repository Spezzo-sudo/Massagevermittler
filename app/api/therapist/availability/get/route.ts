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

    const { data, error: slotError } = await supabase
      .from('availability_slots')
      .select('id, start_time, end_time, is_booked')
      .eq('therapist_id', user.id)
      .order('start_time', { ascending: true });

    if (slotError) return NextResponse.json({ error: slotError.message }, { status: 400 });
    return NextResponse.json({ slots: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
