import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, Film, Clock, Sparkles } from 'lucide-react';

const MovieCard = ({ movie, onBookClick }) => {
  const [imageError, setImageError] = useState(false);
  const primaryFormat = movie.formats?.[0] || '4K Laser';

  return (
    <div className="group flex flex-col rounded-2xl bg-surface/90 border border-border/80 hover:border-accent/50 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1.5">
      {/* 1. Poster Container with 2:3 Aspect Ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-elevated">
        {!imageError && movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          /* Procedural Fallback Poster */
          <div className="h-full w-full bg-gradient-to-br from-surface-elevated via-surface to-background p-5 flex flex-col justify-between items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-border/80 flex items-center justify-center text-accent shadow-inner">
              <Film className="w-6 h-6" />
            </div>
            <div className="space-y-1 my-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block">
                BLOCKBUSTER
              </span>
              <h4 className="font-bold text-base text-text-primary leading-tight">
                {movie.title}
              </h4>
              <p className="text-xs text-text-muted">
                {movie.languages?.join(', ') || movie.language}
              </p>
            </div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
              CINEBOOK PREMIERE
            </span>
          </div>
        )}

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-black/30 to-transparent opacity-80 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/80 text-white/95 border border-white/15 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
            {movie.censorRating || 'UA'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/80 text-accent border border-accent/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-accent" />
            {primaryFormat}
          </span>
        </div>

        {/* Bottom Rating Pill */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/85 border border-accent/30 text-white font-bold backdrop-blur-md shadow-md">
            <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
            <span className="text-white text-xs font-extrabold">{movie.rating || '9.2'}</span>
            <span className="text-[10px] text-white/60 font-normal">({movie.votes || '20K'})</span>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-black/80 text-white/90 border border-white/10 text-[10px] font-semibold backdrop-blur-md">
            {movie.genres?.[0] || 'Action'}
          </span>
        </div>
      </div>

      {/* 2. Movie Details Body */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 space-y-2 bg-surface/90">
        <Link to={`/movie/${movie.slug || movie.id}`} className="group-hover:text-accent transition-colors">
          <h3 className="font-bold text-sm sm:text-base tracking-tight line-clamp-1 text-text-primary leading-snug">
            {movie.title}
          </h3>
        </Link>

        {/* Languages & Duration */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="font-medium truncate text-text-secondary">
            {movie.languages?.join(', ') || movie.language || 'Telugu'}
          </span>
          <span className="text-[11px] text-text-muted font-medium flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3 text-text-muted" /> {movie.duration || '2h 45m'}
          </span>
        </div>

        {/* Genre Tags */}
        <p className="text-[11px] text-text-muted truncate font-normal">
          {movie.genres?.join(' • ') || movie.genre}
        </p>

        {/* Action Button */}
        <div className="pt-2 mt-auto">
          {onBookClick ? (
            <button
              type="button"
              onClick={() => onBookClick(movie)}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Grab Seats</span>
            </button>
          ) : (
            <Link
              to={`/movie/${movie.slug || movie.id}`}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center shadow-sm active:scale-95"
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
