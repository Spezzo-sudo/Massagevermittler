import { ProductGrid } from '@/components/shop/ProductGrid';
import { SectionHeading } from '@/components/common/SectionHeading';
import type { Product } from '@/lib/types/shop';

const demoProducts: Product[] = [
  { id: 1, name: 'Kokos-Aroma Öl', description: 'Lokales Öl mit Lemongras-Note, perfekt für Aromenmassagen.', price: 690, currency: 'THB', category: 'oil', inventory: 50, created_at: new Date().toISOString() },
  { id: 2, name: 'Muskel-Relax Balm', description: 'Sportbalsam mit Menthol & Tamarind für Sportmassagen.', price: 790, currency: 'THB', category: 'oil', inventory: 30, created_at: new Date().toISOString() },
  { id: 3, name: 'Massage-Gutschein', description: 'Digitale Gutscheine, kombinierbar mit allen Services.', price: 2500, currency: 'THB', category: 'gutschein', inventory: 100, created_at: new Date().toISOString() }
];

/** Shop page showcasing upsell products. */
export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
      <SectionHeading eyebrow="Shop" title="Upsells, Öle & Gutscheine" description="Produkte können einzeln bestellt oder direkt mit einer Massage geliefert werden." />
      <ProductGrid products={demoProducts} />
    </div>
  );
}
