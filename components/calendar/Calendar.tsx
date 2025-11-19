'use client';

import { useState, useMemo } from 'react';

export type CalendarDate = {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  isDisabled?: boolean;
  metadata?: any;
};

type CalendarProps = {
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  renderDay?: (day: CalendarDate) => React.ReactNode;
  className?: string;
};

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[]
): boolean {
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  if (disabledDates?.some((d) => isSameDay(d, date))) return true;
  return false;
}

export function Calendar({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  disabledDates,
  renderDay,
  className = '',
}: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(selectedDate || today);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the previous month to fill the calendar grid
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End at the next month to complete the grid
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: CalendarDate[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const isCurrentMonth = current.getMonth() === month;
      const isDisabled = isDateDisabled(current, minDate, maxDate, disabledDates);

      days.push({
        date: new Date(current),
        isToday: isSameDay(current, today),
        isCurrentMonth,
        isDisabled,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth, minDate, maxDate, disabledDates]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: CalendarDate) => {
    if (!day.isDisabled && onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const monthName = currentMonth.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Vorheriger Monat"
        >
          <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-bold text-slate-900 capitalize">{monthName}</h3>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Nächster Monat"
        >
          <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day.date, selectedDate);

          if (renderDay) {
            return (
              <div key={index} onClick={() => handleDateClick(day)}>
                {renderDay(day)}
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={day.isDisabled}
              className={`
                aspect-square p-2 rounded-lg text-sm font-medium transition-all
                ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-900'}
                ${day.isToday ? 'ring-2 ring-brand-400' : ''}
                ${isSelected ? 'bg-brand-600 text-white hover:bg-brand-700' : ''}
                ${!isSelected && !day.isDisabled && day.isCurrentMonth ? 'hover:bg-slate-100' : ''}
                ${day.isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
