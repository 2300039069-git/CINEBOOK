import React, { useState } from 'react';
import { Search, SlidersHorizontal, Film, RotateCcw, Sparkles, LayoutGrid, Radio } from 'lucide-react';
import { MOVIES, GENRES, LANGUAGES, FORMATS } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import MovieCard from '../../components/movies/MovieCard';
import LiveScrapedMoviesViewer from '../../components/movies/LiveScrapedMoviesViewer';

const MoviesPage = () => {
  const { selectedCity } = useLocation();
  const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' | 'LIVE_FEED'
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, NOW_SHOWING, UPCOMING
  const [sortBy, setSortBy] = useState('rating'); // rating, newest, title

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
      movie.director.toLowerCase().includes(search.toLowerCase()) ||
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
    <div className="min-h-screen bg-[#090A0E] text-slate-100 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E2332]">
          <div>
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Cinema Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Movies in {selectedCity.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse now showing blockbuster releases, 4K Laser showtimes, and upcoming films
            </p>
          </div>

          {/* View Toggle Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-[#11141D] rounded-xl border border-[#1E2332]">
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'CARDS'
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Movie Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LIVE_FEED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'LIVE_FEED'
                    ? 'bg-[#181C28] text-[#F59E0B] border border-[#1E2332] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Live Feed</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies, cast, genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#11141D] rounded-xl text-xs text-white border border-[#1E2332] placeholder:text-slate-400 focus:outline-none focus:border-[#E50914] shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Dynamic View: Cards vs Live Scraped Feed */}
        {viewMode === 'LIVE_FEED' ? (
          <LiveScrapedMoviesViewer city={selectedCity.id} />
        ) : (
          /* Filter & Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
            {/* Left Filter Sidebar */}
            <div className="space-y-5 bg-[#11141D] rounded-xl border border-[#1E2332] p-5 h-fit shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2332]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#E50914]" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[#E50914] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Release Status */}
              <div>
                <label className="text-xs font-bold text-white block mb-2 uppercase tracking-wider">
                  Show Status
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#181C28] rounded-lg border border-[#1E2332]">
                  {['ALL', 'NOW_SHOWING', 'UPCOMING'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        statusFilter === status
                          ? 'bg-[#E50914] text-white shadow-sm'
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
                <label className="text-xs font-bold text-white block mb-2 uppercase tracking-wider">
                  Languages
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                        selectedLanguage === lang
                          ? 'bg-[#E50914] border-[#E50914] text-white'
                          : 'bg-[#181C28] border-[#1E2332] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="text-xs font-bold text-white block mb-2 uppercase tracking-wider">
                  Genres
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGenre(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                        selectedGenre === g
                          ? 'bg-[#E50914] border-[#E50914] text-white'
                          : 'bg-[#181C28] border-[#1E2332] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinema Format */}
              <div>
                <label className="text-xs font-bold text-white block mb-2 uppercase tracking-wider">
                  Format
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                        selectedFormat === fmt
                          ? 'bg-[#E50914] border-[#E50914] text-white'
                          : 'bg-[#181C28] border-[#1E2332] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Movies Grid */}
            <div className="lg:col-span-3">
              {/* Top Sort Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1E2332] text-xs">
                <span className="text-slate-400 font-medium">
                  Showing <strong className="text-white font-bold">{filteredMovies.length}</strong> Movies in {selectedCity.name}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#11141D] border border-[#1E2332] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#E50914] shadow-sm font-medium"
                  >
                    <option value="rating" className="bg-[#11141D] text-white">Top Rated ★</option>
                    <option value="newest" className="bg-[#11141D] text-white">Release Date (Newest)</option>
                    <option value="title" className="bg-[#11141D] text-white">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredMovies.length === 0 ? (
                <div className="py-16 text-center bg-[#11141D] rounded-xl border border-[#1E2332]">
                  <Film className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-white">No movies found</h3>
                  <p className="text-xs text-slate-400 mt-1">Try resetting your filter selection</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 px-5 py-2 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-xs font-bold text-white shadow-sm cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
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
