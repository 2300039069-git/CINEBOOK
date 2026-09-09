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
    <div className="min-h-screen bg-background text-text-primary py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Live Experiences & Shows
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-1">
              Events in {selectedCity.name}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Catch live music concerts, stand-up comedy specials, and premier fan events in {selectedCity.name}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface rounded-xl text-xs text-text-primary border border-border placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-accent border-accent text-white shadow-sm'
                  : 'bg-surface border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="py-20 text-center bg-surface border border-border rounded-xl">
            <Sparkles className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-text-primary">No events found</h3>
            <p className="text-xs text-text-muted mt-1">Try selecting another category or check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
