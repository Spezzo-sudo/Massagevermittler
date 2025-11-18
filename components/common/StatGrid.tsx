type Stat = {
  label: string;
  value: string;
  detail?: string;
};

type StatGridProps = {
  stats: Stat[];
};

/** Displays KPI style numbers for marketing proof points. */
export function StatGrid({ stats }: StatGridProps) {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="grid gap-6 rounded-2xl border border-slate-100 bg-white/80 p-10 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-400">{stat.label}</p>
            <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
            {stat.detail ? <p className="text-sm text-slate-500">{stat.detail}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
