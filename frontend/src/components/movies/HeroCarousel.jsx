import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Ticket, Sparkles, Star, Flame, Film, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOVIES } from '../../data/mockData';

const HeroCarousel = ({ onWatchTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const currentMovie = MOVIES[currentIndex] || MOVIES[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOVIES.length);
      setImageError(false);
    }, 7500);
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

  const getImageSrc = () => {
    if (currentMovie.backdropUrl) return currentMovie.backdropUrl;
    if (currentMovie.posterUrl) return currentMovie.posterUrl;
    if (currentMovie.poster) return currentMovie.poster;
    const t = ((currentMovie.title || '') + ' ' + (currentMovie.slug || '')).toLowerCase();
    if (t.includes('pushpa')) return '/posters/pushpa2.jpg';
    if (t.includes('devara')) return '/posters/devara.jpg';
    if (t.includes('kalki')) return '/posters/kalki.webp';
    if (t.includes('og') || t.includes('ojas')) return '/posters/og.jpg';
    return '/posters/default.jpg';
  };

  const handleImageError = (e) => {
    const poster = currentMovie.posterUrl || currentMovie.poster;
    if (poster && e.target.src !== poster && !e.target.src.endsWith(poster)) {
      e.target.src = poster;
      return;
    }
    const t = ((currentMovie.title || '') + ' ' + (currentMovie.slug || '')).toLowerCase();
    let fallback = '/posters/default.jpg';
    if (t.includes('pushpa')) fallback = '/posters/pushpa2.jpg';
    else if (t.includes('devara')) fallback = '/posters/devara.jpg';
    else if (t.includes('kalki')) fallback = '/posters/kalki.webp';
    else if (t.includes('og') || t.includes('ojas')) fallback = '/posters/og.jpg';

    if (e.target.src !== fallback && !e.target.src.endsWith(fallback)) {
      e.target.src = fallback;
      return;
    }
    setImageError(true);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Main Hero Billboard Container */}
      <div className="relative w-full h-72 sm:h-84 lg:h-96 rounded-3xl overflow-hidden border border-border group bg-surface shadow-2xl">
        {/* Background Movie Backdrop Slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0.2, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.1, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {!imageError ? (
              <img
                src={getImageSrc()}
                alt={currentMovie.title}
                onError={handleImageError}
                loading="eager"
                className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.08]"
              />
            ) : (
              <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                <Film className="w-24 h-24 text-text-muted" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* High-Contrast Vignette Multi-Stop Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent w-full lg:w-4/5 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Content Details Grid */}
        <div className="absolute inset-0 p-6 sm:p-8 lg:p-10 flex flex-col justify-between z-20">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-cta">
              <Flame className="w-3.5 h-3.5 fill-white" />
              NOW SHOWING
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-amber-400/50 text-amber-400 text-xs font-extrabold backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {currentMovie.rating} / 10 <span className="text-white/60 font-semibold hidden sm:inline">({currentMovie.votes || '25K+'})</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-white text-xs font-bold backdrop-blur-md">
              {currentMovie.formats?.[0] || '4K Laser'}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-white text-xs font-bold backdrop-blur-md">
              {currentMovie.censorRating || 'UA 16+'}
            </span>
          </div>

          {/* Center/Bottom: Movie Info & Actions */}
          <div className="max-w-2xl space-y-2.5 sm:space-y-3.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              {currentMovie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-white/90 font-semibold">
              <span className="text-amber-400 font-extrabold">{currentMovie.genre || currentMovie.genres?.join(', ')}</span>
              <span>•</span>
              <span>{currentMovie.languages?.join(', ') || 'Telugu'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/70" /> {currentMovie.duration || '2h 45m'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/80 line-clamp-2 font-medium leading-relaxed max-w-xl hidden sm:block">
              {currentMovie.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/movie/${currentMovie.slug || currentMovie.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all shadow-cta active:scale-95 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Tickets</span>
              </Link>

              <Link
                to={`/movie/${currentMovie.slug || currentMovie.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                <span>View Details</span>
              </Link>

              {onWatchTrailer && (
                <button
                  type="button"
                  onClick={() => onWatchTrailer(currentMovie)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-amber-400" />
                  <span>Watch Trailer</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Film"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all z-30 hover:scale-105 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Film"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all z-30 hover:scale-105 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Progress Indicators */}
        <div className="absolute bottom-4 right-5 flex items-center gap-1.5 z-30">
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
                idx === currentIndex
                  ? 'w-7 bg-primary shadow-sm'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
