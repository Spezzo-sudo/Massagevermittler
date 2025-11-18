/**
 * GET /api/shop/products
 *
 * Fetch all shop products
 */

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';

export async function GET(request: Request) {
  const supabase = createSupabaseRouteClient();

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase.from('products').select('*').gt('inventory', 0).order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('[Shop Products] Error fetching products', { error: error.message });
      return new Response(JSON.stringify({ error: 'Failed to fetch products' }), { status: 500 });
    }

    return new Response(JSON.stringify({ products }), { status: 200 });
  } catch (error) {
    console.error('[Shop Products GET] Error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
