/**
 * POST/GET /api/therapist/availability/slots
 *
 * Manage therapist availability slots.
 *
 * GET: List all availability slots for authenticated therapist
 * POST: Create new availability slots
 */

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();

  try {
    // Get authenticated therapist ID from session
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(
      request.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch therapist profile to get therapist_id
    const { data: therapist, error: therapistError } = await supabase
      .from('therapist_profiles')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single();

    if (therapistError || !therapist) {
      return new Response('Therapist profile not found', { status: 404 });
    }

    // Get availability slots
    const { data: slots, error: slotsError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('therapist_id', therapist.id)
      .order('start_time', { ascending: true });

    if (slotsError) {
      console.error('[Availability Slots] Error fetching slots', {
        therapistId: therapist.id,
        error: slotsError.message,
      });
      return new Response(JSON.stringify({ error: 'Failed to fetch availability slots' }), { status: 500 });
    }

    return new Response(JSON.stringify({ slots }), { status: 200 });
  } catch (error) {
    console.error('[Availability Slots GET] Error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseRouteClient();

  try {
    // Get authenticated therapist
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(
      request.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { start_time, end_time, is_available } = body;

    if (!start_time || !end_time) {
      return new Response(JSON.stringify({ error: 'start_time and end_time are required' }), { status: 400 });
    }

    // Validate time range
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid date format' }), { status: 400 });
    }

    if (startDate >= endDate) {
      return new Response(JSON.stringify({ error: 'end_time must be after start_time' }), { status: 400 });
    }

    // Get therapist profile
    const { data: therapist, error: therapistError } = await supabase
      .from('therapist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (therapistError || !therapist) {
      return new Response('Therapist profile not found', { status: 404 });
    }

    // Check for conflicts with existing bookings
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, start_time, end_time')
      .eq('therapist_id', therapist.id)
      .gte('end_time', start_time)
      .lte('start_time', end_time)
      .neq('status', 'cancelled');

    if (bookingError) {
      console.error('[Availability Slots] Error checking bookings', {
        therapistId: therapist.id,
        error: bookingError.message,
      });
      return new Response(JSON.stringify({ error: 'Failed to check bookings' }), { status: 500 });
    }

    if (bookings && bookings.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Time slot conflicts with existing bookings',
          conflicts: bookings,
        }),
        { status: 409 }
      );
    }

    // Create availability slot
    const { data: slot, error: createError } = await supabase
      .from('availability_slots')
      .insert({
        therapist_id: therapist.id,
        start_time,
        end_time,
        is_available: is_available !== false, // Default to true
      })
      .select()
      .single();

    if (createError) {
      console.error('[Availability Slots] Error creating slot', {
        therapistId: therapist.id,
        error: createError.message,
      });
      return new Response(JSON.stringify({ error: 'Failed to create availability slot' }), { status: 500 });
    }

    console.info('[Availability Slots] Slot created', {
      slotId: slot.id,
      therapistId: therapist.id,
      startTime: start_time,
      endTime: end_time,
    });

    return new Response(JSON.stringify({ slot }), { status: 201 });
  } catch (error) {
    console.error('[Availability Slots POST] Error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
