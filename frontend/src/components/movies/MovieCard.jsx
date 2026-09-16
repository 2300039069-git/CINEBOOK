import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, Film, Clock, Sparkles } from 'lucide-react';

const MovieCard = ({ movie = {}, onBookClick }) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const primaryFormat = movie.formats?.[0] || '4K Laser';

  const getPosterSrc = () => {
    const raw = movie.poster || movie.posterUrl || movie.poster_url;
    if (raw) return raw;
    const t = ((movie.title || '') + ' ' + (movie.slug || '')).toLowerCase();
    if (t.includes('pushpa')) return '/posters/pushpa2.jpg';
    if (t.includes('devara')) return '/posters/devara.jpg';
    if (t.includes('kalki')) return '/posters/kalki.webp';
    if (t.includes('og') || t.includes('ojas')) return '/posters/og.jpg';
    return '/posters/default.jpg';
  };

  const posterSrc = getPosterSrc();

  const handleImageError = (e) => {
    if (!fallbackAttempted) {
      setFallbackAttempted(true);
      const t = ((movie.title || '') + ' ' + (movie.slug || '')).toLowerCase();
      let nextSrc = '/posters/default.jpg';
      if (t.includes('pushpa')) nextSrc = '/posters/pushpa2.jpg';
      else if (t.includes('devara')) nextSrc = '/posters/devara.jpg';
      else if (t.includes('kalki')) nextSrc = '/posters/kalki.webp';
      else if (t.includes('og') || t.includes('ojas')) nextSrc = '/posters/og.jpg';

      if (e.target.src !== nextSrc && !e.target.src.endsWith(nextSrc)) {
        e.target.src = nextSrc;
        return;
      }
    }
    setImageError(true);
  };

  return (
    <div className="group flex flex-col rounded-2xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 will-change-transform">
      {/* 1. Poster Container with 2:3 Aspect Ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        {!imageError && posterSrc ? (
          <img
            src={posterSrc}
            alt={movie.title}
            onError={handleImageError}
            className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          /* Procedural Fallback Poster */
          <div className="h-full w-full bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-800 dark:via-[#161B26] dark:to-slate-900 p-5 flex flex-col justify-between items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <Film className="w-6 h-6" />
            </div>
            <div className="space-y-1 my-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary block">
                BLOCKBUSTER
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
                {movie.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {movie.languages?.join(', ') || movie.language}
              </p>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              CINEBOOK PREMIERE
            </span>
          </div>
        )}

        {/* Subtle Dark Bottom Gradient for Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/75 text-white border border-white/15 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
            {movie.censorRating || 'UA'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/75 text-amber-400 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            {primaryFormat}
          </span>
        </div>

        {/* Bottom Rating Pill */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-white/10 text-white font-bold backdrop-blur-md shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-white text-xs font-extrabold">{movie.rating || '9.2'}</span>
            <span className="text-[10px] text-white/60 font-normal">({movie.votes || '20K'})</span>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-black/80 text-white/90 border border-white/10 text-[10px] font-semibold backdrop-blur-md">
            {movie.genres?.[0] || 'Action'}
          </span>
        </div>
      </div>

      {/* 2. Movie Details Body */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 space-y-2 bg-white dark:bg-[#161B26]">
        <Link to={`/movie/${movie.slug || movie.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-bold text-sm sm:text-base tracking-tight line-clamp-1 text-slate-900 dark:text-slate-100 leading-snug">
            {movie.title}
          </h3>
        </Link>

        {/* Languages & Duration */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium truncate">
            {movie.languages?.join(', ') || movie.language || 'Telugu'}
          </span>
          <span className="text-[11px] font-medium flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" /> {movie.duration || '2h 45m'}
          </span>
        </div>

        {/* Genre Tags */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-normal">
          {movie.genres?.join(' • ') || movie.genre}
        </p>

        {/* Action Button */}
        <div className="pt-2 mt-auto">
          {onBookClick ? (
            <button
              type="button"
              onClick={() => onBookClick(movie)}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Grab Seats</span>
            </button>
          ) : (
            <Link
              to={`/movie/${movie.slug || movie.id}`}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center shadow-sm active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Grab Seats</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
