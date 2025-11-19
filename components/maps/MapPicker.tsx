'use client';

import { useEffect, useRef, useState } from 'react';

import { KO_PHANGAN_BOUNDS } from '@/lib/constants';
import type { LocationInput } from '@/features/booking/types';

type MapPickerProps = {
  location: LocationInput | null;
  onChange: (location: LocationInput) => void;
};

const defaultCenter = {
  lat: (KO_PHANGAN_BOUNDS.northEast.lat + KO_PHANGAN_BOUNDS.southWest.lat) / 2,
  lng: (KO_PHANGAN_BOUNDS.northEast.lng + KO_PHANGAN_BOUNDS.southWest.lng) / 2
};

const isWithinBounds = (lat: number, lng: number) =>
  lat >= KO_PHANGAN_BOUNDS.southWest.lat &&
  lat <= KO_PHANGAN_BOUNDS.northEast.lat &&
  lng >= KO_PHANGAN_BOUNDS.southWest.lng &&
  lng <= KO_PHANGAN_BOUNDS.northEast.lng;

/** Lightweight map picker with draggable pin, limited to Ko Phangan bounds. */
export function MapPicker({ location, onChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) {
      return;
    }

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        restriction: {
          latLngBounds: new window.google.maps.LatLngBounds(
            { lat: KO_PHANGAN_BOUNDS.southWest.lat, lng: KO_PHANGAN_BOUNDS.southWest.lng },
            { lat: KO_PHANGAN_BOUNDS.northEast.lat, lng: KO_PHANGAN_BOUNDS.northEast.lng }
          ),
          strictBounds: true
        }
      });

      markerRef.current = new window.google.maps.Marker({
        position: location ? { lat: location.latitude, lng: location.longitude } : defaultCenter,
        map: mapInstance.current,
        draggable: true
      });

      const handlePosition = (lat: number, lng: number) => {
        if (!isWithinBounds(lat, lng)) {
          setError('Außerhalb des Liefergebiets (Ko Phangan).');
          return;
        }
        setError(null);
        markerRef.current?.setPosition({ lat, lng });
        mapInstance.current?.panTo({ lat, lng });
        onChange({
          latitude: lat,
          longitude: lng,
          label: location?.label ?? 'Pin gesetzt',
          source: 'manual',
          googlePlaceId: location?.googlePlaceId,
          formattedAddress: location?.formattedAddress
        });
      };

      mapInstance.current!.addListener('click', (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat !== undefined && lng !== undefined) {
          handlePosition(lat, lng);
        }
      });

      markerRef.current!.addListener('dragend', () => {
        const pos = markerRef.current?.getPosition();
        if (!pos) return;
        handlePosition(pos.lat(), pos.lng());
      });
    }
  }, [location, onChange]);

  useEffect(() => {
    if (!markerRef.current || !mapInstance.current || !location) return;
    markerRef.current.setPosition({ lat: location.latitude, lng: location.longitude });
    mapInstance.current.panTo({ lat: location.latitude, lng: location.longitude });
  }, [location]);

  return (
    <div className="space-y-2">
      <div ref={mapRef} className="h-80 w-full overflow-hidden rounded-2xl border border-slate-200" />
      {error ? <p className="text-xs text-rose-500">{error}</p> : <p className="text-xs text-brand-600">Pin muss auf Ko Phangan liegen.</p>}
    </div>
  );
}

declare global {
  interface Window {
    google?: any;
  }
}
