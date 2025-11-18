/** Address data persisted together with Supabase entries for validation/matching. */
export type AddressPayload = {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
};

/** Booking insert payload used by API routes and Edge Functions. */
export type BookingInput = {
  customerId: string;
  serviceId: number;
  address: AddressPayload;
  startTime: string;
  notes?: string;
};
