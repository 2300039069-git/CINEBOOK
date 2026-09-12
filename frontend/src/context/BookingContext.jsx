import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../data/mockData';
import { seatLockManager, getShowKey, getTabId } from '../services/seatLockManager';
import { useToast } from './ToastContext';

const BookingContext = createContext();

const LOCK_DURATION_SECONDS = 480; // 8 minutes atomic seat lock

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
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Seat locking & countdown
  const [lockToken, setLockToken] = useState(() => sessionStorage.getItem('cinebook_tab_lock_token') || 'lock_init');
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
    if (seat.status === 'BOOKED' || (seat.status === 'LOCKED' && !selectedSeats.some((s) => s.id === seat.id))) {
      toast.warning(`Seat ${seat.id} is already booked or reserved.`);
      return;
    }

    const showKey = overrideShowKey || getShowKey(selectedShow, selectedTheatre, selectedMovie, selectedDate);
    const showId = overrideShowId || selectedShow?.id;
    const exists = selectedSeats.find((s) => s.id === seat.id);

    if (exists) {
      // 1. Instant 0ms UI update for deselecting
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
      seatLockManager.unlockSeat(showKey, seat.id, showId).catch(() => {});
      return;
    }

    // Check maximum 8 seats limit
    if (selectedSeats.length >= 8) {
      toast.warning('You can select a maximum of 8 seats per transaction.', 'Limit Reached');
      return;
    }

    // Check if locked by another tab or already booked
    if (seatLockManager.isSeatLockedByOtherTab(showKey, seat.id)) {
      toast.conflict(`Seat ${seat.id} is currently held by another customer.`);
      return;
    }
    if (seatLockManager.isSeatBooked(showKey, seat.id)) {
      toast.conflict(`Seat ${seat.id} is already booked.`);
      return;
    }

    // 2. Instant 0ms Optimistic UI Selection
    setSelectedSeats((prev) => [...prev, seat]);

    // 3. Fast background atomic lock synchronization
    seatLockManager
      .lockSeat(showKey, seat.id, showId, lockToken !== 'lock_init' ? lockToken : null)
      .then((result) => {
        if (!result.success) {
          // Rollback selection if conflict or already booked
          setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
          toast.conflict(result.message || `Seat ${seat.id} was just reserved by another customer.`);
        } else {
          const expiresAt = result.expiresAt || (Date.now() + LOCK_DURATION_SECONDS * 1000);
          setLockExpiresAt(expiresAt);
          sessionStorage.setItem('cinebook_tab_lock_expires_at', expiresAt.toString());
          if (result.lockToken) {
            setLockToken(result.lockToken);
            sessionStorage.setItem('cinebook_tab_lock_token', result.lockToken);
          }
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
    selectedSeats.forEach((seat) => {
      seatLockManager.lockSeat(showKey, seat.id, showId, lockToken !== 'lock_init' ? lockToken : null);
    });
    const token = lockToken && lockToken !== 'lock_init' ? lockToken : `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
  // Base Ticket Price: sum of seat prices (Balcony: ₹147, Second Class: ₹110)
  const baseAmount = selectedSeats.reduce((sum, seat) => sum + Number(seat.price || 147), 0);

  // Convenience Fee: 10% of Base Ticket Price
  const convenienceFee = Number((baseAmount * 0.10).toFixed(2));

  // Subtotal subject to GST (Base Amount + Convenience Fee)
  const taxableAmount = baseAmount + convenienceFee;

  // Integrated GST (18% of total amount including convenience fee): split 9% CGST + 9% SGST
  const cgst = Number((taxableAmount * 0.09).toFixed(2));
  const sgst = Number((taxableAmount * 0.09).toFixed(2));

  // Total GST Taxes (18%)
  const taxes = Number((cgst + sgst).toFixed(2));

  // Total Amount Payable = Base Amount + Convenience Fee (10%) + 18% GST
  const totalAmount = Number((taxableAmount + taxes).toFixed(2));

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
        convenienceFee,
        cgst,
        sgst,
        taxes,
        totalAmount,
        seatsCount: selectedSeats.length
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

