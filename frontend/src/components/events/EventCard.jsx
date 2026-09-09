import React from 'react';
import { Calendar, MapPin, Ticket, Sparkles } from 'lucide-react';

const EventCard = ({ event }) => {
  return (
    <div className="group relative flex flex-col bg-[#11141D] rounded-xl overflow-hidden border border-[#1E2332] hover:border-slate-600 transition-all duration-300 shadow-sm">
      {/* Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#181C28]">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#11141D] via-[#11141D]/30 to-transparent opacity-80" />
        
        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#090A0E]/90 backdrop-blur-md border border-[#1E2332] text-[11px] font-bold text-[#F59E0B] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
          <span>{event.category}</span>
        </div>

        {/* Date Pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#090A0E]/90 text-[11px] text-slate-300 border border-[#1E2332] font-medium backdrop-blur-sm">
          <Calendar className="w-3 h-3 text-[#E50914]" />
          <span>{event.date} • {event.time}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 space-y-2">
        <h3 className="font-bold text-sm sm:text-base text-white tracking-tight line-clamp-1 group-hover:text-[#E50914] transition-colors">
          {event.title}
        </h3>

        <p className="flex items-center gap-1.5 text-xs text-slate-400 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span>{event.venue}</span>
        </p>

        {/* Pricing & CTA */}
        <div className="pt-2.5 mt-auto border-t border-[#1E2332] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Starting from</span>
            <span className="text-sm font-extrabold text-white">₹{event.priceStarting}</span>
          </div>

          <button
            type="button"
            onClick={() => alert(`Tickets for "${event.title}" will open shortly!`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
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
