import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../data/mockData';
import { seatLockManager, getShowKey, getTabId, getTabLockToken } from '../services/seatLockManager';
import { useToast } from './ToastContext';

const BookingContext = createContext();

const LOCK_DURATION_SECONDS = 480; // 8 minutes atomic seat lock

export const getSeatTier = (seat) => {
  if (!seat) return 'BALCONY';
  const row = (seat.row || seat.rowLetter || (typeof seat.id === 'string' ? seat.id[0] : 'A')).toUpperCase();
  return ['A', 'B', 'C', 'D'].includes(row) || seat.tier === 'BALCONY' ? 'BALCONY' : 'SECOND_CLASS';
};

export const getSeatPrice = (seat) => {
  if (!seat) return 147;
  const tier = getSeatTier(seat);
  return tier === 'BALCONY' ? 147 : 84;
};

export const BookingProvider = ({ children }) => {
  const { toast } = useToast();
  const [selectedMovie, setSelectedMovie] = useState(() => {
    const saved = localStorage.getItem('cinebook_selected_movie');
    return saved ? JSON.parse(saved) : MOVIES[0];
  });

  const [selectedTheatre, setSelectedTheatre] = useState(() => {
    const saved = localStorage.getItem('cinebook_selected_theatre');
    return saved ? JSON.parse(saved) : THEATRES[0];
  });

  const [selectedShow, setSelectedShow] = useState(() => {
    const saved = localStorage.getItem('cinebook_selected_show');
    return saved ? JSON.parse(saved) : SAMPLE_SHOWTIMES[0];
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    return localStorage.getItem('cinebook_selected_date') || new Date().toISOString().split('T')[0];
  });

  // Tab-isolated seat selection (Each browser tab holds its own distinct selection in sessionStorage)
  const [selectedSeats, setSelectedSeats] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cinebook_tab_selected_seats');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((s) => ({
        ...s,
        tier: getSeatTier(s),
        price: getSeatPrice(s)
      }));
    } catch (e) {
      return [];
    }
  });

  // Seat locking & countdown
  const [lockToken, setLockToken] = useState(() => getTabLockToken());
  const [lockExpiresAt, setLockExpiresAt] = useState(() => {
    const saved = sessionStorage.getItem('cinebook_tab_lock_expires_at');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [secondsLeft, setSecondsLeft] = useState(480);

  // Sync state changes
  useEffect(() => {
    if (selectedMovie) localStorage.setItem('cinebook_selected_movie', JSON.stringify(selectedMovie));
  }, [selectedMovie]);

  useEffect(() => {
    if (selectedTheatre) localStorage.setItem('cinebook_selected_theatre', JSON.stringify(selectedTheatre));
  }, [selectedTheatre]);

  useEffect(() => {
    if (selectedShow) localStorage.setItem('cinebook_selected_show', JSON.stringify(selectedShow));
  }, [selectedShow]);

  useEffect(() => {
    if (selectedDate) localStorage.setItem('cinebook_selected_date', selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    sessionStorage.setItem('cinebook_tab_selected_seats', JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  // Current show unique key
  const currentShowKey = getShowKey(selectedShow, selectedTheatre, selectedMovie, selectedDate);

  // Countdown timer effect
  useEffect(() => {
    if (!lockExpiresAt || selectedSeats.length === 0) {
      setSecondsLeft(480);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((lockExpiresAt - now) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        // Lock expired
        seatLockManager.releaseCurrentTabLocks(currentShowKey, selectedShow?.id);
        setSelectedSeats([]);
        sessionStorage.removeItem('cinebook_tab_selected_seats');
        sessionStorage.removeItem('cinebook_tab_lock_expires_at');
        toast.warning('Your 8-minute seat lock has expired. Seats released back to audience.', 'Seat Reservation Expired');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt, selectedSeats.length, currentShowKey, selectedShow?.id, toast]);

  // Toggle seat selection with instant 0ms optimistic UI updates & atomic background lock verification
  const toggleSeatSelection = (seat, overrideShowKey, overrideShowId) => {
    const showKey = overrideShowKey || getShowKey(selectedShow, selectedTheatre, selectedMovie, selectedDate);
    const showId = overrideShowId || selectedShow?.id;
    const exists = selectedSeats.find((s) => s.id === seat.id);

    if (exists) {
      // 1. Instant 0ms UI update for deselecting (ALWAYS allowed for current user)
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
      seatLockManager.unlockSeat(showKey, seat.id, showId).catch(() => {});
      return;
    }

    // Check if permanently booked
    if (seat.status === 'BOOKED') {
      toast.warning(`Seat ${seat.id} is already booked.`);
      return;
    }

    // Check if locked by another user (NOT current user)
    if (seat.isLockedByOther || seatLockManager.isSeatLockedByOtherTab(showKey, seat.id) || (seat.status === 'LOCKED' && !seat.isLockedByMe)) {
      toast.conflict(`Seat ${seat.id} is currently held by another customer.`);
      return;
    }

    // Check maximum 8 seats limit
    if (selectedSeats.length >= 8) {
      toast.warning('You can select a maximum of 8 seats per transaction.', 'Limit Reached');
      return;
    }

    // 2. Instant 0ms Optimistic UI Selection with guaranteed canonical price
    const sanitizedSeat = {
      ...seat,
      tier: getSeatTier(seat),
      price: getSeatPrice(seat)
    };
    setSelectedSeats((prev) => [...prev, sanitizedSeat]);

    const activeToken = getTabLockToken();
    const expiresAt = Date.now() + LOCK_DURATION_SECONDS * 1000;
    setLockExpiresAt(expiresAt);
    sessionStorage.setItem('cinebook_tab_lock_expires_at', expiresAt.toString());

    // 3. Fast background atomic lock synchronization with consistent session token
    seatLockManager
      .lockSeat(showKey, seat.id, showId, activeToken)
      .then((result) => {
        if (!result.success) {
          // Rollback selection only if conflict or already booked by someone else
          setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
          toast.conflict(result.message || `Seat ${seat.id} was just reserved by another customer.`);
        }
      })
      .catch((err) => {
        setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
        toast.conflict(err.message || `Seat ${seat.id} could not be reserved.`);
      });
  };

  const startSeatLock = (overrideShowKey, overrideShowId) => {
    const showKey = overrideShowKey || getShowKey(selectedShow, selectedTheatre, selectedMovie, selectedDate);
    const showId = overrideShowId || selectedShow?.id;
    const token = getTabLockToken();
    selectedSeats.forEach((seat) => {
      seatLockManager.lockSeat(showKey, seat.id, showId, token);
    });
    const expiresAt = Date.now() + LOCK_DURATION_SECONDS * 1000;
    
    setLockToken(token);
    setLockExpiresAt(expiresAt);
    sessionStorage.setItem('cinebook_tab_lock_token', token);
    sessionStorage.setItem('cinebook_tab_lock_expires_at', expiresAt.toString());
    return token;
  };

  const releaseSeatLock = () => {
    const showKey = getShowKey(selectedShow, selectedTheatre, selectedMovie, selectedDate);
    seatLockManager.releaseCurrentTabLocks(showKey, selectedShow?.id);
    setSelectedSeats([]);
    sessionStorage.removeItem('cinebook_tab_selected_seats');
    sessionStorage.removeItem('cinebook_tab_lock_expires_at');
  };

  const clearBooking = () => {
    setSelectedSeats([]);
    sessionStorage.removeItem('cinebook_tab_selected_seats');
    sessionStorage.removeItem('cinebook_tab_lock_expires_at');
  };

  // Pricing calculations
  // Base Ticket Price: sum of seat prices (Balcony: ₹147, Second Class: ₹84)
  const baseAmount = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  // Convenience Fee Base: 10% of Ticket Price
  const convenienceFeeBase = Number((baseAmount * 0.10).toFixed(2));

  // Integrated GST (IGST @ 18% on Convenience Fee Base Amount)
  const igst = Number((convenienceFeeBase * 0.18).toFixed(2));
  const cgst = Number((convenienceFeeBase * 0.09).toFixed(2));
  const sgst = Number((convenienceFeeBase * 0.09).toFixed(2));
  const taxes = igst;

  // Total Convenience Fee = Convenience Base + 18% IGST
  const convenienceFeeTotal = Number((convenienceFeeBase + igst).toFixed(2));

  // Total Amount Payable = Ticket(s) Price + Total Convenience Fees
  const totalAmount = Number((baseAmount + convenienceFeeTotal).toFixed(2));

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        setSelectedMovie,
        selectedTheatre,
        setSelectedTheatre,
        selectedShow,
        setSelectedShow,
        selectedDate,
        setSelectedDate,
        selectedSeats,
        setSelectedSeats,
        toggleSeatSelection,
        lockToken,
        secondsLeft: secondsLeft > 0 ? secondsLeft : 480,
        isLockExpired: false,
        startSeatLock,
        releaseSeatLock,
        clearBooking,
        baseAmount,
        convenienceFeeBase,
        convenienceFeeTotal,
        convenienceFee: convenienceFeeTotal,
        igst,
        cgst,
        sgst,
        taxes,
        totalAmount
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
