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
    <div className="min-h-screen bg-[#090A0E] text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E2332]">
          <div>
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Verified Auditoriums
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Theatres in {selectedCity.name} ({cityTheatres.length})
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Explore 4K RGB Laser, Dolby Atmos, and luxury single-screen cinemas across {selectedCity.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${selectedCity.name} cinemas...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#11141D] rounded-xl text-xs text-white border border-[#1E2332] placeholder:text-slate-400 focus:outline-none focus:border-[#E50914]"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCityModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#181C28] hover:bg-[#1D2232] border border-[#1E2332] text-white text-xs font-bold whitespace-nowrap cursor-pointer"
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
              className="p-5 sm:p-6 rounded-xl bg-[#11141D] border border-[#1E2332] hover:border-slate-600 transition-all space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-[#181C28] border border-[#1E2332] text-[#E50914] flex-shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{theatre.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{theatre.address}</span>
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#181C28] border border-[#1E2332] text-[11px] text-[#F59E0B] font-semibold flex-shrink-0">
                  {theatre.distance || '1.2 km away'}
                </span>
              </div>

              {/* Facilities */}
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-2 tracking-wider">
                  Audi Amenities & Sound
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(theatre.facilities || ['4K RGB Laser', 'Dolby Atmos 64-Channel', 'Pushback Plush Seating']).map((fac) => (
                    <span
                      key={fac}
                      className="px-2.5 py-1 rounded-lg bg-[#181C28] text-slate-300 border border-[#1E2332] text-xs font-medium"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screens & CTA */}
              <div className="pt-3 border-t border-[#1E2332] flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium">
                  ✓ {theatre.screens?.length || 1} Active Laser Screens
                </span>
                <Link
                  to="/movies"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold shadow-sm transition-all"
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
