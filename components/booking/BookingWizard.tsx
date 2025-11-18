'use client';

import { useMemo, useState, useTransition } from 'react';

import { createBooking } from '@/features/booking/actions';
import { massageServices } from '@/features/booking/constants';
import type { BookingPayload, LocationInput } from '@/features/booking/types';

import { Field } from '../forms/Field';
import { AddressAutocomplete, type AddressResult } from '../maps/AddressAutocomplete';
import { MapPinPreview } from '../maps/MapPinPreview';
import { MapPicker } from '../maps/MapPicker';

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export function BookingWizard() {
  const [geoLocation, setGeoLocation] = useState<LocationInput | null>(null);
  const [manualLabel, setManualLabel] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [serviceId, setServiceId] = useState(massageServices[0].id);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedService = useMemo(() => massageServices.find((service) => service.id === serviceId), [serviceId]);

  const effectiveLocation = geoLocation;

  const hydrateLocation = (location: LocationInput) => {
    setGeoLocation(location);
    if (location.label) {
      setManualLabel(location.label);
    }
  };

  const handlePlaceSelect = (place: AddressResult) => {
    hydrateLocation({
      latitude: place.lat,
      longitude: place.lng,
      label: place.address,
      source: 'manual',
      googlePlaceId: place.placeId,
      formattedAddress: place.address
    });
    setGeoStatus('Adresse übernommen – bitte Details prüfen.');
  };

  const requestCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('Dein Gerät erlaubt keine Standortabfrage.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        hydrateLocation({
          latitude,
          longitude,
          accuracy,
          label: manualLabel || 'Aktuelle Position',
          source: 'geolocation'
        });
        setGeoStatus('Standort erkannt. Füge Hotelname & Hinweise hinzu.');
      },
      () => {
        setGeoStatus('Standort konnte nicht ermittelt werden.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!effectiveLocation) {
      setStatus('Bitte Standort per GPS oder Suche setzen.');
      return;
    }

    if (!date || !time) {
      setStatus('Bitte Datum und Uhrzeit wählen.');
      return;
    }

    const payload: BookingPayload = {
      location: {
        ...effectiveLocation,
        label: manualLabel || effectiveLocation.label,
        formattedAddress: effectiveLocation.formattedAddress ?? manualLabel,
        googlePlaceId: effectiveLocation.googlePlaceId
      },
      serviceId,
      scheduledAt: `${date}T${time}:00`,
      notes: [addressNotes, notes].filter(Boolean).join('\n')
    };

    startTransition(async () => {
      const result = await createBooking(payload);
      setStatus(result.message);
    });
  };

  return (
    <form className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
      <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">📍 Adresse & Pin</p>
            <p className="text-xs text-slate-500">Wir liefern nur auf Ko Phangan. Nutze GPS oder suche deine Unterkunft.</p>
          </div>
          <button
            type="button"
            onClick={requestCurrentLocation}
            className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-600 shadow"
          >
            Standort automatisch erkennen
          </button>
        </div>
        <AddressAutocomplete onAddressSelect={handlePlaceSelect} placeholder="Hotel / Villa / Bungalow suchen" />
        {geoStatus ? <p className="text-xs text-emerald-600">{geoStatus}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Hotel / Unterkunft">
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              value={manualLabel}
              onChange={(event) => setManualLabel(event.target.value)}
              placeholder="z.B. Bluerama Resort, Villa 7"
            />
          </Field>
          <Field label="Hinweise für Therapeut:in">
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              value={addressNotes}
              onChange={(event) => setAddressNotes(event.target.value)}
              placeholder="Gatecode, Hunde, Parkplatz..."
            />
          </Field>
        </div>
        <MapPicker location={effectiveLocation} onChange={hydrateLocation} />
        <MapPinPreview latitude={effectiveLocation?.latitude} longitude={effectiveLocation?.longitude} label={manualLabel} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Massage-Art">
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={serviceId}
            onChange={(event) => setServiceId(Number(event.target.value))}
          >
            {massageServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {service.durationMinutes} min
              </option>
            ))}
          </select>
        </Field>
        <Field label="Datum">
          <input
            type="date"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Zeit">
          <input
            type="time"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </Field>
        <Field label="Weitere Hinweise (optional)">
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Sprache, Allergien, gewünschtes Öl..."
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Preis Vorschau</p>
        <p>
          {selectedService?.name} ({selectedService?.durationMinutes} min):{' '}
          <span className="font-semibold text-emerald-600">{selectedService?.price} THB</span>
        </p>
        <p>Preise basieren auf Supabase `services.base_price` – Zuschläge werden automatisch addiert.</p>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-emerald-500 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
        disabled={isPending || !(effectiveLocation?.latitude && effectiveLocation?.longitude)}
      >
        {isPending ? 'Buchung wird erstellt...' : 'Massage buchen'}
      </button>
      {status ? <p className="text-sm text-slate-500">{status}</p> : null}
    </form>
  );
}
