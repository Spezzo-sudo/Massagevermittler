# Booking Feature Notes
- Halte UI-Logik schlank. Matching, Pricing und Validation gehören in `lib/matching` bzw. `lib/validation`.
- Neue API-Calls sollten zuerst als Route Handler unter `app/api/bookings` landen, bevor du direkt Supabase aus dem Client ansprichst.
- Alle Mutation-Hooks werden über TanStack Query oder Server Actions orchestriert; im MVP nutzen wir Fetch-Calls wie `createBooking`.
- Wenn du neue Booking-Subfeatures anlegst, dokumentiere sie hier inkl. erwarteter Supabase Tabellen/Views.
