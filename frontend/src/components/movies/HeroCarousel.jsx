import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Ticket, Sparkles, Star, Flame, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOVIES } from '../../data/mockData';

const HeroCarousel = ({ onWatchTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOVIES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? MOVIES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % MOVIES.length);
  };

  const currentMovie = MOVIES[currentIndex] || MOVIES[0];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute -inset-x-4 top-0 h-96 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-cyan-500/20 filter blur-3xl opacity-60 pointer-events-none" />

      {/* Main Glassmorphic Hero Billboard */}
      <div className="relative w-full aspect-[21/9] min-h-[360px] sm:min-h-[460px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 group glass-panel">
        {/* Cinematic Backdrop Image */}
        <img
          src={currentMovie.backdropUrl || currentMovie.posterUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center filter brightness-45 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Multi-layered futuristic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B14] via-[#0B0B14]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B14] via-transparent to-transparent" />

        {/* Content Billboard Details */}
        <div className="absolute inset-0 p-6 sm:p-14 flex flex-col justify-end max-w-3xl space-y-4 z-10">
          {/* Release & Format Glowing Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black uppercase shadow-lg tracking-wider animate-glow">
              <Flame className="w-3.5 h-3.5 fill-white" />
              BLOCKBUSTER PREMIERE
            </span>

            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 border border-amber-400/40 text-amber-300 text-xs font-extrabold backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {currentMovie.rating}/10 ({currentMovie.votes})
            </span>

            <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-bold backdrop-blur-md">
              {currentMovie.formats?.join(' • ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-lg font-display">
            {currentMovie.title}
          </h1>

          {/* Tagline / Subtitle */}
          <p className="text-xs sm:text-base text-slate-300 line-clamp-2 max-w-xl font-medium">
            {currentMovie.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to={`/movie/${currentMovie.slug || currentMovie.id}`}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-pink-500/50 transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets Now</span>
            </Link>

            {onWatchTrailer && (
              <button
                onClick={() => onWatchTrailer(currentMovie)}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2 hover:border-pink-400"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>

        {/* Circular Prev/Next Controls */}
        <button
          onClick={handlePrev}
          aria-label="Previous Film"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/60 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all z-20 hover:scale-110 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Film"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/60 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all z-20 hover:scale-110 shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Active Animated Capsule Dots */}
        <div className="absolute bottom-6 right-8 flex items-center gap-2.5 z-20">
          {MOVIES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-400 ${
                currentIndex === idx
                  ? 'w-10 bg-gradient-to-r from-pink-500 to-cyan-400 shadow-glow-pink'
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
