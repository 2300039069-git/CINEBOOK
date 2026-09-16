import React, { useState } from 'react';
import { MapPin, Clock, Ticket, ChevronRight, Calendar, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const DEFAULT_SLOTS = ['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM'];

const TheatreShowtimesCard = ({
  theatreName = 'Siva Cinemas 4K Dolby Atmos',
  address = 'Near Old Bus Stand, Guntur',
  priceRange = '₹130 - ₹280',
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
    <div className="p-5 sm:p-6 rounded-2xl bg-void-850/90 border border-white/10 hover:border-brand/40 transition-all space-y-4 shadow-xl backdrop-blur-xl text-text-primary">
      {/* Header: Venue name & Price Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-text-primary tracking-tight">{theatreName}</h3>
          </div>
          <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            <span>{address}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase font-extrabold text-text-muted block tracking-wider">Starting Price</span>
          <span className="text-sm font-black text-brand">{priceRange}</span>
        </div>
      </div>

      {/* Active Day & Date Banner */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-void-900/90 border border-white/8 text-xs">
        <div className="flex items-center gap-2 text-text-secondary">
          <Calendar className="w-3.5 h-3.5 text-brand" />
          <span className="font-bold text-text-primary">{formattedDate}</span>
        </div>
        <span className="text-[10px] font-extrabold text-brand uppercase tracking-wider bg-brand/10 px-2 py-0.5 rounded-md border border-brand/30">
          Laser Showtimes
        </span>
      </div>

      {/* Amenities Tags */}
      {amenities && amenities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {amenities.map((item, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-void-800 text-text-secondary border border-white/6 text-[11px] font-semibold">
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Grid of Showtime Slots */}
      <div>
        <label className="text-xs font-bold text-text-muted block mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand" />
            <span>Showtimes ({formattedDate.split(',')[0]})</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Available
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {timeSlots.map((slot, idx) => {
            const isSelected = selectedSlot === slot;
            const isFast = idx === 1;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`relative py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 via-brand to-amber-600 border-brand text-void-950 shadow-md font-black scale-102'
                    : 'bg-void-900/80 border-white/8 text-text-secondary hover:border-brand/40 hover:text-text-primary'
                }`}
              >
                <span>{slot}</span>
                {isFast && !isSelected && (
                  <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded-full bg-primary text-white text-[8px] font-black uppercase shadow-xs">
                    Fast
                  </span>
                )}
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
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-brand to-amber-600 hover:from-amber-400 hover:to-amber-500 text-void-950 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand/30 hover:shadow-brand/50 transition-all cursor-pointer active:scale-98"
        >
          <Ticket className="w-4 h-4 text-void-950" />
          <span>Grab Seats • {selectedSlot} ({formattedDate.split(',')[0]})</span>
          <ChevronRight className="w-4 h-4 text-void-950" />
        </button>
      </div>
    </div>
  );
};

export default TheatreShowtimesCard;
