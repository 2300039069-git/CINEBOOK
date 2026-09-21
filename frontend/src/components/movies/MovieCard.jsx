import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const MovieCard = ({ movie, onOpenShowtimes, isSelectedDefault = false }) => {
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState(isSelectedDefault);
  const [preferredTime, setPreferredTime] = useState('8:00 PM');

  if (!movie) return null;

  const handleRowClick = () => {
    setIsSelected(!isSelected);
    setSelectedMovie(movie);
  };

  const handleShowtimeClick = (e) => {
    e.stopPropagation();
    setIsSelected(true);
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie, preferredTime);
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

  const posterSrc = movie.poster || movie.posterUrl || movie.poster_url || '/posters/pushpa2.jpg';

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-[#1e2348] border border-[#e0b45c] shadow-[0_0_16px_rgba(224,180,92,0.55)] scale-[1.01]'
          : 'bg-[#1e2348] border border-white/10 hover:border-white/20'
      }`}
    >
      {/* Left: Thumbnail & Title Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Movie Thumbnail */}
        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-[#171b34] shrink-0">
          <img
            src={posterSrc}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Title & Star Rating */}
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[#f6dd9c] transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e0b45c]">
            <span>★</span>
            <span>{movie.rating || '4.5'}</span>
          </div>
          <p className="text-[11px] text-[#6b7094] truncate hidden sm:block">
            {movie.genres?.join(', ') || movie.genre || 'Action, Drama'}
          </p>
        </div>
      </div>

      {/* Right: Preferred Showtime & Find Best Seats Action Pills */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
        <span className="text-[10px] text-[#6b7094] font-medium">
          Preferred Showtime
        </span>
        <button
          type="button"
          onClick={handleShowtimeClick}
          className={`px-4 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isSelected
              ? 'bg-[#e0b45c]/20 border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_10px_rgba(224,180,92,0.35)]'
              : 'border border-[#e0b45c] text-[#e0b45c] hover:bg-[#e0b45c]/10'
          }`}
        >
          {isSelected ? 'Selected' : preferredTime}
        </button>
        <button
          type="button"
          onClick={handleFindBestSeats}
          className="px-4 py-1 rounded-full text-xs font-medium border border-white/20 text-[#a8adc9] hover:text-white hover:border-white/40 transition-all cursor-pointer"
        >
          Find Best Seats
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
