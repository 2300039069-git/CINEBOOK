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
  Info,
  Volume2,
  ShieldCheck
} from 'lucide-react';
import { MOVIES } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HeroCarousel = ({ onWatchTrailer }) => {
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
    navigate(`/movie/${movie.slug || movie.id}`);
  };

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-[520px] lg:min-h-[580px] bg-surface overflow-hidden border-b border-border select-none"
    >
      {/* 1. CINEMATIC BACKDROP ARTWORK WITH VIGNETTE OVERLAYS */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdropUrl || currentMovie.posterUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center filter brightness-[0.45] transition-all duration-700 scale-105"
        />
        {/* Deep Multi-stop Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* 2. FOREGROUND CONTENT CONTAINER */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 min-h-[520px] lg:min-h-[580px] flex items-center">
        <div className="max-w-2xl space-y-4 sm:space-y-5 animate-in fade-in duration-500">
          
          {/* Top Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>BLOCKBUSTER PREMIERE</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-white/10 dark:bg-white/5 border border-white/15 text-text-primary text-[11px] font-bold backdrop-blur-md">
              {currentMovie.censorRating || 'UA 16+'}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-white/10 dark:bg-white/5 border border-white/15 text-text-primary text-[11px] font-bold backdrop-blur-md">
              4K RGB LASER • DOLBY ATMOS
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-display drop-shadow-md">
            {currentMovie.title}
          </h1>

          {/* Ratings & Quick Info Stack */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-amber-400">{currentMovie.rating}/10</span>
              <span className="text-slate-300 font-medium">({currentMovie.votes || '28K'} Votes)</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Clock className="w-4 h-4 text-primary" />
              <span>{currentMovie.duration || '2h 45m'}</span>
            </div>

            <span className="text-slate-400">•</span>

            <div className="text-slate-200 font-semibold">
              <span>{currentMovie.genres?.join(', ') || currentMovie.genre}</span>
            </div>

            <span className="text-slate-400">•</span>

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
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleBookNow(currentMovie)}
              leftIcon={<Ticket className="w-4 h-4" />}
            >
              Book Experience
            </Button>

            <Button
              variant="glass"
              size="lg"
              onClick={() => onWatchTrailer?.(currentMovie)}
              leftIcon={<Play className="w-4 h-4 fill-current ml-0.5" />}
            >
              Watch 4K Trailer
            </Button>
          </div>
        </div>
      </div>

      {/* 3. CAROUSEL PROGRESS BARS & CONTROLS */}
      <div className="absolute bottom-6 right-6 lg:right-12 z-20 flex items-center gap-3">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5 mr-2">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white border border-white/15 backdrop-blur-md transition cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % heroMovies.length)}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white border border-white/15 backdrop-blur-md transition cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
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
                idx === currentIndex ? 'w-8 bg-primary shadow-sm shadow-primary/50' : 'w-2 bg-white/30 hover:bg-white/60'
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
