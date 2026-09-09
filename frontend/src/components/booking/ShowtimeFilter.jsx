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
    <div className="space-y-6 text-[#F8FAFC]">
      {/* 1. HORIZONTAL 7-DAY DATE RIBBON */}
      <div className="bg-[#0F1523]/90 py-3.5 px-4 shadow-xl border-y border-[#1E293B]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
          {datesList.map((item) => {
            const isSelected = selectedDate === item.dateISO;
            return (
              <button
                key={item.dateISO}
                onClick={() => onDateChange(item.dateISO)}
                className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[84px] py-2.5 px-2 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] border-[#D4AF37] text-black font-black shadow-glow-gold scale-105'
                    : 'bg-[#080B10] border-[#1E293B] text-slate-300 hover:border-[#D4AF37] hover:text-white'
                }`}
              >
                <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-black' : 'text-[#94A3B8]'}`}>
                  {item.dayName}
                </span>
                <span className="text-base sm:text-lg font-black my-0.5">
                  {item.dayNumber}
                </span>
                <span className={`text-[10px] font-bold ${isSelected ? 'text-black' : 'text-slate-400'}`}>
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUB-FILTERS (Language, Format) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0F1523]/80 border border-[#1E293B] rounded-3xl text-xs shadow-xl">
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Format filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#94A3B8] font-bold">Format:</span>
              {['All', '2D', '3D', 'IMAX 3D', '4DX'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1 rounded-xl transition-all border cursor-pointer ${
                    selectedFormat === fmt
                      ? 'bg-[#E50914] border-[#FF4B55] text-white font-black shadow-glow-crimson'
                      : 'bg-[#080B10] border-[#1E293B] text-slate-300 hover:border-[#D4AF37]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-[#1E293B] hidden md:block" />

            {/* Language filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#94A3B8] font-bold">Language:</span>
              {['All', 'Telugu', 'Hindi', 'Tamil'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-xl transition-all border cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] border-[#D4AF37] text-black font-black shadow-glow-gold'
                      : 'bg-[#080B10] border-[#1E293B] text-slate-300 hover:border-[#D4AF37]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Legend */}
          <div className="flex items-center gap-4 text-[11px] font-bold text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span> Fast Filling
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]"></span> Almost Full
            </span>
          </div>
        </div>
      </div>

      {/* 3. THEATRE LIST & SHOWTIMES GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {filteredTheatres.length === 0 ? (
          <div className="p-12 text-center bg-[#0F1523]/80 border border-[#1E293B] rounded-3xl">
            <Clock className="w-10 h-10 text-[#94A3B8] mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-black text-white">No showtimes found</h3>
            <p className="text-xs text-[#94A3B8] mt-1">Try selecting another date or clearing filters</p>
          </div>
        ) : (
          filteredTheatres.map((theatre) => (
            <div
              key={theatre.id}
              className="p-6 bg-[#0F1523]/90 border border-[#1E293B] hover:border-[#D4AF37]/40 rounded-3xl space-y-4 shadow-xl transition-all"
            >
              {/* Theatre Header & Amenities */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>{theatre.name}</span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{theatre.address}</p>
                </div>

                {/* Amenities Icons */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-[#080B10] border border-[#1E293B] px-2.5 py-1 rounded-xl">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>M-Ticket</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#D4AF37] font-bold bg-[#080B10] border border-[#1E293B] px-2.5 py-1 rounded-xl">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>F&B</span>
                  </span>
                  <span className="text-[11px] text-[#94A3B8] bg-[#080B10] border border-[#1E293B] px-2.5 py-1 rounded-xl">
                    {theatre.cancellationPolicy || 'Cancellation Available'}
                  </span>
                </div>
              </div>

              {/* Showtimes Buttons Grid */}
              <div className="flex flex-wrap gap-3 pt-1">
                {theatre.filteredShows.map((show) => {
                  const isFillingFast = show.availability === 'FILLING_FAST';
                  const isAlmostFull = show.availability === 'ALMOST_FULL';

                  return (
                    <button
                      key={show.id}
                      onClick={() => onShowSelect(theatre, show)}
                      className={`group relative flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all min-w-[130px] text-center cursor-pointer ${
                        isAlmostFull
                          ? 'border-[#E50914]/50 bg-[#E50914]/10 hover:border-[#E50914] hover:scale-105'
                          : isFillingFast
                          ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-105'
                          : 'bg-[#080B10] border-[#1E293B] hover:border-[#D4AF37] hover:scale-105 shadow-sm'
                      }`}
                    >
                      <span className="text-sm font-black text-white group-hover:text-[#D4AF37] transition-colors">
                        {show.time}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                        {show.format} • {show.language}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] mt-0.5 font-medium">
                        ₹{show.price?.CLASSIC || 120} - ₹{show.price?.RECLINER || 280}
                      </span>

                      {/* Fast Tag */}
                      {isFillingFast && (
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full bg-[#D4AF37] text-black text-[8px] font-black uppercase shadow-xs">
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

