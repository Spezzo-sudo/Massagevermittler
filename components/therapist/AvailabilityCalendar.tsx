'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, type CalendarDate } from '../calendar/Calendar';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

type AvailabilitySlot = {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

type TimeSlot = {
  start: string;
  end: string;
  isBooked: boolean;
  slotId: string | null;
};

export function AvailabilityCalendar() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [allSlots, setAllSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Load all availability slots
  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const res = await fetch('/api/therapist/availability/get', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json?.slots) {
      setAllSlots(json.slots);
    }
    setLoading(false);
  };

  // Get slots for selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    const dateStr = selectedDate.toISOString().split('T')[0];
    return allSlots.filter((slot) => {
      const slotDate = slot.start_time.split('T')[0];
      return slotDate === dateStr;
    });
  }, [selectedDate, allSlots]);

  // Generate time slots for the day (9 AM to 9 PM)
  const generateTimeSlots = (): TimeSlot[] => {
    if (!selectedDate) return [];

    const slots: TimeSlot[] = [];
    const dateStr = selectedDate.toISOString().split('T')[0];

    for (let hour = 9; hour <= 21; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = (hour + 1).toString().padStart(2, '0');
      const start = `${dateStr}T${startHour}:00:00`;
      const end = `${dateStr}T${endHour}:00:00`;

      // Check if this slot exists
      const existingSlot = slotsForSelectedDate.find(
        (s) => s.start_time === start || s.start_time.startsWith(`${dateStr}T${startHour}:`)
      );

      slots.push({
        start,
        end,
        isBooked: existingSlot?.is_booked || false,
        slotId: existingSlot?.id || null,
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Toggle slot (add or remove)
  const toggleSlot = async (slot: TimeSlot) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    if (slot.isBooked) {
      setMessage('Dieser Slot ist bereits gebucht und kann nicht entfernt werden.');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (slot.slotId) {
      // Remove slot
      const res = await fetch('/api/therapists/availability', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.slotId }),
      });

      if (res.ok) {
        setAllSlots((prev) => prev.filter((s) => s.id !== slot.slotId));
        setMessage('Slot entfernt.');
        setTimeout(() => setMessage(null), 2000);
      }
    } else {
      // Add slot
      const res = await fetch('/api/therapists/availability', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: [{ start: slot.start, end: slot.end }] }),
      });

      if (res.ok) {
        const newSlot: AvailabilitySlot = {
          id: crypto.randomUUID(),
          start_time: slot.start,
          end_time: slot.end,
          is_booked: false,
        };
        setAllSlots((prev) => [...prev, newSlot]);
        setMessage('Slot hinzugefügt.');
        setTimeout(() => setMessage(null), 2000);
      } else {
        const text = await res.text();
        setMessage(text || 'Fehler beim Hinzufügen.');
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  // Get dates that have slots
  const datesWithSlots = useMemo(() => {
    const dates = new Set<string>();
    allSlots.forEach((slot) => {
      const dateStr = slot.start_time.split('T')[0];
      dates.add(dateStr);
    });
    return Array.from(dates).map((dateStr) => new Date(dateStr + 'T00:00:00'));
  }, [allSlots]);

  // Custom day renderer to show indicators
  const renderDay = (day: CalendarDate) => {
    const hasSlots = datesWithSlots.some((d) => {
      return (
        d.getFullYear() === day.date.getFullYear() &&
        d.getMonth() === day.date.getMonth() &&
        d.getDate() === day.date.getDate()
      );
    });

    const isSelected =
      selectedDate &&
      selectedDate.getFullYear() === day.date.getFullYear() &&
      selectedDate.getMonth() === day.date.getMonth() &&
      selectedDate.getDate() === day.date.getDate();

    return (
      <button
        type="button"
        disabled={day.isDisabled}
        className={`
          aspect-square p-2 rounded-lg text-sm font-medium transition-all relative
          ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-900'}
          ${day.isToday ? 'ring-2 ring-brand-400' : ''}
          ${isSelected ? 'bg-brand-600 text-white hover:bg-brand-700' : ''}
          ${!isSelected && !day.isDisabled && day.isCurrentMonth ? 'hover:bg-slate-100' : ''}
          ${day.isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {day.date.getDate()}
        {hasSlots && (
          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full"></span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Verfügbarkeits-Kalender</h2>
        <p className="text-sm text-slate-500">
          Wähle ein Datum und klicke auf die Zeitslots, um deine Verfügbarkeit zu setzen.
        </p>
      </div>

      {message && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-sm text-brand-800">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <div>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            minDate={new Date()}
            renderDay={renderDay}
          />
        </div>

        {/* Time Slots */}
        <div>
          {!selectedDate ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
              <svg
                className="h-16 w-16 text-slate-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-slate-500 font-medium">Wähle ein Datum im Kalender</p>
              <p className="text-sm text-slate-400 mt-1">
                Tage mit Slots sind mit einem Punkt markiert
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedDate.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h3>
                <p className="text-sm text-slate-500">Klicke um Slots hinzuzufügen/zu entfernen</p>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                {loading ? (
                  <p className="text-center text-slate-500 py-8">Lädt...</p>
                ) : timeSlots.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    Keine Zeitslots für diesen Tag
                  </p>
                ) : (
                  timeSlots.map((slot, index) => {
                    const startTime = new Date(slot.start).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const endTime = new Date(slot.end).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        disabled={slot.isBooked}
                        className={`
                          w-full p-3 rounded-lg text-left transition-all border-2
                          ${
                            slot.slotId
                              ? slot.isBooked
                                ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                                : 'bg-brand-50 border-brand-300 text-brand-900 hover:bg-brand-100'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-brand-300'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                slot.slotId
                                  ? slot.isBooked
                                    ? 'bg-red-100'
                                    : 'bg-brand-100'
                                  : 'bg-slate-100'
                              }`}
                            >
                              {slot.slotId ? (
                                slot.isBooked ? (
                                  <svg
                                    className="h-5 w-5 text-red-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="h-5 w-5 text-brand-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )
                              ) : (
                                <svg
                                  className="h-5 w-5 text-slate-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {startTime} - {endTime}
                              </p>
                              <p className="text-xs">
                                {slot.isBooked
                                  ? 'Gebucht'
                                  : slot.slotId
                                  ? 'Verfügbar'
                                  : 'Nicht verfügbar'}
                              </p>
                            </div>
                          </div>
                          {!slot.isBooked && (
                            <span className="text-xs font-medium">
                              {slot.slotId ? 'Klick zum Entfernen' : 'Klick zum Hinzufügen'}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{allSlots.length}</p>
            <p className="text-xs text-slate-600">Gesamt Slots</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-600">
              {allSlots.filter((s) => !s.is_booked).length}
            </p>
            <p className="text-xs text-slate-600">Verfügbar</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {allSlots.filter((s) => s.is_booked).length}
            </p>
            <p className="text-xs text-slate-600">Gebucht</p>
          </div>
        </div>
      </div>
    </div>
  );
}
