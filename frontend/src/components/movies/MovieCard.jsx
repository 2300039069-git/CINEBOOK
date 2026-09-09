import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, Film, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieCard = ({ movie, onBookClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-xl bg-surface border border-border hover:border-text-muted overflow-hidden transition-all duration-300 shadow-md"
    >
      {/* 1. Poster Container with 2:3 Aspect Ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-elevated">
        {!imageError && movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          /* Procedural Fallback Poster */
          <div className="h-full w-full bg-surface-elevated p-5 flex flex-col justify-between items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-gold">
              <Film className="w-6 h-6" />
            </div>
            <div className="space-y-1 my-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                BLOCKBUSTER
              </span>
              <h4 className="font-extrabold text-base text-text-primary leading-tight">
                {movie.title}
              </h4>
              <p className="text-xs text-text-muted">
                {movie.languages?.join(', ')}
              </p>
            </div>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
              CINEBOOK
            </span>
          </div>
        )}

        {/* Dark Gradient overlay on image for poster text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-all duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded bg-black/75 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            {movie.censorRating || 'UA'}
          </span>
          <span className="px-2 py-0.5 rounded bg-black/75 text-white/90 border border-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            {movie.formats?.[0] || '2D/4K'}
          </span>
        </div>

        {/* Bottom Rating Strip */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/75 border border-white/20 text-white font-bold backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            <span className="text-white text-xs">{movie.rating || '9.2'}</span>
            <span className="text-[10px] text-white/70 font-normal">({movie.votes || '20K'})</span>
          </div>

          <span className="px-2 py-0.5 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
            {movie.genres?.[0] || 'Action'}
          </span>
        </div>
      </div>

      {/* 2. Movie Details Body */}
      <div className="flex flex-col flex-1 p-3.5 space-y-2 bg-surface">
        <Link to={`/movie/${movie.slug || movie.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-sm sm:text-base tracking-tight line-clamp-1 text-text-primary">
            {movie.title}
          </h3>
        </Link>

        {/* Languages & Duration */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="font-medium truncate text-text-secondary">{movie.languages?.join(', ') || movie.language}</span>
          <span className="text-[11px] text-text-muted font-medium flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3 text-text-muted" /> {movie.duration || '2h 45m'}
          </span>
        </div>

        {/* Genre Tags */}
        <p className="text-[11px] text-text-muted truncate font-normal">
          {movie.genres?.join(' • ') || movie.genre}
        </p>

        {/* Action Button */}
        <div className="pt-2">
          {onBookClick ? (
            <button
              type="button"
              onClick={() => onBookClick(movie)}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </button>
          ) : (
            <Link
              to={`/movie/${movie.slug || movie.id}`}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center shadow-sm active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Tickets</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
