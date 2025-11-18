'use client';

import { useEffect, useRef } from 'react';

export type AddressResult = {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
};

type AddressAutocompleteProps = {
  onAddressSelect: (result: AddressResult) => void;
  placeholder?: string;
};

/** Google Places powered autocomplete input scoped to Ko Phangan. */
export function AddressAutocomplete({ onAddressSelect, placeholder }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['place_id', 'formatted_address', 'geometry'],
      componentRestrictions: { country: 'th' },
      types: ['geocode'],
      strictBounds: true
    });

    const bounds = new window.google.maps.LatLngBounds(
      { lat: 9.65, lng: 99.93 },
      { lat: 9.82, lng: 100.06 }
    );

    autocomplete.setBounds(bounds);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.place_id || !place.formatted_address || !place.geometry?.location) {
        return;
      }

      onAddressSelect({
        placeId: place.place_id,
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [onAddressSelect]);

  return (
    <input
      ref={inputRef}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
      placeholder={placeholder ?? 'Deine Adresse auf Ko Phangan'}
    />
  );
}

declare global {
  interface Window {
    google?: any;
  }
}
