import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Ticket,
  ChevronRight,
  ShieldCheck,
  MapPin
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
    totalAmount
  } = useBooking();

  const show = selectedShow || SAMPLE_SHOWTIMES.find((s) => s.id === showId) || SAMPLE_SHOWTIMES[0];
  const movie = selectedMovie || MOVIES.find((m) => m.id === show.movieId) || MOVIES[0];
  const theatre = selectedTheatre || THEATRES.find((t) => t.id === show.theatreId) || THEATRES[0];

  const [seatLayout, setSeatLayout] = useState([]);

  useEffect(() => {
    const layout = generateSeatLayout(show.id);
    setSeatLayout(layout);
  }, [show.id]);

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least 1 seat to continue.');
      return;
    }
    // Start atomic 5-minute seat lock
    startSeatLock();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen pb-32 transition-colors">
      {/* 1. TOP SHOW INFORMATION HEADER */}
      <div className="sticky top-20 z-30 glass-panel border-b border-[var(--theme-border)] py-4 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl glass-card text-theme-primary hover:border-pink-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-black text-theme-primary leading-none">
                {movie.title} <span className="text-theme-muted text-xs font-normal">({movie.censorRating || 'UA'})</span>
              </h1>
              <p className="text-xs text-theme-secondary mt-1">
                {theatre.name} | <span className="text-cyan-500 font-bold">{show.format || '2D Dolby Atmos'}</span> | {show.time}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-theme-secondary">
            <Clock className="w-3.5 h-3.5 text-pink-500" />
            <span>Date: <strong className="text-theme-primary">{selectedDate || 'Today'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CINEMA SEAT MATRIX CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <SeatGrid
          seatLayout={seatLayout}
          selectedSeats={selectedSeats}
          onToggleSeat={toggleSeatSelection}
        />
      </div>

      {/* 3. STICKY BOTTOM BOOKING SUMMARY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-[var(--theme-border)] py-4 px-4 sm:px-6 lg:px-8 shadow-2xl backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Selected Seats summary */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/20 text-pink-500 border border-pink-500/30 hidden sm:block">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-theme-muted font-bold uppercase tracking-wider">Seats Selected:</span>
                {selectedSeats.length > 0 ? (
                  <span className="font-black text-pink-500 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/30">
                    {selectedSeats.map((s) => s.id).join(', ')}
                  </span>
                ) : (
                  <span className="text-theme-muted italic">Click on seat layout above</span>
                )}
              </div>
              <p className="text-xs text-theme-secondary mt-0.5 font-medium">
                {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} • Base Amount: <strong>₹{baseAmount}</strong>
              </p>
            </div>
          </div>

          {/* Action Total and Checkout Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-theme-muted block tracking-wider">Total Payable</span>
              <span className="text-lg sm:text-2xl font-black gradient-text-neon">₹{totalAmount}</span>
            </div>

            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                selectedSeats.length > 0
                  ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-glow-pink transform hover:scale-105'
                  : 'bg-black/10 dark:bg-white/10 text-theme-muted cursor-not-allowed border border-[var(--theme-border)]'
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
