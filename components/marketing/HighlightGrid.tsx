type Highlight = {
  title: string;
  description: string;
};

type HighlightGridProps = {
  items: Highlight[];
};

/** Feature overview cards describing Supabase + matching pillars. */
export function HighlightGrid({ items }: HighlightGridProps) {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
