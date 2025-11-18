export type LocationInput = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  label?: string;
  source: 'geolocation' | 'manual';
  googlePlaceId?: string;
  formattedAddress?: string;
};

/** Data emitted by the BookingWizard that is required for `/api/bookings`. */
export type BookingPayload = {
  location: LocationInput;
  serviceId: number;
  scheduledAt: string;
  notes: string;
};
