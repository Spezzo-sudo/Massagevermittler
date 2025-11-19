import Link from 'next/link';

const services = [
  { title: 'Thai Massage', description: 'Energiereiche Ganzkörper-Session mit Stretch- und Druckpunkten.', info: '60 Min · ab 900 THB' },
  { title: 'Aroma Ritual', description: 'Heiße Öle und Duftnoten für Tiefenentspannung direkt bei dir.', info: '90 Min · ab 1.100 THB' },
  { title: 'Sport & Recovery', description: 'Deep Tissue & Mobility für aktive Reisende.', info: '60 Min · ab 1.300 THB' }
];

const team = [
  { name: 'Anong', role: 'Thai & Aromaöl', badges: ['5+ Jahre', 'Spricht EN/TH'] },
  { name: 'Mira', role: 'Deep Tissue', badges: ['Yoga Teacher', 'Studio & Hausbesuch'] },
  { name: 'Kai', role: 'Couples & Retreats', badges: ['DE/EN', 'Outdoor Spezialist'] }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main>
        <section className="relative min-h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/842546/pexels-photo-842546.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center brightness-95" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-transparent" />
          <div className="container relative mx-auto flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.45em] text-brand-500 shadow">
              ✨ Mobile Service on Ko Phangan
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-brand-600 md:text-5xl">Luxury Wellness, Delivered.</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Buche verifizierte Therapeut:innen wie eine Fahrt: GPS + Service wählen – Supabase kümmert sich um Matching, Payments und Statusupdates.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/customer/login" className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg">
                Jetzt Massage buchen
              </Link>
              <Link href="/therapist/login" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow">
                Ich möchte massieren
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.35em] text-slate-500">
              <span>Supabase Auth</span>
              <span>Realtime Matching</span>
              <span>Stripe & WhatsApp</span>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="container mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-brand-400">Services</p>
            <h2 className="mt-2 text-3xl font-bold">Massagen, die zu deinem Insel-Lifestyle passen</h2>
            <p className="mt-3 text-sm text-slate-500">
              Details & Buchung auf der separaten Seite. Wir bringen Liege, Öl & Atmosphäre mit – du wählst den Slot.
            </p>
          </div>
          <div className="container mx-auto mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
                <div className="text-xs uppercase tracking-[0.4em] text-brand-400">{service.info}</div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-3 text-sm text-slate-500">{service.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/book" className="text-sm font-semibold text-brand-600">
              Zur Booking-Seite →
            </Link>
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-16 text-slate-900">
          <div className="container mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-brand-400">Our Team</p>
            <h2 className="mt-2 text-3xl font-bold">Lerne unsere Therapeut:innen kennen</h2>
            <p className="mt-3 text-sm text-slate-500">Profile, Zertifikate und Matching laufen via Supabase – Admins prüfen jede Bewerbung.</p>
          </div>
          <div className="container mx-auto mt-10 grid gap-6 md:grid-cols-3">
            {team.map((therapist) => (
              <article key={therapist.name} className="rounded-3xl border border-white bg-white p-6 shadow-lg">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-200 to-brand-600 text-2xl font-bold text-white">
                  {therapist.name[0]}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{therapist.name}</h3>
                <p className="text-sm text-slate-500">{therapist.role}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  {therapist.badges.map((badge) => (
                    <span key={badge} className="rounded-full border border-slate-200 px-3 py-1">
                      {badge}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white px-6 py-16">
          <div className="container mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-brand-400">Shop</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Gutscheine & Wellness-Produkte</h2>
            <p className="mt-3 text-sm text-slate-500">Stöbere im Shop – separater Checkout, kombiniert mit Massagen möglich.</p>
            <Link href="/shop" className="mt-4 inline-flex text-sm font-semibold text-brand-600">
              Zum Shop →
            </Link>
          </div>
        </section>

        <section className="bg-slate-100 px-6 py-16 text-slate-900">
          <div className="container mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-brand-400">Member Area</p>
            <h2 className="mt-2 text-3xl font-bold">Klare Trennung für Kunden & Mitarbeiter</h2>
            <p className="mt-3 text-sm text-slate-500">Customer-Login für Buchungen & Stornos · Therapist-Login für Profile, Slots & Anfragen.</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/customer/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow">
                Kundenbereich öffnen
              </Link>
              <Link href="/therapist/login" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow">
                Mitarbeiterbereich öffnen
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
