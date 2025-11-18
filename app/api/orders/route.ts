import { NextResponse } from 'next/server';

import { createCheckoutSession } from '@/lib/stripe';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

/** Creates a Stripe checkout session for shop orders. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.items?.length) {
    return NextResponse.json({ error: 'Keine Produkte übermittelt.' }, { status: 400 });
  }

  const items: OrderItem[] = body.items;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let checkoutUrl: string | null = null;
  try {
    const session = await createCheckoutSession({
      amount: total * 100,
      successUrl: 'https://massagevermittlung.local/shop/success',
      cancelUrl: 'https://massagevermittlung.local/shop'
    });
    checkoutUrl = session.url ?? null;
  } catch (error) {
    console.warn('Stripe nicht konfiguriert:', error);
  }

  return NextResponse.json({
    status: checkoutUrl ? 'Stripe Session erstellt' : 'Order entgegengenommen (Stripe fehlt)',
    checkoutUrl,
    total
  });
}
