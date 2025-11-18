import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripeClient: Stripe | null = null;

/** Returns a memoized Stripe instance for server-side usage. */
export function getStripeClient() {
  if (!stripeSecret) {
    throw new Error('STRIPE_SECRET_KEY fehlt.');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecret, { apiVersion: '2024-04-10' });
  }
  return stripeClient;
}

type CheckoutPayload = {
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string | number>;
};

/** Creates a Checkout Session for booking payments. */
export async function createCheckoutSession({ amount, currency = 'thb', successUrl, cancelUrl, metadata }: CheckoutPayload) {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: 'Massage Booking'
          }
        }
      }
    ],
    metadata
  });
}
