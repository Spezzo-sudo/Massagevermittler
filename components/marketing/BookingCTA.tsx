type BookingCTAItem = {
  title: string;
  description: string;
  href: string;
};

type BookingCTAProps = {
  ctaItems: BookingCTAItem[];
};

/** Dual CTA cards for customers and therapists. */
export function BookingCTA({ ctaItems }: BookingCTAProps) {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="grid gap-6 md:grid-cols-2">
        {ctaItems.map((item) => (
          <a key={item.title} href={item.href} className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-slate-400">{item.href}</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-600">
              Mehr erfahren
              <svg className="ml-2 h-4 w-4 transition group-hover:translate-x-1" viewBox="0 0 16 16" fill="none">
                <path d="M4 8h8m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
