import Link from 'next/link';

/** Default 404 to stay on-brand. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase text-slate-400">404</p>
      <h1 className="text-3xl font-semibold text-slate-900">Hier gibt es (noch) keine Massage.</h1>
      <p className="text-sm text-slate-600">Zurück zur Landingpage oder direkt zur Booking-Experience springen.</p>
      <div className="flex gap-4">
        <Link href="/" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
          Home
        </Link>
        <Link href="/book" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
          Massage buchen
        </Link>
      </div>
    </div>
  );
}
