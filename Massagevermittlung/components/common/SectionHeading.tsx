type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

/** Shared heading component used across marketing sections. */
export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-3 px-6 text-center">
      {eyebrow ? <p className="text-xs uppercase tracking-widest text-brand-500">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
      {description ? <p className="text-base text-slate-600">{description}</p> : null}
    </div>
  );
}
