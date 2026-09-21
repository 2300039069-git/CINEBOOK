import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Repeat,
  ChevronRight,
  MapPin,
  SlidersHorizontal,
  LayoutGrid
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
  timeSlots = ['10:00 AM', '12:00 PM', '4:00 PM'],
  onConfirmShow
}) => {
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, setSelectedDate } = useBooking();

  const timelineDays = ['Today, Sat', 'Sun', 'Mon', 'Tue'];
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in text-white select-none">
      
      {/* Bottom Sheet Modal Container (16px / rounded-t-3xl) */}
      <div className="relative w-full max-w-lg bg-[#1e2348] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Drag Handle Bar Centered at Top */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 p-1.5 rounded-full bg-[#171b34] text-[#a8adc9] hover:text-white border border-white/10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Filter Chips Bar (Screen 2 Mockup Top) */}
        <div className="px-5 pt-2 pb-3 flex items-center gap-2 overflow-x-auto">
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1e2348] border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_12px_rgba(224,180,92,0.5)]'
                    : 'bg-[#171b34] border border-white/10 text-[#a8adc9] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Sheet Content */}
        <div className="px-5 py-2 overflow-y-auto space-y-4">
          
          {/* Header Title: Showtime Explorer */}
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white tracking-wide font-display">
              Showtime Explorer
            </h2>
          </div>

          {/* Timeline Date Selector: Horizontal Dotted Track */}
          <div className="relative py-2">
            {/* Horizontal Line Behind */}
            <div className="absolute inset-x-2 top-3 h-0.5 bg-white/10" />
            <div
              className="absolute left-2 top-3 h-0.5 bg-[#e0b45c]"
              style={{ width: `${(activeDateIndex + 1) * 22}%` }}
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
                      className={`w-2 h-2 rounded-full transition-all ${
                        isActive
                          ? 'bg-[#e0b45c] ring-4 ring-[#e0b45c]/25 shadow-[0_0_8px_#e0b45c]'
                          : 'bg-[#6b7094] group-hover:bg-white/50'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-semibold transition-colors mt-1 ${
                        isActive ? 'text-[#e0b45c] font-bold' : 'text-[#a8adc9]'
                      }`}
                    >
                      {day}
                    </span>
                    {isActive && (
                      <span className="text-[9px] text-[#e0b45c] font-bold">Today</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hall Header Subtitle: "Grand Cinema Complex - Screen 5" */}
          <div className="pt-1">
            <h3 className="text-xs font-bold text-white tracking-wide">
              {theatreName}
            </h3>
          </div>

          {/* Time Slot Pills: 10:00 AM, 12:00 PM (active), 4:00 PM */}
          <div className="flex items-center gap-2.5">
            {timeSlots.map((slot) => {
              const isActive = selectedTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center cursor-pointer ${
                    isActive
                      ? 'bg-[#1e2348] border border-[#e0b45c] text-[#e0b45c] shadow-[0_0_12px_rgba(224,180,92,0.45)] font-bold'
                      : 'bg-[#171b34] border border-white/10 text-[#a8adc9] hover:border-white/25 hover:text-white'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          {/* Chosen Seats Glowing Gold Pills */}
          <div className="text-center py-2 space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              {pickedSeats.map((seat) => (
                <span
                  key={seat}
                  className="px-2.5 py-1 rounded-lg bg-[#e0b45c] text-[#171b34] text-xs font-bold shadow-[0_0_12px_rgba(224,180,92,0.6)]"
                >
                  {seat}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-[#a8adc9] font-medium">
              Your Chosen Seats
            </p>
          </div>

          {/* Seat Availability Legend */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-white block">
              Seat Availability
            </span>
            <div className="flex items-center gap-6 text-[11px] text-[#a8adc9]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#e0b45c]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#33374f]" />
                <span>Sold Out</span>
              </div>
            </div>
          </div>

          {/* Middle Ornate Cut-Corner Ribbon: "Select Seats (G12, G13, G14) - $28.00" */}
          <div
            onClick={handleProceedToSeats}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1e2348] border border-[#e0b45c] shadow-[0_0_14px_rgba(224,180,92,0.3)] text-center text-xs font-bold text-[#e0b45c] cursor-pointer hover:bg-[#e0b45c]/10 transition-colors flex items-center justify-between"
          >
            <span className="text-[#e0b45c] text-xs">◆</span>
            <span>Select Seats ({pickedSeats.join(', ')}) - $28.00</span>
            <span className="text-[#e0b45c] text-xs">◆</span>
          </div>

          {/* Summary line */}
          <div className="flex items-center justify-between text-xs text-[#a8adc9] pt-1">
            <span>Find a Movie</span>
            <span className="font-bold text-white">$20.00</span>
          </div>
        </div>

        {/* Sticky Bottom Action Bar (Screen 2 & 3 Mockup) */}
        <div className="p-4 bg-[#171b34] border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3">
            {/* Left Square Icon Button (Swap/Reset) */}
            <button
              type="button"
              onClick={handleQuickSwap}
              className="p-3 rounded-xl bg-[#1e2348] border border-white/15 text-[#a8adc9] hover:text-white hover:border-[#e0b45c] transition-colors cursor-pointer shrink-0"
              title="Reshuffle Seats"
            >
              <Repeat className="w-4 h-4 text-[#e0b45c]" />
            </button>

            {/* Large Pill Primary CTA in Gold Gradient Fill with Dark Navy Text */}
            <button
              type="button"
              onClick={handleProceedToSeats}
              className="luxury-gold-btn flex-1 py-3 px-6 rounded-full text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirm & Pay $28.00</span>
            </button>
          </div>

          {/* Thin Drag Indicator Bar Centered at Bottom */}
          <div className="w-24 h-1 bg-white/20 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default ShowtimeDetailsModal;
