import Link from 'next/link';

type MapPinPreviewProps = {
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
};

const getMapUrl = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;

/** Simple map placeholder that shows coordinates and links out to Google Maps. */
export function MapPinPreview({ latitude, longitude, label }: MapPinPreviewProps) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return (
      <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 text-sm text-emerald-700">
        <p>Kein Standort gesetzt</p>
        <p className="text-xs text-emerald-500">Nutze GPS oder suche dein Hotel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 text-sm text-emerald-700">
        <p className="font-semibold text-emerald-900">📍 {label ?? 'Ko Phangan'}</p>
        <p>Lat: {latitude.toFixed(5)}</p>
        <p>Lng: {longitude.toFixed(5)}</p>
      </div>
      <Link
        href={getMapUrl(latitude, longitude)}
        target="_blank"
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"
      >
        In Google Maps öffnen
        <span aria-hidden className="text-base">↗</span>
      </Link>
    </div>
  );
}
