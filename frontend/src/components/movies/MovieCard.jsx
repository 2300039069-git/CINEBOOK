import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play, Ticket, Clock } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const MovieCard = ({
  movie,
  onOpenShowtimes,
  onWatchTrailer,
  isSelectedDefault = false,
  variant = 'grid' // 'grid' | 'row'
}) => {
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState(isSelectedDefault);
  const [preferredTime, setPreferredTime] = useState('8:00 PM');

  if (!movie) return null;

  const posterSrc = movie.poster || movie.posterUrl || movie.poster_url || '/posters/pushpa2.jpg';
  const sampleTimes = ['10:00 AM', '01:15 PM', '04:30 PM', '08:00 PM', '10:45 PM'];

  const handleCardClick = () => {
    setIsSelected(!isSelected);
    setSelectedMovie(movie);
  };

  const handleShowtimeClick = (e, time) => {
    e.stopPropagation();
    setIsSelected(true);
    setPreferredTime(time || preferredTime);
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie, time || preferredTime);
    } else {
      navigate(`/movie/${movie.slug || movie.id}`);
    }
  };

  const handleFindBestSeats = (e) => {
    e.stopPropagation();
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie, preferredTime);
    } else {
      navigate(`/movie/${movie.slug || movie.id}`);
    }
  };

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    if (onWatchTrailer) {
      onWatchTrailer(movie);
    } else {
      navigate(`/movie/${movie.slug || movie.id}`);
    }
  };

  /* ===================================================
     VARIANT A: EXPANSIVE GRID CARD (Modern Cinema Website)
     =================================================== */
  if (variant === 'grid') {
    return (
      <div
        onClick={handleCardClick}
        className={`group relative flex flex-col justify-between rounded-2xl bg-[#1e2348] transition-all duration-300 cursor-pointer overflow-hidden ${
          isSelected
            ? 'border border-[#e0b45c] shadow-[0_0_20px_rgba(224,180,92,0.55)] scale-[1.01]'
            : 'border border-white/10 hover:border-[#e0b45c]/70 hover:shadow-[0_0_18px_rgba(224,180,92,0.35)]'
        }`}
      >
        {/* Top Poster Box with Floating Badges & Hover Play Button */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#171b34]">
          <img
            src={posterSrc}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Gradient Overlay */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />

          {/* Rating Badge Top Left */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#171b34]/90 backdrop-blur-md border border-[#e0b45c]/40 text-[#e0b45c] text-[11px] font-bold shadow-sm">
            <span>★</span>
            <span>{movie.rating || '4.5'}</span>
          </div>

          {/* Censor / Language Badge Top Right */}
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#171b34]/90 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
            {movie.censorRating || movie.language || 'UA 16+'}
          </div>

          {/* Hover Play Trailer Overlay */}
          <div
            onClick={handleTrailerClick}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f6dd9c] via-[#e0b45c] to-[#b8862f] flex items-center justify-center text-[#171b34] shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Watch Trailer
            </span>
          </div>

          {/* Bottom Poster Gradient for Specs */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-[#1e2348] via-[#1e2348]/80 to-transparent flex items-center justify-between text-[10px] text-[#a8adc9] font-medium">
            <span>{movie.duration || '2h 30m'}</span>
            <span className="px-1.5 py-0.2 rounded bg-[#262b52] text-[#e0b45c] font-bold border border-white/10">
              4K ATMOS
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-3">
          {/* Title & Genres */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#f6dd9c] transition-colors truncate">
              {movie.title}
            </h3>
            <p className="text-[11px] text-[#6b7094] truncate mt-0.5">
              {movie.genres?.join(', ') || movie.genre || 'Action, Drama, Thriller'}
            </p>
          </div>

          {/* Showtime Quick Selection Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#a8adc9]">
              <span className="font-semibold">Showtimes</span>
              <span className="text-[#e0b45c] font-bold">Fast Fill</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sampleTimes.slice(0, 3).map((time) => {
                const isTimeSelected = preferredTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={(e) => handleShowtimeClick(e, time)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isTimeSelected
                        ? 'bg-[#e0b45c] text-[#171b34] shadow-[0_0_8px_rgba(224,180,92,0.6)]'
                        : 'bg-[#262b52] border border-white/10 text-[#a8adc9] hover:border-[#e0b45c] hover:text-white'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleFindBestSeats}
            className="w-full py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer luxury-gold-btn"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Find Best Seats</span>
          </button>
        </div>
      </div>
    );
  }

  /* ===================================================
     VARIANT B: HORIZONTAL ROW (List / Compact format)
     =================================================== */
  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 gap-3 ${
        isSelected
          ? 'bg-[#1e2348] border border-[#e0b45c] shadow-[0_0_16px_rgba(224,180,92,0.55)] scale-[1.01]'
          : 'bg-[#1e2348] border border-white/10 hover:border-white/20'
      }`}
    >
      {/* Left: Thumbnail & Title Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Movie Thumbnail */}
        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-[#171b34] shrink-0 relative">
          <img
            src={posterSrc}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Title & Star Rating */}
        <div className="min-w-0 space-y-1 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[#f6dd9c] transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-[#e0b45c] flex items-center gap-1">
              ★ {movie.rating || '4.5'}
            </span>
            <span className="text-[#6b7094]">•</span>
            <span className="text-[#a8adc9] text-[11px]">
              {movie.duration || '2h 45m'}
            </span>
          </div>
          <p className="text-[11px] text-[#6b7094] truncate">
            {movie.genres?.join(', ') || movie.genre || 'Action, Drama'}
          </p>
        </div>
      </div>

      {/* Right: Preferred Showtime & Find Best Seats Action Pills */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
        <button
          type="button"
          onClick={(e) => handleShowtimeClick(e, preferredTime)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isSelected
              ? 'bg-[#e0b45c]/20 border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_10px_rgba(224,180,92,0.35)]'
              : 'border border-[#e0b45c] text-[#e0b45c] hover:bg-[#e0b45c]/10'
          }`}
        >
          {preferredTime}
        </button>
        <button
          type="button"
          onClick={handleFindBestSeats}
          className="px-4 py-1.5 rounded-full text-xs font-medium border border-white/20 text-[#a8adc9] hover:text-white hover:border-white/40 transition-all cursor-pointer"
        >
          Find Best Seats
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
