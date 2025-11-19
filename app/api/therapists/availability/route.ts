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

    // Conflict detection: Check if any booking or existing slot conflicts with the new slots
    for (const slot of body.slots) {
      // Check for conflicting bookings
      const { data: conflictingBookings, error: conflictError } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('therapist_id', user.id)
        .in('status', ['pending', 'confirmed', 'in_progress'])
        .or(`and(start_time.lt.${slot.end},end_time.gt.${slot.start})`);

      if (conflictError) {
        return NextResponse.json({ error: 'Fehler bei Konflikt-Prüfung' }, { status: 500 });
      }

      if (conflictingBookings && conflictingBookings.length > 0) {
        const conflictTime = new Date(conflictingBookings[0].start_time).toLocaleString('de-DE');
        return NextResponse.json({
          error: `Konflikt: Bereits eine Buchung um ${conflictTime}`
        }, { status: 409 });
      }

      // Check for overlapping availability slots
      const { data: overlappingSlots, error: overlapError } = await supabase
        .from('availability_slots')
        .select('id')
        .eq('therapist_id', user.id)
        .or(`and(start_time.lt.${slot.end},end_time.gt.${slot.start})`);

      if (overlapError) {
        return NextResponse.json({ error: 'Fehler bei Überlappungs-Prüfung' }, { status: 500 });
      }

      if (overlappingSlots && overlappingSlots.length > 0) {
        return NextResponse.json({
          error: 'Konflikt: Dieser Zeitraum überschneidet sich mit einem existierenden Slot'
        }, { status: 409 });
      }
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

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.slotId) {
    return NextResponse.json({ error: 'slotId fehlt' }, { status: 400 });
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

    // First check if the slot belongs to this therapist and is not booked
    const { data: slot, error: fetchError } = await supabase
      .from('availability_slots')
      .select('therapist_id, is_booked')
      .eq('id', body.slotId)
      .single();

    if (fetchError || !slot) {
      return NextResponse.json({ error: 'Slot nicht gefunden' }, { status: 404 });
    }

    if (slot.therapist_id !== user.id) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    if (slot.is_booked) {
      return NextResponse.json({ error: 'Gebuchte Slots können nicht gelöscht werden' }, { status: 400 });
    }

    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', body.slotId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
