import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Repeat,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Clock
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
    totalAmount,
    secondsLeft
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
        price: { BALCONY: 14, SECOND_CLASS: 14 },
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
      toast.warning('Please select at least 1 seat to continue.', 'Selection Required');
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
    // Quick toggle selection to demo swap
    if (rawLayout[0]?.rows[0]?.seats[0]) {
      toggleSeatSelection(rawLayout[0].rows[0].seats[0], currentShowKey, show.id);
    }
  };

  const displayTotal = totalAmount && totalAmount > 0 ? totalAmount : selectedSeats.length * 14;

  return (
    <div className="min-h-screen bg-[#171b34] text-white pt-20 pb-36 select-none">
      
      {/* Top Navigation / Back bar */}
      <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#a8adc9] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#e0b45c]" />
          <span>Back</span>
        </button>

        <span className="text-xs font-semibold text-[#a8adc9]">
          {show.time} • {show.language || 'Telugu'}
        </span>
      </div>

      {/* Main Seat Grid Component (Screen 3 Mockup) */}
      <div className="max-w-lg mx-auto px-2 sm:px-4">
        <SeatGrid
          seatLayout={dynamicLayout}
          selectedSeats={selectedSeats}
          onToggleSeat={(seat) => toggleSeatSelection(seat, currentShowKey, show.id)}
        />
      </div>

      {/* Sticky Bottom Action Bar (Screen 3 Mockup) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#171b34]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] py-3 px-4 sm:px-6">
        <div className="max-w-lg mx-auto space-y-2.5">
          
          {/* Summary Text: "View 2 Tickets (L12, L13) for The Stei... $28.00" */}
          <div className="flex items-center justify-between text-xs text-[#a8adc9]">
            <span className="truncate pr-2">
              {selectedSeats.length > 0 ? (
                <span>
                  View {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''} ({selectedSeats.map((s) => s.id || s).join(', ')}) for {movie.title.length > 18 ? movie.title.substring(0, 18) + '...' : movie.title}
                </span>
              ) : (
                <span className="text-[#6b7094] italic">Select seats on layout above</span>
              )}
            </span>
            <span className="font-bold text-white shrink-0">
              ${Number(displayTotal || 28).toFixed(2)}
            </span>
          </div>

          {/* Action Row: Left Square Reset Button + Right Large Pill Primary CTA */}
          <div className="flex items-center gap-3">
            {/* Left Square Icon Button */}
            <button
              type="button"
              onClick={handleReshuffle}
              className="p-3 rounded-xl bg-[#1e2348] border border-white/15 text-[#a8adc9] hover:text-white hover:border-[#e0b45c] transition-colors cursor-pointer shrink-0"
              title="Reshuffle selection"
            >
              <Repeat className="w-4 h-4 text-[#e0b45c]" />
            </button>

            {/* Large Pill Primary CTA Button */}
            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`luxury-gold-btn flex-1 py-3 px-6 rounded-full text-xs sm:text-sm font-bold tracking-wide flex items-center justify-between cursor-pointer ${
                selectedSeats.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="mx-auto pl-6">Confirm & Pay</span>
              <span className="font-extrabold">${Number(displayTotal || 28).toFixed(2)}</span>
            </button>
          </div>

          {/* Thin Drag Indicator Bar Centered at Bottom */}
          <div className="w-24 h-1 bg-white/20 rounded-full mx-auto" />
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
