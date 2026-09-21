import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { MOVIES } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';
import HeroCarousel from '../../components/movies/HeroCarousel';
import MovieCard from '../../components/movies/MovieCard';
import ShowtimeDetailsModal from '../../components/booking/ShowtimeDetailsModal';
import TrailerModal from '../../components/movies/TrailerModal';

export const HomePage = () => {
  const { setSelectedMovie } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);
  const [showtimeModalMovie, setShowtimeModalMovie] = useState(null);

  const handleOpenShowtimes = (movie, time) => {
    setSelectedMovie(movie);
    setShowtimeModalMovie(movie);
  };

  const displayedMovies = searchQuery.trim()
    ? MOVIES.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genres?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : MOVIES;

  return (
    <div className="min-h-screen bg-[#171b34] bg-gradient-to-b from-[#171b34] via-[#1e2348] to-[#171b34] text-white pb-28 select-none">
      
      {/* 1. TOP 3 RECOMMENDED SECTION */}
      <HeroCarousel
        onWatchTrailer={(movie) => setSelectedTrailerMovie(movie)}
        onOpenShowtimes={(movie) => handleOpenShowtimes(movie)}
      />

      {/* 2. ORNATE DIAMOND ACCENTED SEARCH BAR (Screen 1 Mockup) */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 my-4 relative z-20">
        <div className="relative flex items-center justify-between px-3 py-2 rounded-2xl bg-[#1e2348] border border-[#e0b45c] shadow-[0_0_16px_rgba(224,180,92,0.3)]">
          {/* Left Diamond Accent */}
          <div className="flex items-center gap-2 pl-1">
            <span className="text-[#e0b45c] text-xs font-serif leading-none select-none">◆</span>
            <Search className="w-4 h-4 text-[#e0b45c] shrink-0" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Movies, Theaters..."
            className="w-full bg-transparent px-3 text-xs sm:text-sm font-medium text-white placeholder:text-[#6b7094] outline-none"
          />

          {/* Right Diamond Accent */}
          <div className="flex items-center gap-2 pr-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-[#e0b45c] font-semibold hover:underline mr-1"
              >
                Clear
              </button>
            )}
            <span className="text-[#e0b45c] text-xs font-serif leading-none select-none">◆</span>
          </div>
        </div>
      </div>

      {/* 3. STACKED MOVIE LIST ROWS (Screen 1 Mockup) */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-3.5 pt-2">
        {displayedMovies.map((movie, idx) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isSelectedDefault={idx === 1}
            onOpenShowtimes={(m, time) => handleOpenShowtimes(m, time)}
          />
        ))}
      </div>

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
