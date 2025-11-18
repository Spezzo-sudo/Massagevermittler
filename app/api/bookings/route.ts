import { NextResponse } from 'next/server';

import { sendNotification } from '@/lib/notifications';
import { createSupabaseRouteClient } from '@/lib/supabase/routeClient';
import { validateBookingPayload } from '@/lib/validation';
import { findTherapistForBooking } from '@/lib/matching';

const fallbackPrice = 1500;

/** Persists a booking request and triggers asynchronous notifications. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  try {
    const payload = validateBookingPayload(body);

    let supabase: ReturnType<typeof createSupabaseRouteClient> | null = null;
    try {
      supabase = createSupabaseRouteClient();
    } catch (error) {
      console.warn('Supabase Konfiguration fehlt:', error);
    }

    let therapistId: string | null = null;
    let bookingId: string | null = null;

    if (supabase) {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      let customerId: string | null = null;
      if (token) {
        const { data } = await supabase.auth.getUser(token);
        customerId = data.user?.id ?? null;
      }

      const { data: serviceRow } = await supabase
        .from('services')
        .select('base_price, duration_minutes')
        .eq('id', payload.serviceId)
        .single();
      const price = serviceRow?.base_price ?? fallbackPrice;

      therapistId = await findTherapistForBooking(
        supabase,
        { lat: payload.location.latitude, lng: payload.location.longitude },
        payload.serviceId
      );

      const formattedAddress = payload.location.formattedAddress ?? payload.location.label ?? 'Ko Phangan';
      const placeId =
        payload.location.googlePlaceId ??
        `manual-${payload.location.latitude.toFixed(5)}-${payload.location.longitude.toFixed(5)}`;

      const { data: addressRow, error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: customerId,
          label: payload.location.label ?? formattedAddress,
          google_place_id: placeId,
          formatted_address: formattedAddress,
          latitude: payload.location.latitude,
          longitude: payload.location.longitude
        })
        .select('id')
        .single();

      if (addressError) {
        console.warn('Adresse konnte nicht gespeichert werden:', addressError);
      }

      const { data: bookingRow, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: customerId,
          service_id: payload.serviceId,
          therapist_id: therapistId,
          address_id: addressRow?.id ?? null,
          start_time: payload.scheduledAt,
          end_time: payload.scheduledAt,
          price,
          notes: payload.notes ?? null,
          status: 'pending',
          payment_status: 'unpaid',
          latitude: payload.location.latitude,
          longitude: payload.location.longitude,
          location_label: payload.location.label ?? formattedAddress,
          location_source: payload.location.source,
          stripe_payment_intent: null
        })
        .select('id')
        .single();

      if (bookingError) {
        console.warn('Booking insert fehlgeschlagen:', bookingError);
      }
      bookingId = bookingRow?.id ?? null;
    }

    await sendNotification('email', {
      recipient: 'ops@islandmassage.example',
      subject: 'Neue Massage Buchung',
      message: JSON.stringify({ ...payload, therapistId, bookingId })
    });

    return NextResponse.json({
      status: supabase ? 'Booking gespeichert' : 'Mock gespeichert (Supabase ENV fehlt)',
      therapistId,
      bookingId
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
