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
