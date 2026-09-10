import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, Film, Clock, Sparkles } from 'lucide-react';
import TiltCard from '../common/TiltCard';

const MovieCard = ({ movie, onBookClick }) => {
  const [imageError, setImageError] = useState(false);

  const isBlockbuster = (parseFloat(movie.rating) || 0) >= 9.0;
  const primaryFormat = movie.formats?.[0] || '4K Laser';

  return (
    <TiltCard
      glowColor={isBlockbuster ? 'crimson' : 'gold'}
      className="flex flex-col bg-surface/90 dark:bg-surface-card/95 border border-border/80 hover:border-border-hover overflow-hidden shadow-3d-card"
    >
      {/* 1. Poster Container with 2:3 Aspect Ratio & 3D Layering */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-elevated">
        {!imageError && movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          /* Procedural Fallback Poster */
          <div className="h-full w-full bg-gradient-to-br from-surface-elevated via-surface to-background p-5 flex flex-col justify-between items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-border/80 flex items-center justify-center text-gold shadow-inner">
              <Film className="w-6 h-6" />
            </div>
            <div className="space-y-1 my-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold block">
                BLOCKBUSTER
              </span>
              <h4 className="font-black text-base text-text-primary leading-tight">
                {movie.title}
              </h4>
              <p className="text-xs text-text-muted">
                {movie.languages?.join(', ') || movie.language}
              </p>
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              CINEBOOK EXCLUSIVE
            </span>
          </div>
        )}

        {/* Sophisticated Dark Gradient Vignette for Poster Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-black/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-60" />

        {/* 3D Floating Top Badges (translateZ) */}
        <div
          className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-20"
          style={{ transform: 'translateZ(24px)' }}
        >
          <span className="px-2.5 py-0.5 rounded-md bg-black/80 text-white/95 border border-white/20 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm">
            {movie.censorRating || 'UA'}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            {primaryFormat}
          </span>
        </div>

        {/* 3D Floating Bottom Rating & Category Strip */}
        <div
          className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs z-20"
          style={{ transform: 'translateZ(28px)' }}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/85 border border-gold/30 text-white font-black backdrop-blur-md shadow-md">
            <Star className="w-3.5 h-3.5 fill-[#F5C542] text-[#F5C542]" />
            <span className="text-white text-xs">{movie.rating || '9.2'}</span>
            <span className="text-[10px] text-white/60 font-normal">({movie.votes || '20K'})</span>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-primary/90 text-white border border-primary/40 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
            {movie.genres?.[0] || 'Action'}
          </span>
        </div>
      </div>

      {/* 2. Movie Details Body with 3D Depth */}
      <div
        className="flex flex-col flex-1 p-4 space-y-2.5 bg-surface/90 dark:bg-surface-card"
        style={{ transform: 'translateZ(14px)' }}
      >
        <Link to={`/movie/${movie.slug || movie.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-extrabold text-sm sm:text-base tracking-tight line-clamp-1 text-text-primary leading-snug">
            {movie.title}
          </h3>
        </Link>

        {/* Languages & Duration */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="font-semibold truncate text-text-secondary">
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-cta hover:shadow-glow-crimson active:scale-95 border border-white/20"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </button>
          ) : (
            <Link
              to={`/movie/${movie.slug || movie.id}`}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center shadow-cta hover:shadow-glow-crimson active:scale-95 border border-white/20"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </Link>
          )}
        </div>
      </div>
    </TiltCard>
  );
};

export default MovieCard;
