import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Repeat,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Clock,
  Ticket,
  MapPin
} from 'lucide-react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES, generateSeatLayout } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { seatLockManager, getShowKey, getTabId } from '../../services/seatLockManager';
import { bookingApi } from '../../services/bookingApi';
import SeatGrid from '../../components/booking/SeatGrid';
import { LoginModal } from '../../components/auth/LoginModal';

export const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const {
    selectedMovie,
    setSelectedMovie,
    selectedTheatre,
    setSelectedTheatre,
    selectedShow,
    setSelectedShow,
    selectedDate,
    selectedSeats,
    toggleSeatSelection,
    startSeatLock,
    totalAmount
  } = useBooking();

  const show = React.useMemo(() => {
    if (showId) {
      const foundInMock = SAMPLE_SHOWTIMES.find((s) => s.id === showId);
      if (foundInMock) return foundInMock;
      if (selectedShow && selectedShow.id === showId) return selectedShow;

      let matchedTheatre = null;
      for (const t of THEATRES) {
        if (showId.includes(t.id)) {
          matchedTheatre = t;
          break;
        }
      }

      const theatreObj = matchedTheatre || selectedTheatre || THEATRES[0];
      const movieObj = selectedMovie || MOVIES[0];
      const timeStr = showId.endsWith('01') ? '11:00 AM' : showId.endsWith('02') ? '02:30 PM' : showId.endsWith('03') ? '06:15 PM' : '09:45 PM';

      return {
        id: showId,
        movieId: movieObj.id,
        movieTitle: movieObj.title,
        theatreId: theatreObj.id,
        theatreName: theatreObj.name,
        screenName: 'Screen 5, Grand Cinema Complex',
        format: '2D Dolby Atmos',
        language: 'Telugu',
        time: timeStr,
        price: { BALCONY: 150, SECOND_CLASS: 100 },
        availability: 'AVAILABLE'
      };
    }
    return selectedShow || SAMPLE_SHOWTIMES[0];
  }, [showId, selectedShow, selectedMovie, selectedTheatre]);

  const movie = React.useMemo(() => {
    return (show?.movieId && MOVIES.find((m) => m.id === show.movieId)) || selectedMovie || MOVIES[0];
  }, [show?.movieId, selectedMovie]);

  const theatre = React.useMemo(() => {
    return (show?.theatreId && THEATRES.find((t) => t.id === show.theatreId)) || selectedTheatre || THEATRES[0];
  }, [show?.theatreId, selectedTheatre]);

  const effectiveDate = selectedDate || new Date().toISOString().split('T')[0];
  const currentShowKey = getShowKey(show.id, theatre.id, movie.id, effectiveDate);

  useEffect(() => {
    if (show && show.id !== selectedShow?.id) setSelectedShow(show);
    if (movie && movie.id !== selectedMovie?.id) setSelectedMovie(movie);
    if (theatre && theatre.id !== selectedTheatre?.id) setSelectedTheatre(theatre);
  }, [show.id, movie.id, theatre.id]);

  const [rawLayout, setRawLayout] = useState(() => generateSeatLayout(show.id));
  const [liveStatuses, setLiveStatuses] = useState(() => seatLockManager.getShowSeatStatuses(currentShowKey));

  useEffect(() => {
    setRawLayout(generateSeatLayout(show.id));
  }, [show.id]);

  useEffect(() => {
    let isMounted = true;
    const fetchLatestLayout = async () => {
      try {
        const token = sessionStorage.getItem('cinebook_tab_lock_token') || '';
        const tabId = getTabId();
        const res = await bookingApi.getSeatLayout(show.id, token, tabId);
        const tiers = res?.tiers || (Array.isArray(res) ? res : null);
        if (tiers && tiers.length > 0 && isMounted) {
          seatLockManager.syncWithBackend(currentShowKey, tiers);
          setRawLayout(tiers);
          setLiveStatuses(seatLockManager.getShowSeatStatuses(currentShowKey));
        }
      } catch (err) {
        console.warn('Backend layout sync notice:', err.message);
      }
    };
    fetchLatestLayout();
    return () => { isMounted = false; };
  }, [show.id, currentShowKey]);

  const dynamicLayout = React.useMemo(() => {
    return rawLayout.map((tier) => ({
      ...tier,
      rows: tier.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => {
          const statusObj = liveStatuses[seat.id];
          if (statusObj) {
            return {
              ...seat,
              status: statusObj.status,
              isLockedByMe: statusObj.isLockedByMe,
              isLockedByOtherTab: statusObj.isLockedByOtherTab
            };
          }
          return seat;
        })
      }))
    }));
  }, [rawLayout, liveStatuses]);

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least 1 seat on the layout to proceed.', 'Selection Required');
      return;
    }

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    const statuses = seatLockManager.getShowSeatStatuses(currentShowKey);
    const conflicted = selectedSeats.find(
      (s) => statuses[s.id]?.status === 'BOOKED' || statuses[s.id]?.isLockedByOtherTab
    );
    if (conflicted) {
      toast.conflict(`Seat ${conflicted.id} was just reserved by another customer. Please select another seat.`);
      setLiveStatuses(statuses);
      return;
    }

    startSeatLock(currentShowKey, show.id);
    navigate('/checkout');
  };

  const handleLoginSuccess = () => {
    startSeatLock(currentShowKey, show.id);
    navigate('/checkout');
  };

  const handleReshuffle = () => {
    if (rawLayout[0]?.rows[0]?.seats[0]) {
      toggleSeatSelection(rawLayout[0].rows[0].seats[0], currentShowKey, show.id);
    }
  };

  const basePricePerSeat = 150;
  const displayTotal = totalAmount && totalAmount > 0 ? totalAmount : selectedSeats.length * basePricePerSeat;

  return (
    <div className="min-h-screen bg-background text-text-primary pt-24 pb-36 select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header Navigation & Movie Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-surface-elevated hover:bg-surface text-text-secondary hover:text-text-primary border border-border transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-text-primary font-display flex items-center gap-2">
                {movie.title}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase">
                  {movie.censorRating || 'UA 16+'}
                </span>
              </h1>
              <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{theatre.name}</span>
                <span>•</span>
                <span>{show.screenName || 'Screen 5'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-primary">
              <Clock className="w-3.5 h-3.5" />
              <span>{show.time}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-bold text-text-primary">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{effectiveDate}</span>
            </div>
          </div>
        </div>

        {/* 12-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLUMNS: INTERACTIVE AUDITORIUM SEATING GRID */}
          <div className="lg:col-span-8 space-y-6">
            <SeatGrid
              seatLayout={dynamicLayout}
              selectedSeats={selectedSeats}
              onToggleSeat={(seat) => toggleSeatSelection(seat, currentShowKey, show.id)}
            />
          </div>

          {/* RIGHT 4 COLUMNS: DESKTOP BOOKING SUMMARY SIDEBAR */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-5">
            <div className="p-6 rounded-3xl bg-surface border border-primary/30 shadow-2xl space-y-6">
              
              {/* Summary Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-black text-text-primary font-display">Booking Summary</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Live Lock
                </span>
              </div>

              {/* Movie Thumbnail & Show Details */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-elevated border border-border">
                <img
                  src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
                  alt={movie.title}
                  className="w-14 h-18 rounded-xl object-cover border border-border shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <h4 className="text-sm font-bold text-text-primary truncate">{movie.title}</h4>
                  <p className="text-[11px] text-text-muted truncate">{theatre.name}</p>
                  <p className="text-[10px] text-primary font-bold">{show.time} • 4K Dolby Atmos</p>
                </div>
              </div>

              {/* Selected Seats Badges */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                  Selected Seats ({selectedSeats.length})
                </span>
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat) => (
                      <span
                        key={seat.id || seat}
                        className="px-3 py-1 rounded-lg bg-primary text-[#171b34] text-xs font-black shadow-gold-glow"
                      >
                        {seat.id || seat}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-background border border-dashed border-border text-center text-xs text-text-muted">
                    Tap available seats on the map to select
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2.5 pt-2 border-t border-border text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Tickets ({selectedSeats.length} × ₹{basePricePerSeat})</span>
                  <span className="font-bold text-text-primary">₹{selectedSeats.length * basePricePerSeat}.00</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Convenience Handling Fee</span>
                  <span className="font-bold text-emerald-500">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border text-sm font-bold">
                  <span className="text-text-primary font-display">Total Payable</span>
                  <span className="text-lg font-black text-primary">
                    ₹{displayTotal > 0 ? displayTotal : selectedSeats.length * basePricePerSeat}.00
                  </span>
                </div>
              </div>

              {/* Primary Gold CTA Button */}
              <button
                type="button"
                onClick={handleProceed}
                disabled={selectedSeats.length === 0}
                className={`luxury-gold-btn w-full py-3.5 px-6 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-gold-glow ${
                  selectedSeats.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>Proceed to Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[10px] text-text-muted flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  100% Guaranteed Admission & Direct Refund Policy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border shadow-2xl py-3 px-4 sm:px-6">
        <div className="max-w-lg mx-auto space-y-2.5">
          
          {/* Summary Text */}
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="truncate pr-2">
              {selectedSeats.length > 0 ? (
                <span>
                  {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} ({selectedSeats.map((s) => s.id || s).join(', ')})
                </span>
              ) : (
                <span className="text-text-muted italic">Select seats above</span>
              )}
            </span>
            <span className="font-bold text-primary shrink-0 text-sm">
              ₹{displayTotal > 0 ? displayTotal : selectedSeats.length * basePricePerSeat}.00
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3">
            {/* Left Reshuffle Button */}
            <button
              type="button"
              onClick={handleReshuffle}
              className="p-3 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-colors cursor-pointer shrink-0"
              title="Quick Toggle"
            >
              <Repeat className="w-4 h-4 text-primary" />
            </button>

            {/* Large Gold Primary CTA */}
            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`luxury-gold-btn flex-1 py-3 px-6 rounded-full text-xs font-bold tracking-wide flex items-center justify-between cursor-pointer ${
                selectedSeats.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="mx-auto pl-6">Confirm & Pay</span>
              <span className="font-black">₹{displayTotal > 0 ? displayTotal : selectedSeats.length * basePricePerSeat}.00</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        message="Sign in to confirm your 8-minute seat reservation and proceed to instant checkout"
      />
    </div>
  );
};

export default SeatSelectionPage;
