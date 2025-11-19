import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const bookingId = params.id;
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, start_time, status')
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Buchung nicht gefunden' }, { status: 404 });
    }

    const start = new Date(booking.start_time).getTime();
    const diff = start - Date.now();
    const late = diff < THREE_HOURS_MS;
    const newStatus = late ? 'cancelled' : 'refunded';

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: newStatus, payment_status: 'unpaid' })
      .eq('id', bookingId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'cancelled', late });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
