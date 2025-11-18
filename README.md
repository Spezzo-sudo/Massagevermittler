# Island Massage Delivery

Ein Next.js/Supabase Projekt, das Wellness-Buchungen auf Ko Phangan wie eine Pizza-Bestellung abwickelt. Kund:innen wählen Adresse, Massage und Zeitfenster, das System matched passende Therapeut:innen, wickelt Zahlungen ab und verkauft optionale Shop-Produkte (Öle, Gutscheine, Sets).

## Tech-Stack
- **Next.js 14 (App Router)** mit React 18 und Tailwind CSS
- **Supabase** für Auth, PostgreSQL, Storage, RLS und Edge Functions
- **Stripe** für Payments, **Google Maps Places** für Adress-Autocomplete
- **TanStack Query** und **Zustand** für Client-State
- Benachrichtigungen via SendGrid (Mail) und Twilio/WhatsApp

## Projektstruktur
```
app/                  Next.js App Router, Marketing + Portale + APIs
components/           Wiederverwendbare Präsentations- und Formular-Bausteine
features/*            Domänenspezifische Module (Booking, Shop, Therapist, usw.)
lib/                  Supabase/Stripe/Maps-Clients, Matching- und Validation-Logic
config/               Globale Site- und Feature-Flags
docs/                 Architektur-Übersicht, Roadmap, SQL-Schema
public/               Statische Assets (Logos, Illustrationen)
```

Jedes Top-Level-Feature hat eine eigene `AGENTS.md`, damit neue Beiträge die lokalen Conventions kennen.

## Setup
1. `npm install`
2. `.env.example` nach `.env.local` kopieren und Supabase/Stripe/Google/Twilio Keys setzen.
3. Supabase Projekt erstellen und SQL aus `docs/data-model.sql` ausführen.
4. `npm run dev` starten.

> ⚠️ Vor jedem Commit bitte `npm run build` ausführen.

## Wichtige Routen
- `/` – Landingpage
- `/book` – Pizza-Style Buchungs-Flow inkl. Address-Autocomplete
- `/shop` – Produktübersicht mit Warenkorb-Platzhaltern
- `/customer`, `/therapist`, `/admin` – Dashboard Skeletons für jeweilige Rollen
- `/sign-in`, `/sign-up` – Auth-Formulare (Supabase Hosted Flow kann eingebunden werden)

## Weiteres Vorgehen
Siehe `docs/roadmap.md` für Phasenplanung und `docs/architecture.md` für Integrationsdetails (Supabase Policies, Matching-Pipeline, Notifications).
