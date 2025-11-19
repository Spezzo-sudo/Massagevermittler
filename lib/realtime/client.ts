/**
 * Supabase Realtime subscriptions for live notifications
 */

import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type ChangeHandler<T extends Record<string, any> = Record<string, any>> = (payload: RealtimePostgresChangesPayload<T>) => void;

interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

/**
 * Subscribe to booking updates for a customer
 */
export function subscribeToCustomerBookings(customerId: string, onUpdate: ChangeHandler<Record<string, any>>) {
  const supabase = createSupabaseBrowserClient();

  const channel = supabase
    .channel(`customer_bookings:${customerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `customer_id=eq.${customerId}`,
      },
      onUpdate
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  } as RealtimeSubscription;
}

/**
 * Subscribe to therapist's booking requests
 */
export function subscribeToTherapistBookings(therapistId: string, onUpdate: ChangeHandler<Record<string, any>>) {
  const supabase = createSupabaseBrowserClient();

  const channel = supabase
    .channel(`therapist_bookings:${therapistId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `therapist_id=eq.${therapistId}`,
      },
      onUpdate
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  } as RealtimeSubscription;
}

/**
 * Subscribe to all bookings for admin
 */
export function subscribeToAllBookings(onUpdate: ChangeHandler<Record<string, any>>) {
  const supabase = createSupabaseBrowserClient();

  const channel = supabase
    .channel('admin_bookings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
      },
      onUpdate
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  } as RealtimeSubscription;
}

/**
 * Subscribe to availability slots for a therapist
 */
export function subscribeToAvailabilitySlots(therapistId: string, onUpdate: ChangeHandler<Record<string, any>>) {
  const supabase = createSupabaseBrowserClient();

  const channel = supabase
    .channel(`availability_slots:${therapistId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'availability_slots',
        filter: `therapist_id=eq.${therapistId}`,
      },
      onUpdate
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  } as RealtimeSubscription;
}

/**
 * Subscribe to therapist application notifications (for admin)
 */
export function subscribeToTherapistApplications(onUpdate: ChangeHandler<Record<string, any>>) {
  const supabase = createSupabaseBrowserClient();

  const channel = supabase
    .channel('therapist_applications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'therapist_profiles',
        filter: 'onboarding_status=eq.pending',
      },
      onUpdate
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  } as RealtimeSubscription;
}

/**
 * Send a custom realtime message (for notifications)
 */
export async function sendRealtimeNotification(channel: string, eventType: string, payload: any) {
  const supabase = createSupabaseBrowserClient();

  try {
    await supabase.channel(channel).send({
      type: 'broadcast',
      event: eventType,
      payload,
    });
    console.info('[Realtime] Notification sent', { channel, eventType });
  } catch (error) {
    console.error('[Realtime] Error sending notification', {
      channel,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
