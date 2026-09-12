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
      <div className="bg-surface py-3.5 px-4 rounded-2xl border border-border shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
          {datesList.map((item) => {
            const isSelected = selectedDate === item.dateISO;
            return (
              <button
                key={item.dateISO}
                type="button"
                onClick={() => onDateChange(item.dateISO)}
                className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[84px] py-3 px-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gold text-background border-gold font-black shadow-md scale-105'
                    : 'bg-surface-elevated border-border text-text-secondary hover:border-gold/50 hover:text-text-primary'
                }`}
              >
                <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-black/80' : 'text-text-muted'}`}>
                  {item.dayName}
                </span>
                <span className="text-base sm:text-lg font-black my-0.5">
                  {item.dayNumber}
                </span>
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-black/80' : 'text-text-muted'}`}>
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUB-FILTERS (Language, Format) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface border border-border rounded-2xl text-xs">
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
                className={`px-3 py-1.5 rounded-lg transition-all border text-xs cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-gold text-background border-gold font-bold shadow-sm'
                    : 'bg-surface-elevated border-border text-text-secondary hover:border-gold/50 hover:text-text-primary'
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
                className={`px-3 py-1.5 rounded-lg transition-all border text-xs cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-surface-elevated border-gold text-gold font-bold shadow-sm'
                    : 'bg-surface-elevated border-border text-text-secondary hover:border-gold/50 hover:text-text-primary'
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
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Plenty
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold"></span> Filling Fast
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary"></span> Almost Full
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
                      className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 min-w-[130px] text-center cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
                        isAlmostFull
                          ? 'border-primary/50 bg-primary/10 hover:border-primary shadow-sm'
                          : isFillingFast
                          ? 'border-gold/50 bg-gold/10 hover:border-gold shadow-sm'
                          : 'bg-surface-elevated border-border hover:border-gold/60 hover:bg-surface-hover shadow-sm'
                      }`}
                    >
                      <span className="text-sm font-black text-text-primary group-hover:text-gold transition-colors">
                        {show.time}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted uppercase mt-0.5">
                        {show.format} • {show.language}
                      </span>
                      <span className="text-[10px] text-text-secondary mt-0.5 font-semibold">
                        ₹{show.price?.CLASSIC || 120} - ₹{show.price?.RECLINER || 280}
                      </span>

                      {/* Fast Tag */}
                      {isFillingFast && (
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-gold text-background text-[8px] font-black uppercase shadow-xs">
                          Fast
                        </span>
                      )}
                      {isAlmostFull && (
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-primary text-white text-[8px] font-black uppercase shadow-xs">
                          Filling
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

