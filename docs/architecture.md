# Architektur-Notizen

## High-Level Komponenten
- **Frontend**: Next.js 14 (App Router), React Server Components, Tailwind CSS. Client-State über TanStack Query + leichte Stores über Zustand.
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions). Edge-Routen in `app/api/*` dienen als Proxy für Supabase Edge Functions, bis diese implementiert sind.
- **Payments/Notifications**: Stripe Checkout/Payment Intents, SendGrid für E-Mails, Twilio WhatsApp für Echtzeit-Updates.
- **Maps**: Google Places Autocomplete im Client, Bounding-Box-Prüfung serverseitig über `lib/maps`.

## Datenfluss
1. **Auth** erfolgt über Supabase. Der Browser verwendet den `createSupabaseBrowserClient`, Server Actions/API-Routen nutzen `createSupabaseRouteClient`.
2. **Adress-Handling**:
   - Client ruft Google Autocomplete auf, sendet Place-Result an `/api/bookings`.
   - Route überprüft Koordinaten via `lib/maps/ensureInsideBoundingBox` und speichert in `addresses`.
3. **Matching**:
   - `lib/matching/findTherapist` lädt Services, Availability Slots und Ratings.
   - Erstes MVP: Admin Assignment oder „First available therapist“.
   - Phase 4: Distanz-Berechnung via Haversine (`lib/matching/distanceInKm`).
4. **Payments**:
   - `lib/stripe/createCheckoutSession` baut Stripe-Session.
   - Webhook (Edge Function) aktualisiert `payment_status`.
5. **Realtime**:
   - Supabase Realtime Channels für neue Buchungen -> Benachrichtigungen im Therapist-Portal.

## Sicherheit & Policies
- `lib/supabase/policies.md` (TODO) beschreibt aktive RLS-Regeln.
- API-Routen prüfen Rollen anhand `profiles.role`.
- Sensitive Umgebungs-Keys werden ausschließlich serverseitig genutzt (`SUPABASE_SERVICE_ROLE_KEY`, Stripe Secrets).

## Deploy-Idee
- Frontend auf Vercel.
- Supabase Project (Database + Edge Functions).
- Stripe Webhooks via Supabase Edge Function oder separate Cloudflare Worker.
