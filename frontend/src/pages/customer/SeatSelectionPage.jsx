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
    convenienceFee,
    cgst,
    sgst,
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
        price: { BALCONY: 147, SECOND_CLASS: 84 },
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

  // Keep a live mutable reference to selectedSeats to prevent stale closures in polling loops
  const selectedSeatsRef = React.useRef(selectedSeats);
  selectedSeatsRef.current = selectedSeats;

  // Load layout and subscribe to real-time seat locks & bookings from Supabase backend & cross-tabs
  useEffect(() => {
    let isMounted = true;

    const fetchLatestLayout = async () => {
      try {
        const token = sessionStorage.getItem('cinebook_tab_lock_token') || '';
        const tabId = getTabId();
        const res = await bookingApi.getSeatLayout(show.id, token, tabId);
        if (res && res.tiers && res.tiers.length > 0 && isMounted) {
          // Self-heal any stale browser cache with server truth
          seatLockManager.syncWithBackend(currentShowKey, res.tiers);
          setRawLayout(res.tiers);

          // Extract real-time backend lock & booked statuses
          const localStatuses = seatLockManager.getShowSeatStatuses(currentShowKey);
          const backendStatuses = {};
          const currentSelected = selectedSeatsRef.current || [];

          res.tiers.forEach((tier) => {
            (tier.rows || []).forEach((row) => {
              (row.seats || []).forEach((seat) => {
                const isSelectedInThisTab = currentSelected.some((sel) => sel.id === seat.id);
                const isLockedByThisTab = Boolean(localStatuses[seat.id]?.isLockedByCurrentTab) || Boolean(seat.isLockedByMe);
                const isMine = isSelectedInThisTab || isLockedByThisTab;

                if (seat.status === 'BOOKED') {
                  backendStatuses[seat.id] = {
                    status: 'BOOKED',
                    isLockedByOtherTab: false,
                    isLockedByCurrentTab: false
                  };
                } else if (seat.status === 'LOCKED' || seat.isLockedByOther) {
                  backendStatuses[seat.id] = {
                    status: isMine ? 'AVAILABLE' : 'LOCKED',
                    isLockedByOtherTab: !isMine,
                    isLockedByCurrentTab: isMine
                  };
                } else {
                  backendStatuses[seat.id] = {
                    status: 'AVAILABLE',
                    isLockedByOtherTab: false,
                    isLockedByCurrentTab: isMine
                  };
                }
              });
            });
          });

          // Ground truth from live database
          setLiveStatuses(backendStatuses);

          // Only alert if a seat was genuinely confirmed & permanently booked by another customer
          const permanentlyBookedConflicted = currentSelected.filter((s) => backendStatuses[s.id]?.status === 'BOOKED');
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

    // 2. High-speed real-time polling (every 600ms) for instantaneous cross-account / cross-browser seat sync
    const pollTimer = setInterval(fetchLatestLayout, 600);

    // 3. Local cross-tab broadcast listener (0ms instant cross-window sync)
    const unsubscribe = seatLockManager.subscribe((event) => {
      if (isMounted) {
        setLiveStatuses(seatLockManager.getShowSeatStatuses(currentShowKey));
        if (event && event.action) {
          fetchLatestLayout();
        }
      }
    });

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      unsubscribe();
    };
  }, [show.id, currentShowKey]);

  // Merge base layout with live atomic locks and bookings from Supabase
  const dynamicLayout = rawLayout.map((tier) => ({
    ...tier,
    rows: tier.rows.map((row) => ({
      ...row,
      seats: row.seats.map((seat) => {
        const liveInfo = liveStatuses[seat.id];
        const isSelectedInThisTab = selectedSeats.some((sel) => sel.id === seat.id);

        // 1. If selected in this tab, ALWAYS keep selected & available for current user
        if (isSelectedInThisTab) {
          return {
            ...seat,
            status: 'AVAILABLE',
            isLockedByOtherTab: false,
            isLockedByOther: false,
            isLockedByMe: true
          };
        }

        // 2. If permanently booked in backend or live state
        if (seat.status === 'BOOKED' || liveInfo?.status === 'BOOKED') {
          return {
            ...seat,
            status: 'BOOKED',
            isLockedByOtherTab: false,
            isLockedByOther: false
          };
        }

        // 3. If locked by another customer in backend or live state
        if (seat.isLockedByOther || liveInfo?.isLockedByOtherTab || (seat.status === 'LOCKED' && !seat.isLockedByMe && !liveInfo?.isLockedByCurrentTab)) {
          return {
            ...seat,
            status: 'LOCKED',
            isLockedByOtherTab: true,
            isLockedByOther: true
          };
        }

        // 4. Clean available
        return {
          ...seat,
          status: 'AVAILABLE',
          isLockedByOtherTab: false,
          isLockedByOther: false
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
      <div className="sticky top-16 sm:top-20 z-30 bg-void-900/95 backdrop-blur-md border-b border-white/8 py-3.5 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-void-800 text-text-secondary hover:text-text-primary border border-white/8 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-text-primary leading-none">
                  {movie.title}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-void-800 text-text-secondary text-[10px] font-bold border border-white/8">
                  {movie.censorRating || 'UA 16+'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {theatre.name} • <span className="text-brand font-bold">{show.format || '4K Dolby Atmos'}</span> • {show.time} ({show.language || 'Telugu'})
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
                : 'bg-void-800 border-brand/40 text-brand'
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
          <div className="p-3.5 rounded-2xl bg-void-850 border border-brand/30 shadow-sm flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <Sparkles className="w-4 h-4 text-brand flex-shrink-0" />
              <span>
                <strong className="text-text-primary">{selectedSeats.length} Seat(s) Selected:</strong> Seats <span className="text-brand font-bold">{selectedSeats.map(s => s.id).join(', ')}</span> held exclusively for you. Complete payment within <strong className="text-brand">{formatTime(secondsLeft)}</strong>.
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-void-900/95 backdrop-blur-md border-t border-white/8 py-4 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Selected Seats summary */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-brand/15 text-brand border border-brand/30 hidden sm:block">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted font-semibold">Selected Seats:</span>
                {selectedSeats.length > 0 ? (
                  <span className="font-black bg-void-800 px-3 py-0.5 rounded-full border border-brand/40 text-brand">
                    {selectedSeats.map((s) => s.id).join(', ')}
                  </span>
                ) : (
                  <span className="text-text-muted italic">Click on seat layout above</span>
                )}
              </div>
              <p className="text-[11px] text-text-muted mt-1">
                {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} • Ticket(s): <strong className="text-text-primary font-bold">₹{Number(baseAmount || 0).toFixed(2)}</strong> + Convenience Fee (10% + 18% GST): <strong className="text-text-primary font-bold">₹{Number(convenienceFee || 0).toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* Action Total and Checkout Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-text-muted block tracking-wider">Total Amount (Incl. All)</span>
              <span className="text-xl sm:text-2xl font-black text-brand font-mono">₹{Number(totalAmount || 0).toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-brand hover:bg-brand-hover text-void-950 shadow-lg shadow-brand/25 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-98'
                  : 'bg-void-800 text-text-muted cursor-not-allowed border border-white/8'
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
