import { z } from 'zod';

import { assertKoPhanganBounds } from './maps';

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  label: z.string().max(200).optional(),
  source: z.enum(['geolocation', 'manual']),
  googlePlaceId: z.string().optional(),
  formattedAddress: z.string().optional()
});

const bookingSchema = z.object({
  location: locationSchema,
  serviceId: z.number().positive(),
  scheduledAt: z.string(),
  notes: z.string().optional()
});

/** Validates booking payloads from the client and enforces Ko Phangan bounds. */
export function validateBookingPayload(payload: unknown) {
  const parsed = bookingSchema.parse(payload);
  assertKoPhanganBounds({ lat: parsed.location.latitude, lng: parsed.location.longitude });
  return parsed;
}
