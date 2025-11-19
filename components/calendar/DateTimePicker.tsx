'use client';

import { useState } from 'react';
import { Calendar } from './Calendar';

export type TimeSlot = {
  time: string; // HH:MM format
  available: boolean;
  label?: string;
};

type DateTimePickerProps = {
  selectedDate?: Date | null;
  selectedTime?: string | null;
  onDateTimeSelect: (date: Date, time: string) => void;
  availableTimeSlots?: TimeSlot[];
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
};

// Generate default time slots (9 AM to 9 PM, every 30 minutes)
function generateDefaultTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 21 && minute > 0) break; // Stop at 21:00
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ time, available: true });
    }
  }
  return slots;
}

export function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateTimeSelect,
  availableTimeSlots = generateDefaultTimeSlots(),
  minDate,
  maxDate,
  disabledDates,
  className = '',
}: DateTimePickerProps) {
  const [internalDate, setInternalDate] = useState<Date | null>(selectedDate || null);
  const [internalTime, setInternalTime] = useState<string | null>(selectedTime || null);

  const handleDateSelect = (date: Date) => {
    setInternalDate(date);
    // Reset time when date changes
    setInternalTime(null);
  };

  const handleTimeSelect = (time: string) => {
    if (!internalDate) return;

    setInternalTime(time);
    onDateTimeSelect(internalDate, time);
  };

  return (
    <div className={`grid gap-6 md:grid-cols-2 ${className}`}>
      {/* Calendar */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Datum wählen
        </label>
        <Calendar
          selectedDate={internalDate}
          onDateSelect={handleDateSelect}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
        />
      </div>

      {/* Time Slots */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Uhrzeit wählen
        </label>
        {!internalDate ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <svg
              className="h-12 w-12 text-slate-300 mx-auto mb-3"
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
            <p className="text-sm text-slate-500">
              Bitte wählen Sie zuerst ein Datum
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      internalTime === slot.time
                        ? 'bg-brand-600 text-white ring-2 ring-brand-400'
                        : slot.available
                        ? 'bg-slate-50 text-slate-900 hover:bg-brand-50 hover:text-brand-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  {slot.time}
                  {slot.label && <span className="block text-xs mt-1">{slot.label}</span>}
                </button>
              ))}
            </div>
            {availableTimeSlots.filter((s) => s.available).length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">
                  Keine verfügbaren Zeitslots für diesen Tag
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Summary */}
      {internalDate && internalTime && (
        <div className="md:col-span-2 bg-brand-50 border border-brand-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <svg
              className="h-6 w-6 text-brand-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-slate-900">Gewählter Termin:</p>
              <p className="text-lg font-bold text-brand-700">
                {internalDate.toLocaleDateString('de-DE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                um {internalTime} Uhr
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
