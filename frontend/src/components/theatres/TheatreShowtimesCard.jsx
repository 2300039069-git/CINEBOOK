import React, { useState } from 'react';
import { MapPin, Clock, Ticket, ChevronRight, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const DEFAULT_SLOTS = ['10:00 AM', '12:00 PM', '04:00 PM', '07:30 PM', '10:15 PM'];

export const TheatreShowtimesCard = ({
  theatreName = 'Grand Cinema Complex - Screen 5',
  address = 'Main Multiplex Complex, 4K Laser Projection',
  priceRange = '₹120 - ₹280',
  amenities = ['4K RGB Laser', 'Dolby Atmos 64-Ch', 'Recliner Seating'],
  timeSlots = DEFAULT_SLOTS,
  selectedDate,
  onBookTickets
}) => {
  const { selectedDate: contextDate } = useBooking();
  const activeDateISO = selectedDate || contextDate || new Date().toISOString().split('T')[0];
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);

  // Format date display (e.g., "Wednesday, 16 Sep 2026")
  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(activeDateISO);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch (e) {
      return activeDateISO;
    }
  }, [activeDateISO]);

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#121824] border border-[#E5A93C]/20 hover:border-[#E5A93C]/50 transition-all space-y-4 shadow-xl text-white">
      {/* Header: Venue name & Price Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E5A93C]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight font-display">{theatreName}</h3>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>{address}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Ticket Rates</span>
          <span className="text-sm font-black text-[#FFD066] font-mono">{priceRange}</span>
        </div>
      </div>

      {/* Active Day & Date Banner */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-[#1A2234] border border-[#E5A93C]/20 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-[#E5A93C]" />
          <span className="font-bold text-white">{formattedDate}</span>
        </div>
        <span className="text-[10px] font-black text-[#FFD066] uppercase tracking-wider bg-[#E5A93C]/15 px-2 py-0.5 rounded-lg border border-[#E5A93C]/30">
          Laser Showtimes
        </span>
      </div>

      {/* Amenities Tags */}
      {amenities && amenities.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {amenities.map((item, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-xl bg-[#1A2234] text-slate-300 border border-[#E5A93C]/20 text-[11px] font-semibold">
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Grid of Showtime Slots */}
      <div>
        <label className="text-xs font-bold text-slate-400 block mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Showtimes ({formattedDate.split(',')[0]})</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Available
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {timeSlots.map((slot, idx) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] border-[#FFD066] text-[#0B0E14] shadow-[0_0_12px_rgba(229,169,60,0.5)] font-black'
                    : 'bg-[#1A2234] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/60 hover:text-white'
                }`}
              >
                <span>{slot}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onBookTickets?.({ theatreName, time: selectedSlot, priceRange, date: activeDateISO })}
          className="gold-glow-btn w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Ticket className="w-4 h-4 text-[#0B0E14]" />
          <span>Find Best Seats • {selectedSlot}</span>
          <ChevronRight className="w-4 h-4 text-[#0B0E14]" />
        </button>
      </div>
    </div>
  );
};

export default TheatreShowtimesCard;
