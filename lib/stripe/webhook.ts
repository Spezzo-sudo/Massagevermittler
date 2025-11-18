/**
 * Stripe webhook handling for payment events
 *
 * This module processes Stripe payment events and updates booking status
 */

import { getStripeClient } from './client';
import type Stripe from 'stripe';

/**
 * Construct and verify a Stripe webhook event
 */
export function constructWebhookEvent(body: string | Buffer, signature: string | string[] | undefined): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  if (!signature) {
    throw new Error('Missing Stripe signature header');
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Handle successful payment intent
 */
export async function handlePaymentIntentSucceeded(
  event: Stripe.Event,
  onSuccess: (metadata: Record<string, string | number>) => Promise<void>
) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.info('[Stripe Webhook] Payment intent succeeded', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  });

  // Get metadata from payment intent
  const metadata = paymentIntent.metadata || {};

  // Call the handler (e.g., update booking in database)
  try {
    await onSuccess(metadata);
  } catch (error) {
    console.error('[Stripe Webhook] Error processing payment success', {
      paymentIntentId: paymentIntent.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Handle payment intent failure
 */
export async function handlePaymentIntentFailed(
  event: Stripe.Event,
  onFailure: (metadata: Record<string, string | number>, reason: string) => Promise<void>
) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  const lastError = paymentIntent.last_payment_error;
  const failureReason = lastError?.message || 'Unknown error';

  console.warn('[Stripe Webhook] Payment intent failed', {
    paymentIntentId: paymentIntent.id,
    reason: failureReason,
    code: lastError?.code,
  });

  const metadata = paymentIntent.metadata || {};

  try {
    await onFailure(metadata, failureReason);
  } catch (error) {
    console.error('[Stripe Webhook] Error processing payment failure', {
      paymentIntentId: paymentIntent.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Handle checkout session completion
 */
export async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  onSuccess: (sessionData: { sessionId: string; customerId: string; metadata: Record<string, string | number> }) => Promise<void>
) {
  const session = event.data.object as Stripe.Checkout.Session;

  console.info('[Stripe Webhook] Checkout session completed', {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
  });

  const metadata = session.metadata || {};

  try {
    await onSuccess({
      sessionId: session.id,
      customerId: session.customer as string,
      metadata,
    });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing checkout completion', {
      sessionId: session.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Map Stripe event types to handlers
 */
export const webhookEventHandlers: Record<
  string,
  (event: Stripe.Event, handler: (...args: any[]) => Promise<void>) => Promise<void>
> = {
  'payment_intent.succeeded': handlePaymentIntentSucceeded,
  'payment_intent.payment_failed': handlePaymentIntentFailed,
  'charge.succeeded': async (event, handler) => {
    // Optional: handle charge.succeeded for additional confirmation
    console.info('[Stripe Webhook] Charge succeeded', {
      chargeId: (event.data.object as any).id,
    });
    await handler((event.data.object as any).metadata || {});
  },
  'checkout.session.completed': handleCheckoutSessionCompleted,
};

/**
 * Process a Stripe webhook event
 */
export async function processWebhookEvent(
  event: Stripe.Event,
  handlers: {
    onPaymentSuccess?: (metadata: Record<string, string | number>) => Promise<void>;
    onPaymentFailure?: (metadata: Record<string, string | number>, reason: string) => Promise<void>;
    onCheckoutComplete?: (sessionData: { sessionId: string; customerId: string; metadata: Record<string, string | number> }) => Promise<void>;
  }
): Promise<{ handled: boolean; eventType: string }> {
  const eventType = event.type;

  console.info('[Stripe Webhook] Processing event', { eventType, eventId: event.id });

  switch (eventType) {
    case 'payment_intent.succeeded':
      if (handlers.onPaymentSuccess) {
        await handlePaymentIntentSucceeded(event, handlers.onPaymentSuccess);
        return { handled: true, eventType };
      }
      break;

    case 'payment_intent.payment_failed':
      if (handlers.onPaymentFailure) {
        await handlePaymentIntentFailed(event, handlers.onPaymentFailure);
        return { handled: true, eventType };
      }
      break;

    case 'checkout.session.completed':
      if (handlers.onCheckoutComplete) {
        await handleCheckoutSessionCompleted(event, handlers.onCheckoutComplete);
        return { handled: true, eventType };
      }
      break;

    default:
      console.info('[Stripe Webhook] Unhandled event type', { eventType });
      return { handled: false, eventType };
  }

  return { handled: false, eventType };
}
