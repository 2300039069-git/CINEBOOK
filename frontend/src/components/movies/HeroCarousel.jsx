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
  Flame,
  Award
} from 'lucide-react';
import { MOVIES } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';

export const HeroCarousel = ({ onWatchTrailer, onOpenShowtimes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();

  // Top 3 Recommended Movies
  const topRecommended = MOVIES.slice(0, 3);
  const currentMovie = topRecommended[currentIndex] || topRecommended[0];

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topRecommended.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isHovered, topRecommended.length]);

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
      className="relative w-full min-h-[560px] lg:min-h-[620px] bg-[#0B0A14] overflow-hidden border-b border-[#E5A93C]/25 select-none"
    >
      {/* 1. CINEMATIC BACKDROP ARTWORK WITH VIOLET-NAVY VIGNETTE */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdropUrl || currentMovie.posterUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center filter brightness-[0.34] transition-all duration-700 scale-105"
        />
        {/* Pitch midnight obsidian with subtle violet-navy tone vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0A14] via-[#0B0A14]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A14] via-[#0B0A14]/50 to-transparent" />
        {/* Vintage Neon Gold Ambient Pool */}
        <div className="absolute top-0 left-1/3 w-[450px] h-[450px] bg-[#E5A93C]/12 rounded-full blur-[170px] pointer-events-none" />
      </div>

      {/* 2. FOREGROUND CONTENT & "TOP 3 RECOMMENDED" SECTION */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 min-h-[560px] lg:min-h-[620px] flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Left Info Column */}
        <div className="max-w-2xl space-y-4 sm:space-y-5 animate-in fade-in duration-500">
          
          {/* Top Metadata Pills with Art-Deco Framing */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-lg bg-[#E5A93C]/20 text-[#FFE29A] border border-[#E5A93C]/50 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,169,60,0.35)]">
              <Award className="w-3.5 h-3.5 text-[#FFD066]" />
              <span>TOP RECOMMENDED #{currentIndex + 1}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-[#120F24]/85 border border-[#E5A93C]/30 text-white text-[11px] font-bold backdrop-blur-md">
              {currentMovie.censorRating || 'UA 16+'}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-[#120F24]/85 border border-[#E5A93C]/30 text-[#FFD066] text-[11px] font-bold backdrop-blur-md">
              4K RGB LASER • DOLBY ATMOS
            </span>
          </div>

          {/* Movie Title in Gold/White Typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-display drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            {currentMovie.title}
          </h1>

          {/* Star Rating Badge ("★ 4.9") & Quick Info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#120F24]/90 backdrop-blur-md border border-[#E5A93C]/40 text-white shadow-[0_0_15px_rgba(229,169,60,0.3)]">
              <span className="text-sm font-black text-[#FFD066]">★ {currentMovie.rating || '4.9'}</span>
              <span className="text-slate-400 font-medium">({currentMovie.votes || '28K'} ratings)</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Clock className="w-4 h-4 text-[#FFD066]" />
              <span>{currentMovie.duration || '2h 45m'}</span>
            </div>

            <span className="text-slate-600">•</span>

            <div className="text-slate-200 font-semibold">
              <span className="text-[#FFE29A]">{currentMovie.genres?.join(', ') || currentMovie.genre}</span>
            </div>

            <span className="text-slate-600">•</span>

            <div className="text-slate-300">
              <span>{currentMovie.languages?.join(' • ') || currentMovie.language}</span>
            </div>
          </div>

          {/* Description Subtext */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl font-normal">
            {currentMovie.description}
          </p>

          {/* Call to Action Buttons with Notched Style */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => handleBookNow(currentMovie)}
              className="art-deco-gold-btn px-7 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_18px_rgba(229,169,60,0.45)]"
            >
              <Ticket className="w-4 h-4" />
              <span>Find Best Seats</span>
            </button>

            <button
              type="button"
              onClick={() => onWatchTrailer?.(currentMovie)}
              className="px-6 py-3.5 rounded-xl bg-[#120F24]/85 hover:bg-[#1A1633] border border-[#E5A93C]/40 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#FFD066]"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Watch Trailer</span>
            </button>
          </div>
        </div>

        {/* Right: "TOP 3 RECOMMENDED" SWIPEABLE CARDS WITH CORNER NOTCH DECORATIONS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-[#FFD066] flex items-center gap-1.5 font-display">
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
              Top 3 Recommended
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Swipe to Select</span>
          </div>

          <div className="flex items-center gap-4.5 overflow-x-auto pb-2 scrollbar-none">
            {topRecommended.map((movie, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={movie.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${
                    isActive
                      ? 'w-52 sm:w-56 h-80 border-2 border-[#FFD066] shadow-[0_0_25px_rgba(229,169,60,0.55)] scale-102 z-10'
                      : 'w-40 sm:w-44 h-64 border border-[#E5A93C]/30 opacity-65 hover:opacity-100 hover:border-[#FFD066]/70'
                  }`}
                >
                  {/* Poster Image Filling Card Top */}
                  <img
                    src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Rating Badge Overlay ("★ 4.9") */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#0B0A14]/90 backdrop-blur-md border border-[#E5A93C]/50 text-[#FFD066] text-xs font-black shadow-[0_0_10px_rgba(229,169,60,0.3)]">
                    ★ {movie.rating || '4.9'}
                  </div>

                  {/* Corner Notch Decorations for Active Card */}
                  {isActive && (
                    <>
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FFE29A] z-20 pointer-events-none" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FFE29A] z-20 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FFE29A] z-20 pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FFE29A] z-20 pointer-events-none" />
                    </>
                  )}

                  {/* Card Title & Subtext Drawer */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-[#0B0A14] via-[#0B0A14]/85 to-transparent space-y-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#FFD066] block">
                      #{idx + 1} Best Pick
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-white truncate font-display">
                      {movie.title}
                    </h3>
                    <p className="text-[10px] text-slate-300 truncate">
                      {movie.genres?.join(', ') || movie.genre}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CAROUSEL PROGRESS CONTROLS */}
      <div className="absolute bottom-6 right-6 lg:right-12 z-20 flex items-center gap-3">
        <div className="flex items-center gap-1.5 mr-2">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + topRecommended.length) % topRecommended.length)}
            className="p-2 rounded-xl bg-[#120F24]/90 hover:bg-[#1A1633] text-white border border-[#E5A93C]/30 backdrop-blur-md transition cursor-pointer shadow-xs"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 text-[#FFD066]" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % topRecommended.length)}
            className="p-2 rounded-xl bg-[#120F24]/90 hover:bg-[#1A1633] text-white border border-[#E5A93C]/30 backdrop-blur-md transition cursor-pointer shadow-xs"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 text-[#FFD066]" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {topRecommended.map((m, idx) => (
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
