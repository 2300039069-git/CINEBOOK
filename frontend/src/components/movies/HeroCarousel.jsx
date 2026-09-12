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

  const currentMovie = MOVIES[currentIndex] || MOVIES[0];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* 1. Atmospheric Stage Lighting Glow */}
      <AmbientGlow variant="cinema" intensity="intense" className="-top-12 inset-x-0 h-96 mx-auto w-3/4" />

      {/* 2. Main 3D Hero Billboard Container */}
      <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] rounded-3xl overflow-hidden border border-border/80 group bg-surface/90 shadow-2xl backdrop-blur-md">
        {/* Animated Background Image Slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0.3, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.15, scale: 0.98 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {!imageError ? (
              <img
                src={currentMovie.backdropUrl || currentMovie.posterUrl}
                alt={currentMovie.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.05]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface-elevated via-surface to-background flex items-center justify-center">
                <Film className="w-64 h-64 text-text-muted/10" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Multi-angle Cinematic Gradients for Depth & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070B] via-[#05070B]/85 to-transparent w-full md:w-3/4 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-[#05070B]/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/70 pointer-events-none z-10" />

        {/* Content Details Grid (Left 2/3 Text + Right 1/3 Floating 3D Ticket Pass) */}
        <div className="absolute inset-0 p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 z-20">
          {/* Left: Movie Info */}
          <div className="max-w-2xl space-y-4">
            {/* Release & Format Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-primary to-red-700 text-white text-[11px] font-black uppercase tracking-wider shadow-cta border border-white/20">
                <Flame className="w-3.5 h-3.5 fill-white" />
                NOW SHOWING
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 border border-gold/40 text-gold text-xs font-black backdrop-blur-xl shadow-sm">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                {currentMovie.rating} / 10 <span className="text-white/60 font-medium">({currentMovie.votes || '25K+ Reviews'})</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-bold backdrop-blur-xl flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {currentMovie.formats?.[0] || '4K Laser'}
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-white/90 text-xs font-medium backdrop-blur-xl">
                {currentMovie.censorRating || 'UA 16+'}
              </span>
            </div>

            {/* Title with 3D Headline styling */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] drop-shadow-lg font-sans">
              {currentMovie.title}
            </h1>

            {/* Formats, Duration & Audio Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/90 font-semibold">
              <span className="text-gold font-bold">{currentMovie.genre}</span>
              <span>•</span>
              <span className="text-cyan-300">{currentMovie.languages?.join(', ') || 'Telugu'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-white/70" /> {currentMovie.duration || '2h 45m'}
              </span>
              <span>•</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Dolby Atmos 7.1
              </span>
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-white/80 line-clamp-2 font-normal leading-relaxed max-w-xl">
              {currentMovie.description}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <Link to={`/movie/${currentMovie.slug || currentMovie.id}`}>
                <GradientButton variant="gold" size="md" icon={Ticket}>
                  Grab your seats
                </GradientButton>
              </Link>

              {onWatchTrailer && (
                <GradientButton
                  variant="glass"
                  size="md"
                  icon={Play}
                  onClick={() => onWatchTrailer(currentMovie)}
                >
                  Watch Trailer
                </GradientButton>
              )}
            </div>
          </div>

          {/* Right: Floating 3D Glass Ticket Teaser (Visible on Desktop) */}
          <div className="hidden lg:flex flex-col items-end pb-2">
            <GlassCard
              variant="elevated"
              className="w-72 p-5 space-y-4 border-gold/30 hover:border-gold/60 transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gold/20 flex items-center justify-center text-gold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider block">VIP PASS PREVIEW</span>
                    <span className="text-xs font-bold text-text-primary">Instant Confirmation</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-text-muted">4K LASER</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Atomic Seat Lock</span>
                  <span className="text-emerald-400 font-bold">Active 8m</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Sound System</span>
                  <span className="text-text-primary font-semibold">Dolby Atmos</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Exhibitor Refund</span>
                  <span className="text-gold font-bold">100% Instant</span>
                </div>
              </div>

              <Link
                to={`/movie/${currentMovie.slug || currentMovie.id}`}
                className="w-full py-2.5 rounded-xl bg-surface-hover hover:bg-gold hover:text-black border border-border/80 hover:border-transparent text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-text-primary text-center"
              >
                <span>Select Showtime</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </GlassCard>
          </div>
        </div>

        {/* 3D Navigation Controls */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Film"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all z-30 hover:scale-110 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Film"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all z-30 hover:scale-110 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Timeline Pill Progress Indicators */}
        <div className="absolute bottom-5 right-6 flex items-center gap-2 z-30">
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
                  ? 'w-8 bg-gradient-to-r from-primary to-gold shadow-glow-crimson'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
