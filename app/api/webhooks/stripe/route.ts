/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook endpoint for handling payment events:
 * - payment_intent.succeeded: Update booking to paid
 * - payment_intent.payment_failed: Mark booking as failed
 * - checkout.session.completed: Create order from checkout
 *
 * Critical for payment processing and order fulfillment.
 */

import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';
import { constructWebhookEvent, processWebhookEvent } from '@/lib/stripe';
import { notifyBookingConfirmed, notifyBookingConfirmedWhatsApp, notifyTherapistNewBooking } from '@/lib/notifications';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  try {
    const body = await request.text();

    // Verify and construct Stripe event
    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (error) {
      console.error('[Stripe Webhook] Signature verification failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return new Response('Unauthorized', { status: 401 });
    }

    // Initialize Supabase client for database updates
    const supabase = createSupabaseRouteClient();

    // Define event handlers
    const handlers = {
      onPaymentSuccess: async (metadata: Record<string, string | number>) => {
        const bookingId = metadata.bookingId as string;
        if (!bookingId) {
          console.warn('[Stripe Webhook] No booking ID in metadata');
          return;
        }

        console.info('[Stripe Webhook] Updating booking payment status', { bookingId });

        // Update booking status in database
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ payment_status: 'confirmed', status: 'confirmed' })
          .eq('id', bookingId);

        if (updateError) {
          console.error('[Stripe Webhook] Failed to update booking', { bookingId, error: updateError.message });
          throw updateError;
        }

        // Fetch booking details to send notifications
        const { data: booking, error: fetchError } = await supabase
          .from('bookings')
          .select('*, customer:profiles!customer_id(*), therapist:profiles!therapist_id(*), service:services!service_id(*)')
          .eq('id', bookingId)
          .single();

        if (fetchError) {
          console.error('[Stripe Webhook] Failed to fetch booking for notifications', { bookingId, error: fetchError.message });
          return;
        }

        if (!booking) {
          console.warn('[Stripe Webhook] Booking not found', { bookingId });
          return;
        }

        // Send notifications to customer
        try {
          const appointmentDate = new Date(booking.start_time).toLocaleDateString('de-DE');
          const appointmentTime = new Date(booking.start_time).toLocaleTimeString('de-DE');

          if (booking.customer?.email) {
            await notifyBookingConfirmed(booking.customer.email, {
              customerName: booking.customer.full_name || 'Kundin/Kunde',
              serviceName: booking.service?.name || 'Service',
              therapistName: booking.therapist?.full_name || 'Therapeutin/Therapeut',
              appointmentDate,
              appointmentTime,
              location: 'Ko Phangan',
              amount: booking.price,
              currency: 'THB',
              bookingId,
            });
          }

          if (booking.customer?.phone) {
            await notifyBookingConfirmedWhatsApp(booking.customer.phone, {
              customerName: booking.customer.full_name || 'Kundin/Kunde',
              serviceName: booking.service?.name || 'Service',
              therapistName: booking.therapist?.full_name || 'Therapeutin/Therapeut',
              appointmentDate,
              appointmentTime,
              location: 'Ko Phangan',
              amount: booking.price,
              currency: 'THB',
              bookingId,
            });
          }
        } catch (error) {
          console.error('[Stripe Webhook] Failed to send customer notifications', {
            bookingId,
            error: error instanceof Error ? error.message : String(error),
          });
          // Don't throw - customer should see confirmation in dashboard
        }

        // Send notification to therapist
        try {
          if (booking.therapist?.email) {
            await notifyTherapistNewBooking(booking.therapist.email, {
              therapistName: booking.therapist.full_name || 'Therapeutin/Therapeut',
              customerName: booking.customer?.full_name || 'Kundin/Kunde',
              serviceName: booking.service?.name || 'Service',
              appointmentDate: new Date(booking.start_time).toLocaleDateString('de-DE'),
              appointmentTime: new Date(booking.start_time).toLocaleTimeString('de-DE'),
              location: 'Ko Phangan',
              notes: booking.notes,
            });
          }
        } catch (error) {
          console.error('[Stripe Webhook] Failed to send therapist notification', {
            bookingId,
            error: error instanceof Error ? error.message : String(error),
          });
          // Don't throw - booking was already confirmed
        }

        console.info('[Stripe Webhook] Booking confirmed and notifications sent', { bookingId });
      },

      onPaymentFailure: async (metadata: Record<string, string | number>, reason: string) => {
        const bookingId = metadata.bookingId as string;
        if (!bookingId) {
          console.warn('[Stripe Webhook] No booking ID in metadata');
          return;
        }

        console.warn('[Stripe Webhook] Updating booking payment status to failed', { bookingId, reason });

        // Update booking to failed state
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ payment_status: 'failed', status: 'cancelled' })
          .eq('id', bookingId);

        if (updateError) {
          console.error('[Stripe Webhook] Failed to update booking', { bookingId, error: updateError.message });
          throw updateError;
        }

        // TODO: Send notification to customer about payment failure
        console.info('[Stripe Webhook] Booking marked as failed', { bookingId, reason });
      },

      onCheckoutComplete: async (sessionData: { sessionId: string; customerId: string; metadata: Record<string, string | number> }) => {
        console.info('[Stripe Webhook] Checkout session completed', { sessionId: sessionData.sessionId });
        // TODO: Create order from checkout session if shop functionality is implemented
      },
    };

    // Process webhook event
    const result = await processWebhookEvent(event, handlers);

    if (result.handled) {
      console.info('[Stripe Webhook] Event processed successfully', { eventType: result.eventType });
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } else {
      console.info('[Stripe Webhook] Event type not handled', { eventType: result.eventType });
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook', {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}
