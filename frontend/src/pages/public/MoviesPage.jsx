import React, { useState } from 'react';
import { Search, SlidersHorizontal, Film, RotateCcw, LayoutGrid, Radio } from 'lucide-react';
import { MOVIES, GENRES, LANGUAGES, FORMATS } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import MovieCard from '../../components/movies/MovieCard';
import LiveScrapedMoviesViewer from '../../components/movies/LiveScrapedMoviesViewer';
import DateDayRibbon from '../../components/common/DateDayRibbon';

export const MoviesPage = () => {
  const { selectedCity } = useLocation();
  const { selectedDate, setSelectedDate } = useBooking();
  const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' | 'LIVE_FEED'
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating');

  const resetFilters = () => {
    setSearch('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedFormat('All');
    setStatusFilter('ALL');
    setSortBy('rating');
  };

  const filteredMovies = MOVIES.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(search.toLowerCase()) ||
      movie.director?.toLowerCase().includes(search.toLowerCase()) ||
      movie.cast?.some(c => c.name.toLowerCase().includes(search.toLowerCase()));

    const matchesGenre = selectedGenre === 'All' || movie.genres?.includes(selectedGenre);
    const matchesLanguage = selectedLanguage === 'All' || movie.languages?.includes(selectedLanguage);
    const matchesFormat = selectedFormat === 'All' || movie.formats?.includes(selectedFormat);
    const matchesStatus = statusFilter === 'ALL' || movie.status === statusFilter;

    return matchesSearch && matchesGenre && matchesLanguage && matchesFormat && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.releaseDate) - new Date(a.releaseDate);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#171b34] text-white pt-24 pb-28 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold text-[#e0b45c] uppercase tracking-wider">
              Cinema Catalog & Box Office
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display mt-1">
              Movies in {selectedCity.name}
            </h1>
            <p className="text-xs text-[#a8adc9] mt-0.5">
              Browse premier blockbuster releases and 4K Laser showtimes in {selectedCity.name}
            </p>
          </div>

          {/* View Toggle Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-[#1e2348] rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'CARDS'
                    ? 'luxury-gold-btn text-[#171b34]'
                    : 'text-[#a8adc9] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Movie Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LIVE_FEED')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'LIVE_FEED'
                    ? 'bg-[#262b52] text-[#e0b45c] border border-[#e0b45c]/40'
                    : 'text-[#a8adc9] hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Live Feed</span>
              </button>
            </div>

            {/* Search Bar with Golden Border */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0b45c]" />
              <input
                type="text"
                placeholder="Search movies, cast, genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1e2348] rounded-full text-xs font-semibold text-white border border-white/10 placeholder:text-[#6b7094] focus:outline-none focus:border-[#e0b45c]"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Dates & Days Scheduler */}
        <DateDayRibbon
          selectedDate={selectedDate}
          onDateSelect={(d) => setSelectedDate(d)}
        />

        {/* View Selection */}
        {viewMode === 'LIVE_FEED' ? (
          <LiveScrapedMoviesViewer city={selectedCity.id} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
            
            {/* Left Filter Sidebar */}
            <div className="space-y-5 bg-[#1e2348] border border-white/10 rounded-2xl p-5 h-fit">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#e0b45c]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#a8adc9] hover:text-[#e0b45c] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Release Status */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">Status</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['ALL', 'NOW_SHOWING', 'UPCOMING'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                        statusFilter === st
                          ? 'bg-[#e0b45c] text-[#171b34] font-bold'
                          : 'bg-[#262b52] text-[#a8adc9] hover:text-white'
                      }`}
                    >
                      {st === 'ALL' ? 'All' : st === 'NOW_SHOWING' ? 'Now Showing' : 'Upcoming'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">Genre</label>
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...GENRES].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGenre(g)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        selectedGenre === g
                          ? 'bg-[#e0b45c] text-[#171b34] font-bold shadow-sm'
                          : 'bg-[#262b52] text-[#a8adc9] hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider block">Language</label>
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...LANGUAGES].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setSelectedLanguage(l)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        selectedLanguage === l
                          ? 'bg-[#e0b45c] text-[#171b34] font-bold shadow-sm'
                          : 'bg-[#262b52] text-[#a8adc9] hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Movie List Area */}
            <div className="lg:col-span-3 space-y-3">
              {filteredMovies.length > 0 ? (
                <div className="space-y-3">
                  {filteredMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl bg-[#1e2348] border border-white/10 space-y-3">
                  <Film className="w-12 h-12 text-[#6b7094] mx-auto" />
                  <h3 className="text-base font-bold text-white">No Movies Found</h3>
                  <p className="text-xs text-[#a8adc9]">Try adjusting your search or filters to see more results.</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="luxury-gold-btn px-4 py-2 text-xs font-bold"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
