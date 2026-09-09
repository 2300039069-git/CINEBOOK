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
    <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border hover:border-text-muted transition-all space-y-4 shadow-sm text-text-primary">
      {/* Header: Venue name & Price Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">{theatreName}</h3>
          </div>
          <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-text-muted" />
            <span>{address}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase font-bold text-text-muted block tracking-wider">Starting Price</span>
          <span className="text-sm font-extrabold text-gold">{priceRange}</span>
        </div>
      </div>

      {/* Amenities Tags */}
      {amenities && amenities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {amenities.map((item, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-md bg-surface-elevated text-text-secondary border border-border text-[11px] font-medium">
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Grid of Showtime Slots */}
      <div>
        <label className="text-xs font-semibold text-text-muted block mb-2.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
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
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-surface-elevated border border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
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
          className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
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
