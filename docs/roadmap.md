# Roadmap

## Phase 1 – Marketing & Basic Booking
- Landingpage fertigstellen (Hero, Services, Team, FAQ, CTA).
- Form `/book` sammelt Adresse (noch ohne Google) + Wunschzeit und schreibt eine einfache Buchung in Supabase.
- Bewerbungsformular für Therapeut:innen (landet als Pending Datensatz).

## Phase 2 – Auth & Profile
- Supabase Auth integrieren (E-Mail + Magic Link).
- `profiles`, `addresses`, `services`, `bookings` Tabellen per SQL Setup.
- Kunden-Dashboard: Meine Buchungen, Standardadresse, Profilpflege.

## Phase 3 – Mitarbeiterzone & Admin
- Rollen `therapist` und `admin` erzwingen.
- Therapist-Dashboard: Availability Slots anlegen, Booking-Liste, Einnahmen.
- Admin-Ansicht: Bewerbungen freischalten, Bookings manuell zuweisen, Preise pflegen.

## Phase 4 – Google Maps & Matching
- Google Places Autocomplete integrieren, Bounding-Box-Validation.
- Automatisches Matching nach Distanz/Ratings, Realtime Notifications.
- Stripe Checkout vollständig anbinden (inkl. Webhook, Refund Flow).

## Phase 5 – Shop & Upsells
- Produkt-Katalog in Supabase, Shop-UI + Warenkorb.
- Orders -> Stripe Payment, Option zur Kombination mit Massage.
- Lager- und Fulfillment-Tools im Admin-Bereich.
