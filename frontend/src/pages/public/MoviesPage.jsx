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
    <div className="min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--theme-border)]">
          <div>
            <span className="text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Explore Full Movie Catalog
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-theme-primary tracking-tight mt-1 font-display">
              Movies in {selectedCity.name}
            </h1>
            <p className="text-xs text-theme-muted mt-1">
              Discover blockbuster Telugu hits, IMAX experiences, and live cinema showtimes
            </p>
          </div>

          {/* View Toggle Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 glass-panel rounded-2xl border border-[var(--theme-border)]">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'CARDS'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-theme-muted hover:text-theme-primary'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Movie Cards</span>
              </button>
              <button
                onClick={() => setViewMode('LIVE_FEED')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'LIVE_FEED'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-theme-muted hover:text-theme-primary'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span>Live BMS Feed</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Search movie title, actor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-2xl text-xs text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-pink-500 shadow-sm"
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
            <div className="space-y-5 glass-panel rounded-3xl p-5 h-fit">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-black text-theme-primary uppercase tracking-wider">Filters</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-theme-muted hover:text-pink-500 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Release Status */}
              <div>
                <label className="text-xs font-black text-theme-primary block mb-2 uppercase tracking-wider">
                  Show Status
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-black/10 dark:bg-white/5 rounded-2xl border border-[var(--theme-border)]">
                  {['ALL', 'NOW_SHOWING', 'UPCOMING'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                        statusFilter === status
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                          : 'text-theme-secondary hover:text-theme-primary'
                      }`}
                    >
                      {status === 'ALL' ? 'All' : status === 'NOW_SHOWING' ? 'Now' : 'Upcoming'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div>
                <label className="text-xs font-black text-theme-primary block mb-2 uppercase tracking-wider">
                  Languages
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedLanguage === lang
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white shadow-sm'
                          : 'glass-panel text-theme-secondary hover:border-pink-500'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="text-xs font-black text-theme-primary block mb-2 uppercase tracking-wider">
                  Genres
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGenre(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedGenre === g
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white shadow-sm'
                          : 'glass-panel text-theme-secondary hover:border-pink-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinema Format */}
              <div>
                <label className="text-xs font-black text-theme-primary block mb-2 uppercase tracking-wider">
                  Format
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedFormat === fmt
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white shadow-sm'
                          : 'glass-panel text-theme-secondary hover:border-pink-500'
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
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--theme-border)] text-xs">
                <span className="text-theme-muted font-bold">
                  Showing <strong className="text-theme-primary">{filteredMovies.length}</strong> Movies in {selectedCity.name}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-theme-muted font-bold">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-panel rounded-xl px-3 py-1.5 text-theme-primary text-xs focus:outline-none focus:border-pink-500 shadow-sm font-bold"
                  >
                    <option value="rating">Top Rated ★</option>
                    <option value="newest">Release Date (Newest)</option>
                    <option value="title">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredMovies.length === 0 ? (
                <div className="py-16 text-center glass-panel rounded-3xl">
                  <Film className="w-12 h-12 text-theme-muted mx-auto mb-2 opacity-50" />
                  <h3 className="text-base font-black text-theme-primary">No movies found</h3>
                  <p className="text-xs text-theme-muted mt-1">Try resetting your filter selection</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-black text-white shadow-md cursor-pointer"
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
