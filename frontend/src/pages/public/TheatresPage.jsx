import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, MapPin, Search, ChevronRight, Sparkles, Film, Clock, Ticket, ShieldCheck } from 'lucide-react';
import { THEATRES, MOVIES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import DateDayRibbon from '../../components/common/DateDayRibbon';

const TheatresPage = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { selectedDate, setSelectedDate, setSelectedMovie, setSelectedTheatre, setSelectedShow } = useBooking();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Strictly filter theatres belonging to the selected city only!
  const cityTheatres = THEATRES.filter((t) => {
    const matchesCity = t.city === selectedCity.id;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const handleBookSlot = (theatre, timeSlot) => {
    const movie = MOVIES[0];
    const date = selectedDate || new Date().toISOString().split('T')[0];
    setSelectedMovie(movie);
    setSelectedTheatre(theatre);
    setSelectedDate(date);
    setSelectedShow({
      id: `sh-${theatre.id}-01`,
      movieId: movie.id,
      theatreId: theatre.id,
      theatreName: theatre.name,
      time: timeSlot || '11:00 AM',
      format: '2D Dolby Atmos',
      date
    });
    navigate(`/seat-selection/sh-${theatre.id}-01`);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-primary)] py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Verified Cinema Auditoriums
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              Cinemas in {selectedCity.name} ({cityTheatres.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore 4K RGB Laser, Dolby Atmos 7.1, and luxury single-screen cinemas across {selectedCity.name}
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
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#161B26] rounded-xl text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCityModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161B26] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors shadow-sm"
            >
              Change City ({selectedCity.name})
            </button>
          </div>
        </div>

        {/* Dynamic Dates & Days Scheduler */}
        <DateDayRibbon
          selectedDate={selectedDate}
          onDateSelect={(d) => setSelectedDate(d)}
        />

        {/* Theatres List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cityTheatres.map((theatre) => (
            <div
              key={theatre.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 hover:border-primary/40 transition-all space-y-4 shadow-sm dark:shadow-xl group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                      {theatre.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{theatre.address}</span>
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-primary font-bold flex-shrink-0">
                  {theatre.distance || '1.2 km away'}
                </span>
              </div>

              {/* Facilities */}
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-2 tracking-wider">
                  Audi Amenities & Sound Engine
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(theatre.facilities || ['4K RGB Laser', 'Dolby Atmos 64-Channel', 'Pushback Plush Seating']).map((fac) => (
                    <span
                      key={fac}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Showtimes Quick Pick */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-primary block mb-2 tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Select Showtime to Book
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleBookSlot(theatre, slot)}
                      className="py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/10 hover:text-primary text-xs font-bold text-slate-900 dark:text-slate-100 transition-all text-center cursor-pointer shadow-xs"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Screens & CTA */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{theatre.screens?.length || 1} Active Laser Screens</span>
                </span>
                <Link
                  to="/movies"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <span>Select Movies</span>
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
