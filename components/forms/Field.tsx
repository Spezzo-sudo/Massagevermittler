type FieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: string;
};

/** Simple label + input wrapper for booking/shop forms. */
export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
