const teamMembers = [
  { name: 'Mali', role: 'Thai Massage · Srithanu', languages: 'TH / EN' },
  { name: 'Noi', role: 'Sport Massage · Thong Sala', languages: 'TH / DE' },
  { name: 'Anna', role: 'Aroma Rituals · Chaloklum', languages: 'EN / DE' }
];

/** Snapshot of featured therapists with location/language cues. */
export function TeamPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="rounded-3xl bg-slate-900 px-6 py-10 text-white md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-brand-200">Therapist:innen</p>
            <h3 className="text-2xl font-semibold">Verifiziert, lokal und mehrsprachig.</h3>
          </div>
          <p className="text-sm text-slate-200">
            Admins prüfen Zertifikate, Profile pflegen Skills, Sprachen & Radius. Matching basiert auf Distanz und Rating.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {teamMembers.map((member) => (
            <div key={member.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-lg font-semibold">{member.name}</p>
              <p className="text-sm text-slate-200">{member.role}</p>
              <p className="text-xs text-slate-300">{member.languages}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
