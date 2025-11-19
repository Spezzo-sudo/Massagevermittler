import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseRouteClient();
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Session ungültig' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const nextStatus = body?.status as string | undefined;
    if (!nextStatus || !['accepted', 'rejected', 'confirmed'].includes(nextStatus)) {
      return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 });
    }

    // Get booking details before updating
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('start_time, end_time, therapist_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Buchung nicht gefunden' }, { status: 404 });
    }

    if (booking.therapist_id !== user.id) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Conflict detection when accepting or confirming a booking
    if (nextStatus === 'accepted' || nextStatus === 'confirmed') {
      // Check for conflicting confirmed bookings
      const { data: conflicts, error: conflictError } = await supabase
        .from('bookings')
        .select('id, start_time')
        .eq('therapist_id', user.id)
        .in('status', ['confirmed', 'in_progress'])
        .neq('id', params.id) // Exclude current booking
        .or(`and(start_time.lt.${booking.end_time},end_time.gt.${booking.start_time})`);

      if (conflictError) {
        return NextResponse.json({ error: 'Fehler bei Konflikt-Prüfung' }, { status: 500 });
      }

      if (conflicts && conflicts.length > 0) {
        const conflictTime = new Date(conflicts[0].start_time).toLocaleString('de-DE');
        return NextResponse.json({
          error: `Konflikt: Bereits eine bestätigte Buchung um ${conflictTime}. Bitte lehnen Sie eine der Buchungen ab.`
        }, { status: 409 });
      }

      // Mark corresponding availability slot as booked if it exists
      await supabase
        .from('availability_slots')
        .update({ is_booked: true })
        .eq('therapist_id', user.id)
        .gte('start_time', booking.start_time)
        .lte('end_time', booking.end_time);
    }

    // If rejecting, free up the availability slot
    if (nextStatus === 'rejected') {
      await supabase
        .from('availability_slots')
        .update({ is_booked: false })
        .eq('therapist_id', user.id)
        .gte('start_time', booking.start_time)
        .lte('end_time', booking.end_time);
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: nextStatus })
      .eq('id', params.id)
      .eq('therapist_id', user.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
    return NextResponse.json({ status: nextStatus });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
