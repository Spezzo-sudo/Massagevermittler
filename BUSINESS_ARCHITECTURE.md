# Massagevermittler - Detaillierte Geschäfts- und Architektur-Dokumentation

## Inhaltsverzeichnis
1. [Geschäftsidee & Vision](#1-geschäftsidee--vision)
2. [Zielgruppen & Nutzerprofile](#2-zielgruppen--nutzerprofile)
3. [Kernfunktionalitäten](#3-kernfunktionalitäten)
4. [Technische Architektur](#4-technische-architektur)
5. [Datenbank-Schema](#5-datenbank-schema)
6. [User Flows](#6-user-flows)
7. [Technologie-Stack](#7-technologie-stack)
8. [Sicherheitskonzept](#8-sicherheitskonzept)
9. [Payment & Notification System](#9-payment--notification-system)
10. [Matching-Algorithmus](#10-matching-algorithmus)
11. [Deployment & Infrastruktur](#11-deployment--infrastruktur)
12. [Development Roadmap](#12-development-roadmap)

---

## 1. Geschäftsidee & Vision

### Kernidee
**"Massage-Lieferung wie Pizza bestellen - speziell für Ko Phangan, Thailand"**

Die Plattform ist ein **zweiseitiger Marktplatz**, der Kunden mit verifizierten Massage-Therapeuten verbindet. Ähnlich wie Uber oder Deliveroo, aber für Mobile Massage Services auf der thailändischen Insel Ko Phangan.

### Wertversprechen

#### Für Kunden:
- ✅ **Schnelle Buchung**: In wenigen Klicks einen Therapeuten buchen
- ✅ **GPS-basiert**: Automatische Standorterkennung oder manuelle Adresseingabe
- ✅ **Verifizierte Therapeuten**: Alle Therapeuten werden geprüft und freigegeben
- ✅ **Sichere Zahlung**: Stripe-Integration für sichere Transaktionen
- ✅ **Echtzeit-Updates**: Status-Updates von der Buchung bis zur Fertigstellung
- ✅ **Bewertungssystem**: Transparente Bewertungen anderer Kunden

#### Für Therapeuten:
- ✅ **Zugang zu Kunden**: Kontinuierlicher Strom an Buchungsanfragen
- ✅ **Flexibles Arbeiten**: Eigene Verfügbarkeit und Preise festlegen
- ✅ **Professionelle Plattform**: Dashboard zur Verwaltung von Buchungen und Einnahmen
- ✅ **Automatische Zuweisung**: Intelligentes Matching basierend auf Standort und Bewertung
- ✅ **Reputation aufbauen**: Bewertungssystem zum Aufbau des Profils

#### Für Administratoren:
- ✅ **Qualitätskontrolle**: Therapeuten-Bewerbungen prüfen und freischalten
- ✅ **Buchungsmanagement**: Übersicht und manuelle Steuerung aller Buchungen
- ✅ **Produktverwaltung**: Shop-Katalog pflegen
- ✅ **Finanzkontrolle**: Zahlungen und Rückerstattungen überwachen

### Geografischer Fokus
Die Plattform ist **exklusiv für Ko Phangan** konzipiert. Es gibt eine technische Validierung (Bounding Box), die verhindert, dass Buchungen außerhalb der Insel getätigt werden können.

**Ko Phangan Bounding Box:**
- Nord: 9.8°
- Süd: 9.6°
- Ost: 100.1°
- West: 99.9°

---

## 2. Zielgruppen & Nutzerprofile

### Nutzertypen (Rollen)

Die Plattform hat drei Hauptrollen:

#### 1. **Customer (Kunde)**
- Touristen und Einheimische auf Ko Phangan
- Suchen Mobile Massage Services
- Können Buchungen erstellen, verwalten und bewerten
- Können Shop-Produkte kaufen

#### 2. **Therapist (Therapeut)**
- Zertifizierte Massage-Therapeuten
- Müssen durch Admin-Prozess verifiziert werden
- Können Services anbieten, Verfügbarkeit managen
- Erhalten automatisch zugewiesene Buchungen

#### 3. **Admin (Administrator)**
- Plattform-Betreiber
- Genehmigen/ablehnen Therapeuten-Bewerbungen
- Haben vollständigen Zugriff auf alle Daten
- Verwalten Produkte und Systemeinstellungen

---

## 3. Kernfunktionalitäten

### A. Kunden-Funktionen

#### Buchungs-Wizard (`/book`)
Ein mehrstufiger Prozess zur Buchung:

**Schritt 1: Standort-Auswahl**
- GPS-Standortabfrage (Browser Geolocation API)
- Alternativ: Google Places Autocomplete für Adresssuche
- Validierung gegen Ko Phangan Bounding Box
- Adresse wird in der Datenbank gecacht für spätere Nutzung

**Schritt 2: Service-Auswahl**
Drei Hauptkategorien:
1. **Thai Massage** - Traditionelle Thai-Massage
2. **Aroma Ritual** - Aromatherapie-Massage
3. **Sport & Recovery** - Sportmassage und Rehabilitation

**Schritt 3: Datum & Zeit**
- Kalender-Komponente zur Datumsauswahl
- Zeitslot-Auswahl basierend auf Verfügbarkeit
- Dauer wird automatisch aus dem gewählten Service übernommen

**Schritt 4: Optional - Notizen**
- Kunde kann spezielle Wünsche oder Anmerkungen hinterlassen
- Z.B. "Fokus auf Rücken" oder "Allergien gegen bestimmte Öle"

**Schritt 5: Buchungsbestätigung**
- Zusammenfassung aller Angaben
- Automatisches Matching mit bestem verfügbaren Therapeuten
- Buchung wird erstellt mit Status "pending"
- Email-Benachrichtigung an Operations-Team

#### Kunden-Dashboard (`/customer`)
**Buchungsübersicht:**
- Aktuelle Buchungen mit Status
- Vergangene Buchungen
- Stornierung möglich (Status-Update)

**Adressverwaltung:**
- Gespeicherte Adressen anzeigen
- Standard-Adresse festlegen
- Neue Adressen hinzufügen

**Profil-Einstellungen:**
- Persönliche Daten bearbeiten
- Telefonnummer, Avatar
- Passwort ändern

**Bestellhistorie:**
- Shop-Bestellungen ansehen
- Bestellstatus verfolgen

### B. Therapeuten-Funktionen

#### Onboarding & Registrierung (`/therapist/register`)
**Profil-Setup:**
```typescript
interface TherapistProfile {
  bio: string                    // Beschreibung der Person
  experience_years: number       // Jahre Berufserfahrung
  languages: string[]            // Gesprochene Sprachen
  travel_radius_km: number       // Wie weit Therapeut reist (Standard: 10km)
  latitude: number               // GPS-Koordinaten des Standorts
  longitude: number
  certifications_url: string     // Link zu Zertifikaten/Portfolio
  payout_method: string          // Zahlungsmethode (Bank, PayPal, etc.)
  avg_rating: number             // Durchschnittsbewertung
  total_bookings: number         // Anzahl abgeschlossener Buchungen
}
```

**Zertifizierungen:**
- Upload von Zertifikaten (Supabase Storage)
- Validierung durch Admins
- Öffentlich sichtbar nach Freischaltung

#### Service-Management (`/therapist/services`)
- Auswahl aus verfügbaren Services
- Eigene Preise festlegen (oder Standard-Preis übernehmen)
- Services jederzeit aktivieren/deaktivieren

**Beispiel:**
```sql
-- Therapeut bietet Thai Massage an
INSERT INTO therapist_services (therapist_id, service_id, custom_price)
VALUES ('uuid-123', 'thai-massage-id', 1200.00);  -- 1200 THB
```

#### Verfügbarkeits-Management (`/therapist/availability`)

**Zwei Methoden:**

1. **Wiederkehrende Muster** (Recurring Patterns)
```typescript
interface AvailabilityPattern {
  day_of_week: 0-6              // 0=Sonntag, 1=Montag, etc.
  start_time: '09:00'           // Startzeit
  end_time: '18:00'             // Endzeit
  valid_from: Date              // Ab wann gültig
  valid_until: Date | null      // Bis wann gültig (null = unbegrenzt)
}
```

Beispiel: "Jeden Montag bis Freitag von 9 bis 18 Uhr verfügbar"

2. **Spezifische Slots** (Individual Slots)
```typescript
interface AvailabilitySlot {
  therapist_id: string
  start_time: DateTime          // Genaue Start-Zeit
  end_time: DateTime            // Genaue End-Zeit
  is_booked: boolean            // Ist Slot gebucht?
}
```

**Auto-Generierung:**
Die Plattform kann automatisch aus Patterns konkrete Slots generieren (z.B. für die nächsten 4 Wochen).

#### Buchungs-Dashboard (`/therapist/bookings`)
**Funktionen:**
- Eingehende Buchungsanfragen anzeigen
- Buchung annehmen/ablehnen
- Status aktualisieren:
  - `pending` → `accepted` (Therapeut nimmt an)
  - `accepted` → `confirmed` (Zahlung bestätigt)
  - `confirmed` → `on_the_way` (Therapeut ist unterwegs)
  - `on_the_way` → `in_progress` (Massage läuft)
  - `in_progress` → `completed` (Abgeschlossen)
- Detailansicht: Kundeninfo, Adresse, Notizen
- Karten-Integration: Route zum Kunden anzeigen

#### Einnahmen-Tracking (`/therapist/earnings`)
- Übersicht aller abgeschlossenen Buchungen
- Gesamteinnahmen (gesamt, monatlich, wöchentlich)
- Auszahlungsstatus
- Export als CSV

### C. Admin-Funktionen

#### Therapeuten-Freigabe (`/admin`)
**Approval Workflow:**

1. **Pending Applications anzeigen**
   - Liste aller Therapeuten mit Status `pending_review`
   - Profildetails, Zertifikate, Berufserfahrung

2. **Prüfung**
   - Zertifikate validieren
   - Referenzen checken
   - Kontaktaufnahme bei Rückfragen

3. **Entscheidung**
   - **Approve**: `onboarding_status` → `approved`
     - Therapeut wird in Suche sichtbar
     - Kann Buchungen empfangen
     - Email-Benachrichtigung über Freischaltung
   - **Reject**: Email mit Begründung
     - Therapeut kann sich nicht einloggen
     - Profil bleibt inaktiv

#### Buchungsmanagement
- Alle Buchungen systemweit anzeigen
- Manuelle Zuweisung/Umzuweisung von Therapeuten
- Stornierungen und Rückerstattungen
- Notfall-Eingriffe bei Problemen

#### Produkt-Katalog
- Produkte hinzufügen/bearbeiten/löschen
- Lagerbestand verwalten
- Preise anpassen
- Bilder hochladen

#### Analytics & Reporting
- Gesamtzahl Buchungen
- Umsatz-Statistiken
- Therapeuten-Performance
- Kundenzufriedenheit (Bewertungen)

### D. Shop-Funktionen

#### Produktkatalog (`/shop`)
**Produktkategorien:**
- Massage-Öle
- Geschenk-Gutscheine
- Wellness-Sets
- Zubehör

**Shop-Features:**
- Produktliste mit Bildern
- In den Warenkorb legen (Zustand: Zustand Store)
- Checkout via Stripe
- Bestellhistorie

**Kombination mit Massage:**
- Option: "Produkt zur Massage hinzufügen"
- Gemeinsamer Checkout möglich

---

## 4. Technische Architektur

### Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                     NUTZER-BROWSER                          │
│                                                             │
│  Next.js 14 App Router                                      │
│  React 18 Components                                        │
│  TanStack Query (Server State Caching)                      │
│  Zustand (Client State - Warenkorb)                         │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌──────────┐
   │Supabase │  │ Google  │  │  Stripe  │
   │  Auth   │  │  Maps   │  │ Payments │
   │  JWT    │  │ Places  │  │ Checkout │
   └────┬────┘  └────┬────┘  └────┬─────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────▼────────────┐
        │   NEXT.JS API ROUTES    │
        │                         │
        │  /api/bookings          │
        │  /api/auth/*            │
        │  /api/customer/*        │
        │  /api/therapist/*       │
        │  /api/admin/*           │
        │  /api/shop/*            │
        │  /api/webhooks/stripe   │
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────────┐
        │   SUPABASE BACKEND          │
        │                             │
        │ ┌────────────────────────┐  │
        │ │   PostgreSQL DB        │  │
        │ │                        │  │
        │ │ - profiles             │  │
        │ │ - therapist_profiles   │  │
        │ │ - bookings             │  │
        │ │ - availability_slots   │  │
        │ │ - availability_patterns│  │
        │ │ - services             │  │
        │ │ - therapist_services   │  │
        │ │ - addresses            │  │
        │ │ - reviews              │  │
        │ │ - products             │  │
        │ │ - orders               │  │
        │ │ - order_items          │  │
        │ └────────────────────────┘  │
        │                             │
        │ ┌────────────────────────┐  │
        │ │  Row Level Security    │  │
        │ │  (RLS Policies)        │  │
        │ │  - Nutzer sehen nur    │  │
        │ │    eigene Daten        │  │
        │ │  - Therapeuten nur     │  │
        │ │    zugewiesene         │  │
        │ │    Buchungen           │  │
        │ └────────────────────────┘  │
        │                             │
        │ ┌────────────────────────┐  │
        │ │  Supabase Auth         │  │
        │ │  - JWT Tokens          │  │
        │ │  - Session Management  │  │
        │ │  - Email Auth          │  │
        │ └────────────────────────┘  │
        │                             │
        │ ┌────────────────────────┐  │
        │ │  Realtime Engine       │  │
        │ │  - WebSocket           │  │
        │ │  - Booking Updates     │  │
        │ │  - Live Notifications  │  │
        │ └────────────────────────┘  │
        │                             │
        │ ┌────────────────────────┐  │
        │ │  Supabase Storage      │  │
        │ │  - Zertifikate         │  │
        │ │  - Portfolio-Fotos     │  │
        │ │  - Produkt-Bilder      │  │
        │ └────────────────────────┘  │
        └─────────────────────────────┘
             ▲
             │ (Webhooks, API Calls)
             │
        ┌────┴──────────────────┐
        │  Externe Services     │
        ├───────────────────────┤
        │ - SendGrid (Email)    │
        │ - Twilio (WhatsApp)   │
        │ - Stripe (Payments)   │
        │ - Google Maps API     │
        └───────────────────────┘
```

### Frontend-Architektur

#### Route-Struktur (Next.js App Router)

```
app/
├── (app)/                          # Öffentliche App-Routen
│   ├── page.tsx                    # Landing Page
│   ├── book/
│   │   └── page.tsx                # Buchungs-Wizard
│   ├── shop/
│   │   └── page.tsx                # Shop Katalog
│   └── therapeuten/
│       └── [id]/page.tsx           # Therapeuten-Profil
│
├── auth/
│   └── callback/
│       └── route.ts                # OAuth Callback Handler
│
├── customer/
│   ├── login/page.tsx              # Kunden-Login
│   ├── register/page.tsx           # Kunden-Registrierung
│   └── (dashboard)/                # Protected Customer Area
│       ├── layout.tsx              # Customer Layout
│       ├── page.tsx                # Dashboard Home
│       ├── bookings/page.tsx       # Buchungsliste
│       ├── orders/page.tsx         # Bestellhistorie
│       └── profile/page.tsx        # Profil-Einstellungen
│
├── therapist/
│   ├── login/page.tsx              # Therapeuten-Login
│   ├── register/page.tsx           # Therapeuten-Registrierung
│   └── (dashboard)/                # Protected Therapist Area
│       ├── layout.tsx              # Therapist Layout
│       ├── page.tsx                # Dashboard Home
│       ├── profile/page.tsx        # Profil-Management
│       ├── services/page.tsx       # Service-Auswahl
│       ├── availability/page.tsx   # Verfügbarkeits-Management
│       ├── bookings/page.tsx       # Buchungsanfragen
│       ├── earnings/page.tsx       # Einnahmen
│       └── calendar/page.tsx       # Kalender-Ansicht
│
├── admin/
│   └── page.tsx                    # Admin Control Panel
│
└── api/                            # API Route Handlers
    ├── auth/
    │   ├── ensure-profile/route.ts
    │   ├── role/route.ts
    │   └── signout/route.ts
    ├── bookings/
    │   └── route.ts                # POST: Neue Buchung erstellen
    ├── customer/
    │   └── bookings/
    │       ├── route.ts            # GET: Kundenbuchungen
    │       └── [id]/
    │           └── cancel/route.ts # POST: Buchung stornieren
    ├── therapist/
    │   └── bookings/
    │       ├── route.ts            # GET: Therapeutenbuchungen
    │       └── [id]/
    │           └── status/route.ts # POST: Status ändern
    ├── admin/
    │   └── therapists/
    │       ├── route.ts            # GET/POST: Therapeuten
    │       ├── query/route.ts      # GET: Erweiterte Suche
    │       └── [id]/
    │           └── approve/route.ts # POST: Therapeut freigeben
    ├── shop/
    │   ├── products/route.ts       # GET: Produkte
    │   └── orders/route.ts         # POST: Bestellung erstellen
    ├── webhooks/
    │   └── stripe/route.ts         # POST: Stripe Webhooks
    └── health/route.ts             # GET: Health Check
```

#### Komponenten-Hierarchie

**Schlüsselkomponenten:**

```typescript
components/
├── booking/
│   ├── BookingWizard.tsx           // Mehrstufiger Buchungsprozess
│   ├── ServiceSelector.tsx         // Service-Auswahl
│   └── BookingConfirmation.tsx     // Buchungsbestätigung
│
├── maps/
│   ├── AddressAutocomplete.tsx     // Google Places Integration
│   ├── MapPicker.tsx               // Interaktive Karte zur Standortwahl
│   └── MapPinPreview.tsx           // Standort-Vorschau
│
├── calendar/
│   ├── Calendar.tsx                // Datumsauswahl-Kalender
│   ├── DateTimePicker.tsx          // Zeit-Slot-Auswahl
│   └── TimeSlotGrid.tsx            // Verfügbare Zeitfenster
│
├── therapist/
│   ├── TherapistProfileForm.tsx    // Profil-Formular
│   ├── TherapistAvailability.tsx   // Verfügbarkeits-Management
│   ├── AvailabilityCalendar.tsx    // Kalender-Ansicht
│   ├── RecurringPatterns.tsx       // Wiederkehrende Muster
│   ├── TherapistServiceSelector.tsx // Service-Auswahl
│   └── BookingRequestCard.tsx      // Buchungsanfrage-Karte
│
├── admin/
│   ├── TherapistApprovalPanel.tsx  // Freigabe-Panel
│   ├── BookingManagementTable.tsx  // Buchungstabelle
│   └── ProductCatalogManager.tsx   // Produktverwaltung
│
├── shop/
│   ├── ProductGrid.tsx             // Produktraster
│   ├── ProductCard.tsx             // Produkt-Karte
│   ├── ShoppingCart.tsx            // Warenkorb
│   └── CheckoutForm.tsx            // Checkout-Formular
│
├── auth/
│   ├── RoleGate.tsx                // Route Protection Component
│   ├── ProfileBootstrapper.tsx     // Auto-Profil-Erstellung
│   ├── LoginForm.tsx               // Login-Formular
│   └── RegisterForm.tsx            // Registrierungs-Formular
│
└── ui/
    ├── button.tsx                  // Button-Komponente
    ├── input.tsx                   // Input-Komponente
    ├── card.tsx                    // Card-Komponente
    ├── badge.tsx                   // Badge-Komponente
    └── ...                         // Weitere UI-Komponenten
```

#### State Management

**1. Server State (TanStack Query)**
```typescript
// Beispiel: Buchungen abrufen
const { data: bookings, isLoading } = useQuery({
  queryKey: ['customer-bookings'],
  queryFn: async () => {
    const response = await fetch('/api/customer/bookings');
    return response.json();
  },
  refetchInterval: 30000,  // Alle 30 Sekunden aktualisieren
});
```

**Vorteile:**
- Automatisches Caching
- Background-Refetching
- Optimistic Updates
- Error Handling

**2. Client State (Zustand)**
```typescript
// Warenkorb-Store
interface CartStore {
  items: CartItem[];
  addItem: (item: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.id !== productId)
  })),
  clearCart: () => set({ items: [] }),
  get total() {
    return get().items.reduce((sum, item) => sum + item.price, 0);
  }
}));
```

**3. Auth State (Supabase Session + Cookies)**
```typescript
// Browser Client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Session abrufen
const { data: { session } } = await supabase.auth.getSession();

// Role Cookie (gesetzt bei Login)
cookies().set('sb-role', user.role, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
});
```

### Backend-Architektur

#### API Route Handler Pattern

**Standard-Struktur:**
```typescript
// /app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validierungs-Schema
const bookingSchema = z.object({
  service_id: z.string().uuid(),
  latitude: z.number().min(9.6).max(9.8),
  longitude: z.number().min(99.9).max(100.1),
  start_time: z.string().datetime(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentifizierung
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Request Body parsen und validieren
    const body = await request.json();
    const validated = bookingSchema.parse(body);

    // 3. Business Logic
    const therapist = await findTherapistForBooking(
      supabase,
      { lat: validated.latitude, lng: validated.longitude },
      validated.service_id
    );

    if (!therapist) {
      return NextResponse.json(
        { error: 'No therapist available' },
        { status: 404 }
      );
    }

    // 4. Datenbank-Operation
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        therapist_id: therapist.id,
        service_id: validated.service_id,
        latitude: validated.latitude,
        longitude: validated.longitude,
        start_time: validated.start_time,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 5. Notifications senden
    await sendNotification({
      channel: 'email',
      to: therapist.email,
      template: 'new-booking',
      data: { booking }
    });

    // 6. Erfolgs-Response
    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    // Error Handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Booking creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Middleware (Route Protection)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const role = request.cookies.get('sb-role')?.value;
  const path = request.nextUrl.pathname;

  // Customer-Routen
  if (path.startsWith('/customer')) {
    if (role !== 'customer') {
      return NextResponse.redirect(new URL('/customer/login', request.url));
    }
  }

  // Therapeuten-Routen
  if (path.startsWith('/therapist')) {
    if (role !== 'therapist') {
      return NextResponse.redirect(new URL('/therapist/login', request.url));
    }
  }

  // Admin-Routen
  if (path.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/therapist/:path*',
    '/admin/:path*',
  ],
};
```

---

## 5. Datenbank-Schema

### Tabellen-Übersicht

#### **profiles** - Basis-Nutzerprofil
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('customer', 'therapist', 'admin')),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  onboarding_status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy: Nutzer können nur eigenes Profil sehen/bearbeiten
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### **therapist_profiles** - Erweiterte Therapeuten-Daten
```sql
CREATE TABLE therapist_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  bio TEXT,
  experience_years INTEGER,
  languages TEXT[],                    -- Array von Sprachen
  travel_radius_km NUMERIC DEFAULT 10,  -- Reiseradius in km
  latitude NUMERIC,                     -- GPS-Koordinaten
  longitude NUMERIC,
  avg_rating NUMERIC DEFAULT 0,         -- Durchschnittsbewertung
  total_bookings INTEGER DEFAULT 0,     -- Anzahl Buchungen
  certifications_url TEXT,              -- Link zu Zertifikaten
  payout_method TEXT,                   -- Auszahlungsmethode
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Therapeuten-Profile sind öffentlich lesbar (nach Approval)
CREATE POLICY "Approved therapist profiles are public"
  ON therapist_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = therapist_profiles.id
      AND profiles.onboarding_status = 'approved'
    )
  );

-- Nur eigenes Profil bearbeiten
CREATE POLICY "Therapists can update own profile"
  ON therapist_profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### **services** - Verfügbare Massage-Services
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL,          -- Basis-Preis in THB
  duration_minutes INTEGER NOT NULL,    -- Dauer in Minuten
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beispiel-Daten
INSERT INTO services (name, base_price, duration_minutes) VALUES
  ('Thai Massage', 1000, 90),
  ('Aroma Ritual', 1500, 120),
  ('Sport & Recovery', 1300, 90);

-- RLS: Services sind öffentlich lesbar
CREATE POLICY "Services are public"
  ON services FOR SELECT
  USING (is_active = true);
```

#### **therapist_services** - Welcher Therapeut bietet welche Services an
```sql
CREATE TABLE therapist_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id),
  service_id UUID NOT NULL REFERENCES services(id),
  custom_price NUMERIC,                 -- Optional: eigener Preis
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(therapist_id, service_id)
);

-- RLS: Öffentlich lesbar für aktive Services
CREATE POLICY "Active therapist services are public"
  ON therapist_services FOR SELECT
  USING (is_active = true);
```

#### **addresses** - Kunden-Adressen (Google Places Cache)
```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  google_place_id TEXT,
  formatted_address TEXT NOT NULL,
  street_address TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Nur eigene Adressen
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  USING (auth.uid() = user_id);
```

#### **availability_patterns** - Wiederkehrende Verfügbarkeit
```sql
CREATE TABLE availability_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,                     -- NULL = unbegrenzt
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Endzeit muss nach Startzeit sein
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Beispiel: Montag bis Freitag, 9-18 Uhr
INSERT INTO availability_patterns
  (therapist_id, day_of_week, start_time, end_time)
VALUES
  ('uuid-123', 1, '09:00', '18:00'),  -- Montag
  ('uuid-123', 2, '09:00', '18:00'),  -- Dienstag
  ('uuid-123', 3, '09:00', '18:00'),  -- Mittwoch
  ('uuid-123', 4, '09:00', '18:00'),  -- Donnerstag
  ('uuid-123', 5, '09:00', '18:00');  -- Freitag
```

#### **availability_slots** - Konkrete Zeitfenster
```sql
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Keine überlappenden Slots
  CONSTRAINT no_overlap EXCLUDE USING GIST (
    therapist_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
);

-- Index für schnelle Abfragen
CREATE INDEX idx_slots_therapist_time
  ON availability_slots(therapist_id, start_time, is_booked);
```

#### **bookings** - Kern der Plattform
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  therapist_id UUID REFERENCES therapist_profiles(id),
  service_id UUID NOT NULL REFERENCES services(id),
  address_id UUID REFERENCES addresses(id),

  -- Location (direkt gespeichert für Matching)
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  formatted_address TEXT,

  -- Zeitplanung
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Finanzen
  price NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  stripe_payment_intent TEXT UNIQUE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (
    status IN (
      'pending',           -- Warte auf Therapeuten-Zuweisung
      'accepted',          -- Therapeut hat angenommen
      'confirmed',         -- Zahlung bestätigt
      'on_the_way',        -- Therapeut ist unterwegs
      'in_progress',       -- Massage läuft
      'completed',         -- Abgeschlossen
      'cancelled',         -- Storniert
      'no_show'            -- Kunde war nicht da
    )
  ),

  -- Optionale Felder
  customer_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Kunden sehen eigene Buchungen
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id);

-- RLS: Therapeuten sehen zugewiesene Buchungen
CREATE POLICY "Therapists can view assigned bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = therapist_id);

-- Indexes für Performance
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_therapist ON bookings(therapist_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_time ON bookings(start_time);
```

#### **reviews** - Bewertungen
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  therapist_id UUID NOT NULL REFERENCES therapist_profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Durchschnittsbewertung aktualisieren
CREATE OR REPLACE FUNCTION update_therapist_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE therapist_profiles
  SET avg_rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE therapist_id = NEW.therapist_id
  )
  WHERE id = NEW.therapist_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_avg_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_therapist_avg_rating();
```

#### **products** - Shop-Produkte
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Produkte sind öffentlich
CREATE POLICY "Products are public"
  ON products FOR SELECT
  USING (is_active = true);
```

#### **orders** - Shop-Bestellungen
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')
  ),
  stripe_payment_intent TEXT UNIQUE,
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Nur eigene Bestellungen
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);
```

#### **order_items** - Bestellpositionen
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Über orders Policy
CREATE POLICY "Order items follow orders policy"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );
```

### Datenbank-Diagramm

```
┌─────────────┐
│   profiles  │
│ (Base User) │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌────────────┐
│  therapist_  │   │  addresses │
│   profiles   │   │  (Customer)│
└──────┬───────┘   └─────┬──────┘
       │                 │
       │                 │
       ▼                 │
┌──────────────┐         │
│  therapist_  │         │
│   services   │         │
└──────┬───────┘         │
       │                 │
       │    ┌────────────┴────┐
       │    │                 │
       │    ▼                 ▼
       │  ┌─────────────────────┐
       │  │      bookings       │
       │  └──────────┬──────────┘
       │             │
       │             ▼
       │      ┌────────────┐
       │      │   reviews  │
       │      └────────────┘
       │
       ▼
┌──────────────┐
│availability_ │
│   patterns   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│availability_ │
│    slots     │
└──────────────┘

┌──────────────┐
│   products   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    orders    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ order_items  │
└──────────────┘
```

---

## 6. User Flows

### A. Kunden-Buchungsflow (detailliert)

```
1. Kunde besucht /book
   │
   ├─ Seite lädt BookingWizard Komponente
   ├─ TanStack Query cached Services vom Server
   └─ Zustand: Step 1 - Location
   │
   ▼
2. Location eingeben
   │
   ├─ Option A: GPS-Button klicken
   │   ├─ Browser Geolocation API aufrufen
   │   ├─ Koordinaten erhalten
   │   ├─ Reverse Geocoding via Google Maps
   │   └─ Adresse anzeigen
   │
   └─ Option B: Manuelle Suche
       ├─ AddressAutocomplete Komponente
       ├─ Google Places Autocomplete API
       ├─ Nutzer tippt Adresse
       ├─ Vorschläge werden angezeigt
       ├─ Auswahl getroffen
       └─ Place Details API → Koordinaten
   │
   ├─ Validierung: Ko Phangan Bounding Box
   │   ├─ Lat: 9.6 - 9.8
   │   └─ Lng: 99.9 - 100.1
   │
   ├─ ✅ Innerhalb: Weiter zu Schritt 2
   └─ ❌ Außerhalb: Fehlermeldung
   │
   ▼
3. Service auswählen
   │
   ├─ ServiceSelector zeigt verfügbare Services
   ├─ Thai Massage (1000 THB, 90 min)
   ├─ Aroma Ritual (1500 THB, 120 min)
   └─ Sport & Recovery (1300 THB, 90 min)
   │
   ├─ Nutzer wählt Service
   ├─ Preis und Dauer werden gespeichert
   └─ Weiter zu Schritt 3
   │
   ▼
4. Datum & Zeit wählen
   │
   ├─ Calendar Komponente
   ├─ Datepicker zeigt verfügbare Tage
   ├─ Nutzer wählt Datum
   │
   ├─ DateTimePicker lädt verfügbare Slots
   │   └─ Query: /api/availability?date=2024-01-15
   │
   ├─ TimeSlotGrid zeigt Zeiten
   │   ├─ 09:00 - 10:30 ✅
   │   ├─ 11:00 - 12:30 ✅
   │   ├─ 14:00 - 15:30 ❌ (gebucht)
   │   └─ 16:00 - 17:30 ✅
   │
   └─ Nutzer wählt Zeitslot
   │
   ▼
5. Optional: Notizen hinzufügen
   │
   ├─ Textarea für Spezialwünsche
   ├─ Beispiele anzeigen
   └─ Weiter zur Bestätigung
   │
   ▼
6. Buchung absenden
   │
   ├─ BookingConfirmation zeigt Zusammenfassung
   │   ├─ Standort: "123 Beach Rd, Ko Phangan"
   │   ├─ Service: "Thai Massage"
   │   ├─ Zeit: "15.01.2024, 11:00 - 12:30"
   │   ├─ Preis: "1000 THB"
   │   └─ Notizen: "Fokus auf Rücken"
   │
   ├─ "Jetzt buchen" Button
   │
   ▼
7. POST /api/bookings
   │
   ├─ Request Body:
   │   {
   │     service_id: "uuid",
   │     latitude: 9.7123,
   │     longitude: 100.0456,
   │     formatted_address: "123 Beach Rd",
   │     start_time: "2024-01-15T11:00:00Z",
   │     customer_notes: "Fokus auf Rücken"
   │   }
   │
   ├─ Backend-Verarbeitung:
   │   │
   │   ├─ 1. Authentifizierung prüfen (JWT)
   │   ├─ 2. Payload validieren (Zod)
   │   ├─ 3. Ko Phangan Bounding Box prüfen
   │   │
   │   ├─ 4. Matching-Algorithmus starten
   │   │   └─ findTherapistForBooking()
   │   │
   │   ├─ 5. Service-Details abrufen (Preis, Dauer)
   │   │
   │   ├─ 6. Adresse in addresses Tabelle cachen
   │   │   INSERT INTO addresses (...)
   │   │
   │   ├─ 7. Buchung erstellen
   │   │   INSERT INTO bookings (
   │   │     customer_id,
   │   │     therapist_id,      ← Vom Matching
   │   │     service_id,
   │   │     latitude,
   │   │     longitude,
   │   │     start_time,
   │   │     end_time,          ← start_time + Dauer
   │   │     price,
   │   │     status: 'pending'
   │   │   )
   │   │
   │   ├─ 8. Benachrichtigungen senden
   │   │   ├─ Email an Therapeuten
   │   │   │   └─ "Neue Buchung von Max M."
   │   │   ├─ Email an Operations
   │   │   │   └─ "Booking #123 created"
   │   │   └─ WhatsApp an Kunden (optional)
   │   │       └─ "Ihre Buchung wurde bestätigt"
   │   │
   │   └─ 9. Response zurück
   │       {
   │         id: "booking-uuid",
   │         status: "pending",
   │         therapist: { name: "Anna T." },
   │         ...
   │       }
   │
   ▼
8. Bestätigungsseite
   │
   ├─ "Buchung erfolgreich!"
   ├─ Buchungsdetails anzeigen
   ├─ Therapeut-Info (Name, Foto, Bewertung)
   ├─ "Zahlung abschließen" Button
   │
   ▼
9. Stripe Checkout (TODO: vollständige Integration)
   │
   ├─ POST /api/payments/create-intent
   │   └─ Stripe Payment Intent erstellen
   │
   ├─ Redirect zu Stripe Checkout
   │
   ├─ Kunde gibt Zahlungsdaten ein
   │
   ├─ Zahlung erfolgreich
   │   └─ Webhook: /api/webhooks/stripe
   │       └─ payment_intent.succeeded
   │
   ├─ Booking-Status Update:
   │   UPDATE bookings
   │   SET payment_status = 'paid',
   │       status = 'confirmed'
   │   WHERE stripe_payment_intent = 'pi_xyz'
   │
   └─ Redirect zurück zu /customer/bookings
   │
   ▼
10. Therapeut erhält Benachrichtigung
    │
    ├─ Email: "Neue bezahlte Buchung"
    ├─ Real-time: Supabase Realtime Subscription
    │   └─ Dashboard zeigt neuen Badge
    │
    └─ Therapeut loggt sich ein
    │
    ▼
11. Therapeut nimmt Buchung an
    │
    ├─ /therapist/bookings
    ├─ Booking-Karte anzeigen
    │   ├─ Kunde: "Max M."
    │   ├─ Service: "Thai Massage"
    │   ├─ Zeit: "15.01. 11:00"
    │   ├─ Ort: Karte mit Route
    │   └─ Notizen: "Fokus auf Rücken"
    │
    ├─ "Annehmen" Button
    │
    ├─ POST /api/therapist/bookings/{id}/status
    │   { status: "accepted" }
    │
    ├─ Backend:
    │   UPDATE bookings
    │   SET status = 'accepted'
    │   WHERE id = booking_id
    │
    └─ Notification an Kunden
        └─ "Anna T. hat Ihre Buchung angenommen"
    │
    ▼
12. Am Buchungstag
    │
    ├─ Therapeut: Status → "on_the_way"
    ├─ Kunde erhält Notification
    │
    ├─ Therapeut kommt an: Status → "in_progress"
    ├─ Kunde erhält Update
    │
    ├─ Massage fertig: Status → "completed"
    │
    └─ Kunde erhält Anfrage zur Bewertung
    │
    ▼
13. Bewertung abgeben
    │
    ├─ /customer/bookings/{id}/review
    │
    ├─ Rating: 1-5 Sterne
    ├─ Kommentar (optional)
    │
    ├─ POST /api/reviews
    │   {
    │     booking_id,
    │     rating: 5,
    │     comment: "Sehr professionell!"
    │   }
    │
    ├─ Backend:
    │   ├─ INSERT INTO reviews (...)
    │   └─ Trigger: update_therapist_avg_rating()
    │       └─ Durchschnitt neu berechnen
    │
    └─ Therapeut sieht neue Bewertung im Profil
```

### B. Therapeuten-Onboarding Flow

```
1. Therapeut besucht /therapist/register
   │
   ▼
2. Registrierungs-Formular
   │
   ├─ Email + Passwort
   ├─ Vollständiger Name
   ├─ Telefonnummer
   │
   ├─ Submit → Supabase Auth
   │
   ├─ Auth User erstellt
   │   └─ Supabase sendet Bestätigungs-Email
   │
   └─ Profile erstellt via Trigger/Hook
       INSERT INTO profiles (
         id: auth.user.id,
         role: 'therapist',
         onboarding_status: 'pending_review'
       )
   │
   ▼
3. Email bestätigen
   │
   ├─ Nutzer klickt Link in Email
   ├─ Redirect zu /auth/callback
   └─ Session wird erstellt
   │
   ▼
4. Redirect zu /therapist/profile (First Login)
   │
   ├─ Profilformular anzeigen
   │   ├─ Bio (Textarea)
   │   ├─ Berufserfahrung (Jahre)
   │   ├─ Sprachen (Multi-Select)
   │   ├─ Reiseradius (Slider: 1-20 km)
   │   ├─ Standort (Map Picker)
   │   │   └─ Latitude/Longitude
   │   ├─ Zertifikate-Upload
   │   │   └─ Supabase Storage
   │   └─ Auszahlungsmethode
   │
   ├─ Validierung: Alle Pflichtfelder
   │
   └─ Submit
       │
       ├─ POST /api/therapist/profile
       │
       ├─ Backend:
       │   INSERT INTO therapist_profiles (
       │     id: user.id,
       │     bio,
       │     experience_years,
       │     languages,
       │     travel_radius_km,
       │     latitude,
       │     longitude,
       │     certifications_url,
       │     payout_method
       │   )
       │
       └─ Redirect zu /therapist/services
   │
   ▼
5. Services auswählen
   │
   ├─ TherapistServiceSelector
   │
   ├─ Alle verfügbaren Services anzeigen
   │   ├─ ☐ Thai Massage (1000 THB)
   │   ├─ ☐ Aroma Ritual (1500 THB)
   │   └─ ☐ Sport & Recovery (1300 THB)
   │
   ├─ Therapeut wählt Services aus
   │
   ├─ Optional: Eigene Preise festlegen
   │   └─ Custom Price Input pro Service
   │
   └─ Submit
       │
       ├─ POST /api/therapist/services
       │   {
       │     services: [
       │       { service_id: "uuid-1", custom_price: 1100 },
       │       { service_id: "uuid-2", custom_price: null }
       │     ]
       │   }
       │
       ├─ Backend:
       │   INSERT INTO therapist_services (...)
       │
       └─ Redirect zu /therapist/availability
   │
   ▼
6. Verfügbarkeit einrichten
   │
   ├─ AvailabilityManagement Komponente
   │
   ├─ Tab 1: Wiederkehrende Muster
   │   │
   │   ├─ RecurringPatternForm
   │   │   ├─ Wochentag: [Mo, Di, Mi, Do, Fr, Sa, So]
   │   │   ├─ Von: 09:00
   │   │   ├─ Bis: 18:00
   │   │   ├─ Gültig ab: Heute
   │   │   └─ Gültig bis: (optional)
   │   │
   │   ├─ "Muster hinzufügen"
   │   │
   │   ├─ POST /api/therapist/availability/patterns
   │   │
   │   └─ Liste der Muster anzeigen
   │       └─ Bearbeiten/Löschen möglich
   │
   └─ Tab 2: Spezifische Slots
       │
       ├─ Kalender-Ansicht
       ├─ Tag auswählen
       ├─ Zeitfenster manuell hinzufügen
       │   └─ z.B. "15.01.2024, 14:00 - 17:00"
       │
       └─ POST /api/therapist/availability/slots
   │
   ▼
7. Profil zur Überprüfung einreichen
   │
   ├─ Zusammenfassung anzeigen
   │   ├─ ✅ Profil vollständig
   │   ├─ ✅ Services ausgewählt
   │   ├─ ✅ Verfügbarkeit eingerichtet
   │   └─ ✅ Zertifikate hochgeladen
   │
   ├─ "Zur Überprüfung einreichen" Button
   │
   ├─ PUT /api/therapist/profile
   │   { onboarding_status: 'pending_review' }
   │
   ├─ Backend:
   │   └─ Notification an Admins
   │       └─ "Neue Therapeuten-Bewerbung"
   │
   └─ Bestätigungsseite
       └─ "Danke! Wir überprüfen Ihr Profil."
   │
   ▼
8. Admin-Überprüfung (siehe Admin Flow)
   │
   ├─ Admin sieht Bewerbung in /admin
   ├─ Prüft Zertifikate
   ├─ Verifiziert Angaben
   │
   └─ Entscheidung
       │
       ├─ APPROVE:
       │   ├─ POST /admin/therapists/{id}/approve
       │   ├─ UPDATE profiles
       │   │   SET onboarding_status = 'approved'
       │   ├─ Notification an Therapeuten
       │   │   └─ "Herzlichen Glückwunsch! ..."
       │   └─ Therapeut kann Buchungen empfangen
       │
       └─ REJECT:
           ├─ POST /admin/therapists/{id}/reject
           ├─ UPDATE profiles
           │   SET onboarding_status = 'rejected'
           └─ Notification mit Feedback
   │
   ▼
9. Genehmigter Therapeut
   │
   ├─ Login zu /therapist
   │
   ├─ Dashboard zeigt:
   │   ├─ Neue Buchungen (0)
   │   ├─ Nächste Termine (-)
   │   ├─ Profil-Status: ✅ Aktiv
   │   └─ Bewertung: ⭐ - (noch keine)
   │
   ├─ Wartet auf erste Buchung
   │
   └─ Bei Buchung: Real-time Notification
       └─ Badge in Navbar
```

### C. Admin Therapeuten-Freigabe Flow

```
1. Admin besucht /admin
   │
   ├─ Authentifizierung: sb-role = 'admin'
   │
   ▼
2. Admin Dashboard
   │
   ├─ Übersicht-Karten
   │   ├─ Ausstehende Bewerbungen: 3
   │   ├─ Aktive Therapeuten: 12
   │   ├─ Heutige Buchungen: 8
   │   └─ Umsatz (Monat): 45.000 THB
   │
   ├─ Tab: Therapeuten-Bewerbungen
   │
   ▼
3. TherapistApprovalPanel
   │
   ├─ GET /api/admin/therapists?status=pending_review
   │
   ├─ Liste anzeigen:
   │   ┌──────────────────────────────────────┐
   │   │ Anna Schmidt                         │
   │   ├──────────────────────────────────────┤
   │   │ Berufserfahrung: 5 Jahre             │
   │   │ Sprachen: DE, EN, TH                 │
   │   │ Zertifikate: ✅ Hochgeladen          │
   │   │ Eingereicht: 12.01.2024              │
   │   │                                      │
   │   │ [Details] [Genehmigen] [Ablehnen]   │
   │   └──────────────────────────────────────┘
   │
   ▼
4. Details anzeigen (Modal)
   │
   ├─ TherapistProfileView
   │
   ├─ Vollständiges Profil:
   │   ├─ Persönliche Info
   │   │   ├─ Name: Anna Schmidt
   │   │   ├─ Email: anna@example.com
   │   │   ├─ Telefon: +66 123 456 789
   │   │   └─ Standort: 📍 Karte anzeigen
   │   │
   │   ├─ Berufliche Info
   │   │   ├─ Bio: "Ich bin zertifizierte..."
   │   │   ├─ Erfahrung: 5 Jahre
   │   │   ├─ Sprachen: Deutsch, Englisch, Thai
   │   │   └─ Reiseradius: 15 km
   │   │
   │   ├─ Services
   │   │   ├─ ✅ Thai Massage (1000 THB)
   │   │   ├─ ✅ Aroma Ritual (1600 THB - Eigener Preis)
   │   │   └─ ❌ Sport & Recovery
   │   │
   │   ├─ Verfügbarkeit
   │   │   └─ Mo-Fr: 9:00 - 18:00
   │   │
   │   └─ Zertifikate
   │       ├─ [PDF anzeigen] Thai Massage Certificate
   │       ├─ [PDF anzeigen] Aromatherapy Diploma
   │       └─ [Bild anzeigen] ID Card
   │
   ▼
5. Zertifikate prüfen
   │
   ├─ Click auf PDF → Neues Tab
   │   └─ Supabase Storage URL
   │       └─ https://supabase.co/storage/v1/object/...
   │
   ├─ Admin prüft:
   │   ├─ Gültigkeit
   │   ├─ Ausstellende Institution
   │   └─ Übereinstimmung mit Name
   │
   └─ Entscheidung treffen
   │
   ▼
6A. Genehmigen
    │
    ├─ "Genehmigen" Button
    │
    ├─ POST /api/admin/therapists/{id}/approve
    │
    ├─ Backend:
    │   │
    │   ├─ 1. Auth prüfen (Admin-Rolle)
    │   │
    │   ├─ 2. Profil aktualisieren
    │   │   UPDATE profiles
    │   │   SET onboarding_status = 'approved',
    │   │       updated_at = NOW()
    │   │   WHERE id = therapist_id
    │   │
    │   ├─ 3. Email senden
    │   │   sendNotification({
    │   │     channel: 'email',
    │   │     to: therapist.email,
    │   │     template: 'therapist-approved',
    │   │     data: {
    │   │       name: 'Anna',
    │   │       loginUrl: 'https://app.../therapist'
    │   │     }
    │   │   })
    │   │
    │   └─ 4. Response
    │       { success: true }
    │
    ├─ Frontend:
    │   ├─ Toast: "Anna Schmidt wurde genehmigt"
    │   ├─ Entfernen aus Liste
    │   └─ Counter aktualisieren
    │
    └─ Therapeut erhält Email:
        │
        "Herzlichen Glückwunsch, Anna!

        Ihr Therapeuten-Profil wurde genehmigt.
        Sie können sich jetzt einloggen und
        Buchungen empfangen.

        [Zum Dashboard]"
    │
    ▼
6B. Ablehnen
    │
    ├─ "Ablehnen" Button
    │
    ├─ Modal: Grund angeben
    │   ├─ Textarea: "Grund für Ablehnung"
    │   ├─ Beispiele:
    │   │   • "Zertifikate ungültig"
    │   │   • "Nicht genug Erfahrung"
    │   │   • "Unvollständige Angaben"
    │   └─ [Absenden]
    │
    ├─ POST /api/admin/therapists/{id}/reject
    │   { reason: "Zertifikate ungültig" }
    │
    ├─ Backend:
    │   ├─ UPDATE profiles
    │   │   SET onboarding_status = 'rejected'
    │   │
    │   └─ Email senden
    │       sendNotification({
    │         template: 'therapist-rejected',
    │         data: { reason }
    │       })
    │
    └─ Therapeut erhält Email:
        │
        "Leider konnten wir Ihre Bewerbung
        nicht genehmigen.

        Grund: Zertifikate ungültig

        Sie können sich gerne erneut bewerben,
        nachdem Sie die Probleme behoben haben."
```

---

## 7. Technologie-Stack

### Frontend-Stack

| Kategorie | Technologie | Version | Zweck |
|-----------|-------------|---------|-------|
| **Framework** | Next.js | 14.x | React-Framework mit App Router |
| **UI Library** | React | 18.x | Komponenten-Bibliothek |
| **Sprache** | TypeScript | 5.x | Typsicheres JavaScript |
| **Styling** | Tailwind CSS | 3.x | Utility-First CSS |
| **State (Server)** | TanStack Query | 5.x | Server State Management, Caching |
| **State (Client)** | Zustand | 4.x | Lightweight State Store |
| **Forms** | React Hook Form | 7.x | Formular-Management |
| **Validation** | Zod | 3.x | Schema-Validierung |
| **Datumsverarbeitung** | dayjs | 1.x | Datum/Zeit Manipulation |
| **Icons** | Lucide React | - | Icon-Bibliothek |
| **Utilities** | clsx / cn | - | CSS Class Merging |

**Installation:**
```bash
npm install next@14 react@18 typescript
npm install tailwindcss @tanstack/react-query zustand
npm install react-hook-form zod dayjs
npm install lucide-react clsx
```

### Backend-Stack

| Kategorie | Technologie | Zweck |
|-----------|-------------|-------|
| **Database** | PostgreSQL | Relationale Datenbank (via Supabase) |
| **Backend** | Supabase | Backend-as-a-Service |
| **Auth** | Supabase Auth | Authentifizierung mit JWT |
| **Storage** | Supabase Storage | File Uploads (Zertifikate, Bilder) |
| **Realtime** | Supabase Realtime | WebSocket für Live-Updates |
| **API** | Next.js Route Handlers | RESTful API Endpoints |

**Supabase Clients:**
```typescript
// Browser Client (Public Anon Key)
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server Client (Service Role Key - Elevated Permissions)
import { createServerClient } from '@supabase/ssr';

export const supabaseAdmin = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ⚠️ Nur server-side!
);
```

### Externe Services

| Service | Zweck | Integration |
|---------|-------|-------------|
| **Stripe** | Payment Processing | Stripe.js + Webhooks |
| **SendGrid** | Email Versand | REST API |
| **Twilio** | WhatsApp/SMS | SDK |
| **Google Maps** | Geocoding, Places | JavaScript API |

**Installationen:**
```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Stripe
npm install @stripe/stripe-js stripe

# SendGrid
npm install @sendgrid/mail

# Twilio
npm install twilio

# Google Maps
npm install @vis.gl/react-google-maps
```

### Development Tools

| Tool | Zweck |
|------|-------|
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **Vitest** | Unit Testing |
| **Playwright** | E2E Testing |
| **TypeScript** | Type Checking |

### Deployment & Hosting

| Komponente | Service |
|-----------|---------|
| **Frontend** | Vercel (Next.js optimiert) |
| **Backend** | Supabase Cloud |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage |
| **CDN** | Vercel Edge Network |

---

## 8. Sicherheitskonzept

### Authentifizierung

#### Supabase Auth Flow
```typescript
// 1. User registriert sich
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'Max Mustermann',
      role: 'customer'
    }
  }
});

// 2. Supabase sendet Bestätigungs-Email
// 3. User klickt Link → /auth/callback
// 4. Session wird erstellt

// 5. Session abrufen
const { data: { session } } = await supabase.auth.getSession();
// session.access_token → JWT Token
// session.user.id → User UUID

// 6. Token wird automatisch in Requests inkludiert
// Authorization: Bearer <JWT>
```

#### JWT Token Struktur
```json
{
  "sub": "user-uuid-123",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "full_name": "Max Mustermann",
    "role": "customer"
  },
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Autorisierung

#### Row Level Security (RLS)

**Konzept:**
Jede Tabelle hat SQL-Policies, die definieren, wer was sehen/ändern darf.

**Beispiele:**

```sql
-- 1. Nutzer können nur eigene Buchungen sehen
CREATE POLICY "Users can view own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = customer_id);

-- 2. Therapeuten sehen zugewiesene Buchungen
CREATE POLICY "Therapists can view assigned bookings"
  ON bookings
  FOR SELECT
  USING (
    auth.uid() = therapist_id
    OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- 3. Nur eigenes Profil bearbeiten
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 4. Therapeuten-Profile sind öffentlich (nach Approval)
CREATE POLICY "Approved therapist profiles are public"
  ON therapist_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = therapist_profiles.id
      AND profiles.onboarding_status = 'approved'
    )
  );

-- 5. Admins haben vollen Zugriff
CREATE POLICY "Admins have full access"
  ON bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

**Aktivierung:**
```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
```

#### API Route Protection

**Middleware-basiert:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const role = request.cookies.get('sb-role')?.value;
  const path = request.nextUrl.pathname;

  // Rollen-Mapping
  const protectedRoutes = {
    '/customer': 'customer',
    '/therapist': 'therapist',
    '/admin': 'admin',
  };

  for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
    if (path.startsWith(route) && role !== requiredRole) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}
```

**Route Handler Protection:**
```typescript
// /app/api/admin/therapists/route.ts
export async function GET(request: NextRequest) {
  // 1. Session prüfen
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rolle prüfen
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Daten abrufen (mit Service Role Key für Admin-Zugriff)
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: therapists } = await supabaseAdmin
    .from('therapist_profiles')
    .select('*');

  return NextResponse.json(therapists);
}
```

### Datenschutz

#### Umgebungsvariablen

**Öffentlich (NEXT_PUBLIC_*):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Public Key, nur Read
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=https://massagevermittler.com
```

**Privat (Nur Server-Side):**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ⚠️ Volle DB-Rechte!
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@massagevermittler.com
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+...
```

**Wichtig:**
- ✅ `.env.local` ist in `.gitignore`
- ❌ Niemals Secret Keys im Frontend verwenden
- ✅ Vercel Environment Variables für Production

#### Sensitive Daten

**Verschlüsselung:**
- Passwörter: Bcrypt (Supabase Auth)
- Zahlungsdaten: Stripe (PCI-compliant)
- HTTPS: Alle Verbindungen verschlüsselt

**Daten-Minimierung:**
- Keine Kreditkartendaten gespeichert (Stripe übernimmt)
- GPS-Koordinaten nur für Matching (nicht öffentlich)
- Therapeuten-Telefonnummern nur für zugewiesene Kunden

### OWASP Top 10 Schutz

#### 1. SQL Injection
- ✅ Supabase verwendet Prepared Statements
- ✅ Zod-Validierung vor DB-Queries

#### 2. XSS (Cross-Site Scripting)
- ✅ React escapt automatisch User Input
- ✅ Content Security Policy (CSP) Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com; style-src 'self' 'unsafe-inline';"
  }
];
```

#### 3. CSRF (Cross-Site Request Forgery)
- ✅ Supabase JWT Tokens (nicht Cookie-basiert)
- ✅ SameSite Cookies

#### 4. Authentication Bypass
- ✅ RLS Policies erzwingen Auth auf DB-Ebene
- ✅ Middleware prüft alle geschützten Routen

#### 5. Authorization Bypass
- ✅ Doppelte Prüfung: Middleware + RLS
- ✅ Admin-Operationen via Service Role Key

### Stripe Webhook Verification

```typescript
// /app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Webhook-Signatur verifizieren
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Event verarbeiten
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    // ...
  }

  return new Response('OK', { status: 200 });
}
```

---

## 9. Payment & Notification System

### Stripe Integration

#### Payment Flow

```typescript
// 1. Payment Intent erstellen (Server-Side)
// /app/api/payments/create-intent/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { booking_id } = await request.json();

  // Buchungsdetails abrufen
  const booking = await getBooking(booking_id);

  // Payment Intent erstellen
  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.price * 100,  // In Cent
    currency: 'thb',              // Thai Baht
    metadata: {
      booking_id: booking.id,
      customer_id: booking.customer_id,
      therapist_id: booking.therapist_id,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Payment Intent ID in Buchung speichern
  await supabase
    .from('bookings')
    .update({ stripe_payment_intent: paymentIntent.id })
    .eq('id', booking_id);

  return Response.json({
    clientSecret: paymentIntent.client_secret
  });
}

// 2. Frontend: Checkout aufrufen
// components/booking/PaymentForm.tsx
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function PaymentForm({ bookingId }: { bookingId: string }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Payment Intent erstellen
    fetch('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [bookingId]);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentElement />
      <button onClick={handleSubmit}>Jetzt bezahlen</button>
    </Elements>
  );
}

// 3. Webhook: Zahlung bestätigen
// /app/api/webhooks/stripe/route.ts
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.booking_id;

  // Buchungsstatus aktualisieren
  await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
    })
    .eq('id', bookingId);

  // Benachrichtigungen senden
  const booking = await getBookingDetails(bookingId);

  await sendNotification({
    channel: 'email',
    to: booking.therapist.email,
    template: 'payment-confirmed',
    data: { booking }
  });

  await sendNotification({
    channel: 'whatsapp',
    to: booking.customer.phone,
    template: 'booking-confirmed',
    data: { booking }
  });
}
```

#### Stripe Checkout Session (Alternative)

```typescript
// Für Shop-Bestellungen
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'thb',
        product_data: {
          name: 'Aromatherapy Oil Set',
          images: ['https://...'],
        },
        unit_amount: 50000,  // 500 THB
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/cancel`,
  metadata: {
    order_id: 'order-uuid-123',
  },
});

// Redirect zu Stripe
return Response.json({ url: session.url });
```

### Notification System

#### Email (SendGrid)

```typescript
// lib/notifications/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({
  to,
  template,
  data
}: {
  to: string;
  template: string;
  data: Record<string, any>;
}) {
  const templates = {
    'new-booking': {
      subject: 'Neue Buchung erhalten',
      html: `
        <h1>Neue Buchung!</h1>
        <p>Hallo ${data.therapist_name},</p>
        <p>Sie haben eine neue Buchung:</p>
        <ul>
          <li>Service: ${data.service_name}</li>
          <li>Datum: ${data.start_time}</li>
          <li>Kunde: ${data.customer_name}</li>
          <li>Adresse: ${data.address}</li>
        </ul>
        <a href="${data.dashboard_url}">Zur Buchung</a>
      `,
    },
    'booking-confirmed': {
      subject: 'Buchung bestätigt',
      html: `
        <h1>Buchung bestätigt!</h1>
        <p>Ihre Massage-Buchung wurde bestätigt.</p>
        <p>Therapeut: ${data.therapist_name}</p>
        <p>Datum: ${data.start_time}</p>
      `,
    },
    'therapist-approved': {
      subject: 'Profil genehmigt!',
      html: `
        <h1>Herzlichen Glückwunsch, ${data.name}!</h1>
        <p>Ihr Therapeuten-Profil wurde genehmigt.</p>
        <p>Sie können sich jetzt einloggen und Buchungen empfangen.</p>
        <a href="${data.loginUrl}">Zum Dashboard</a>
      `,
    },
  };

  const template_data = templates[template as keyof typeof templates];

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: template_data.subject,
    html: template_data.html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
```

#### WhatsApp (Twilio)

```typescript
// lib/notifications/whatsapp.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsApp({
  to,
  template,
  data
}: {
  to: string;
  template: string;
  data: Record<string, any>;
}) {
  const messages = {
    'booking-confirmed': `
🌴 *Massagevermittler*

Ihre Buchung wurde bestätigt!

✅ Service: ${data.service_name}
📅 Datum: ${data.start_time}
👤 Therapeut: ${data.therapist_name}
📍 Adresse: ${data.address}

Wir freuen uns auf Sie!
    `,
    'therapist-on-the-way': `
🌴 *Massagevermittler*

${data.therapist_name} ist auf dem Weg zu Ihnen!

⏱️ Ankunft: ca. ${data.eta} Minuten
    `,
  };

  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM!}`,
      to: `whatsapp:${to}`,
      body: messages[template as keyof typeof messages],
    });
    console.log(`WhatsApp sent to ${to}`);
  } catch (error) {
    console.error('WhatsApp sending failed:', error);
    throw error;
  }
}
```

#### Notification Service (Unified)

```typescript
// lib/notifications/index.ts
type NotificationChannel = 'email' | 'whatsapp';

export async function sendNotification({
  channel,
  to,
  template,
  data,
}: {
  channel: NotificationChannel;
  to: string;
  template: string;
  data: Record<string, any>;
}) {
  // Retry-Logik mit Exponential Backoff
  const maxRetries = 3;
  const delays = [1000, 2000, 4000]; // 1s, 2s, 4s

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (channel === 'email') {
        await sendEmail({ to, template, data });
      } else if (channel === 'whatsapp') {
        await sendWhatsApp({ to, template, data });
      }
      return; // Erfolg
    } catch (error) {
      if (attempt < maxRetries - 1) {
        console.log(`Retry ${attempt + 1}/${maxRetries} after ${delays[attempt]}ms`);
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      } else {
        console.error('All notification attempts failed:', error);
        throw error;
      }
    }
  }
}
```

#### Real-time Notifications (Supabase Realtime)

```typescript
// Client-Side: Buchungs-Updates abonnieren
// app/therapist/(dashboard)/bookings/page.tsx

useEffect(() => {
  const supabase = createBrowserClient();

  // Real-time Subscription
  const subscription = supabase
    .channel('therapist-bookings')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `therapist_id=eq.${userId}`,
      },
      (payload) => {
        console.log('New booking received!', payload.new);

        // Toast-Notification anzeigen
        toast({
          title: 'Neue Buchung!',
          description: `${payload.new.customer_name} hat gebucht.`,
        });

        // Query invalidieren → neu laden
        queryClient.invalidateQueries(['therapist-bookings']);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

---

## 10. Matching-Algorithmus

### Konzept

Der Algorithmus findet den **besten verfügbaren Therapeuten** für eine Buchungsanfrage basierend auf:
1. **Distanz** (Haversine-Formel)
2. **Verfügbarkeit** (Services, Reiseradius)
3. **Bewertung** (Durchschnittsbewertung als Tiebreaker)

### Implementation

```typescript
// lib/matching.ts

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Haversine-Formel: Berechnet Luftlinie zwischen zwei GPS-Koordinaten
 */
function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Erdradius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
    Math.cos(toRad(point2.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Findet den besten Therapeuten für eine Buchung
 */
export async function findTherapistForBooking(
  supabase: SupabaseClient,
  customerLocation: Coordinates,
  serviceId: string
): Promise<string | null> {
  // 1. Alle Therapeuten finden, die den Service anbieten
  const { data: therapists, error } = await supabase
    .from('therapist_services')
    .select(`
      therapist_id,
      therapist_profiles (
        id,
        latitude,
        longitude,
        travel_radius_km,
        avg_rating,
        profiles (
          onboarding_status
        )
      )
    `)
    .eq('service_id', serviceId)
    .eq('is_active', true);

  if (error || !therapists || therapists.length === 0) {
    return null;
  }

  // 2. Therapeuten filtern und bewerten
  const candidates = therapists
    .map((ts) => {
      const profile = ts.therapist_profiles;

      // Nur genehmigte Therapeuten
      if (profile.profiles.onboarding_status !== 'approved') {
        return null;
      }

      // Nur mit GPS-Koordinaten
      if (!profile.latitude || !profile.longitude) {
        return null;
      }

      // Distanz berechnen
      const distance = calculateDistance(
        customerLocation,
        { lat: profile.latitude, lng: profile.longitude }
      );

      // Nur innerhalb des Reiseradius
      if (distance > profile.travel_radius_km) {
        return null;
      }

      return {
        therapist_id: profile.id,
        distance,
        rating: profile.avg_rating || 0,
      };
    })
    .filter(Boolean) as Array<{
      therapist_id: string;
      distance: number;
      rating: number;
    }>;

  if (candidates.length === 0) {
    return null;
  }

  // 3. Sortieren: Distanz (aufsteigend), dann Bewertung (absteigend)
  candidates.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance; // Näher = besser
    }
    return b.rating - a.rating; // Höhere Bewertung = besser
  });

  // 4. Besten Therapeuten zurückgeben
  return candidates[0].therapist_id;
}
```

### Beispiel-Szenario

**Buchungsanfrage:**
- Standort: `{ lat: 9.7123, lng: 100.0456 }`
- Service: Thai Massage
- Zeit: 15.01.2024, 11:00

**Verfügbare Therapeuten:**

| Therapeut | GPS | Distanz | Reiseradius | Bewertung | Match? |
|-----------|-----|---------|-------------|-----------|--------|
| Anna | 9.7100, 100.0400 | 0.6 km | 10 km | 4.8 ⭐ | ✅ |
| Lisa | 9.7200, 100.0500 | 1.2 km | 10 km | 4.9 ⭐ | ✅ |
| Maria | 9.7500, 100.0800 | 5.8 km | 5 km | 5.0 ⭐ | ✅ |
| Sophie | 9.6800, 99.9900 | 8.2 km | 5 km | 4.7 ⭐ | ❌ (außerhalb Radius) |

**Sortierung:**
1. Anna: 0.6 km, 4.8 ⭐
2. Lisa: 1.2 km, 4.9 ⭐
3. Maria: 5.8 km, 5.0 ⭐

**Ergebnis:** Anna wird zugewiesen (kürzeste Distanz)

### Erweiterungsmöglichkeiten

**Zukünftige Optimierungen:**

1. **Verfügbarkeits-Check:**
   ```typescript
   // Prüfen, ob Therapeut im gewünschten Zeitfenster verfügbar ist
   const { data: slots } = await supabase
     .from('availability_slots')
     .select('*')
     .eq('therapist_id', therapist_id)
     .eq('is_booked', false)
     .gte('start_time', requestedStartTime)
     .lte('end_time', requestedEndTime);

   if (!slots || slots.length === 0) {
     // Therapeut nicht verfügbar
     continue;
   }
   ```

2. **Präferenzen:**
   - Kunde bevorzugt bestimmte Sprachen
   - Geschlechtspräferenz
   - Bevorzugte Therapeuten (Favoriten)

3. **Dynamische Preisgestaltung:**
   - Therapeuten können Stoßzeiten-Preise festlegen
   - Rabatte für Neukunden

4. **Fairness:**
   - Round-Robin bei gleicher Distanz
   - Neuen Therapeuten Priorität geben (für erste Buchungen)

---

## 11. Deployment & Infrastruktur

### Vercel Deployment (Frontend + API)

#### Setup

```bash
# 1. Vercel CLI installieren
npm install -g vercel

# 2. Login
vercel login

# 3. Projekt initialisieren
vercel

# 4. Environment Variables setzen
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
# ... alle weiteren Variablen
```

#### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],  // Singapur (nah an Thailand)
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### Automatisches Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Supabase Setup

#### Projekt erstellen

```bash
# 1. Supabase Account erstellen auf https://supabase.com

# 2. Neues Projekt erstellen
# - Name: Massagevermittler
# - Region: Singapore (ap-southeast-1)
# - Database Password: [sicher generieren]

# 3. Supabase CLI installieren
npm install -g supabase

# 4. Login
supabase login

# 5. Projekt mit lokalem Code verknüpfen
supabase link --project-ref <your-project-ref>
```

#### Datenbank-Migrationen

```bash
# Schema lokal erstellen
supabase/migrations/20240101_initial_schema.sql

# Migration hochladen
supabase db push

# Oder: Migration direkt im Supabase Dashboard SQL Editor
```

#### RLS Policies aktivieren

```sql
-- Im Supabase SQL Editor ausführen

-- 1. RLS für alle Tabellen aktivieren
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ... für alle Tabellen

-- 2. Policies erstellen (siehe Abschnitt 5 - Datenbank-Schema)
```

#### Supabase Storage (Datei-Uploads)

```sql
-- 1. Bucket erstellen (im Supabase Dashboard > Storage)
-- Name: "certifications"
-- Public: false

-- 2. Policy für Upload
CREATE POLICY "Therapists can upload certifications"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certifications'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Policy für Download
CREATE POLICY "Admins can view all certifications"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certifications'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

**Upload im Code:**
```typescript
// Zertifikat hochladen
const file = event.target.files[0];
const filePath = `${userId}/${Date.now()}_${file.name}`;

const { data, error } = await supabase.storage
  .from('certifications')
  .upload(filePath, file);

if (!error) {
  const publicUrl = supabase.storage
    .from('certifications')
    .getPublicUrl(filePath).data.publicUrl;

  // URL in therapist_profile speichern
  await supabase
    .from('therapist_profiles')
    .update({ certifications_url: publicUrl })
    .eq('id', userId);
}
```

### Stripe Configuration

#### Webhook Setup

```bash
# 1. Stripe CLI installieren (für lokales Testen)
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Webhook lokal forwarden
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. Webhook Secret erhalten (aus CLI Output)
STRIPE_WEBHOOK_SECRET=whsec_...

# 5. In Production: Webhook im Stripe Dashboard erstellen
# URL: https://massagevermittler.com/api/webhooks/stripe
# Events:
#   - payment_intent.succeeded
#   - payment_intent.payment_failed
#   - checkout.session.completed
```

### Monitoring & Logging

#### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs

npx @sentry/wizard -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Supabase Logs

```bash
# Logs abrufen
supabase functions logs <function-name>

# Real-time logs
supabase functions logs <function-name> --tail
```

### Performance Optimierung

#### Next.js Optimierungen

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['supabase.co', 'stripe.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // React Compiler (experimental)
  experimental: {
    reactCompiler: true,
  },

  // Edge Runtime für API Routes
  experimental: {
    runtime: 'edge',
  },
};
```

#### Database Indexing

```sql
-- Wichtige Indexes für Performance
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_therapist ON bookings(therapist_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);

CREATE INDEX idx_therapist_services_therapist
  ON therapist_services(therapist_id);
CREATE INDEX idx_therapist_services_service
  ON therapist_services(service_id);

CREATE INDEX idx_availability_slots_therapist_time
  ON availability_slots(therapist_id, start_time, is_booked);
```

#### Caching-Strategie

```typescript
// TanStack Query Konfiguration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 Minuten
      cacheTime: 10 * 60 * 1000,     // 10 Minuten
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});

// Spezifische Caching-Strategien
useQuery({
  queryKey: ['services'],
  queryFn: fetchServices,
  staleTime: Infinity,  // Services ändern sich selten
});

useQuery({
  queryKey: ['bookings', userId],
  queryFn: fetchUserBookings,
  refetchInterval: 30000,  // Alle 30s aktualisieren
});
```

---

## 12. Development Roadmap

### ✅ Phase 1: Foundation (Completed)

**Ziele:**
- Projekt-Setup
- Basis-Authentifizierung
- Datenbank-Schema
- Landing Page

**Ergebnisse:**
- ✅ Next.js 14 Projekt initialisiert
- ✅ Supabase Integration
- ✅ Basis-Tabellen erstellt
- ✅ RLS Policies implementiert
- ✅ Landing Page mit Services

### ✅ Phase 2: Core Features (Completed)

**Ziele:**
- Buchungs-Wizard
- Kunden-Dashboard
- Therapeuten-Registration
- Admin-Panel (Basic)

**Ergebnisse:**
- ✅ BookingWizard Komponente
- ✅ Google Maps Integration
- ✅ Service-Auswahl
- ✅ Kunden-Login/-Registration
- ✅ Therapeuten-Onboarding
- ✅ Admin Approval Flow

### 🔄 Phase 3: Advanced Features (In Progress)

**Ziele:**
- Vollständige Stripe-Integration
- Automatisches Therapeuten-Matching
- Verfügbarkeits-Management
- Real-time Notifications

**Status:**
- ✅ Matching-Algorithmus implementiert
- ✅ Haversine-Distanzberechnung
- 🔄 Stripe Payment Intents (80%)
- 🔄 Webhook-Handling (70%)
- 🔄 Verfügbarkeits-Patterns (90%)
- ⏳ WhatsApp-Benachrichtigungen (50%)
- ⏳ Real-time Updates (30%)

**Nächste Schritte:**
1. Stripe Checkout vollständig testen
2. Webhook Error Handling verbessern
3. Supabase Realtime aktivieren
4. WhatsApp-Templates finalisieren

### ⏳ Phase 4: Shop & Upsells (Planned)

**Ziele:**
- Produktkatalog
- Shop-Checkout
- Gutschein-System
- Kombination Massage + Shop

**Tasks:**
- [ ] Produktverwaltung im Admin-Panel
- [ ] Warenkorb-Funktionalität (Zustand Store)
- [ ] Stripe Checkout für Shop
- [ ] Bestellhistorie
- [ ] Gutschein-Codes

### ⏳ Phase 5: Optimization & Scale (Planned)

**Ziele:**
- Performance-Optimierung
- SEO
- Mobile App (React Native)
- Analytics & Reporting

**Tasks:**
- [ ] Image Optimization (Next.js Image)
- [ ] Database Query Optimization
- [ ] Server-Side Rendering wo sinnvoll
- [ ] Sentry Error Tracking
- [ ] Google Analytics Integration
- [ ] Admin Dashboard Analytics
- [ ] React Native App (iOS/Android)

### ⏳ Phase 6: Expansion (Future)

**Ziele:**
- Multi-Location Support (andere Inseln/Städte)
- Multi-Language Support (Thai, Deutsch, Englisch)
- Subscription Model für Therapeuten
- Loyalty Program für Kunden

**Ideas:**
- Therapeuten-Abonnements (Premium-Features)
- Kunden-Treuepunkte
- Referral-System
- Business-Accounts für Hotels

---

## Zusammenfassung für Entwickler

### Quick Start

```bash
# 1. Repository klonen
git clone <repo-url>
cd massagevermittler

# 2. Dependencies installieren
npm install

# 3. Environment Variables kopieren
cp .env.example .env.local
# Variablen ausfüllen (siehe SETUP.md)

# 4. Supabase Schema importieren
supabase db push

# 5. Development Server starten
npm run dev
```

### Projekt-Struktur

```
massagevermittler/
├── app/                    # Next.js App Router
│   ├── (app)/             # Öffentliche Routen
│   ├── customer/          # Kunden-Bereich
│   ├── therapist/         # Therapeuten-Bereich
│   ├── admin/             # Admin-Bereich
│   └── api/               # API Route Handlers
├── components/            # React Komponenten
├── lib/                   # Utilities & Helpers
│   ├── supabase/         # Supabase Clients
│   ├── matching.ts       # Matching-Algorithmus
│   └── notifications/    # Email/WhatsApp
├── features/             # Feature-spezifische Logik
├── public/               # Statische Assets
├── supabase/             # Supabase Migrations
└── tests/                # Tests (Vitest, Playwright)
```

### Entwicklungs-Workflow

1. **Feature Branch erstellen**
   ```bash
   git checkout -b feature/booking-calendar
   ```

2. **Entwickeln mit Hot Reload**
   ```bash
   npm run dev
   # http://localhost:3000
   ```

3. **Tests schreiben**
   ```bash
   npm run test        # Vitest
   npm run test:e2e    # Playwright
   ```

4. **Code Quality**
   ```bash
   npm run lint        # ESLint
   npm run type-check  # TypeScript
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: Add booking calendar"
   git push origin feature/booking-calendar
   ```

6. **Pull Request erstellen**
   - GitHub PR mit Beschreibung
   - Code Review
   - Merge nach Approval

### Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `middleware.ts` | Route Protection & Auth |
| `lib/supabase/client.ts` | Supabase Browser Client |
| `lib/supabase/server.ts` | Supabase Server Client |
| `lib/matching.ts` | Therapeuten-Matching Logik |
| `lib/notifications/index.ts` | Unified Notification Service |
| `app/api/bookings/route.ts` | Buchungs-API |
| `components/booking/BookingWizard.tsx` | Haupt-Buchungs-UI |

### Datenfluss-Beispiel

**Buchung erstellen:**
```
User Input (BookingWizard)
  ↓
POST /api/bookings
  ↓
Validierung (Zod)
  ↓
Matching-Algorithmus
  ↓
Supabase Insert (bookings)
  ↓
Notifications senden
  ↓
Response → UI Update
  ↓
TanStack Query Cache Invalidation
  ↓
Dashboard zeigt neue Buchung
```

### Debugging

**Supabase Queries:**
```typescript
// Query mit Error Handling
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('customer_id', userId);

if (error) {
  console.error('Supabase error:', error);
  // RLS Policy-Fehler?
  // Falsche Filter?
}
```

**API Route Debugging:**
```typescript
// Logging hinzufügen
export async function POST(request: Request) {
  console.log('Request headers:', request.headers);
  const body = await request.json();
  console.log('Request body:', body);

  // ... Logik

  console.log('Response data:', data);
  return NextResponse.json(data);
}
```

**Browser DevTools:**
- Network Tab: API Calls inspizieren
- React DevTools: Komponenten-State
- Redux DevTools: TanStack Query Cache

### Hilfreiche Ressourcen

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **TanStack Query:** https://tanstack.com/query
- **Stripe Docs:** https://stripe.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Viel Erfolg bei der Entwicklung! 🚀**

Bei Fragen:
- Code Review via GitHub
- Dokumentation in `/docs`
- Team-Meetings für Architektur-Diskussionen
