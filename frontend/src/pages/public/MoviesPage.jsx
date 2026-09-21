import React, { useState } from 'react';
import { Search, SlidersHorizontal, Film, RotateCcw, Sparkles, LayoutGrid, Radio, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0B0E14] text-white pt-28 pb-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5A93C]/20">
          <div>
            <span className="text-xs font-black text-[#FFD066] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" /> Cinema Catalog & Box Office
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display mt-1">
              Movies in {selectedCity.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse premier blockbuster releases, 4K Laser showtimes, and upcoming films in {selectedCity.name}
            </p>
          </div>

          {/* View Toggle Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-[#121824] rounded-2xl border border-[#E5A93C]/25">
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'CARDS'
                    ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0E14] shadow-[0_0_12px_rgba(229,169,60,0.5)] font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Movie Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LIVE_FEED')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'LIVE_FEED'
                    ? 'bg-[#1A2234] text-[#FFD066] border border-[#E5A93C]/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Live Feed</span>
              </button>
            </div>

            {/* Search Bar with Golden Border */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD066]" />
              <input
                type="text"
                placeholder="Search movies, cast, genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#121824] rounded-2xl text-xs font-bold text-white border border-[#E5A93C]/30 placeholder:text-slate-400 focus:outline-none focus:border-[#FFD066] focus:shadow-[0_0_12px_rgba(229,169,60,0.3)]"
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-2">
            
            {/* Left Filter Sidebar */}
            <div className="space-y-6 gold-glass-card rounded-3xl p-6 h-fit">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5A93C]/20">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FFD066]" />
                  <span className="text-xs font-black text-white uppercase tracking-wider font-display">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[#FFD066] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Release Status */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                  Show Status
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B0E14] rounded-xl border border-[#E5A93C]/20">
                  {['ALL', 'NOW_SHOWING', 'UPCOMING'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        statusFilter === status
                          ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0E14] shadow-xs font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {status === 'ALL' ? 'All' : status === 'NOW_SHOWING' ? 'Now' : 'Upcoming'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                  Languages
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        selectedLanguage === lang
                          ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] border-[#FFD066] text-[#0B0E14] font-black shadow-[0_0_10px_rgba(229,169,60,0.4)]'
                          : 'bg-[#121824] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/60 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                  Genres
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGenre(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        selectedGenre === g
                          ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] border-[#FFD066] text-[#0B0E14] font-black shadow-[0_0_10px_rgba(229,169,60,0.4)]'
                          : 'bg-[#121824] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/60 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinema Format */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                  Projection & Audio
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        selectedFormat === fmt
                          ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] border-[#FFD066] text-[#0B0E14] font-black shadow-[0_0_10px_rgba(229,169,60,0.4)]'
                          : 'bg-[#121824] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/60 hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Movies Grid */}
            <div className="lg:col-span-3 space-y-4">
              {/* Sort Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5A93C]/20 text-xs">
                <span className="text-slate-400 font-medium">
                  Showing <strong className="text-white font-bold">{filteredMovies.length}</strong> Movies in {selectedCity.name}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#121824] border border-[#E5A93C]/30 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#FFD066] shadow-xs font-bold"
                  >
                    <option value="rating" className="bg-[#121824] text-white">Top Rated ★</option>
                    <option value="newest" className="bg-[#121824] text-white">Release Date (Newest)</option>
                    <option value="title" className="bg-[#121824] text-white">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredMovies.length === 0 ? (
                <div className="py-20 text-center gold-glass-card rounded-3xl space-y-3">
                  <Film className="w-12 h-12 text-slate-500 mx-auto opacity-40" />
                  <h3 className="text-base font-bold text-white">No movies match your filter</h3>
                  <p className="text-xs text-slate-400">Try resetting your filter parameters</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="gold-glow-btn mt-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
                  {filteredMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
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
