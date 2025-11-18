import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
    }
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Session ungültig' }, { status: 401 });
    }

    const { data, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, service_id, start_time, end_time, status, payment_status, price, notes')
      .eq('customer_id', user.id)
      .order('start_time', { ascending: true });

    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 400 });
    }

    return NextResponse.json({ bookings: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
