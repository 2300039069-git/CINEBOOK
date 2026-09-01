import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Sparkles } from 'lucide-react';

const EventCard = ({ event }) => {
  return (
    <div className="group relative flex flex-col bg-cine-surface rounded-2xl overflow-hidden border border-cine-border/80 glass-card-hover transition-all duration-300">
      {/* Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-cine-card">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cine-surface via-transparent to-transparent opacity-80" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-cine-accent flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>{event.category}</span>
        </div>

        {/* Date Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cine-card/90 text-xs text-white border border-cine-border font-medium">
          <Calendar className="w-3.5 h-3.5 text-cine-primary" />
          <span>{event.date} • {event.time}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-base text-white tracking-tight line-clamp-1 group-hover:text-cine-accent transition-colors">
          {event.title}
        </h3>

        <p className="flex items-center gap-1.5 text-xs text-cine-textMuted mt-2 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span>{event.venue}</span>
        </p>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-cine-border/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-cine-textMuted block">Starting from</span>
            <span className="text-base font-bold text-white">₹{event.priceStarting}</span>
          </div>

          <button
            onClick={() => alert(`Tickets for "${event.title}" will open shortly!`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cine-card hover:bg-cine-cardHover border border-cine-border hover:border-cine-accent text-white text-xs font-bold transition-all"
          >
            <Ticket className="w-3.5 h-3.5 text-cine-accent" />
            <span>Book Passes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
