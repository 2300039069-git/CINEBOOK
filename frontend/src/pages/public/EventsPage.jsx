import React, { useState } from 'react';
import { Sparkles, Search, Calendar, MapPin } from 'lucide-react';
import { EVENTS } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import EventCard from '../../components/events/EventCard';

const EventsPage = () => {
  const { selectedCity } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Concert', 'Standup Comedy', 'Music Festival', 'Workshop'];

  const filteredEvents = EVENTS.filter((event) => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                          event.venue.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[var(--theme-border)]">
        <div>
          <span className="text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Live Experiences & Shows
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-theme-primary tracking-tight mt-1">
            Events in {selectedCity.name}
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Catch live music concerts, stand-up comedy specials, and cultural festivals
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            placeholder="Search events, artists, venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-2xl text-theme-primary placeholder:text-theme-muted text-xs focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white shadow-md scale-102'
                : 'glass-panel text-theme-secondary hover:border-pink-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl">
          <Sparkles className="w-12 h-12 text-theme-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-black text-theme-primary">No events found</h3>
          <p className="text-xs text-theme-muted mt-1">Try selecting another category or check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
