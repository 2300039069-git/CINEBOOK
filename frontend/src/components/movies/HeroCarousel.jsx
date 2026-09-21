import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Ticket,
  Star,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { MOVIES } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';

export const HeroCarousel = ({ onWatchTrailer, onOpenShowtimes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();

  const heroMovies = MOVIES.slice(0, 4);
  const currentMovie = heroMovies[currentIndex] || heroMovies[0];

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isHovered, heroMovies.length]);

  const handleBookNow = (movie) => {
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie);
    } else {
      navigate(`/movie/${movie.slug || movie.id}`);
    }
  };

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-[520px] lg:min-h-[600px] bg-[#0B0E14] overflow-hidden border-b border-[#E5A93C]/20 select-none"
    >
      {/* 1. CINEMATIC BACKDROP ARTWORK WITH LUXE VIGNETTE */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdropUrl || currentMovie.posterUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center filter brightness-[0.38] transition-all duration-700 scale-105"
        />
        {/* Multi-stop Midnight Blue Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
        {/* Ambient Neon Gold Glow Pool */}
        <div className="absolute top-0 left-1/4 w-[420px] h-[420px] bg-[#E5A93C]/10 rounded-full blur-[160px] pointer-events-none" />
      </div>

      {/* 2. FOREGROUND CONTENT & POSTER CAROUSEL DECK */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 min-h-[520px] lg:min-h-[600px] flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Info Column */}
        <div className="max-w-2xl space-y-4 sm:space-y-5 animate-in fade-in duration-500">
          
          {/* Top Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E5A93C]/20 text-[#FFD066] border border-[#E5A93C]/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_12px_rgba(229,169,60,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD066]" />
              <span>FEATURED PREMIERE</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-[#121824]/80 border border-[#E5A93C]/20 text-white text-[11px] font-bold backdrop-blur-md">
              {currentMovie.censorRating || 'UA 16+'}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-[#121824]/80 border border-[#E5A93C]/20 text-[#FFD066] text-[11px] font-bold backdrop-blur-md">
              4K RGB LASER • DOLBY ATMOS
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-display drop-shadow-lg">
            {currentMovie.title}
          </h1>

          {/* Star Rating Badge (⭐ 9.4 / 10) & Quick Info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121824]/90 backdrop-blur-md border border-[#E5A93C]/30 text-white shadow-[0_0_12px_rgba(229,169,60,0.25)]">
              <Star className="w-4 h-4 fill-[#FFD066] text-[#FFD066]" />
              <span className="text-sm font-black text-[#FFD066]">⭐ {currentMovie.rating || '9.4'}/10</span>
              <span className="text-slate-400 font-medium">({currentMovie.votes || '28K'} Votes)</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Clock className="w-4 h-4 text-[#E5A93C]" />
              <span>{currentMovie.duration || '2h 45m'}</span>
            </div>

            <span className="text-slate-600">•</span>

            <div className="text-slate-200 font-semibold">
              <span>{currentMovie.genres?.join(', ') || currentMovie.genre}</span>
            </div>

            <span className="text-slate-600">•</span>

            <div className="text-slate-300">
              <span>{currentMovie.languages?.join(' • ') || currentMovie.language}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl font-normal">
            {currentMovie.description}
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleBookNow(currentMovie)}
              className="gold-glow-btn px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Find Best Seats</span>
            </button>

            <button
              type="button"
              onClick={() => onWatchTrailer?.(currentMovie)}
              className="px-6 py-3 rounded-2xl bg-[#121824]/80 hover:bg-[#1A2234] border border-[#E5A93C]/30 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#E5A93C]"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Watch 4K Trailer</span>
            </button>
          </div>
        </div>

        {/* Right: Glowing Poster Carousel Cards */}
        <div className="hidden lg:flex items-center gap-4 animate-in slide-in-from-right-4 duration-500">
          {heroMovies.map((movie, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={movie.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isCurrent
                    ? 'w-48 h-72 border-2 border-[#FFD066] shadow-[0_0_25px_rgba(229,169,60,0.5)] scale-105 z-10'
                    : 'w-36 h-54 border border-[#E5A93C]/20 opacity-60 hover:opacity-100 hover:border-[#E5A93C]/60'
                }`}
              >
                <img
                  src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-[10px] font-black text-white truncate max-w-[80px]">
                    {movie.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#0B0E14]/80 text-[#FFD066] text-[9px] font-black border border-[#E5A93C]/30">
                    ⭐ {movie.rating || '9.4'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CAROUSEL PROGRESS CONTROLS */}
      <div className="absolute bottom-6 right-6 lg:right-12 z-20 flex items-center gap-3">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5 mr-2">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)}
            className="p-2 rounded-xl bg-[#121824]/80 hover:bg-[#1A2234] text-white border border-[#E5A93C]/30 backdrop-blur-md transition cursor-pointer shadow-xs"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 text-[#FFD066]" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % heroMovies.length)}
            className="p-2 rounded-xl bg-[#121824]/80 hover:bg-[#1A2234] text-white border border-[#E5A93C]/30 backdrop-blur-md transition cursor-pointer shadow-xs"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 text-[#FFD066]" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2">
          {heroMovies.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-8 bg-[#FFD066] shadow-[0_0_10px_rgba(229,169,60,0.6)]' : 'w-2 bg-white/25 hover:bg-white/50'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
