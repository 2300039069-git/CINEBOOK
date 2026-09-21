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

export const ShowtimeFilter = ({
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
      const dayNumber = String(d.getDate()).padStart(2, '0');
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
    <div className="space-y-6 text-white">
      {/* 1. HORIZONTAL 7-DAY DATE RIBBON */}
      <div className="bg-[#121824] py-3.5 px-4 rounded-3xl border border-[#E5A93C]/25 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
          {datesList.map((item) => {
            const isSelected = selectedDate === item.dateISO;
            return (
              <button
                key={item.dateISO}
                type="button"
                onClick={() => onDateChange(item.dateISO)}
                className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[84px] py-3 px-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#E5A93C] to-[#FFD066] border-[#FFD066] text-[#0B0E14] font-black shadow-[0_0_15px_rgba(229,169,60,0.5)] scale-105'
                    : 'bg-[#1A2234] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/60 hover:text-white'
                }`}
              >
                <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-[#0B0E14]' : 'text-slate-400'}`}>
                  {item.dayName}
                </span>
                <span className="text-base sm:text-lg font-black my-0.5 font-display">
                  {item.dayNumber}
                </span>
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#0B0E14]' : 'text-slate-400'}`}>
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUB-FILTERS (Language, Format) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#121824] border border-[#E5A93C]/20 rounded-3xl text-xs">
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Format filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Format:</span>
            {['All', '2D', '3D', '4K Laser', 'Dolby Atmos'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-[#E5A93C] text-[#0B0E14] border-[#FFD066] font-black shadow-[0_0_10px_rgba(229,169,60,0.4)]'
                    : 'bg-[#1A2234] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/50 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#E5A93C]/20 hidden md:block" />

          {/* Language filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Language:</span>
            {['All', 'Telugu', 'Hindi', 'Tamil'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl transition-all border text-xs cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-[#E5A93C] text-[#0B0E14] border-[#FFD066] font-black shadow-[0_0_10px_rgba(229,169,60,0.4)]'
                    : 'bg-[#1A2234] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/50 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Legend */}
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Plenty Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFD066]"></span> Filling Fast
          </span>
        </div>
      </div>

      {/* 3. THEATRE LIST & SHOWTIMES GRID */}
      <div className="space-y-4">
        {filteredTheatres.length === 0 ? (
          <div className="p-12 text-center bg-[#121824] border border-[#E5A93C]/20 rounded-3xl">
            <Clock className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-bold text-white">No showtimes found</h3>
            <p className="text-xs text-slate-400 mt-1">Try selecting another date or clearing filters</p>
          </div>
        ) : (
          filteredTheatres.map((theatre) => (
            <div
              key={theatre.id}
              className="gold-glass-card p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl transition-all"
            >
              {/* Theatre Header & Amenities */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5A93C]/20">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2 font-display">
                    <span>{theatre.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{theatre.address}</p>
                </div>

                {/* Amenities Icons */}
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium bg-[#1A2234] border border-[#E5A93C]/20 px-2.5 py-1 rounded-xl">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>M-Pass</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#FFD066] font-medium bg-[#1A2234] border border-[#E5A93C]/20 px-2.5 py-1 rounded-xl">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>F&B Order</span>
                  </span>
                  <span className="text-[11px] text-slate-400 bg-[#1A2234] border border-[#E5A93C]/20 px-2.5 py-1 rounded-xl">
                    {theatre.cancellationPolicy || 'Free Cancellation'}
                  </span>
                </div>
              </div>

              {/* Showtimes Buttons Grid */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {theatre.filteredShows.map((show) => {
                  const isFillingFast = show.availability === 'FILLING_FAST';

                  return (
                    <button
                      key={show.id}
                      type="button"
                      onClick={() => onShowSelect(theatre, show)}
                      className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 min-w-[130px] text-center cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
                        isFillingFast
                          ? 'border-[#FFD066]/60 bg-[#E5A93C]/15 hover:border-[#FFD066] shadow-[0_0_12px_rgba(229,169,60,0.2)]'
                          : 'bg-[#1A2234] border-[#E5A93C]/20 hover:border-[#E5A93C] hover:bg-[#222C42] shadow-sm'
                      }`}
                    >
                      <span className="text-sm font-black text-white group-hover:text-[#FFD066] transition-colors">
                        {show.time}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                        {show.format} • {show.language}
                      </span>
                      <span className="text-[10px] text-[#FFD066] mt-0.5 font-bold">
                        ₹{show.price?.BALCONY || show.price?.CLASSIC || 120} - ₹{show.price?.RECLINER || 280}
                      </span>

                      {/* Fast Tag */}
                      {isFillingFast && (
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-[#FFD066] text-[#0B0E14] text-[8px] font-black uppercase shadow-xs">
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
