/**
 * POST /api/shop/orders
 *
 * Create a new order from cart
 */

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';
import { createCheckoutSession } from '@/lib/stripe';
import type { CartItem } from '@/lib/types/shop';

interface OrderPayload {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  shipping_address?: string;
  notes?: string;
}

export async function POST(request: Request) {
  const supabase = createSupabaseRouteClient();

  try {
    // Get authenticated user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = (await request.json()) as OrderPayload;

    // Validate payload
    if (!payload.items || payload.items.length === 0) {
      return new Response(JSON.stringify({ error: 'Order must contain at least one item' }), { status: 400 });
    }

    if (!payload.total || payload.total <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid order total' }), { status: 400 });
    }

    // Check inventory for all items
    for (const item of payload.items) {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('inventory')
        .eq('id', item.product_id)
        .single();

      if (fetchError || !product) {
        return new Response(JSON.stringify({ error: `Product ${item.product_id} not found` }), { status: 404 });
      }

      if (product.inventory < item.quantity) {
        return new Response(
          JSON.stringify({
            error: `Insufficient inventory for product ${item.product_id}. Available: ${product.inventory}`,
          }),
          { status: 409 }
        );
      }
    }

    // Create order in database
    const { data: order, error: createError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        items: payload.items,
        subtotal: payload.subtotal,
        tax: payload.tax,
        total: payload.total,
        currency: 'THB',
        status: 'pending',
        payment_status: 'unpaid',
        shipping_address: payload.shipping_address,
        notes: payload.notes,
      })
      .select()
      .single();

    if (createError) {
      console.error('[Shop Orders] Error creating order', { error: createError.message });
      return new Response(JSON.stringify({ error: 'Failed to create order' }), { status: 500 });
    }

    // Create Stripe checkout session
    try {
      const amount = Math.round(payload.total * 100); // Convert to smallest currency unit (satang for THB)

      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/shop/order-confirmation?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/shop/checkout?cancelled=true`;

      const session = await createCheckoutSession({
        amount,
        currency: 'thb',
        successUrl,
        cancelUrl,
        metadata: {
          orderId: order.id,
          customerId: user.id,
        },
      });

      // Update order with Stripe session ID
      const { error: updateError } = await supabase
        .from('orders')
        .update({ stripe_checkout_session_id: session.id, status: 'processing' })
        .eq('id', order.id);

      if (updateError) {
        console.error('[Shop Orders] Error updating order with Stripe session', { error: updateError.message });
      }

      // Update inventory
      for (const item of payload.items) {
        await supabase.rpc('decrement_inventory', {
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }

      console.info('[Shop Orders] Order created with checkout session', {
        orderId: order.id,
        customerId: user.id,
        sessionId: session.id,
        total: payload.total,
      });

      return new Response(
        JSON.stringify({
          order,
          checkout_url: session.url,
        }),
        { status: 201 }
      );
    } catch (stripeError) {
      console.error('[Shop Orders] Stripe error', {
        orderId: order.id,
        error: stripeError instanceof Error ? stripeError.message : String(stripeError),
      });

      // Mark order as failed but don't fail the response
      await supabase
        .from('orders')
        .update({ payment_status: 'failed', status: 'cancelled' })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({
          error: 'Failed to create checkout session',
          orderId: order.id,
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Shop Orders POST] Error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
