import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Repeat,
  ChevronRight,
  MapPin,
  SlidersHorizontal,
  LayoutGrid,
  Calendar,
  Clock,
  Volume2
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const ShowtimeDetailsModal = ({
  isOpen,
  onClose,
  movie = {
    id: 'mov-pushpa-2',
    title: 'Pushpa 2: The Rule',
    rating: '4.9',
    genres: ['Action', 'Drama'],
    duration: '2h 45m',
    posterUrl: '/posters/pushpa2.jpg'
  },
  theatreName = 'Grand Cinema Complex - Screen 5',
  timeSlots = ['10:00 AM', '12:00 PM', '04:00 PM', '07:30 PM', '10:15 PM'],
  onConfirmShow
}) => {
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, setSelectedDate } = useBooking();

  const timelineDays = ['Today, Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('12:00 PM');
  const [pickedSeats, setPickedSeats] = useState(['G12', 'G13', 'G14']);
  const [activeFilter, setActiveFilter] = useState('Filter');

  if (!isOpen) return null;

  const handleProceedToSeats = () => {
    const showObj = {
      id: `sh-${movie.id}-${selectedTime.replace(/[^0-9]/g, '')}`,
      movieId: movie.id,
      movieTitle: movie.title,
      theatreName: theatreName,
      screenName: 'Screen 5, Grand Cinema Complex',
      time: selectedTime,
      format: '4K Dolby Atmos',
      date: new Date().toISOString().split('T')[0]
    };

    setSelectedMovie(movie);
    setSelectedDate(showObj.date);
    setSelectedShow(showObj);

    if (onConfirmShow) {
      onConfirmShow(showObj);
    } else {
      onClose();
      navigate(`/seat-selection/${showObj.id}`);
    }
  };

  const handleQuickSwap = () => {
    setPickedSeats((prev) => (prev[0] === 'G12' ? ['L12', 'L13', 'L14'] : ['G12', 'G13', 'G14']));
  };

  const posterSrc = movie.poster || movie.posterUrl || movie.poster_url || '/posters/pushpa2.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white select-none">
      
      {/* Responsive Modal Container: Bottom sheet on mobile, centered dialog on desktop */}
      <div className="relative w-full max-w-2xl bg-[#1e2348] border border-white/10 sm:border-[#e0b45c]/40 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#171b34]/80">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={posterSrc}
              alt={movie.title}
              className="w-10 h-14 rounded-lg object-cover border border-white/15 shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-display truncate">
                {movie.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#a8adc9] mt-0.5">
                <span className="text-[#e0b45c] font-bold">★ {movie.rating || '4.9'}</span>
                <span>•</span>
                <span>{movie.duration || '2h 45m'}</span>
                <span>•</span>
                <span className="text-[#e0b45c]">4K Atmos</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#1e2348] hover:bg-[#262b52] text-[#a8adc9] hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Chips Bar (Screen 2 Mockup Top) */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between gap-2 overflow-x-auto border-b border-white/5 bg-[#1e2348]">
          <div className="flex items-center gap-2">
            {[
              { id: 'Filter', label: 'Filter', icon: SlidersHorizontal },
              { id: 'Grid', label: 'Grid', icon: LayoutGrid },
              { id: 'Nearby', label: 'Nearby', icon: MapPin },
            ].map((chip) => {
              const Icon = chip.icon;
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveFilter(chip.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#262b52] border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_12px_rgba(224,180,92,0.4)]'
                      : 'bg-[#171b34] border border-white/10 text-[#a8adc9] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-xs font-bold text-[#e0b45c] hidden sm:inline font-mono">
            Screen 5 • 4K Laser
          </span>
        </div>

        {/* Scrollable Sheet Content */}
        <div className="px-6 py-4 overflow-y-auto space-y-5">
          
          {/* Timeline Date Selector: Horizontal Dotted Track */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#e0b45c]" />
              Select Date & Day
            </span>
            <div className="relative py-3">
              {/* Horizontal Track Behind */}
              <div className="absolute inset-x-2 top-4.5 h-0.5 bg-white/10" />
              <div
                className="absolute left-2 top-4.5 h-0.5 bg-[#e0b45c] transition-all duration-300"
                style={{ width: `${(activeDateIndex + 1) * 20}%` }}
              />

              <div className="relative z-10 flex items-center justify-between">
                {timelineDays.map((day, idx) => {
                  const isActive = idx === activeDateIndex;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDateIndex(idx)}
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          isActive
                            ? 'bg-[#e0b45c] ring-4 ring-[#e0b45c]/30 shadow-[0_0_10px_#e0b45c]'
                            : 'bg-[#6b7094] group-hover:bg-white/50'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold transition-colors mt-1 ${
                          isActive ? 'text-[#e0b45c] font-bold' : 'text-[#a8adc9]'
                        }`}
                      >
                        {day}
                      </span>
                      {isActive && (
                        <span className="text-[9px] text-[#e0b45c] font-bold">Selected</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hall Header Subtitle */}
          <div className="p-3 rounded-xl bg-[#262b52] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#e0b45c]" />
              <span className="text-xs font-bold text-white tracking-wide">
                {theatreName}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#e0b45c]/20 text-[#f6dd9c] text-[10px] font-black uppercase">
              Dolby Atmos 7.1
            </span>
          </div>

          {/* Time Slot Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#e0b45c]" />
              Select Showtime
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {timeSlots.map((slot) => {
                const isActive = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-center cursor-pointer ${
                      isActive
                        ? 'bg-[#262b52] border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_12px_rgba(224,180,92,0.45)] font-bold'
                        : 'bg-[#171b34] border border-white/10 text-[#a8adc9] hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chosen Seats Glowing Gold Pills */}
          <div className="p-4 rounded-2xl bg-[#171b34] border border-white/10 text-center space-y-2">
            <p className="text-xs text-[#a8adc9] font-medium">
              Your Pre-Selected Prime Seats
            </p>
            <div className="flex items-center justify-center gap-2.5">
              {pickedSeats.map((seat) => (
                <span
                  key={seat}
                  className="px-3.5 py-1 rounded-lg bg-[#e0b45c] text-[#171b34] text-xs font-black shadow-[0_0_12px_rgba(224,180,92,0.6)]"
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>

          {/* Seat Availability Legend */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-white">
              Seat Legend:
            </span>
            <div className="flex items-center gap-5 text-xs text-[#a8adc9]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#4a4f74] border border-white/10" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#e0b45c] shadow-[0_0_6px_#e0b45c]" />
                <span className="text-white font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#33374f] text-[8px] text-[#6b7094] flex items-center justify-center font-bold">
                  ✕
                </span>
                <span>Sold Out</span>
              </div>
            </div>
          </div>

          {/* Ornate Cut-Corner Ribbon */}
          <div
            onClick={handleProceedToSeats}
            className="w-full py-3 px-4 rounded-xl bg-[#262b52] border border-[#e0b45c] shadow-[0_0_14px_rgba(224,180,92,0.3)] text-center text-xs font-bold text-[#e0b45c] cursor-pointer hover:bg-[#e0b45c]/10 transition-colors flex items-center justify-between"
          >
            <span className="text-[#e0b45c] text-xs">◆</span>
            <span>Reserve Seats ({pickedSeats.join(', ')}) • 4K Dolby Atmos</span>
            <span className="text-[#e0b45c] text-xs">◆</span>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="p-4 sm:p-5 bg-[#171b34] border-t border-white/10 flex items-center gap-3">
          {/* Reshuffle Button */}
          <button
            type="button"
            onClick={handleQuickSwap}
            className="p-3.5 rounded-2xl bg-[#1e2348] border border-white/15 text-[#a8adc9] hover:text-white hover:border-[#e0b45c] transition-colors cursor-pointer shrink-0"
            title="Reshuffle Seats"
          >
            <Repeat className="w-4 h-4 text-[#e0b45c]" />
          </button>

          {/* Large Primary CTA */}
          <button
            type="button"
            onClick={handleProceedToSeats}
            className="luxury-gold-btn flex-1 py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(224,180,92,0.4)]"
          >
            <span>Proceed to Interactive Seat Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeDetailsModal;
