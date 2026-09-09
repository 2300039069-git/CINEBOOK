import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Ticket, Sparkles, Star, Flame, Film } from 'lucide-react';
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
    }, 6000);
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
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Dynamic Ambient Gold & Crimson Glow */}
      <div className="absolute -inset-x-4 top-0 h-96 bg-gradient-to-r from-[#D4AF37]/15 via-[#E50914]/10 to-amber-600/15 filter blur-3xl opacity-70 pointer-events-none" />

      {/* Main Glassmorphic Hero Billboard */}
      <div className="relative w-full aspect-[21/9] min-h-[380px] sm:min-h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08] group glass-panel bg-[#0B0E14]">
        {/* Cinematic Backdrop Image or Procedural Background */}
        {!imageError ? (
          <img
            key={currentMovie.id}
            src={currentMovie.backdropUrl || currentMovie.posterUrl}
            alt={currentMovie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center filter brightness-50 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#121824] via-[#0E131E] to-[#0B0E14] flex items-center justify-end pr-16">
            <Film className="w-72 h-72 text-white/[0.03]" />
          </div>
        )}

        {/* Multi-layered futuristic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />

        {/* Content Billboard Details */}
        <div className="absolute inset-0 p-6 sm:p-14 flex flex-col justify-end max-w-3xl space-y-4 z-10">
          {/* Release & Format Glowing Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#E50914] to-rose-700 text-white text-xs font-black uppercase shadow-glow-crimson tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-white" />
              BLOCKBUSTER SHOWCASE
            </span>

            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/70 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-extrabold backdrop-blur-md shadow-md">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
              {currentMovie.rating}/10 ({currentMovie.votes})
            </span>

            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-bold backdrop-blur-md">
              {currentMovie.formats?.join(' • ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-2xl font-display leading-none">
            {currentMovie.title}
          </h1>

          {/* Tagline / Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-xl font-medium leading-relaxed">
            {currentMovie.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to={`/movie/${currentMovie.slug || currentMovie.id}`}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-glow-gold transition-all duration-300 flex items-center gap-2 transform hover:scale-105 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets Now</span>
            </Link>

            {onWatchTrailer && (
              <button
                type="button"
                onClick={() => onWatchTrailer(currentMovie)}
                className="px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2 hover:border-[#D4AF37] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>

        {/* Circular Prev/Next Controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Film"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/60 hover:bg-[#D4AF37] hover:text-slate-950 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all z-20 hover:scale-110 shadow-lg cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Film"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/60 hover:bg-[#D4AF37] hover:text-slate-950 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all z-20 hover:scale-110 shadow-lg cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Active Animated Capsule Dots */}
        <div className="absolute bottom-6 right-8 flex items-center gap-2.5 z-20">
          {MOVIES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setImageError(false);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-10 bg-gradient-to-r from-[#D4AF37] to-amber-500 shadow-glow-gold'
                  : 'w-2.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
