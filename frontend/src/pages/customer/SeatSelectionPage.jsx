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
import { seatLockManager, getShowKey, getTabId } from '../../services/seatLockManager';
import { bookingApi } from '../../services/bookingApi';
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

  const currentShowKey = getShowKey(show, theatre, movie, selectedDate);
  const currentTabId = getTabId();

  const [rawLayout, setRawLayout] = useState(() => generateSeatLayout(show.id));
  const [liveStatuses, setLiveStatuses] = useState(() => seatLockManager.getShowSeatStatuses(currentShowKey));

  // Load layout and subscribe to real-time cross-tab seat lock & booking events
  useEffect(() => {
    // 1. Initial local + API layout sync
    setRawLayout(generateSeatLayout(show.id));
    setLiveStatuses(seatLockManager.getShowSeatStatuses(currentShowKey));

    // Async backend fetch
    bookingApi.getSeatLayout(show.id).then((res) => {
      if (res && res.tiers && res.tiers.length > 0) {
        setRawLayout(res.tiers);
      }
    }).catch(() => {});

    // 2. Real-time subscription across all browser tabs & storage events
    const unsubscribe = seatLockManager.subscribe((event) => {
      setLiveStatuses(seatLockManager.getShowSeatStatuses(currentShowKey));
    });

    return () => {
      unsubscribe();
    };
  }, [show.id, currentShowKey]);

  // Merge base layout with live atomic locks and bookings
  const dynamicLayout = rawLayout.map((tier) => ({
    ...tier,
    rows: tier.rows.map((row) => ({
      ...row,
      seats: row.seats.map((seat) => {
        const liveInfo = liveStatuses[seat.id];
        let status = seat.status;

        if (liveInfo) {
          if (liveInfo.status === 'BOOKED') {
            status = 'BOOKED';
          } else if (liveInfo.status === 'LOCKED') {
            // If locked by another tab, mark LOCKED. If locked by this tab, mark AVAILABLE for selection engine
            status = liveInfo.isLockedByOtherTab ? 'LOCKED' : (seat.status === 'COUNTER_QUOTA' ? 'COUNTER_QUOTA' : 'AVAILABLE');
          }
        }

        return {
          ...seat,
          status,
          isLockedByOtherTab: liveInfo?.isLockedByOtherTab || false
        };
      })
    }))
  }));

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
    // Check if any selected seat has become booked or locked by another session
    const statuses = seatLockManager.getShowSeatStatuses(currentShowKey);
    const conflicted = selectedSeats.find(
      (s) => statuses[s.id]?.status === 'BOOKED' || statuses[s.id]?.isLockedByOtherTab
    );
    if (conflicted) {
      alert(`Seat ${conflicted.id} is already booked or locked by another customer. Please select another seat.`);
      setLiveStatuses(statuses);
      return;
    }

    // Start atomic 8-minute seat lock
    startSeatLock();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-36 transition-colors">
      {/* 1. TOP SHOW INFORMATION HEADER */}
      <div className="sticky top-20 z-30 bg-surface border-b border-border py-3.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary border border-border transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-text-primary leading-none">
                  {movie.title}
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-elevated text-text-secondary text-[10px] font-bold border border-border">
                  {movie.censorRating || 'UA 16+'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {theatre.name} • <span className="text-amber-500 font-semibold">{show.format || '4K Dolby Atmos'}</span> • {show.time} ({show.language || 'Telugu'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="w-3.5 h-3.5 opacity-60" />
              <span>Date: <strong className="text-text-primary">{selectedDate || 'Today'}</strong></span>
            </div>

            {/* 8-Minute Countdown Timer Widget */}
            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border transition-all ${
              secondsLeft < 120
                ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse'
                : 'bg-surface-elevated border-border text-amber-500'
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
          <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                <strong className="text-text-primary">{selectedSeats.length} Seat(s) Selected:</strong> Seats {selectedSeats.map(s => s.id).join(', ')} held exclusively for you. Complete payment within <strong className="text-amber-500">{formatTime(secondsLeft)}</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CINEMA SEAT MATRIX CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <SeatGrid
          seatLayout={dynamicLayout}
          selectedSeats={selectedSeats}
          onToggleSeat={toggleSeatSelection}
        />
      </div>

      {/* 4. STICKY BOTTOM BOOKING SUMMARY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border py-3.5 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Selected Seats summary */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-surface-elevated text-accent border border-border hidden sm:block">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted font-semibold">Selected Seats:</span>
                {selectedSeats.length > 0 ? (
                  <span className="font-bold text-text-primary bg-surface-elevated px-2.5 py-0.5 rounded border border-border">
                    {selectedSeats.map((s) => s.id).join(', ')}
                  </span>
                ) : (
                  <span className="text-text-muted italic">Click on seat layout above</span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} • Base Amount: <strong className="text-text-primary">₹{baseAmount}</strong>
              </p>
            </div>
          </div>

          {/* Action Total and Checkout Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-text-muted block tracking-wider">Total Amount</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-500">₹{totalAmount}</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`px-7 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-accent hover:bg-accent-hover text-white shadow-sm'
                  : 'bg-surface-elevated text-text-muted cursor-not-allowed border border-border'
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
