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
    <div className="min-h-screen bg-background text-text-primary py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Cinema Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-1">
              Movies in {selectedCity.name}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Browse now showing blockbuster releases, 4K Laser showtimes, and upcoming films
            </p>
          </div>

          {/* View Toggle Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-surface rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'CARDS'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
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
                    ? 'bg-surface-elevated text-amber-500 border border-border shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Live Feed</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search movies, cast, genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface rounded-xl text-xs text-text-primary border border-border placeholder:text-text-muted focus:outline-none focus:border-accent shadow-sm"
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
            <div className="space-y-5 bg-surface rounded-xl border border-border p-5 h-fit shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-text-primary uppercase tracking-wider">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-text-muted hover:text-accent transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Release Status */}
              <div>
                <label className="text-xs font-bold text-text-primary block mb-2 uppercase tracking-wider">
                  Show Status
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-surface-elevated rounded-lg border border-border">
                  {['ALL', 'NOW_SHOWING', 'UPCOMING'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        statusFilter === status
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {status === 'ALL' ? 'All' : status === 'NOW_SHOWING' ? 'Now' : 'Upcoming'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div>
                <label className="text-xs font-bold text-text-primary block mb-2 uppercase tracking-wider">
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
                          ? 'bg-accent border-accent text-white'
                          : 'bg-surface-elevated border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="text-xs font-bold text-text-primary block mb-2 uppercase tracking-wider">
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
                          ? 'bg-accent border-accent text-white'
                          : 'bg-surface-elevated border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinema Format */}
              <div>
                <label className="text-xs font-bold text-text-primary block mb-2 uppercase tracking-wider">
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
                          ? 'bg-accent border-accent text-white'
                          : 'bg-surface-elevated border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
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
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border text-xs">
                <span className="text-text-muted font-medium">
                  Showing <strong className="text-text-primary font-bold">{filteredMovies.length}</strong> Movies in {selectedCity.name}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-text-muted font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent shadow-sm font-medium"
                  >
                    <option value="rating" className="bg-surface text-text-primary">Top Rated ★</option>
                    <option value="newest" className="bg-surface text-text-primary">Release Date (Newest)</option>
                    <option value="title" className="bg-surface text-text-primary">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredMovies.length === 0 ? (
                <div className="py-16 text-center bg-surface rounded-xl border border-border">
                  <Film className="w-12 h-12 text-text-muted mx-auto mb-2 opacity-50" />
                  <h3 className="text-base font-bold text-text-primary">No movies found</h3>
                  <p className="text-xs text-text-muted mt-1">Try resetting your filter selection</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-xs font-bold text-white shadow-sm cursor-pointer"
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
