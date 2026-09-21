import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Ticket, Play } from 'lucide-react';
import { MOVIES } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';

export const HeroCarousel = ({ onWatchTrailer, onOpenShowtimes }) => {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const { setSelectedMovie } = useBooking();
  const navigate = useNavigate();

  // Top 3 Recommended Movies
  const topRecommended = MOVIES.slice(0, 3).map((m, i) => ({
    ...m,
    badgeTime: i === 0 ? '1:40' : i === 1 ? '1:00' : '2:00',
    starRating: i === 0 ? '4.9' : i === 1 ? '1.0' : '2.0'
  }));

  const handleCardClick = (movie, idx) => {
    setSelectedIndex(idx);
    setSelectedMovie(movie);
    if (onOpenShowtimes) {
      onOpenShowtimes(movie);
    }
  };

  return (
    <section className="w-full pt-24 pb-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      <div className="space-y-4">
        {/* Section Heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-display">
            Top 3 Recommended
          </h2>
        </div>

        {/* 3 Horizontal Poster Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 items-stretch">
          {topRecommended.map((movie, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={movie.id}
                onClick={() => handleCardClick(movie, idx)}
                className={`group relative flex flex-col justify-between p-2 sm:p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#1e2348] border border-[#e0b45c] shadow-[0_0_16px_rgba(224,180,92,0.55)] scale-[1.02]'
                    : 'bg-[#1e2348]/70 border border-white/10 hover:border-white/20 hover:bg-[#1e2348]'
                }`}
              >
                {/* Poster Container */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#171b34]">
                  <img
                    src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Circular/Pill Badge Top-Right */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#171b34]/85 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white">
                    {movie.badgeTime}
                  </div>
                </div>

                {/* Title & Star Rating Below Poster */}
                <div className="pt-2 text-center space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#e0b45c]">
                    <span>★</span>
                    <span>{movie.starRating}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dot Pagination Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {topRecommended.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === selectedIndex
                  ? 'w-6 bg-[#e0b45c] shadow-[0_0_8px_rgba(224,180,92,0.8)]'
                  : 'w-1.5 bg-[#6b7094] hover:bg-white/50'
              }`}
              aria-label={`Select recommended movie ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
