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

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Keine Admin-Rechte' }, { status: 403 });

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ onboarding_status: 'approved' })
      .eq('id', params.id)
      .eq('role', 'therapist');

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
    return NextResponse.json({ status: 'approved' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
