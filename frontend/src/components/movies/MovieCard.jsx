import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Ticket, Clock, Sparkles } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const MovieCard = ({ movie, onOpenShowtimes, isSelectedDefault = false }) => {
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState(isSelectedDefault);
  const [activeSlot, setActiveSlot] = useState('8:00 PM');

  if (!movie) return null;

  const handleBook = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie, activeSlot);
    } else {
      navigate(`/movie/${movie.slug || movie.id}`);
    }
  };

  const handleShowtimeClick = (e, time) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveSlot(time);
    setIsSelected(true);
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie, time);
    }
  };

  const posterSrc = movie.poster || movie.posterUrl || movie.poster_url || '/posters/pushpa2.jpg';
  const sampleShowtimes = ['10:00 AM', '12:00 PM', '4:00 PM', '8:00 PM'];

  return (
    <div
      onClick={() => setIsSelected(!isSelected)}
      className={`group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${
        isSelected
          ? 'art-deco-double-border bg-[#120F24]/95 shadow-[0_0_20px_rgba(229,169,60,0.5)] scale-[1.01]'
          : 'art-deco-glass hover:border-[#E5A93C]/60'
      }`}
    >
      {/* 1. MOVIE POSTER THUMBNAIL (2:3 Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0B0A14]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A14] via-[#0B0A14]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges (Status & Format) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-[#E5A93C]/20 border border-[#E5A93C]/50 text-[#FFD066] text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(229,169,60,0.3)]">
            {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Premiere'}
          </span>

          <span className="px-2 py-0.5 rounded-md bg-[#0B0A14]/85 backdrop-blur-md border border-[#E5A93C]/30 text-[10px] font-bold text-white">
            {movie.censorRating || 'UA 16+'}
          </span>
        </div>

        {/* Star Rating Badge ("★ 4.9") */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0B0A14]/90 backdrop-blur-md border border-[#E5A93C]/40 shadow-[0_0_12px_rgba(229,169,60,0.3)]">
          <span className="text-xs font-black text-[#FFD066]">★ {movie.rating || '4.9'}</span>
          <span className="text-[10px] text-slate-400 font-medium">({movie.votes || '20K'})</span>
        </div>
      </div>

      {/* 2. DETAILS & SHOWTIME PILLS DRAWER */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#120F24]/90">
        <div>
          <h3 className="font-black text-sm sm:text-base text-white group-hover:text-[#FFD066] transition-colors truncate font-display">
            {movie.title}
          </h3>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {movie.genres?.join(', ') || movie.genre || 'Action, Drama'} • {movie.duration || '2h 45m'}
          </p>
        </div>

        {/* Showtime Pills Strip */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#FFD066]" />
            Showtimes:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {sampleShowtimes.map((slot) => {
              const isSlotActive = activeSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={(e) => handleShowtimeClick(e, slot)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                    isSlotActive
                      ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0A14] font-black border border-[#FFE29A] shadow-[0_0_10px_rgba(229,169,60,0.4)]'
                      : 'bg-[#1A1633] text-slate-300 hover:text-white border border-[#E5A93C]/20 hover:border-[#E5A93C]'
                  }`}
                >
                  {slot} {isSlotActive && '• Selected'}
                </button>
              );
            })}
          </div>
        </div>

        {/* "Find Best Seats" Button with Notched Art-Deco Styling */}
        <button
          type="button"
          onClick={handleBook}
          className="art-deco-gold-btn w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 mt-1 shadow-[0_0_12px_rgba(229,169,60,0.35)]"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Find Best Seats</span>
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
