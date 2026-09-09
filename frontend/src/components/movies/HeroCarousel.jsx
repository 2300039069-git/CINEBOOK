import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Ticket, Sparkles, Star, Flame, Film, Volume2, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOVIES } from '../../data/mockData';

const HeroCarousel = ({ onWatchTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOVIES.length);
      setImageError(false);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setImageError(false);
    setCurrentIndex((prev) => (prev === 0 ? MOVIES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setImageError(false);
    setCurrentIndex((prev) => (prev + 1) % MOVIES.length);
  };

  const currentMovie = MOVIES[currentIndex] || MOVIES[0];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Subtle Ambient Red/Gold Atmosphere Glow */}
      <div className="absolute -inset-x-4 top-0 h-80 bg-gradient-to-r from-[#E50914]/10 via-[#F59E0B]/5 to-transparent filter blur-3xl opacity-50 pointer-events-none" />

      {/* Main Hero Billboard Container */}
      <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[580px] rounded-2xl overflow-hidden border border-[#1E2332] group bg-[#11141D] shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0.4, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {!imageError ? (
              <img
                src={currentMovie.backdropUrl || currentMovie.posterUrl}
                alt={currentMovie.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center filter brightness-[0.75]"
              />
            ) : (
              <div className="w-full h-full bg-[#11141D] flex items-center justify-end pr-16">
                <Film className="w-72 h-72 text-white/[0.04]" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Sophisticated Multi-Angle Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090A0E] via-[#090A0E]/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/60 to-transparent" />

        {/* Content Details */}
        <div className="absolute inset-0 p-6 sm:p-10 lg:p-14 flex flex-col justify-end max-w-2xl space-y-4 z-10">
          {/* Release & Format Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E50914] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-white" />
              NOW SHOWING
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181C28]/90 border border-[#1E2332] text-[#F59E0B] text-xs font-bold backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              {currentMovie.rating}/10 ({currentMovie.votes || '24.5k'})
            </span>

            <span className="px-2.5 py-1 rounded-md bg-[#181C28]/80 border border-[#1E2332] text-slate-300 text-xs font-medium backdrop-blur-md">
              {currentMovie.censorRating || 'UA 16+'}
            </span>

            <span className="px-2.5 py-1 rounded-md bg-[#181C28]/80 border border-[#1E2332] text-slate-300 text-xs font-medium backdrop-blur-md">
              {currentMovie.language || 'Telugu'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {currentMovie.title}
          </h1>

          {/* Formats & Genre Info */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
            <span>{currentMovie.genre}</span>
            <span>•</span>
            <span className="text-[#F59E0B] font-semibold">{currentMovie.formats?.join(', ') || '2D, 3D, 4K Laser'}</span>
            <span>•</span>
            <span>{currentMovie.duration || '2h 45m'}</span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 font-normal leading-relaxed max-w-lg">
            {currentMovie.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              to={`/movie/${currentMovie.slug || currentMovie.id}`}
              className="bg-[#E50914] hover:bg-[#B80710] text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-[#E50914]/20 transition-all duration-200 flex items-center gap-2 cursor-pointer text-xs sm:text-sm tracking-wide"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </Link>

            {onWatchTrailer && (
              <button
                type="button"
                onClick={() => onWatchTrailer(currentMovie)}
                className="px-5 py-3 rounded-xl bg-[#181C28]/80 hover:bg-[#1D2232] border border-[#1E2332] text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer hover:border-slate-500"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>

        {/* Prev/Next Navigation Controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Film"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#090A0E]/80 hover:bg-[#181C28] text-white flex items-center justify-center backdrop-blur-md border border-[#1E2332] transition-all z-20 hover:scale-105 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Film"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#090A0E]/80 hover:bg-[#181C28] text-white flex items-center justify-center backdrop-blur-md border border-[#1E2332] transition-all z-20 hover:scale-105 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Active Pill Indicators */}
        <div className="absolute bottom-5 right-6 flex items-center gap-2 z-20">
          {MOVIES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setImageError(false);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-8 bg-[#E50914]'
                  : 'w-2 bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
