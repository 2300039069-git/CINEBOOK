import React, { useMemo } from 'react';
import { Calendar, Sparkles, Clock, ChevronRight, Zap } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const DateDayRibbon = ({
  selectedDate,
  onDateSelect,
  showQuickFilters = true,
  className = ''
}) => {
  const { selectedDate: contextDate, setSelectedDate: setContextDate } = useBooking();
  const activeDate = selectedDate || contextDate || new Date().toISOString().split('T')[0];

  // Generate dynamic 8-day schedule window starting from today
  const datesList = useMemo(() => {
    const list = [];
    const today = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = 0; i < 8; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateISO = d.toISOString().split('T')[0];
      const dayIndex = d.getDay();
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const isWeekend = dayIndex === 0 || dayIndex === 6;

      const dayCode = isToday ? 'TODAY' : isTomorrow ? 'TOM' : days[dayIndex];
      const dayNumber = d.getDate();
      const monthCode = months[d.getMonth()];
      const formattedLong = `${fullDays[dayIndex]}, ${dayNumber} ${fullMonths[d.getMonth()]} ${d.getFullYear()}`;

      list.push({
        dateISO,
        dayCode,
        dayNumber,
        monthCode,
        isToday,
        isTomorrow,
        isWeekend,
        formattedLong
      });
    }
    return list;
  }, []);

  const handleSelect = (dateISO) => {
    if (onDateSelect) {
      onDateSelect(dateISO);
    }
    if (setContextDate) {
      setContextDate(dateISO);
    }
  };

  return (
    <div className={`w-full space-y-3.5 ${className}`}>
      {/* Header with Active Date Summary & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 text-brand flex items-center justify-center shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-text-primary">
                Select Date & Day
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-brand/20 text-brand text-[10px] font-extrabold border border-brand/40 animate-pulse">
                Live Box Office
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              {datesList.find((d) => d.dateISO === activeDate)?.formattedLong || 'Select a day to view showtimes'}
            </p>
          </div>
        </div>

        {/* Quick Filter Shortcuts */}
        {showQuickFilters && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleSelect(datesList[0].dateISO)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                activeDate === datesList[0].dateISO
                  ? 'bg-brand text-void-950 border-brand shadow-xs font-black'
                  : 'bg-void-850/80 border-white/8 text-text-secondary hover:border-brand/40 hover:text-text-primary'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelect(datesList[1].dateISO)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                activeDate === datesList[1].dateISO
                  ? 'bg-brand text-void-950 border-brand shadow-xs font-black'
                  : 'bg-void-850/80 border-white/8 text-text-secondary hover:border-brand/40 hover:text-text-primary'
              }`}
            >
              Tomorrow
            </button>
            {datesList.find((d) => d.isWeekend && !d.isToday && !d.isTomorrow) && (
              <button
                type="button"
                onClick={() => {
                  const weekend = datesList.find((d) => d.isWeekend && !d.isToday && !d.isTomorrow);
                  if (weekend) handleSelect(weekend.dateISO);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-void-850/80 border-white/8 text-text-secondary hover:border-brand/40 hover:text-text-primary cursor-pointer hidden md:inline-block"
              >
                Weekend
              </button>
            )}
          </div>
        )}
      </div>

      {/* Horizontal 8-Day Scrolling Ribbon */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-void-900/90 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {datesList.map((item) => {
            const isSelected = activeDate === item.dateISO;
            return (
              <button
                key={item.dateISO}
                type="button"
                onClick={() => handleSelect(item.dateISO)}
                className={`relative flex flex-col items-center justify-center min-w-[70px] sm:min-w-[82px] py-2.5 sm:py-3 px-2 rounded-xl border transition-all duration-200 cursor-pointer flex-shrink-0 group ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 via-brand to-amber-600 text-void-950 border-brand shadow-md shadow-brand/30 scale-105 z-10'
                    : 'bg-void-850/90 border-white/6 hover:border-brand/50 text-text-secondary hover:text-text-primary hover:bg-void-800'
                }`}
              >
                {/* Day code */}
                <span
                  className={`text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase ${
                    isSelected ? 'text-void-950 font-black' : 'text-text-muted group-hover:text-brand'
                  }`}
                >
                  {item.dayCode}
                </span>

                {/* Day Number */}
                <span
                  className={`text-base sm:text-xl font-black my-0.5 tracking-tight ${
                    isSelected ? 'text-void-950' : 'text-text-primary'
                  }`}
                >
                  {item.dayNumber}
                </span>

                {/* Month Name */}
                <span
                  className={`text-[10px] font-bold uppercase ${
                    isSelected ? 'text-void-950/80 font-extrabold' : 'text-text-muted'
                  }`}
                >
                  {item.monthCode}
                </span>

                {/* Active Indicator Pip */}
                {isSelected && (
                  <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-void-950 border border-brand" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateDayRibbon;
