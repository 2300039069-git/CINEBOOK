import React from 'react';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';

export const DateDayRibbon = ({ selectedDate, onDateSelect }) => {
  // Generate next 8 days from today
  const dateSlots = React.useMemo(() => {
    const slots = [];
    const today = new Date();
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (let i = 0; i < 8; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      const isoDate = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'TODAY' : i === 1 ? 'TOMORROW' : daysOfWeek[d.getDay()];
      const dayNumber = d.getDate();
      const monthName = months[d.getMonth()];

      slots.push({
        isoDate,
        dayName,
        dayNumber: String(dayNumber).padStart(2, '0'),
        monthName,
        isToday: i === 0,
      });
    }
    return slots;
  }, []);

  const activeDate = selectedDate || dateSlots[0].isoDate;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2 mb-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-text-primary">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>Select Cinema Date</span>
        </div>
        <span className="text-[11px] text-text-muted font-medium">Next 7 Days Scheduling</span>
      </div>

      {/* Horizontal Ribbon */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {dateSlots.map((slot) => {
          const isSelected = activeDate === slot.isoDate;
          return (
            <button
              key={slot.isoDate}
              type="button"
              onClick={() => onDateSelect?.(slot.isoDate)}
              className={`relative flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-2.5 px-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                isSelected
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 transform -translate-y-0.5'
                  : 'bg-surface border-border text-text-secondary hover:border-primary/40 hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              {/* Day Name */}
              <span
                className={`text-[9px] font-black uppercase tracking-wider ${
                  isSelected ? 'text-white' : slot.isToday ? 'text-primary' : 'text-text-muted'
                }`}
              >
                {slot.dayName}
              </span>

              {/* Day Number */}
              <span
                className={`text-base sm:text-lg font-black font-display leading-tight my-0.5 ${
                  isSelected ? 'text-white' : 'text-text-primary'
                }`}
              >
                {slot.dayNumber}
              </span>

              {/* Month */}
              <span
                className={`text-[9px] font-bold uppercase tracking-wider ${
                  isSelected ? 'text-white/80' : 'text-text-muted'
                }`}
              >
                {slot.monthName}
              </span>

              {/* Active Indicator Dot */}
              {isSelected && (
                <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-accent ring-2 ring-background" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateDayRibbon;
