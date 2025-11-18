import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function GET() {
  try {
    const supabase = createSupabaseRouteClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const response = NextResponse.json({ user: null, role: null });
      response.cookies.set('sb-role', '', { path: '/', maxAge: 0 });
      return response;
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    const role = profile?.role ?? null;
    const response = NextResponse.json({ user: data.user, role });
    cookies().set('sb-role', role ?? '', { path: '/', sameSite: 'lax' });
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
