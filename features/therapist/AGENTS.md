# Therapist Portal
- Dashboard-Widgets (Buchungen, Einnahmen, Slots) liegen hier. Heavy logic wandert nach `lib/`.
- Immer prüfen, ob eine Aktion Admin-Rechte braucht – toggle per `profiles.role`.
- Realtime-Subscription Code gehört in dedizierte Hooks, nicht direkt in Komponenten.
