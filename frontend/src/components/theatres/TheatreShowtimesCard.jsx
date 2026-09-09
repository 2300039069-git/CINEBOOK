import React, { useState } from 'react';
import { MapPin, Clock, Ticket, ChevronRight, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

const DEFAULT_SLOTS = ['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM'];

const TheatreShowtimesCard = ({
  theatreName = 'Siva Cinemas 4K Dolby Atmos',
  address = 'Near Old Bus Stand, Guntur',
  priceRange = '₹130 - ₹280',
  amenities = ['4K RGB Laser', 'Dolby Atmos 64-Ch', 'Recliner Seating'],
  timeSlots = DEFAULT_SLOTS,
  onBookTickets
}) => {
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-[#11141D] border border-[#1E2332] hover:border-slate-600 transition-all space-y-4 shadow-sm text-slate-200">
      {/* Header: Venue name & Price Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#1E2332]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{theatreName}</h3>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{address}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Starting Price</span>
          <span className="text-sm font-extrabold text-[#F59E0B]">{priceRange}</span>
        </div>
      </div>

      {/* Amenities Tags */}
      {amenities && amenities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {amenities.map((item, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-md bg-[#181C28] text-slate-300 border border-[#1E2332] text-[11px] font-medium">
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Grid of Showtime Slots */}
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-2.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#E50914]" />
          <span>Showtimes</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#E50914] border-[#E50914] text-white shadow-sm'
                    : 'bg-[#181C28] border-[#1E2332] text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onBookTickets?.({ theatreName, time: selectedSlot, priceRange })}
          className="w-full py-3 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <Ticket className="w-4 h-4 text-white" />
          <span>Select Seats ({selectedSlot})</span>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default TheatreShowtimesCard;

