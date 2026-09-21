import React, { useState } from 'react';
import { MapPin, Clock, Ticket, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const DEFAULT_SLOTS = ['10:00 AM', '12:00 PM', '04:00 PM', '07:30 PM', '10:15 PM'];

export const TheatreShowtimesCard = ({
  theatreName = 'Grand Cinema Complex - Screen 5',
  address = 'Main Multiplex Complex, 4K Laser Projection',
  priceRange = '$14.00 - $28.00',
  amenities = ['4K RGB Laser', 'Dolby Atmos 64-Ch', 'Recliner Seating'],
  timeSlots = DEFAULT_SLOTS,
  selectedDate,
  onBookTickets
}) => {
  const { selectedDate: contextDate } = useBooking();
  const activeDateISO = selectedDate || contextDate || new Date().toISOString().split('T')[0];
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);

  // Format date display
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
    <div className="p-5 sm:p-6 rounded-2xl bg-[#1e2348] border border-white/10 hover:border-[#e0b45c]/50 transition-all space-y-4 shadow-xl text-white">
      {/* Header: Venue name & Price Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-display">{theatreName}</h3>
          </div>
          <p className="text-xs text-[#a8adc9] flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#e0b45c]" />
            <span>{address}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase font-semibold text-[#6b7094] block tracking-wider">Ticket Rates</span>
          <span className="text-sm font-bold text-[#e0b45c] font-mono">{priceRange}</span>
        </div>
      </div>

      {/* Active Day & Date Banner */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#262b52] border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-[#a8adc9]">
          <Calendar className="w-3.5 h-3.5 text-[#e0b45c]" />
          <span className="font-semibold text-white">{formattedDate}</span>
        </div>
        <span className="text-[10px] font-bold text-[#e0b45c] uppercase tracking-wider bg-[#e0b45c]/15 px-2.5 py-0.5 rounded-full border border-[#e0b45c]/30">
          Laser Showtimes
        </span>
      </div>

      {/* Amenities Tags */}
      {amenities && amenities.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {amenities.map((item, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-full bg-[#262b52] text-[#a8adc9] border border-white/10 text-[11px] font-medium">
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Grid of Showtime Slots */}
      <div>
        <label className="text-xs font-semibold text-[#a8adc9] block mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-white">
            <Clock className="w-3.5 h-3.5 text-[#e0b45c]" />
            <span>Showtimes ({formattedDate.split(',')[0]})</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Available
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e2348] border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_12px_rgba(224,180,92,0.5)] font-bold'
                    : 'bg-[#262b52] border border-white/10 text-[#a8adc9] hover:border-[#e0b45c]/50 hover:text-white'
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
          className="luxury-gold-btn w-full py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Ticket className="w-4 h-4 text-[#171b34]" />
          <span>Find Best Seats • {selectedSlot}</span>
          <ChevronRight className="w-4 h-4 text-[#171b34]" />
        </button>
      </div>
    </div>
  );
};

export default TheatreShowtimesCard;
