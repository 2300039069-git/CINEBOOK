import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Film, Volume2, Armchair, UtensilsCrossed, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { MOVIES, GENRES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import HeroCarousel from '../../components/movies/HeroCarousel';
import MovieCard from '../../components/movies/MovieCard';
import ShowtimeDetailsModal from '../../components/booking/ShowtimeDetailsModal';
import TrailerModal from '../../components/movies/TrailerModal';

export const HomePage = () => {
  const { selectedCity } = useLocation();
  const { setSelectedMovie } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);
  const [showtimeModalMovie, setShowtimeModalMovie] = useState(null);

  const handleOpenShowtimes = (movie, time) => {
    setSelectedMovie(movie);
    setShowtimeModalMovie(movie);
  };

  const displayedMovies = MOVIES.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genres?.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.cast?.some((c) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'All' || m.genres?.includes(selectedGenre);

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-[#171b34] bg-gradient-to-b from-[#171b34] via-[#1e2348] to-[#171b34] text-white pb-24 select-none">
      
      {/* 1. WIDESCREEN CINEMATIC HERO & TOP 3 RECOMMENDED SECTION */}
      <HeroCarousel
        onWatchTrailer={(movie) => setSelectedTrailerMovie(movie)}
        onOpenShowtimes={(movie) => handleOpenShowtimes(movie)}
      />

      {/* 2. ORNATE DIAMOND ACCENTED SEARCH & FILTER BAR (Widescreen Website Fit) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 relative z-20 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Main Ornate Search Box */}
          <div className="flex-1 relative flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#1e2348] border border-[#e0b45c] shadow-[0_0_16px_rgba(224,180,92,0.3)]">
            {/* Left Diamond Accent */}
            <div className="flex items-center gap-2.5 pl-1">
              <span className="text-[#e0b45c] text-xs font-serif leading-none select-none">◆</span>
              <Search className="w-4 h-4 text-[#e0b45c] shrink-0" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Movies, Cast, Directors, Theatres..."
              className="w-full bg-transparent px-3 text-xs sm:text-sm font-medium text-white placeholder:text-[#6b7094] outline-none"
            />

            {/* Right Diamond Accent & Clear Button */}
            <div className="flex items-center gap-2 pr-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-[#e0b45c] font-semibold hover:underline mr-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <span className="text-[#e0b45c] text-xs font-serif leading-none select-none">◆</span>
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', 'Action', 'Drama', 'Sci-Fi', 'Thriller'].map((genre) => {
              const isActive = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'luxury-gold-btn text-[#171b34]'
                      : 'bg-[#1e2348] border border-white/10 text-[#a8adc9] hover:text-white hover:border-white/25'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. NOW SHOWING MOVIES RESPONSIVE CATALOG GRID (Full Website Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-6">
        {/* Section Title Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e0b45c] shadow-[0_0_10px_#e0b45c]" />
              Now Showing in {selectedCity.name}
            </h2>
            <p className="text-xs text-[#a8adc9] mt-0.5">
              Select your preferred showtime for instant seat reservation & live QR passes
            </p>
          </div>

          <Link
            to="/movies"
            className="flex items-center gap-1 text-xs font-bold text-[#e0b45c] hover:text-white transition-colors"
          >
            <span>View All ({MOVIES.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on laptop, 4 on wide desktop */}
        {displayedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedMovies.map((movie, idx) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                variant="grid"
                isSelectedDefault={idx === 1}
                onOpenShowtimes={(m, time) => handleOpenShowtimes(m, time)}
                onWatchTrailer={(m) => setSelectedTrailerMovie(m)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[#1e2348] border border-white/10 space-y-3">
            <Film className="w-12 h-12 text-[#6b7094] mx-auto" />
            <h3 className="text-base font-bold text-white">No Movies Match Your Search</h3>
            <p className="text-xs text-[#a8adc9]">Try searching for other titles, actors, or reset filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All');
              }}
              className="luxury-gold-btn px-5 py-2 rounded-full text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 4. PREMIUM CINEMA EXPERIENCE HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold text-[#e0b45c] uppercase tracking-wider">
            Uncompromising Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            The Luxury Cinema Difference
          </h2>
          <p className="text-xs text-[#a8adc9]">
            Designed for the ultimate visual clarity, immersive acoustic depth, and first-class auditorium comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-[#1e2348] border border-white/10 shadow-lg space-y-3 group hover:border-[#e0b45c]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#e0b45c]/15 text-[#e0b45c] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">4K RGB Laser Projection</h3>
            <p className="text-xs text-[#a8adc9] leading-relaxed">
              Ultra-high contrast, razor-sharp 4K imagery with 100% Rec.2020 color fidelity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1e2348] border border-white/10 shadow-lg space-y-3 group hover:border-[#e0b45c]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#7c5cc4]/20 text-[#7c5cc4] flex items-center justify-center shadow-sm">
              <Volume2 className="w-5 h-5 text-[#e0b45c]" />
            </div>
            <h3 className="text-sm font-bold text-white">Dolby Atmos 360° Sound</h3>
            <p className="text-xs text-[#a8adc9] leading-relaxed">
              Object-based multidimensional soundscapes that flow with pinpoint precision.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1e2348] border border-white/10 shadow-lg space-y-3 group hover:border-[#e0b45c]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#e0b45c]/15 text-[#e0b45c] flex items-center justify-center shadow-sm">
              <Armchair className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">VIP Italian Leather Recliners</h3>
            <p className="text-xs text-[#a8adc9] leading-relaxed">
              Motorized headrests, plush leg support, and in-seat USB charging sockets.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1e2348] border border-white/10 shadow-lg space-y-3 group hover:border-[#e0b45c]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#7c5cc4]/20 text-[#7c5cc4] flex items-center justify-center shadow-sm">
              <UtensilsCrossed className="w-5 h-5 text-[#e0b45c]" />
            </div>
            <h3 className="text-sm font-bold text-white">Gourmet Canteen & Cafe</h3>
            <p className="text-xs text-[#a8adc9] leading-relaxed">
              Chef-crafted artisanal snacks, gourmet popcorn varieties, and delivered to seat.
            </p>
          </div>
        </div>
      </section>

      {/* SHOWTIME DETAILS EXPLORER MODAL (Screen 2) */}
      {showtimeModalMovie && (
        <ShowtimeDetailsModal
          movie={showtimeModalMovie}
          isOpen={Boolean(showtimeModalMovie)}
          onClose={() => setShowtimeModalMovie(null)}
        />
      )}

      {/* TRAILER MODAL */}
      {selectedTrailerMovie && (
        <TrailerModal
          movie={selectedTrailerMovie}
          isOpen={Boolean(selectedTrailerMovie)}
          onClose={() => setSelectedTrailerMovie(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
