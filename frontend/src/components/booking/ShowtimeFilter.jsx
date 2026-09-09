import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Info,
  Smartphone,
  Utensils,
  ChevronDown,
  Filter,
  Sparkles
} from 'lucide-react';

const ShowtimeFilter = ({
  theatres = [],
  selectedDate,
  onDateChange,
  onShowSelect
}) => {
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('All');

  // 7-day date strip
  const datesList = useMemo(() => {
    const list = [];
    const today = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateISO = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'TODAY' : i === 1 ? 'TOM' : days[d.getDay()];
      const dayNumber = d.getDate();
      const monthName = months[d.getMonth()];

      list.push({
        dateISO,
        dayName,
        dayNumber,
        monthName
      });
    }
    return list;
  }, []);

  // Filter shows
  const filteredTheatres = useMemo(() => {
    return theatres.map((theatre) => {
      const shows = (theatre.shows || []).filter((s) => {
        const matchesFormat = selectedFormat === 'All' || s.format.includes(selectedFormat);
        const matchesLang = selectedLanguage === 'All' || s.language === selectedLanguage;

        let matchesTime = true;
        if (selectedTimeOfDay !== 'All') {
          const hour = parseInt(s.time.split(':')[0], 10);
          const isPM = s.time.includes('PM');
          const fullHour = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
          if (selectedTimeOfDay === 'Morning' && fullHour >= 12) matchesTime = false;
          if (selectedTimeOfDay === 'Matinee' && (fullHour < 12 || fullHour >= 16)) matchesTime = false;
          if (selectedTimeOfDay === 'Evening' && (fullHour < 16 || fullHour >= 20)) matchesTime = false;
          if (selectedTimeOfDay === 'Night' && fullHour < 20) matchesTime = false;
        }

        return matchesFormat && matchesLang && matchesTime;
      });

      return {
        ...theatre,
        filteredShows: shows
      };
    }).filter(t => t.filteredShows.length > 0);
  }, [theatres, selectedFormat, selectedLanguage, selectedTimeOfDay]);

  return (
    <div className="space-y-6 text-text-primary">
      {/* 1. HORIZONTAL 7-DAY DATE RIBBON */}
      <div className="bg-surface py-3.5 px-4 rounded-xl border border-border">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
          {datesList.map((item) => {
            const isSelected = selectedDate === item.dateISO;
            return (
              <button
                key={item.dateISO}
                type="button"
                onClick={() => onDateChange(item.dateISO)}
                className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-2.5 px-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent border-accent text-white font-bold shadow-sm'
                    : 'bg-surface-elevated border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                }`}
              >
                <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-white/90' : 'text-text-muted'}`}>
                  {item.dayName}
                </span>
                <span className="text-base sm:text-lg font-extrabold my-0.5">
                  {item.dayNumber}
                </span>
                <span className={`text-[10px] font-medium ${isSelected ? 'text-white/90' : 'text-text-muted'}`}>
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUB-FILTERS (Language, Format) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface border border-border rounded-xl text-xs">
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Format filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted font-medium">Format:</span>
            {['All', '2D', '3D', 'IMAX 3D', '4DX'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-accent border-accent text-white font-bold shadow-sm'
                    : 'bg-surface-elevated border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-border hidden md:block" />

          {/* Language filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted font-medium">Language:</span>
            {['All', 'Telugu', 'Hindi', 'Tamil'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-surface-elevated border-amber-500 text-amber-500 font-bold shadow-sm'
                    : 'bg-surface-elevated border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Legend */}
        <div className="flex items-center gap-4 text-[11px] font-semibold text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Fast Filling
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent"></span> Almost Full
          </span>
        </div>
      </div>

      {/* 3. THEATRE LIST & SHOWTIMES GRID */}
      <div className="space-y-4">
        {filteredTheatres.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-border rounded-xl">
            <Clock className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-bold text-text-primary">No showtimes found</h3>
            <p className="text-xs text-text-muted mt-1">Try selecting another date or clearing filters</p>
          </div>
        ) : (
          filteredTheatres.map((theatre) => (
            <div
              key={theatre.id}
              className="p-5 sm:p-6 bg-surface border border-border hover:border-accent/40 rounded-xl space-y-4 shadow-sm transition-all"
            >
              {/* Theatre Header & Amenities */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <span>{theatre.name}</span>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">{theatre.address}</p>
                </div>

                {/* Amenities Icons */}
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium bg-surface-elevated border border-border px-2.5 py-1 rounded-lg">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>M-Ticket</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium bg-surface-elevated border border-border px-2.5 py-1 rounded-lg">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>F&B Order</span>
                  </span>
                  <span className="text-[11px] text-text-muted bg-surface-elevated border border-border px-2.5 py-1 rounded-lg">
                    {theatre.cancellationPolicy || 'Free Cancellation'}
                  </span>
                </div>
              </div>

              {/* Showtimes Buttons Grid */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {theatre.filteredShows.map((show) => {
                  const isFillingFast = show.availability === 'FILLING_FAST';
                  const isAlmostFull = show.availability === 'ALMOST_FULL';

                  return (
                    <button
                      key={show.id}
                      type="button"
                      onClick={() => onShowSelect(theatre, show)}
                      className={`group relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all min-w-[125px] text-center cursor-pointer ${
                        isAlmostFull
                          ? 'border-accent/50 bg-accent/10 hover:border-accent'
                          : isFillingFast
                          ? 'border-amber-500/50 bg-amber-500/10 hover:border-amber-500'
                          : 'bg-surface-elevated border-border hover:border-accent/50'
                      }`}
                    >
                      <span className="text-sm font-extrabold text-text-primary group-hover:text-accent transition-colors">
                        {show.time}
                      </span>
                      <span className="text-[10px] font-semibold text-text-muted uppercase mt-0.5">
                        {show.format} • {show.language}
                      </span>
                      <span className="text-[10px] text-text-secondary mt-0.5 font-medium">
                        ₹{show.price?.CLASSIC || 120} - ₹{show.price?.RECLINER || 280}
                      </span>

                      {/* Fast Tag */}
                      {isFillingFast && (
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[8px] font-bold uppercase">
                          Fast
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShowtimeFilter;

