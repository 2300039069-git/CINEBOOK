import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Ticket, Play, Sparkles, Volume2 } from 'lucide-react';
import { MOVIES } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';

export const HeroCarousel = ({ onWatchTrailer, onOpenShowtimes }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();

  // Top 3 Recommended Movies
  const topRecommended = MOVIES.slice(0, 3).map((m, i) => ({
    ...m,
    badgeTime: i === 0 ? '1:40' : i === 1 ? '1:00' : '2:00',
    starRating: i === 0 ? '4.9' : i === 1 ? '1.0' : '2.0'
  }));

  const activeMovie = topRecommended[selectedIndex] || topRecommended[0];

  const handleCardClick = (movie, idx) => {
    setSelectedIndex(idx);
    setSelectedMovie(movie);
  };

  const handleBookActiveMovie = () => {
    setSelectedMovie(activeMovie);
    if (onOpenShowtimes) {
      onOpenShowtimes(activeMovie);
    } else {
      navigate(`/movie/${activeMovie.slug || activeMovie.id}`);
    }
  };

  const handleTrailerActiveMovie = () => {
    if (onWatchTrailer) {
      onWatchTrailer(activeMovie);
    } else {
      navigate(`/movie/${activeMovie.slug || activeMovie.id}`);
    }
  };

  return (
    <section className="w-full pt-20 sm:pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      
      {/* DESKTOP & WIDESCREEN HERO SHOWCASE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT / MAIN (8 COLS ON DESKTOP): CINEMATIC FEATURED BACKDROP BANNER */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-surface border border-border shadow-2xl min-h-[360px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-10 group">
          
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={activeMovie.backdropUrl || activeMovie.posterUrl || '/posters/pushpa2.jpg'}
              alt={activeMovie.title}
              className="w-full h-full object-cover filter brightness-[0.38] group-hover:scale-105 transition-transform duration-700"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          </div>

          {/* Featured Content Overlay */}
          <div className="relative z-10 space-y-3.5 max-w-2xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3 h-3 text-primary" />
                Featured Premiere
              </span>
              <span className="px-2.5 py-1 rounded-full bg-surface/80 border border-border text-xs font-bold text-text-primary backdrop-blur-md">
                {activeMovie.censorRating || 'UA 16+'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-surface/80 border border-border text-xs font-bold text-primary backdrop-blur-md flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> 4K Dolby Atmos
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-display drop-shadow-md">
              {activeMovie.title}
            </h1>

            {/* Rating & Synopsis Snippet */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-text-secondary">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface/90 border border-primary/30 text-primary font-bold">
                <span>★</span>
                <span>{activeMovie.rating || '4.9'}/5</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-white/90">{activeMovie.genres?.join(', ') || activeMovie.genre || 'Action, Thriller'}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-white/90">{activeMovie.duration || '2h 45m'}</span>
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed">
              {activeMovie.description || 'Experience the adrenaline-pumping cinematic spectacle on the grandest 4K Laser auditorium.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBookActiveMovie}
                className="luxury-gold-btn px-6 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-gold-glow"
              >
                <Ticket className="w-4 h-4" />
                <span>Find Best Seats</span>
              </button>

              <button
                type="button"
                onClick={handleTrailerActiveMovie}
                className="px-5 py-3 rounded-full bg-surface/90 hover:bg-surface-elevated border border-border text-text-primary text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT (4 COLS ON DESKTOP): TOP 3 RECOMMENDED POSTER SHOWCASE */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl">
          
          {/* Section Heading */}
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-wide font-display flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-gold-glow" />
              Top 3 Recommended
            </h2>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
              {selectedIndex + 1} of 3
            </span>
          </div>

          {/* 3 Horizontal Poster Cards Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 items-stretch flex-1">
            {topRecommended.map((movie, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={movie.id}
                  onClick={() => handleCardClick(movie, idx)}
                  className={`group relative flex flex-col justify-between p-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'bg-surface-elevated border border-primary shadow-gold-glow scale-[1.03]'
                      : 'bg-surface/80 border border-border hover:border-primary/40 hover:bg-surface-elevated'
                  }`}
                >
                  {/* Poster Container */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-background">
                    <img
                      src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Time Pill Badge Top-Right */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-background/90 backdrop-blur-md border border-border text-[9px] font-bold text-text-primary">
                      {movie.badgeTime}
                    </div>
                  </div>

                  {/* Title & Star Rating Below Poster */}
                  <div className="pt-2 text-center space-y-0.5">
                    <h3 className="text-[11px] sm:text-xs font-semibold text-text-primary truncate">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-primary">
                      <span>★</span>
                      <span>{movie.starRating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot Pagination Indicator */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {topRecommended.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === selectedIndex
                    ? 'w-6 bg-primary shadow-gold-glow'
                    : 'w-1.5 bg-text-muted hover:bg-text-secondary'
                }`}
                aria-label={`Select recommended movie ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
