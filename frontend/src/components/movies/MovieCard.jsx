import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, Flame, Sparkles, Film, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieCard = ({ movie, onBookClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-2xl glass-panel glass-panel-hover overflow-hidden shadow-glass-card transition-all duration-300"
    >
      {/* 1. Poster Container with 2:3 Aspect Ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface">
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
          <div className="h-full w-full bg-gradient-to-b from-[#182235] via-[#0B101B] to-[#05070B] p-5 flex flex-col justify-between items-center text-center border-b border-border">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-gold-glow">
              <Film className="w-6 h-6" />
            </div>
            <div className="space-y-1 my-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold block">
                BLOCKBUSTER
              </span>
              <h4 className="font-black text-lg text-text-primary leading-tight">
                {movie.title}
              </h4>
              <p className="text-[11px] text-text-secondary font-medium">
                {movie.languages?.join(', ')}
              </p>
            </div>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
              CineBook Platinum
            </span>
          </div>
        )}

        {/* Instant Dark Overlay on Hover & Base Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-[#05070B]/30 to-transparent opacity-75 group-hover:opacity-90 group-hover:bg-[#05070B]/40 transition-all duration-300" />

        {/* Top Badges: Clean Gold & White Chips for "4K DOLBY" and "UA" */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-gold/90 text-black text-[10px] font-black uppercase tracking-wide shadow-md">
            {movie.censorRating || 'UA'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
            4K DOLBY
          </span>
        </div>

        {/* Bottom Rating Strip */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-gold/30 text-white font-black shadow-lg">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-gold" />
            <span className="text-gold">{movie.rating || '9.5'}/10</span>
            <span className="text-[10px] text-text-muted font-normal">({movie.votes || '420K'})</span>
          </div>

          <span className="px-2 py-0.5 rounded-lg bg-accent/90 text-white text-[10px] font-black uppercase tracking-wider shadow-cinema-glow">
            {movie.genres?.[0] || 'Action'}
          </span>
        </div>
      </div>

      {/* 2. Movie Details Body */}
      <div className="flex flex-col flex-1 p-4 space-y-2.5 bg-surface/90">
        <Link to={`/movie/${movie.slug || movie.id}`} className="hover:text-gold transition-colors">
          <h3 className="font-extrabold text-base tracking-tight line-clamp-1 text-text-primary">
            {movie.title}
          </h3>
        </Link>

        {/* Languages & Duration */}
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="font-bold truncate">{movie.languages?.join(', ')}</span>
          <span className="text-[11px] text-text-muted font-medium flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3 text-gold" /> {movie.duration || '2h 55m'}
          </span>
        </div>

        {/* Genre Tags */}
        <p className="text-[11px] text-text-muted truncate font-medium">
          {movie.genres?.join(' • ')}
        </p>

        {/* Action Button: Luxury Champagne Gold & Cinema Crimson CTA */}
        <div className="pt-2">
          {onBookClick ? (
            <button
              onClick={() => onBookClick(movie)}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-cinema-glow flex items-center justify-center gap-2 transition-all cursor-pointer transform group-hover:scale-102"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </button>
          ) : (
            <Link
              to={`/movie/${movie.slug || movie.id}`}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-cinema-glow flex items-center justify-center gap-2 transition-all transform group-hover:scale-102 text-center"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
