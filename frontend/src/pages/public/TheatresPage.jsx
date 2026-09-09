import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Search, ChevronRight, Sparkles, Film } from 'lucide-react';
import { THEATRES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';

const TheatresPage = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const [search, setSearch] = useState('');

  // Strictly filter theatres belonging to the selected city only!
  const cityTheatres = THEATRES.filter((t) => {
    const matchesCity = t.city === selectedCity.id;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-text-primary py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Verified Auditoriums
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-1">
              Theatres in {selectedCity.name} ({cityTheatres.length})
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Explore 4K RGB Laser, Dolby Atmos, and luxury single-screen cinemas across {selectedCity.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder={`Search ${selectedCity.name} cinemas...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface rounded-xl text-xs text-text-primary border border-border placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCityModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text-primary text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
            >
              Change City ({selectedCity.name})
            </button>
          </div>
        </div>

        {/* Theatres List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cityTheatres.map((theatre) => (
            <div
              key={theatre.id}
              className="p-5 sm:p-6 rounded-xl bg-surface border border-border hover:border-accent/40 transition-all space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-surface-elevated border border-border text-accent flex-shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-text-primary">{theatre.name}</h3>
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-text-muted" />
                      <span>{theatre.address}</span>
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border text-[11px] text-amber-500 font-semibold flex-shrink-0">
                  {theatre.distance || '1.2 km away'}
                </span>
              </div>

              {/* Facilities */}
              <div>
                <span className="text-[11px] font-semibold uppercase text-text-muted block mb-2 tracking-wider">
                  Audi Amenities & Sound
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(theatre.facilities || ['4K RGB Laser', 'Dolby Atmos 64-Channel', 'Pushback Plush Seating']).map((fac) => (
                    <span
                      key={fac}
                      className="px-2.5 py-1 rounded-lg bg-surface-elevated text-text-secondary border border-border text-xs font-medium"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screens & CTA */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ {theatre.screens?.length || 1} Active Laser Screens
                </span>
                <Link
                  to="/movies"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm transition-all"
                >
                  <span>View Showtimes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TheatresPage;
