import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Ticket, Sparkles, Star, Flame, Film, Volume2, Clock, Calendar, ShieldCheck, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOVIES } from '../../data/mockData';
import GradientButton from '../common/GradientButton';
import GlassCard from '../common/GlassCard';
import AmbientGlow from '../common/AmbientGlow';

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
      {/* 1. Atmospheric Stage Lighting Glow */}
      <AmbientGlow variant="cinema" intensity="subtle" className="-top-8 inset-x-0 h-48 mx-auto w-3/4" />

      {/* 2. Main Hero Billboard Container - Compact and GPU accelerated */}
      <div className="relative w-full h-56 sm:h-72 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 group bg-surface/90 shadow-xl backdrop-blur-md will-change-transform transform-gpu">
        {/* Animated Background Image Slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0.3, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.15, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full will-change-transform transform-gpu"
          >
            {!imageError ? (
              <img
                src={getImageSrc()}
                alt={currentMovie.title}
                onError={handleImageError}
                loading="eager"
                className="w-full h-full object-cover object-center filter brightness-[0.68] contrast-[1.05]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface-elevated via-surface to-background flex items-center justify-center">
                <Film className="w-32 h-32 text-text-muted/10" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Gradients for Depth & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070B] via-[#05070B]/80 to-transparent w-full md:w-3/4 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-[#05070B]/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none z-10" />

        {/* Content Details Grid */}
        <div className="absolute inset-0 p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 z-20">
          {/* Left: Movie Info */}
          <div className="max-w-xl space-y-2 sm:space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-primary to-red-700 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm border border-white/20">
                <Flame className="w-3 h-3 fill-white" />
                NOW SHOWING
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/70 border border-gold/40 text-gold text-[10px] sm:text-xs font-black backdrop-blur-xl shadow-sm">
                <Star className="w-3 h-3 fill-gold text-gold" />
                {currentMovie.rating} / 10 <span className="text-white/60 font-medium hidden sm:inline">({currentMovie.votes || '25K+'})</span>
              </span>

              <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[10px] sm:text-xs font-bold backdrop-blur-xl flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                {currentMovie.formats?.[0] || '4K Laser'}
              </span>

              <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/20 text-white/90 text-[10px] sm:text-xs font-medium backdrop-blur-xl">
                {currentMovie.censorRating || 'UA 16+'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              {currentMovie.title}
            </h1>

            {/* Formats, Duration & Audio Info */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-white/90 font-medium">
              <span className="text-gold font-bold">{currentMovie.genre || currentMovie.genres?.join(', ')}</span>
              <span>•</span>
              <span className="text-cyan-300">{currentMovie.languages?.join(', ') || 'Telugu'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/70" /> {currentMovie.duration || '2h 45m'}
              </span>
            </div>

            {/* Synopsis - hidden on mobile for clean compact view */}
            <p className="text-xs text-white/80 line-clamp-1 sm:line-clamp-2 font-normal leading-relaxed max-w-lg hidden sm:block">
              {currentMovie.description}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link to={`/movie/${currentMovie.slug || currentMovie.id}`}>
                <GradientButton variant="gold" size="sm" icon={Ticket}>
                  Grab your seats
                </GradientButton>
              </Link>

              {onWatchTrailer && (
                <GradientButton
                  variant="glass"
                  size="sm"
                  icon={Play}
                  onClick={() => onWatchTrailer(currentMovie)}
                >
                  Watch Trailer
                </GradientButton>
              )}
            </div>
          </div>

          {/* Right: Compact Ticket Preview (Desktop only) */}
          <div className="hidden lg:flex flex-col items-end pb-1">
            <GlassCard
              variant="elevated"
              className="w-64 p-3.5 space-y-2.5 border-gold/30 hover:border-gold/60 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-gold/20 flex items-center justify-center text-gold">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-gold uppercase tracking-wider block">VIP PASS</span>
                    <span className="text-xs font-bold text-text-primary">Instant Booking</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-text-muted">4K LASER</span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-text-muted">
                  <span>Atomic Seat Lock</span>
                  <span className="text-emerald-400 font-bold">Active 8m</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Sound System</span>
                  <span className="text-text-primary font-semibold">Dolby Atmos 7.1</span>
                </div>
              </div>

              <Link
                to={`/movie/${currentMovie.slug || currentMovie.id}`}
                className="w-full py-1.5 rounded-lg bg-surface-hover hover:bg-gold hover:text-black border border-border/80 hover:border-transparent text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all text-text-primary text-center"
              >
                <span>Select Showtime</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </GlassCard>
          </div>
        </div>

        {/* Navigation Controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Film"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all z-30 hover:scale-105 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Film"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all z-30 hover:scale-105 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Timeline Pill Progress Indicators */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-30">
          {MOVIES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setImageError(false);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-gradient-to-r from-primary to-gold shadow-glow-crimson'
                  : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
