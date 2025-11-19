import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

/**
 * GET - Get all availability patterns for the authenticated therapist
 */
export async function GET(request: Request) {
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

    const { data: patterns, error } = await supabase
      .from('availability_patterns')
      .select('*')
      .eq('therapist_id', user.id)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ patterns });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * POST - Create a new availability pattern
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
    if (!body?.day_of_week || !body?.start_time || !body?.end_time) {
      return NextResponse.json(
        { error: 'day_of_week, start_time und end_time sind erforderlich' },
        { status: 400 }
      );
    }

    const { data: pattern, error } = await supabase
      .from('availability_patterns')
      .insert({
        therapist_id: user.id,
        day_of_week: body.day_of_week,
        start_time: body.start_time,
        end_time: body.end_time,
        valid_from: body.valid_from || null,
        valid_until: body.valid_until || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ pattern });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * DELETE - Delete an availability pattern
 */
export async function DELETE(request: Request) {
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
    if (!body?.patternId) {
      return NextResponse.json({ error: 'patternId fehlt' }, { status: 400 });
    }

    const { error } = await supabase
      .from('availability_patterns')
      .delete()
      .eq('id', body.patternId)
      .eq('therapist_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
