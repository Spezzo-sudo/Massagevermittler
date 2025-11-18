type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  items: FAQItem[];
};

/** FAQ accordion stand-in (static cards for now). */
export function FAQ({ items }: FAQProps) {
  return (
    <section className="mx-auto max-w-3xl px-6">
      <h3 className="text-center text-2xl font-semibold text-slate-900">FAQ</h3>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <details key={item.question} className="rounded-2xl border border-slate-100 bg-white p-4">
            <summary className="cursor-pointer text-lg font-semibold text-slate-900">{item.question}</summary>
            <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
