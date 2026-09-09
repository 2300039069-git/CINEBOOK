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
      className="group relative flex flex-col rounded-3xl overflow-hidden glass-card border border-white/[0.08] hover:border-[#D4AF37]/50 shadow-2xl transition-all duration-300"
    >
      {/* 1. Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0F141E]">
        {!imageError && movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          /* Procedural Fallback Poster */
          <div className="h-full w-full bg-gradient-to-b from-[#182030] via-[#0E131E] to-[#07090E] p-5 flex flex-col justify-between items-center text-center border-b border-white/[0.05]">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-glow-gold">
              <Film className="w-6 h-6" />
            </div>
            <div className="space-y-1 my-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block">
                BLOCKBUSTER
              </span>
              <h4 className="font-display font-black text-lg text-white leading-tight">
                {movie.title}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                {movie.languages?.join(', ')}
              </p>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              CineBook Platinum
            </span>
          </div>
        )}

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges: Censor & Trending */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full bg-[#0B0E14]/85 backdrop-blur-md text-[10px] font-black uppercase text-[#D4AF37] border border-[#D4AF37]/30 shadow-md">
            {movie.censorRating || 'UA 16+'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#E50914] to-rose-600 text-white text-[9px] font-black uppercase shadow-glow-crimson flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 fill-white" /> Live Trending
          </span>
        </div>

        {/* Bottom Rating & Format Strip */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-[#D4AF37]/30 text-white font-black shadow-lg">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-[#D4AF37]">{movie.rating || '9.5'}/10</span>
            <span className="text-[10px] text-slate-400 font-normal">({movie.votes || '420K'})</span>
          </div>

          <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-black uppercase text-cyan-400 border border-cyan-500/30">
            {movie.formats?.[0] || '4K Dolby Atmos'}
          </span>
        </div>
      </div>

      {/* 2. Movie Details Body */}
      <div className="flex flex-col flex-1 p-4 space-y-2.5 bg-[#121824]/90">
        <Link to={`/movie/${movie.slug || movie.id}`} className="hover:text-[#D4AF37] transition-colors">
          <h3 className="font-extrabold text-base tracking-tight line-clamp-1 text-white">
            {movie.title}
          </h3>
        </Link>

        {/* Languages & Duration */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-bold truncate text-[#CBD5E1]">{movie.languages?.join(', ')}</span>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3 text-[#D4AF37]" /> {movie.duration || '2h 55m'}
          </span>
        </div>

        {/* Genre Tags */}
        <p className="text-[11px] text-slate-400 truncate font-medium">
          {movie.genres?.join(' • ')}
        </p>

        {/* Action Button: Luxury Champagne Gold & Crimson CTA */}
        <div className="pt-2">
          {onBookClick ? (
            <button
              onClick={() => onBookClick(movie)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-glow-gold flex items-center justify-center gap-2 transition-all cursor-pointer transform group-hover:scale-102"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </button>
          ) : (
            <Link
              to={`/movie/${movie.slug || movie.id}`}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-glow-gold flex items-center justify-center gap-2 transition-all transform group-hover:scale-102"
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
