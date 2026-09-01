import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, Flame } from 'lucide-react';

const MovieCard = ({ movie, onBookClick }) => {
  return (
    <div className="group relative flex flex-col rounded-3xl overflow-hidden glass-card transition-all duration-300">
      {/* 1. Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Dark overlay for poster text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges: Censor & Trending */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-black uppercase text-white border border-white/20">
            {movie.censorRating || 'UA'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-black uppercase shadow-md flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 fill-white" /> Trending
          </span>
        </div>

        {/* Bottom Rating & Format Strip */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-white font-black">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating}/10</span>
            <span className="text-[10px] text-slate-300 font-normal">({movie.votes})</span>
          </div>

          {movie.formats && (
            <span className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-black uppercase text-cyan-300 border border-cyan-400/30">
              {movie.formats[0]}
            </span>
          )}
        </div>
      </div>

      {/* 2. Movie Details Body */}
      <div className="flex flex-col flex-1 p-4 space-y-2.5">
        <Link to={`/movie/${movie.slug || movie.id}`} className="hover:text-pink-500 transition-colors">
          <h3 className="font-extrabold text-base tracking-tight line-clamp-1 text-theme-primary">
            {movie.title}
          </h3>
        </Link>

        {/* Languages */}
        <div className="flex items-center gap-1.5 text-xs text-theme-secondary">
          <span className="font-bold">{movie.languages?.join(', ')}</span>
        </div>

        {/* Genre Tags */}
        <p className="text-[11px] text-theme-muted truncate font-medium">
          {movie.genres?.join(' • ')}
        </p>

        {/* Action Button: Glowing Gradient CTA */}
        <div className="pt-2">
          {onBookClick ? (
            <button
              onClick={() => onBookClick(movie)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-pink-500/40 flex items-center justify-center gap-2 transition-all transform group-hover:scale-102"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </button>
          ) : (
            <Link
              to={`/movie/${movie.slug || movie.id}`}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-pink-500/40 flex items-center justify-center gap-2 transition-all transform group-hover:scale-102"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
