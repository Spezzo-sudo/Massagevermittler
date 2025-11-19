import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

/**
 * POST - Generate availability slots from patterns for a given date range
 */
export async function POST(request: Request) {
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

    const body = await request.json().catch(() => null);
    if (!body?.start_date || !body?.end_date) {
      return NextResponse.json(
        { error: 'start_date und end_date sind erforderlich' },
        { status: 400 }
      );
    }

    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);

    if (startDate >= endDate) {
      return NextResponse.json({ error: 'start_date muss vor end_date liegen' }, { status: 400 });
    }

    // Limit to max 90 days
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      return NextResponse.json(
        { error: 'Maximaler Zeitraum: 90 Tage' },
        { status: 400 }
      );
    }

    // Get all active patterns for this therapist
    const { data: patterns, error: patternsError } = await supabase
      .from('availability_patterns')
      .select('*')
      .eq('therapist_id', user.id)
      .eq('is_active', true);

    if (patternsError) {
      return NextResponse.json({ error: patternsError.message }, { status: 500 });
    }

    if (!patterns || patterns.length === 0) {
      return NextResponse.json({ error: 'Keine aktiven Muster gefunden' }, { status: 404 });
    }

    // Generate slots
    const slotsToCreate = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Find patterns for this day of week
      const dayPatterns = patterns.filter((p: any) => {
        if (p.day_of_week !== dayOfWeek) return false;

        // Check if pattern is valid for this date
        if (p.valid_from) {
          const validFrom = new Date(p.valid_from);
          if (currentDate < validFrom) return false;
        }
        if (p.valid_until) {
          const validUntil = new Date(p.valid_until);
          if (currentDate > validUntil) return false;
        }

        return true;
      });

      // Create slots for each matching pattern
      for (const pattern of dayPatterns) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const startTime = `${dateStr}T${pattern.start_time}`;
        const endTime = `${dateStr}T${pattern.end_time}`;

        // Check if slot already exists
        const { data: existingSlots } = await supabase
          .from('availability_slots')
          .select('id')
          .eq('therapist_id', user.id)
          .eq('start_time', startTime)
          .eq('end_time', endTime);

        if (!existingSlots || existingSlots.length === 0) {
          slotsToCreate.push({
            therapist_id: user.id,
            start_time: startTime,
            end_time: endTime,
            is_booked: false,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slotsToCreate.length === 0) {
      return NextResponse.json({
        message: 'Keine neuen Slots erstellt (bereits vorhanden)',
        created: 0,
      });
    }

    // Insert all slots
    const { data: createdSlots, error: insertError } = await supabase
      .from('availability_slots')
      .insert(slotsToCreate)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `${createdSlots?.length || 0} Slots erfolgreich erstellt`,
      created: createdSlots?.length || 0,
      slots: createdSlots,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
