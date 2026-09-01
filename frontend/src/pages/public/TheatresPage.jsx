import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Search, ChevronRight, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[var(--theme-border)]">
        <div>
          <span className="text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Cinema Halls & Multiplexes
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-theme-primary tracking-tight mt-1">
            Theatres in {selectedCity.name} ({cityTheatres.length})
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Browse authentic verified theatres and screens exclusively in {selectedCity.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder={`Search ${selectedCity.name} theatres...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-2xl text-theme-primary placeholder:text-theme-muted text-xs focus:outline-none focus:border-pink-500"
            />
          </div>
          <button
            onClick={() => setIsCityModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black hover:opacity-90 transition-all whitespace-nowrap shadow-md"
          >
            Change City ({selectedCity.name})
          </button>
        </div>
      </div>

      {/* Theatres List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        {cityTheatres.map((theatre) => (
          <div
            key={theatre.id}
            className="p-6 rounded-3xl glass-card space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-pink-500 flex-shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-theme-primary">{theatre.name}</h3>
                  <p className="text-xs text-theme-secondary mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-pink-500" />
                    <span>{theatre.address}</span>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full glass-panel text-xs text-amber-500 font-black flex-shrink-0">
                {theatre.distance || 'Near Center'}
              </span>
            </div>

            {/* Facilities */}
            <div>
              <span className="text-[11px] font-black uppercase text-theme-muted block mb-2 tracking-wider">
                Sound & Projection Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {theatre.facilities.map((fac) => (
                  <span
                    key={fac}
                    className="px-2.5 py-1 rounded-xl glass-panel text-xs text-theme-primary border border-[var(--theme-border)] font-semibold"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Screens & CTA */}
            <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between">
              <span className="text-xs text-emerald-500 font-bold">
                ✓ {theatre.screens?.length || 1} Active Audi Screens
              </span>
              <Link
                to="/movies"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black shadow-md transition-all"
              >
                <span>View Showtimes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheatresPage;
