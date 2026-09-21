import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Ticket, Clock, Sparkles } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const MovieCard = ({ movie, onOpenShowtimes }) => {
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();

  if (!movie) return null;

  const handleBook = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie);
    } else {
      navigate(`/movie/${movie.slug || movie.id}`);
    }
  };

  const handleShowtimeClick = (e, time) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie, time);
    } else {
      navigate(`/movie/${movie.slug || movie.id}`);
    }
  };

  const posterSrc = movie.poster || movie.posterUrl || movie.poster_url || '/posters/pushpa2.jpg';
  const sampleShowtimes = ['10:00 AM', '02:30 PM', '06:15 PM', '09:45 PM'];

  return (
    <div
      onClick={() => navigate(`/movie/${movie.slug || movie.id}`)}
      className="gold-glass-card group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* 1. GLOWING POSTER CONTAINER (2:3 Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#121824]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges (Status & Format) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#FFD066] text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(229,169,60,0.3)]">
            {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Premiere'}
          </span>

          <span className="px-2 py-0.5 rounded-lg bg-[#0B0E14]/80 backdrop-blur-md border border-[#E5A93C]/25 text-[10px] font-bold text-white">
            {movie.censorRating || 'UA 16+'}
          </span>
        </div>

        {/* Floating Star Rating Badge at Bottom of Poster (⭐ 9.4) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0B0E14]/85 backdrop-blur-md border border-[#E5A93C]/30 shadow-[0_0_12px_rgba(229,169,60,0.3)]">
          <Star className="w-3.5 h-3.5 fill-[#FFD066] text-[#FFD066]" />
          <span className="text-xs font-black text-[#FFD066]">⭐ {movie.rating || '9.4'}</span>
          <span className="text-[10px] text-slate-400 font-medium">({movie.votes || '20K'})</span>
        </div>
      </div>

      {/* 2. CARD DETAILS & SHOWTIME PILLS DRAWER */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#121824]/90">
        <div>
          <h3 className="font-black text-sm sm:text-base text-white group-hover:text-[#FFD066] transition-colors truncate">
            {movie.title}
          </h3>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {movie.genres?.join(', ') || movie.genre || 'Action, Drama'} • {movie.duration || '2h 45m'}
          </p>
        </div>

        {/* Showtime Pills Strip */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#E5A93C]" />
            Showtimes Today:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {sampleShowtimes.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={(e) => handleShowtimeClick(e, slot)}
                className="px-2.5 py-1 rounded-lg bg-[#1A2234] hover:bg-[#E5A93C] text-slate-300 hover:text-[#0B0E14] border border-[#E5A93C]/20 hover:border-[#FFD066] text-[10px] font-bold whitespace-nowrap transition-all shadow-xs"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Action "Find Best Seats" Button */}
        <button
          type="button"
          onClick={handleBook}
          className="gold-glow-btn w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 mt-1"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Find Best Seats</span>
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
