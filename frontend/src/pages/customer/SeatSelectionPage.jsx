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
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES, generateSeatLayout } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { seatLockManager, getShowKey, getTabId, getTabLockToken } from '../../services/seatLockManager';
import { bookingApi } from '../../services/bookingApi';
import { supabase } from '../../services/supabaseClient';
import SeatGrid from '../../components/booking/SeatGrid';
import { LoginModal } from '../../components/auth/LoginModal';
import { Button } from '../../components/ui/Button';

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
        price: { BALCONY: 1, SECOND_CLASS: 1 },
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

  const formattedDateStr = React.useMemo(() => {
    try {
      const d = new Date(effectiveDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch (e) {
      return effectiveDate;
    }
  }, [effectiveDate]);

  useEffect(() => {
    if (show && show.id !== selectedShow?.id) setSelectedShow(show);
    if (movie && movie.id !== selectedMovie?.id) setSelectedMovie(movie);
    if (theatre && theatre.id !== selectedTheatre?.id) setSelectedTheatre(theatre);
  }, [show.id, movie.id, theatre.id]);

  const [rawLayout, setRawLayout] = useState(() => generateSeatLayout(show.id));
  const [liveStatuses, setLiveStatuses] = useState(() => seatLockManager.getShowSeatStatuses(currentShowKey));

  const selectedSeatsRef = React.useRef(selectedSeats);
  selectedSeatsRef.current = selectedSeats;

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

          const localStatuses = seatLockManager.getShowSeatStatuses(currentShowKey);
          const backendStatuses = {};
          const currentSelected = selectedSeatsRef.current || [];

          tiers.forEach((tier) => {
            (tier.rows || []).forEach((row) => {
              (row.seats || []).forEach((seat) => {
                const isRecentlyReleased = seatLockManager.isSeatRecentlyReleased(currentShowKey, seat.id);
                if (isRecentlyReleased) {
                  backendStatuses[seat.id] = {
                    status: 'AVAILABLE',
                    isLockedByOtherTab: false,
                    isLockedByCurrentTab: false
                  };
                  return;
                }

                const isSelectedInThisTab = currentSelected.some((sel) => sel.id === seat.id);
                const isLockedByThisTab = Boolean(localStatuses[seat.id]?.isLockedByCurrentTab) || Boolean(seat.isLockedByMe) || Boolean(seat.is_locked_by_me);
                const isMine = isSelectedInThisTab || isLockedByThisTab;
                const isOtherLocked = !isMine && (Boolean(seat.isLockedByOther) || Boolean(seat.is_locked_by_other) || Boolean(localStatuses[seat.id]?.isLockedByOtherTab));

                if (seat.status === 'BOOKED') {
                  backendStatuses[seat.id] = {
                    status: 'BOOKED',
                    isLockedByOtherTab: false,
                    isLockedByCurrentTab: false
                  };
                } else if (seat.status === 'LOCKED' || isOtherLocked) {
                  backendStatuses[seat.id] = {
                    status: isMine ? 'AVAILABLE' : 'LOCKED',
                    isLockedByOtherTab: isOtherLocked,
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

          setLiveStatuses(backendStatuses);

          const permanentlyBookedConflicted = currentSelected.filter((s) => backendStatuses[s.id]?.status === 'BOOKED');
          if (permanentlyBookedConflicted.length > 0) {
            toast.conflict(`Seat(s) ${permanentlyBookedConflicted.map((s) => s.id).join(', ')} were just purchased by another customer.`);
            permanentlyBookedConflicted.forEach((s) => toggleSeatSelection(s, currentShowKey, show.id));
          }
        }
      } catch (err) {
        // Fallback
      }
    };

    fetchLatestLayout();
    const pollTimer = setInterval(fetchLatestLayout, 1000);

    const unsubscribe = seatLockManager.subscribe((event) => {
      if (isMounted) {
        setLiveStatuses(seatLockManager.getShowSeatStatuses(currentShowKey));
        if (event && event.action) fetchLatestLayout();
      }
    });

    let channel = null;
    if (supabase) {
      try {
        channel = supabase
          .channel(`realtime:seats:${show.id}`, {
            config: { broadcast: { self: false } }
          })
          // 1. Ultra-fast WebSocket Realtime Broadcast (<50ms fraction-of-second sync)
          .on('broadcast', { event: 'SEAT_LOCK_EVENT' }, (payload) => {
            if (!isMounted) return;
            const evt = payload?.payload;
            if (!evt || (evt.showId && evt.showId !== show.id)) return;

            const currentTabId = getTabId();
            const currentToken = getTabLockToken();
            if (evt.tabId === currentTabId || evt.lockToken === currentToken) return;

            if (evt.action === 'LOCK' && evt.seatId) {
              setLiveStatuses((prev) => ({
                ...prev,
                [evt.seatId]: {
                  status: 'LOCKED',
                  isLockedByOtherTab: true,
                  isLockedByCurrentTab: false,
                  lockToken: evt.lockToken,
                  expiresAt: evt.expiresAt || (Date.now() + 8 * 60 * 1000)
                }
              }));

              const currentSelected = selectedSeatsRef.current || [];
              if (currentSelected.some((s) => s.id === evt.seatId)) {
                toast.conflict(`Seat ${evt.seatId} was just selected by another customer.`);
                toggleSeatSelection({ id: evt.seatId }, currentShowKey, show.id);
              }
            } else if (evt.action === 'UNLOCK' && evt.seatId) {
              seatLockManager.markSeatRecentlyReleased(currentShowKey, evt.seatId);
              setLiveStatuses((prev) => ({
                ...prev,
                [evt.seatId]: {
                  status: 'AVAILABLE',
                  isLockedByOtherTab: false,
                  isLockedByCurrentTab: false
                }
              }));
            } else if (evt.action === 'RELEASE_ALL' || evt.action === 'RELEASE_SEATS') {
              fetchLatestLayout();
            } else if (evt.action === 'CONFIRM' || evt.action === 'BOOKED' || evt.action === 'BOOKED_CONFIRMED') {
              const targetSeats = evt.seatIds || (evt.seatId ? [evt.seatId] : []);
              setLiveStatuses((prev) => {
                const next = { ...prev };
                targetSeats.forEach((sId) => {
                  next[sId] = {
                    status: 'BOOKED',
                    isLockedByOtherTab: false,
                    isLockedByCurrentTab: false
                  };
                });
                return next;
              });
            }
          })
          // 2. Database changes on 'seats' table
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'seats' },
            (payload) => {
              if (!isMounted) return;
              const updatedSeat = payload.new || payload.old;
              if (!updatedSeat || (updatedSeat.show_id && updatedSeat.show_id !== show.id)) return;

              const seatId = updatedSeat.seat_id || (updatedSeat.id && updatedSeat.id.includes(':') ? updatedSeat.id.split(':')[1] : updatedSeat.id);
              if (!seatId) return;

              const currentToken = getTabLockToken();
              const isMine = updatedSeat.lock_token === currentToken || (updatedSeat.user_id && user && updatedSeat.user_id === user.id);
              const isOtherLocked = !isMine && updatedSeat.status === 'LOCKED';

              setLiveStatuses((prev) => ({
                ...prev,
                [seatId]: {
                  status: updatedSeat.status === 'AVAILABLE' ? 'AVAILABLE' : (isMine ? 'AVAILABLE' : updatedSeat.status),
                  isLockedByOtherTab: isOtherLocked,
                  isLockedByCurrentTab: isMine,
                  lockToken: updatedSeat.lock_token,
                  expiresAt: updatedSeat.expires_at ? new Date(updatedSeat.expires_at).getTime() : Date.now() + 8 * 60 * 1000
                }
              }));

              if (isOtherLocked || updatedSeat.status === 'BOOKED') {
                const currentSelected = selectedSeatsRef.current || [];
                if (currentSelected.some((s) => s.id === seatId)) {
                  toast.conflict(`Seat ${seatId} was just reserved by another customer.`);
                  toggleSeatSelection({ id: seatId }, currentShowKey, show.id);
                }
              }
            }
          )
          // 3. Database changes on 'seat_locks' table
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'seat_locks' },
            (payload) => {
              if (!isMounted) return;
              const rec = payload.new || payload.old;
              if (!rec || (rec.show_id && rec.show_id !== show.id)) return;
              const seatId = rec.seat_id;
              if (!seatId) return;

              const currentToken = getTabLockToken();
              const isMine = rec.lock_token === currentToken || (rec.user_id && user && rec.user_id === user.id);
              const isLocked = payload.eventType !== 'DELETE' && rec.status === 'LOCKED' && !isMine;

              setLiveStatuses((prev) => ({
                ...prev,
                [seatId]: {
                  status: isLocked ? 'LOCKED' : (rec.status === 'BOOKED' ? 'BOOKED' : 'AVAILABLE'),
                  isLockedByOtherTab: isLocked,
                  isLockedByCurrentTab: isMine
                }
              }));
            }
          )
          .subscribe();
      } catch (e) {}
    }

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      unsubscribe();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [show.id, currentShowKey]);

  const dynamicLayout = (rawLayout && rawLayout.length > 0 ? rawLayout : generateSeatLayout(show.id)).map((tier) => ({
    ...tier,
    rows: (tier.rows || []).map((row) => ({
      ...row,
      seats: row.seats.map((seat) => {
        const liveInfo = liveStatuses[seat.id];
        const isSelectedInThisTab = selectedSeats.some((sel) => sel.id === seat.id);
        const isRecentlyReleased = seatLockManager.isSeatRecentlyReleased(currentShowKey, seat.id);

        if (isRecentlyReleased && !isSelectedInThisTab) {
          return { ...seat, status: 'AVAILABLE', isLockedByOtherTab: false, isLockedByOther: false, isLockedByMe: false };
        }

        if (isSelectedInThisTab) {
          return { ...seat, status: 'AVAILABLE', isLockedByOtherTab: false, isLockedByOther: false, isLockedByMe: true };
        }

        if (seat.status === 'BOOKED' || liveInfo?.status === 'BOOKED') {
          return { ...seat, status: 'BOOKED', isLockedByOtherTab: false, isLockedByOther: false };
        }

        const isMine = seat.is_locked_by_me || seat.isLockedByMe || liveInfo?.isLockedByCurrentTab;
        if (isMine) {
          return { ...seat, status: 'AVAILABLE', isLockedByOtherTab: false, isLockedByOther: false, isLockedByMe: true };
        }

        const isOther = seat.is_locked_by_other || seat.isLockedByOther || liveInfo?.isLockedByOtherTab || (seat.status === 'LOCKED' && !isMine);
        if (isOther) {
          return { ...seat, status: 'LOCKED', isLockedByOtherTab: true, isLockedByOther: true };
        }

        return { ...seat, status: 'AVAILABLE', isLockedByOtherTab: false, isLockedByOther: false };
      })
    }))
  }));

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

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white pt-24 pb-36 transition-colors">
      
      {/* 1. TOP SHOW INFORMATION HEADER */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#121824]/95 backdrop-blur-2xl border-b border-[#E5A93C]/20 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-2xl bg-[#1A2234] hover:bg-[#222C42] text-white border border-[#E5A93C]/20 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white leading-none font-display">
                  {movie.title}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#1A2234] text-[#FFD066] text-[10px] font-bold border border-[#E5A93C]/30">
                  {movie.censorRating || 'UA 16+'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {theatre.name} • <span className="text-[#FFD066] font-bold">{show.format || '4K Dolby Atmos'}</span> • {show.time} ({show.language || 'Telugu'})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#1A2234] border border-[#E5A93C]/20 text-white">
              <Calendar className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span className="font-bold">{formattedDateStr}</span>
            </div>

            {/* 8-Minute Countdown Timer Widget */}
            <div className={`px-3.5 py-1.5 rounded-2xl flex items-center gap-2 border transition-all ${
              secondsLeft < 120
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-[#1A2234] border-[#E5A93C]/40 text-[#FFD066]'
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
          <div className="p-3.5 rounded-3xl bg-[#121824]/90 border border-[#E5A93C]/30 shadow-[0_0_15px_rgba(229,169,60,0.2)] flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-[#FFD066] shrink-0" />
              <span>
                <strong className="text-white">{selectedSeats.length} Seat(s) Selected:</strong> Seats <span className="text-[#FFD066] font-black">{selectedSeats.map(s => s.id).join(', ')}</span> held exclusively for you. Complete payment within <strong className="text-[#FFD066]">{formatTime(secondsLeft)}</strong>.
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

      {/* 4. STICKY FLOATING BOTTOM BOOKING SUMMARY DECK */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0E14]/95 backdrop-blur-2xl border-t border-[#E5A93C]/25 py-4 px-4 sm:px-6 lg:px-8 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Selected Seats summary (Ticket Count + Seat List) */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#E5A93C]/10 text-[#FFD066] border border-[#E5A93C]/30 hidden sm:block">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-md bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#FFD066] font-black uppercase text-[11px]">
                  {selectedSeats.length} Ticket{selectedSeats.length !== 1 ? 's' : ''}
                </span>
                <span className="text-slate-400 font-bold">Seats:</span>
                {selectedSeats.length > 0 ? (
                  <span className="font-black bg-[#1A2234] px-3 py-0.5 rounded-full border border-[#E5A93C]/40 text-[#FFD066] shadow-[0_0_10px_rgba(229,169,60,0.25)]">
                    {selectedSeats.map((s) => s.id).join(', ')}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Click on seat layout above</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Base Ticket(s): <strong className="text-white">₹{Number(baseAmount || 0).toFixed(2)}</strong> + Handling Fee: <strong className="text-white">₹{Number(convenienceFee || 0).toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* Action Total and Glowing "Confirm & Pay" Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Total Payable (All Incl.)</span>
              <span className="text-xl sm:text-2xl font-black text-[#FFD066] font-mono">₹{Number(totalAmount || 0).toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`gold-glow-btn px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                selectedSeats.length === 0 ? 'opacity-40 cursor-not-allowed filter grayscale pointer-events-none' : ''
              }`}
            >
              <span>Confirm & Pay</span>
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
