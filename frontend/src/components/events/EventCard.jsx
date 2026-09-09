import React from 'react';
import { Calendar, MapPin, Ticket, Sparkles } from 'lucide-react';

const EventCard = ({ event }) => {
  return (
    <div className="group relative flex flex-col bg-surface rounded-xl overflow-hidden border border-border hover:border-text-muted transition-all duration-300 shadow-sm">
      {/* Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-elevated">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80" />
        
        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-bold text-gold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-gold" />
          <span>{event.category}</span>
        </div>

        {/* Date Pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/75 text-[11px] text-white/90 border border-white/20 font-medium backdrop-blur-sm">
          <Calendar className="w-3 h-3 text-primary" />
          <span>{event.date} • {event.time}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 space-y-2 bg-surface">
        <h3 className="font-bold text-sm sm:text-base text-text-primary tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <p className="flex items-center gap-1.5 text-xs text-text-muted line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <span>{event.venue}</span>
        </p>

        {/* Pricing & CTA */}
        <div className="pt-2.5 mt-auto border-t border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-muted block font-semibold">Starting from</span>
            <span className="text-sm font-extrabold text-text-primary">₹{event.priceStarting}</span>
          </div>

          <button
            type="button"
            onClick={() => alert(`Tickets for "${event.title}" will open shortly!`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5 text-white" />
            <span>Book Passes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
