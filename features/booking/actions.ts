import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import type { BookingPayload } from './types';

type BookingResponse = {
  success: boolean;
  message: string;
};

/** Calls the `/api/bookings` route to persist a massage order. */
export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  let authHeader: Record<string, string> = {};
  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      return { success: false, message: 'Bitte einloggen, um zu buchen.' };
    }
    authHeader = { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.warn('Supabase Session nicht verfügbar:', error);
  }

  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    return { success: false, message: text || 'Fehler beim Erstellen der Buchung.' };
  }

  const data = await response.json();
  return {
    success: true,
    message: data?.status ?? 'Buchung gespeichert. Wir bestätigen gleich per WhatsApp.'
  };
}
