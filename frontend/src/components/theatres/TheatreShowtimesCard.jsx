import React, { useState } from 'react';
import { MapPin, Clock, Ticket, Sparkles, ChevronRight } from 'lucide-react';

const DEFAULT_SLOTS = ['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM'];

const TheatreShowtimesCard = ({
  theatreName = 'Siva Cinemas',
  address = 'Near Old Bus Stand, Guntur',
  priceRange = '₹130 - ₹280',
  timeSlots = DEFAULT_SLOTS,
  onBookTickets
}) => {
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);

  return (
    <div className="p-6 rounded-3xl glass-card space-y-5">
      {/* Header: Venue name & Price Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <h3 className="text-lg font-black text-theme-primary tracking-tight">{theatreName}</h3>
          </div>
          <p className="text-xs text-theme-secondary flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-pink-500" />
            <span>{address}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase font-black text-theme-muted block tracking-wider">Pricing</span>
          <span className="text-sm font-black gradient-text-gold">{priceRange}</span>
        </div>
      </div>

      {/* Grid of Showtime Slots */}
      <div>
        <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider block mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-purple-500" />
          <span>Available Showtime Slots</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-black transition-all text-center ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 border-transparent text-white shadow-glow-pink scale-105'
                    : 'bg-black/5 dark:bg-white/5 border-[var(--theme-border)] text-theme-primary hover:border-pink-500'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Radiant Gradient Book Tickets Button */}
      <div className="pt-2">
        <button
          onClick={() => onBookTickets?.({ theatreName, time: selectedSlot, priceRange })}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-pink-500/50 transition-all transform hover:scale-102"
        >
          <Ticket className="w-4 h-4" />
          <span>Select Seats — {selectedSlot}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TheatreShowtimesCard;
