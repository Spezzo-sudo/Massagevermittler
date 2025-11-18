import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.slots || !Array.isArray(body.slots)) {
    return NextResponse.json({ error: 'slots array fehlt' }, { status: 400 });
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

    const payload = body.slots.map((slot: { start: string; end: string }) => ({
      therapist_id: user.id,
      start_time: slot.start,
      end_time: slot.end,
      is_booked: false
    }));

    const { error } = await supabase.from('availability_slots').insert(payload);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
