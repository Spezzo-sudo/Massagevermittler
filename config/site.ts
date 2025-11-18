export type SiteConfig = {
  name: string;
  description: string;
  links: {
    booking: string;
    shop: string;
  };
};

/** Site-wide metadata used in the layout and structured data tags. */
export const siteConfig: SiteConfig = {
  name: 'Island Massage Delivery',
  description:
    'Buch dir eine Massage auf Ko Phangan wie eine Pizza-Bestellung – Adresse wählen, Service aussuchen, fertig.',
  links: {
    booking: '/book',
    shop: '/shop'
  }
};
