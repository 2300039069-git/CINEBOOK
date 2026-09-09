import React, { useState } from 'react';
import { MapPin, Clock, Ticket, Sparkles, ChevronRight } from 'lucide-react';

const DEFAULT_SLOTS = ['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM'];

const TheatreShowtimesCard = ({
  theatreName = 'Siva Cinemas 4K Dolby Atmos',
  address = 'Near Old Bus Stand, Guntur',
  priceRange = '₹130 - ₹280',
  timeSlots = DEFAULT_SLOTS,
  onBookTickets
}) => {
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);

  return (
    <div className="p-6 rounded-3xl bg-[#0F1523]/90 border border-[#1E293B] hover:border-[#D4AF37]/40 transition-all space-y-5 shadow-xl text-[#F8FAFC]">
      {/* Header: Venue name & Price Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-lg font-black text-white tracking-tight">{theatreName}</h3>
          </div>
          <p className="text-xs text-[#94A3B8] flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{address}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase font-black text-[#94A3B8] block tracking-wider">Direct Price</span>
          <span className="text-sm font-black text-[#D4AF37]">{priceRange}</span>
        </div>
      </div>

      {/* Grid of Showtime Slots */}
      <div>
        <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Available Showtime Slots</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`py-3 px-3 rounded-xl border text-xs font-black transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#E50914] border-[#FF4B55] text-white shadow-glow-crimson scale-105'
                    : 'bg-[#080B10] border-[#1E293B] text-slate-300 hover:border-[#D4AF37] hover:text-white'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Radiant Book Tickets Button */}
      <div className="pt-2">
        <button
          onClick={() => onBookTickets?.({ theatreName, time: selectedSlot, priceRange })}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B80710] hover:from-[#FF1E27] hover:to-[#E50914] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-crimson transition-all transform hover:scale-102 cursor-pointer"
        >
          <Ticket className="w-4 h-4 text-white" />
          <span>Select Seats — {selectedSlot}</span>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default TheatreShowtimesCard;

