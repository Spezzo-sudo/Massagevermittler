export type MassageService = {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
};

/** Placeholder services used in the booking wizard until Supabase seeds exist. */
export const massageServices: MassageService[] = [
  { id: 1, name: 'Thai Massage', durationMinutes: 60, price: 1200 },
  { id: 2, name: 'Aroma Ritual', durationMinutes: 90, price: 1800 },
  { id: 3, name: 'Sport Recovery', durationMinutes: 60, price: 1500 },
  { id: 4, name: 'Couples Massage', durationMinutes: 120, price: 3200 }
];
