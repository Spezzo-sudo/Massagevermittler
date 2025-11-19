'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/shop/cart.store';
import type { Product } from '@/lib/types/shop';

type ProductGridProps = {
  products: Product[];
};

/** Simple product card list for oils, vouchers, etc. */
export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCartStore();
  const [addedId, setAddedId] = useState<number | null>(null);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {products.map((product) => (
        <article key={product.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-2 text-sm text-slate-600">{product.description}</p>
          <p className="mt-4 text-base font-semibold text-brand-600">{product.price} THB</p>
          <button
            onClick={() => handleAddToCart(product)}
            className={`mt-3 w-full rounded-full py-2 text-sm font-semibold transition-colors ${
              addedId === product.id
                ? 'bg-brand-500 text-white'
                : 'border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600'
            }`}
          >
            {addedId === product.id ? '✓ Hinzugefügt' : 'In den Warenkorb'}
          </button>
        </article>
      ))}
    </div>
  );
}
