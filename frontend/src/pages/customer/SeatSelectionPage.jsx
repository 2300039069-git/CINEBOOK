import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Ticket,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES, generateSeatLayout } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';
import SeatGrid from '../../components/booking/SeatGrid';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedDate,
    selectedSeats,
    toggleSeatSelection,
    startSeatLock,
    baseAmount,
    totalAmount,
    secondsLeft
  } = useBooking();

  const show = selectedShow || SAMPLE_SHOWTIMES.find((s) => s.id === showId) || SAMPLE_SHOWTIMES[0];
  const movie = selectedMovie || MOVIES.find((m) => m.id === show.movieId) || MOVIES[0];
  const theatre = selectedTheatre || THEATRES.find((t) => t.id === show.theatreId) || THEATRES[0];

  const [seatLayout, setSeatLayout] = useState([]);

  useEffect(() => {
    const layout = generateSeatLayout(show.id);
    setSeatLayout(layout);
  }, [show.id]);

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least 1 seat to continue.');
      return;
    }
    // Start atomic 8-minute seat lock
    startSeatLock();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#090A0E] text-slate-100 pb-36 transition-colors">
      {/* 1. TOP SHOW INFORMATION HEADER */}
      <div className="sticky top-20 z-30 bg-[#11141D] border-b border-[#1E2332] py-3.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-[#181C28] text-slate-300 hover:text-white border border-[#1E2332] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white leading-none">
                  {movie.title}
                </h1>
                <span className="px-2 py-0.5 rounded bg-[#181C28] text-slate-300 text-[10px] font-bold border border-[#1E2332]">
                  {movie.censorRating || 'UA 16+'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {theatre.name} • <span className="text-[#F59E0B] font-semibold">{show.format || '4K Dolby Atmos'}</span> • {show.time} ({show.language || 'Telugu'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Date: <strong className="text-white">{selectedDate || 'Today'}</strong></span>
            </div>

            {/* 8-Minute Countdown Timer Widget */}
            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border transition-all ${
              secondsLeft < 120
                ? 'bg-red-500/10 border-red-500/50 text-red-400 animate-pulse'
                : 'bg-[#181C28] border-[#1E2332] text-[#F59E0B]'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <div className="leading-tight">
                <span className="text-[9px] uppercase font-bold block tracking-wider opacity-80">Seat Lock</span>
                <span className="text-xs font-mono font-bold">{formatTime(secondsLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PULSATING SEAT URGENCY NOTICE (When seats selected) */}
      {selectedSeats.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="p-3 rounded-xl bg-[#11141D] border border-[#1E2332] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              <span>
                <strong className="text-white">{selectedSeats.length} Seat(s) Selected:</strong> Seats {selectedSeats.map(s => s.id).join(', ')} held exclusively for you. Complete payment within <strong className="text-[#F59E0B]">{formatTime(secondsLeft)}</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CINEMA SEAT MATRIX CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <SeatGrid
          seatLayout={seatLayout}
          selectedSeats={selectedSeats}
          onToggleSeat={toggleSeatSelection}
        />
      </div>

      {/* 4. STICKY BOTTOM BOOKING SUMMARY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#11141D] border-t border-[#1E2332] py-3.5 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Selected Seats summary */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#181C28] text-[#E50914] border border-[#1E2332] hidden sm:block">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Selected Seats:</span>
                {selectedSeats.length > 0 ? (
                  <span className="font-bold text-white bg-[#181C28] px-2.5 py-0.5 rounded border border-[#1E2332]">
                    {selectedSeats.map((s) => s.id).join(', ')}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Click on seat layout above</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} • Base Amount: <strong className="text-white">₹{baseAmount}</strong>
              </p>
            </div>
          </div>

          {/* Action Total and Checkout Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Amount</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#F59E0B]">₹{totalAmount}</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`px-7 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-[#E50914] hover:bg-[#B80710] text-white shadow-sm'
                  : 'bg-[#181C28] text-slate-500 cursor-not-allowed border border-[#1E2332]'
              }`}
            >
              <span>Proceed to Pay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
