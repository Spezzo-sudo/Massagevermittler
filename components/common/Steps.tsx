type Step = {
  title: string;
  description: string;
};

type StepsProps = {
  steps: Step[];
};

/** Ordered horizontal/vertical process display for the pizza-style booking. */
export function Steps({ steps }: StepsProps) {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="grid gap-6 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">
              {index + 1}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
            <p className="text-sm text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
