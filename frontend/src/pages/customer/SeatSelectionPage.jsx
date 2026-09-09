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
    <div className="min-h-screen pb-36 transition-colors">
      {/* 1. TOP SHOW INFORMATION HEADER */}
      <div className="sticky top-20 z-30 glass-panel border-b border-white/[0.08] py-4 px-4 sm:px-6 lg:px-8 shadow-xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl glass-card text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white leading-none font-display">
                  {movie.title}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-300 text-[10px] font-black border border-white/10">
                  {movie.censorRating || 'UA 16+'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {theatre.name} • <span className="text-cyan-400 font-bold">{show.format || '4K Dolby Atmos'}</span> • {show.time} ({show.language || 'Telugu'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Date: <strong className="text-white">{selectedDate || 'Today'}</strong></span>
            </div>

            {/* 8-Minute Countdown Timer Widget */}
            <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 border transition-all ${
              secondsLeft < 120
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-glow-crimson animate-pulse'
                : 'bg-amber-500/15 border-[#D4AF37]/40 text-[#D4AF37]'
            }`}>
              <Clock className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" style={{ animationDuration: '6s' }} />
              <div className="leading-tight">
                <span className="text-[9px] uppercase font-black block tracking-widest opacity-80">Seat Lock</span>
                <span className="text-xs font-mono font-black">{formatTime(secondsLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PULSATING SEAT URGENCY NOTICE (When seats selected) */}
      {selectedSeats.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-500/30 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 animate-bounce" />
              <span>
                <strong className="text-pink-400">{selectedSeats.length} Seat(s) Temporarily Locked:</strong> Seats {selectedSeats.map(s => s.id).join(', ')} held exclusively for you. Complete payment within <strong className="text-[#D4AF37]">{formatTime(secondsLeft)}</strong>.
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
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/[0.08] py-4 px-4 sm:px-6 lg:px-8 shadow-2xl backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Selected Seats summary */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 hidden sm:block">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Seats Selected:</span>
                {selectedSeats.length > 0 ? (
                  <span className="font-black text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-0.5 rounded-full border border-[#D4AF37]/30">
                    {selectedSeats.map((s) => s.id).join(', ')}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Click on seat layout above</span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} • Base Amount: <strong className="text-white">₹{baseAmount}</strong>
              </p>
            </div>
          </div>

          {/* Action Total and Checkout Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Total Payable</span>
              <span className="text-xl sm:text-2xl font-black gradient-text-gold">₹{totalAmount}</span>
            </div>

            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-glow-gold transform hover:scale-105'
                  : 'bg-white/[0.04] text-slate-500 cursor-not-allowed border border-white/[0.06]'
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
