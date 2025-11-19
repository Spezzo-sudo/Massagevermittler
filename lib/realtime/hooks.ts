/**
 * React hooks for Supabase Realtime subscriptions
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
  subscribeToCustomerBookings,
  subscribeToTherapistBookings,
  subscribeToAllBookings,
  subscribeToAvailabilitySlots,
  subscribeToTherapistApplications,
} from './client';

/**
 * Hook to listen for booking updates (customer view)
 */
export function useCustomerBookings<T extends Record<string, any> & { id: string } = any>(customerId: string) {
  const [bookings, setBookings] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const subscription = subscribeToCustomerBookings(customerId, (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
      console.info('[Realtime] Booking update received', { eventType: payload.eventType });

      if (payload.eventType === 'INSERT') {
        setBookings((prev) => [payload.new as T, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setBookings((prev) => prev.map((b) => (b.id === (payload.new as T).id ? payload.new as T : b)));
      } else if (payload.eventType === 'DELETE') {
        setBookings((prev) => prev.filter((b) => b.id !== (payload.old as T).id));
      }
    });

    setLoading(false);

    return () => subscription.unsubscribe();
  }, [customerId]);

  return { bookings, loading, error };
}

/**
 * Hook to listen for new booking requests (therapist view)
 */
export function useTherapistBookingRequests<T extends Record<string, any> & { id: string } = any>(therapistId: string) {
  const [requests, setRequests] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const subscription = subscribeToTherapistBookings(therapistId, (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
      console.info('[Realtime] New booking request received');

      if (payload.eventType === 'INSERT') {
        setRequests((prev) => [payload.new as T, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setRequests((prev) => prev.map((r) => (r.id === (payload.new as T).id ? payload.new as T : r)));
      }
    });

    setLoading(false);

    return () => subscription.unsubscribe();
  }, [therapistId]);

  return { requests, loading };
}

/**
 * Hook for availability slot updates
 */
export function useAvailabilitySlots<T extends Record<string, any> & { id: string } = any>(therapistId: string) {
  const [slots, setSlots] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const subscription = subscribeToAvailabilitySlots(therapistId, (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
      console.info('[Realtime] Availability slot update received', { eventType: payload.eventType });

      if (payload.eventType === 'INSERT') {
        setSlots((prev) => [...prev, payload.new as T]);
      } else if (payload.eventType === 'UPDATE') {
        setSlots((prev) => prev.map((s) => (s.id === (payload.new as T).id ? payload.new as T : s)));
      } else if (payload.eventType === 'DELETE') {
        setSlots((prev) => prev.filter((s) => s.id !== (payload.old as T).id));
      }
    });

    setLoading(false);

    return () => subscription.unsubscribe();
  }, [therapistId]);

  return { slots, loading };
}

/**
 * Hook for admin: listen to all booking changes
 */
export function useAdminBookingMonitor<T extends Record<string, any> & { id: string } = any>() {
  const [bookings, setBookings] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestChange, setLatestChange] = useState<T | null>(null);

  useEffect(() => {
    setLoading(true);

    const subscription = subscribeToAllBookings((payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
      console.info('[Realtime] Admin: Booking change received', { eventType: payload.eventType });

      setLatestChange(payload.eventType === 'DELETE' ? payload.old as T : payload.new as T);

      if (payload.eventType === 'INSERT') {
        setBookings((prev) => [payload.new as T, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setBookings((prev) => prev.map((b) => (b.id === (payload.new as T).id ? payload.new as T : b)));
      }
    });

    setLoading(false);

    return () => subscription.unsubscribe();
  }, []);

  return { bookings, loading, latestChange };
}

/**
 * Hook for admin: listen to therapist applications
 */
export function useTherapistApplications<T extends Record<string, any> = any>() {
  const [applications, setApplications] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    setLoading(true);

    const subscription = subscribeToTherapistApplications((payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
      console.info('[Realtime] New therapist application received');

      if (payload.eventType === 'INSERT') {
        setApplications((prev) => [payload.new as T, ...prev]);
        setNewCount((prev) => prev + 1);
      }
    });

    setLoading(false);

    return () => subscription.unsubscribe();
  }, []);

  const clearNotification = useCallback(() => {
    setNewCount(0);
  }, []);

  return { applications, loading, newCount, clearNotification };
}
