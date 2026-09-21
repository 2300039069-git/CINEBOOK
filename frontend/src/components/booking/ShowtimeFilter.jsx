import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  SlidersHorizontal,
  LayoutGrid,
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
  const [activeChip, setActiveChip] = useState('Filter'); // 'Filter', 'View', 'Nearby'

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

  const filterChips = [
    { id: 'Filter', label: 'Filter', icon: SlidersHorizontal },
    { id: 'View', label: 'Grid', icon: LayoutGrid },
    { id: 'Nearby', label: 'Nearby', icon: MapPin },
  ];

  return (
    <div className="space-y-4 text-white max-w-4xl mx-auto px-4 select-none">
      {/* 1. FILTER CHIPS ROW (Screen 2 Mockup) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {filterChips.map((chip) => {
          const Icon = chip.icon;
          const isActive = activeChip === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActiveChip(chip.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1e2348] border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_16px_rgba(224,180,92,0.55)]'
                  : 'bg-[#1e2348] border border-white/10 text-[#a8adc9] hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. TIMELINE DATE STRIP */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {datesList.map((item) => {
          const isSelected = selectedDate === item.dateISO;
          return (
            <button
              key={item.dateISO}
              type="button"
              onClick={() => onDateChange(item.dateISO)}
              className={`flex flex-col items-center justify-center min-w-[68px] py-2.5 px-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#1e2348] border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_16px_rgba(224,180,92,0.55)] scale-105 font-bold'
                  : 'bg-[#1e2348] border border-white/10 text-[#a8adc9] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-medium tracking-wider">
                {item.dayName}
              </span>
              <span className="text-sm font-bold my-0.5 text-white">
                {item.dayNumber}
              </span>
              <span className="text-[9px] text-[#6b7094]">
                {item.monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ShowtimeFilter;
