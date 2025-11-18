type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type ProductGridProps = {
  products: Product[];
};

/** Simple product card list for oils, vouchers, etc. */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {products.map((product) => (
        <article key={product.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-2 text-sm text-slate-600">{product.description}</p>
          <p className="mt-4 text-base font-semibold text-brand-600">{product.price} THB</p>
          <button className="mt-3 w-full rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600">
            In den Warenkorb
          </button>
        </article>
      ))}
    </div>
  );
}
