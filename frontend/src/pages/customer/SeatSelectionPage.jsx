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
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { seatLockManager, getShowKey, getTabId } from '../../services/seatLockManager';
import { bookingApi } from '../../services/bookingApi';
import SeatGrid from '../../components/booking/SeatGrid';
import { LoginModal } from '../../components/auth/LoginModal';
import { Button } from '../../components/ui/Button';

const SeatSelectionPage = () => {
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
    baseAmount,
    totalAmount,
    secondsLeft
  } = useBooking();

  // Resolve exact show details using showId from URL as the primary source of truth
  const show = React.useMemo(() => {
    if (showId) {
      const foundInMock = SAMPLE_SHOWTIMES.find((s) => s.id === showId);
      if (foundInMock) return foundInMock;

      if (selectedShow && selectedShow.id === showId) return selectedShow;

      // Match theatre from showId slug (e.g. sh-th-gtr-003-01 -> th-gtr-003)
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
        screenName: theatreObj.screens?.[0]?.name || 'Audi 1 4K Laser',
        format: '2D Dolby Atmos',
        language: 'Telugu',
        time: timeStr,
        price: { CLASSIC: 120, PREMIUM: 190, RECLINER: 280 },
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
  const currentTabId = getTabId();

  // Keep BookingContext synced with the current show
  useEffect(() => {
    if (show && show.id !== selectedShow?.id) {
      setSelectedShow(show);
    }
    if (movie && movie.id !== selectedMovie?.id) {
      setSelectedMovie(movie);
    }
    if (theatre && theatre.id !== selectedTheatre?.id) {
      setSelectedTheatre(theatre);
    }
  }, [show.id, movie.id, theatre.id]);

  const [rawLayout, setRawLayout] = useState(() => generateSeatLayout(show.id));
  const [liveStatuses, setLiveStatuses] = useState(() => seatLockManager.getShowSeatStatuses(currentShowKey));

  // Load layout and subscribe to real-time seat locks & bookings from Supabase backend & cross-tabs
  useEffect(() => {
    let isMounted = true;

    const fetchLatestLayout = async () => {
      try {
        const res = await bookingApi.getSeatLayout(show.id);
        if (res && res.tiers && res.tiers.length > 0 && isMounted) {
          setRawLayout(res.tiers);

          // Extract real-time backend lock & booked statuses
          const localStatuses = seatLockManager.getShowSeatStatuses(currentShowKey);
          const backendStatuses = {};
          res.tiers.forEach((tier) => {
            (tier.rows || []).forEach((row) => {
              (row.seats || []).forEach((seat) => {
                if (seat.status === 'LOCKED' || seat.status === 'BOOKED') {
                  const isSelectedInThisTab = selectedSeats.some((sel) => sel.id === seat.id);
                  const isLockedByThisTab = Boolean(localStatuses[seat.id]?.isLockedByCurrentTab);
                  const isMine = isSelectedInThisTab || isLockedByThisTab;

                  backendStatuses[seat.id] = {
                    status: seat.status,
                    isLockedByOtherTab: !isMine && seat.status === 'LOCKED',
                    isLockedByCurrentTab: isMine && seat.status === 'LOCKED'
                  };
                }
              });
            });
          });

          // Merge local and backend statuses
          const merged = { ...localStatuses, ...backendStatuses };
          setLiveStatuses(merged);

          // Only alert if a seat was permanently purchased by another customer while this tab had it selected
          const permanentlyBookedConflicted = selectedSeats.filter((s) => backendStatuses[s.id]?.status === 'BOOKED');
          if (permanentlyBookedConflicted.length > 0) {
            toast.conflict(`Seat(s) ${permanentlyBookedConflicted.map((s) => s.id).join(', ')} were just purchased by another customer.`);
            permanentlyBookedConflicted.forEach((s) => toggleSeatSelection(s, currentShowKey, show.id));
          }
        }
      } catch (err) {
        // Fallback to local
      }
    };

    // 1. Initial fetch
    fetchLatestLayout();

    // 2. Real-time fast polling (every 1 second) for responsive cross-device / cross-account seat blocking
    const pollTimer = setInterval(fetchLatestLayout, 1000);

    // 3. Local cross-tab broadcast listener (0ms instant cross-window sync)
    const unsubscribe = seatLockManager.subscribe(() => {
      if (isMounted) {
        setLiveStatuses(seatLockManager.getShowSeatStatuses(currentShowKey));
      }
    });

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      unsubscribe();
    };
  }, [show.id, currentShowKey, selectedSeats.length]);

  // Merge base layout with live atomic locks and bookings from Supabase
  const dynamicLayout = rawLayout.map((tier) => ({
    ...tier,
    rows: tier.rows.map((row) => ({
      ...row,
      seats: row.seats.map((seat) => {
        const liveInfo = liveStatuses[seat.id];
        const isSelectedInThisTab = selectedSeats.some((sel) => sel.id === seat.id);
        let status = 'AVAILABLE';

        if (liveInfo?.status === 'BOOKED' || seat.status === 'BOOKED') {
          status = 'BOOKED';
        } else if (
          (liveInfo?.status === 'LOCKED' && liveInfo?.isLockedByOtherTab && !isSelectedInThisTab) ||
          (seat.status === 'LOCKED' && !isSelectedInThisTab && liveInfo?.isLockedByOtherTab)
        ) {
          status = 'LOCKED';
        }

        return {
          ...seat,
          status,
          isLockedByOtherTab: (liveInfo?.isLockedByOtherTab && !isSelectedInThisTab) || false
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
      toast.warning('Please select at least 1 seat to continue.', 'Selection Required');
      return;
    }

    // Strict Login Requirement Check
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // Check if any selected seat has become booked or locked by another session
    const statuses = seatLockManager.getShowSeatStatuses(currentShowKey);
    const conflicted = selectedSeats.find(
      (s) => statuses[s.id]?.status === 'BOOKED' || statuses[s.id]?.isLockedByOtherTab
    );
    if (conflicted) {
      toast.conflict(`Seat ${conflicted.id} was just reserved by another customer. Please select another seat.`);
      setLiveStatuses(statuses);
      return;
    }

    // Start atomic 8-minute seat lock
    startSeatLock(currentShowKey, show.id);
    navigate('/checkout');
  };

  const handleLoginSuccess = () => {
    startSeatLock(currentShowKey, show.id);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-36 transition-colors">
      {/* 1. TOP SHOW INFORMATION HEADER */}
      <div className="sticky top-16 sm:top-20 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 py-3.5 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-surface-elevated text-text-secondary hover:text-text-primary border border-border transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-text-primary leading-none">
                  {movie.title}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-text-secondary text-[10px] font-bold border border-border">
                  {movie.censorRating || 'UA 16+'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {theatre.name} • <span className="text-gold font-bold">{show.format || '4K Dolby Atmos'}</span> • {show.time} ({show.language || 'Telugu'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="w-3.5 h-3.5 opacity-60" />
              <span>Date: <strong className="text-text-primary">{selectedDate || 'Today'}</strong></span>
            </div>

            {/* 8-Minute Countdown Timer Widget */}
            <div className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 border transition-all ${
              secondsLeft < 120
                ? 'bg-primary/15 border-primary text-primary animate-pulse'
                : 'bg-surface-elevated border-gold/40 text-gold'
            }`}>
              <Clock className="w-4 h-4" />
              <div className="leading-tight">
                <span className="text-[9px] uppercase font-black block tracking-wider opacity-80">Seat Lock</span>
                <span className="text-xs font-mono font-black">{formatTime(secondsLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PULSATING SEAT URGENCY NOTICE (When seats selected) */}
      {selectedSeats.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="p-3.5 rounded-2xl bg-surface border border-gold/40 shadow-sm flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
              <span>
                <strong className="text-text-primary">{selectedSeats.length} Seat(s) Selected:</strong> Seats <span className="text-gold font-bold">{selectedSeats.map(s => s.id).join(', ')}</span> held exclusively for you. Complete payment within <strong className="text-gold">{formatTime(secondsLeft)}</strong>.
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
          onToggleSeat={(seat) => toggleSeatSelection(seat, currentShowKey, show.id)}
        />
      </div>

      {/* 4. STICKY BOTTOM BOOKING SUMMARY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border py-4 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Selected Seats summary */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gold/15 text-gold border border-gold/30 hidden sm:block">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted font-semibold">Selected Seats:</span>
                {selectedSeats.length > 0 ? (
                  <span className="font-black text-text-primary bg-surface-elevated px-3 py-0.5 rounded-full border border-gold/40 text-gold">
                    {selectedSeats.map((s) => s.id).join(', ')}
                  </span>
                ) : (
                  <span className="text-text-muted italic">Click on seat layout above</span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} • Base Amount: <strong className="text-text-primary font-bold">₹{baseAmount}</strong>
              </p>
            </div>
          </div>

          {/* Action Total and Checkout Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-text-muted block tracking-wider">Total Amount</span>
              <span className="text-xl sm:text-2xl font-black text-gold">₹{totalAmount}</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-gold hover:bg-gold-hover text-background shadow-lg shadow-gold/20 transform hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-surface-elevated text-text-muted cursor-not-allowed border border-border'
              }`}
            >
              <span>Proceed to Pay</span>
              <ChevronRight className="w-4 h-4" />
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
