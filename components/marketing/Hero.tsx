import Link from 'next/link';

import { siteConfig } from '@/config/site';

/** Landing hero explaining the pizza-style wellness concept. */
export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center">
      <div className="flex-1 space-y-6">
        <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          Ko Phangan · Wellness Delivery
        </p>
        <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          Massagen buchen wie Pizza bestellen – schneller Service, geprüfte Therapeut:innen.
        </h1>
        <p className="text-lg text-slate-600">
          Adresse eingeben, gewünschte Massage auswählen, online zahlen. Wir matchen automatisch eine verifizierte
          Fachkraft in deinem Radius auf Ko Phangan.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href={siteConfig.links.booking} className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-white">
            Jetzt Massage buchen
          </Link>
          <Link href="/therapist" className="rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700">
            Therapeuten-Portal
          </Link>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <div>
            <span className="font-semibold text-slate-900">24/7 Support</span>
            <p>WhatsApp Updates & Hotline</p>
          </div>
          <div>
            <span className="font-semibold text-slate-900">Live Tracking</span>
            <p>Status: unterwegs / angekommen</p>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-lg">
          <p className="text-sm font-semibold text-slate-700">Koordinaten-Check</p>
          <p className="text-3xl font-bold text-brand-600">9.73° N / 100° E</p>
          <p className="mt-2 text-sm text-slate-500">
            Wir speichern jede Adresse mit <span className="font-semibold">Place-ID</span>, Geokoordinaten und Bounding Box
            Validierung.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-white p-4 text-sm text-slate-600">
            Stripe Payment, Supabase Policies und Realtime Matching sind bereits ausgeplant.
          </div>
        </div>
      </div>
    </section>
  );
}
