import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Ticket, Clock, Sparkles } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { Badge } from '../ui/Badge';

export const MovieCard = ({ movie, variant = 'standard' }) => {
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();

  if (!movie) return null;

  const handleBook = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedMovie(movie);
    navigate(`/movie/${movie.slug || movie.id}`);
  };

  const posterSrc = movie.poster || movie.posterUrl || movie.poster_url || '/posters/pushpa2.jpg';

  return (
    <div
      onClick={() => navigate(`/movie/${movie.slug || movie.id}`)}
      className="group relative flex flex-col rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-md hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
    >
      {/* 1. POSTER CONTAINER (2:3 Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-elevated">
        <img
          src={posterSrc}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            const t = ((movie.title || '') + ' ' + (movie.slug || '')).toLowerCase();
            let fb = '/posters/pushpa2.jpg';
            if (t.includes('devara')) fb = '/posters/devara.jpg';
            else if (t.includes('kalki')) fb = '/posters/kalki.webp';
            else if (t.includes('og') || t.includes('ojas')) fb = '/posters/og.jpg';
            if (e.target.src !== fb && !e.target.src.endsWith(fb)) {
              e.target.src = fb;
            }
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges (Status & Format) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <Badge variant="primary" size="sm">
            {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Upcoming'}
          </Badge>

          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white">
            {movie.censorRating || 'UA'}
          </span>
        </div>

        {/* Floating Rating Pill at Bottom of Poster */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-white">{movie.rating}</span>
          <span className="text-[10px] text-slate-300 font-medium">({movie.votes || '20K'})</span>
        </div>
      </div>

      {/* 2. CARD DETAILS DRAWER */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <h3 className="font-black text-sm sm:text-base text-text-primary group-hover:text-primary transition-colors truncate">
            {movie.title}
          </h3>
          <p className="text-[11px] text-text-muted truncate mt-0.5">
            {movie.genres?.join(', ') || movie.genre || 'Action, Drama'}
          </p>
        </div>

        {/* Language & Duration Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/80 text-[11px] text-text-secondary font-medium">
          <span>{movie.languages?.join(' • ') || movie.language || 'Telugu'}</span>
          <span className="text-text-muted">{movie.duration || '2h 45m'}</span>
        </div>

        {/* Direct Action Button */}
        <button
          type="button"
          onClick={handleBook}
          className="w-full py-2.5 rounded-xl bg-surface-elevated group-hover:bg-primary text-text-primary group-hover:text-white border border-border group-hover:border-primary text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Book Tickets</span>
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
