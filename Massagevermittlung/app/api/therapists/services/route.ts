import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.serviceIds)) {
    return NextResponse.json({ error: 'serviceIds array fehlt' }, { status: 400 });
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

    const serviceIds: number[] = body.serviceIds;
    const upserts = serviceIds.map((serviceId) => ({
      therapist_id: user.id,
      service_id: serviceId,
      active: true
    }));

    await supabase
      .from('therapist_services')
      .upsert(upserts, { onConflict: 'therapist_id,service_id' });

    await supabase
      .from('therapist_services')
      .update({ active: false })
      .eq('therapist_id', user.id)
      .not('service_id', 'in', `(${serviceIds.join(',') || 0})`);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
