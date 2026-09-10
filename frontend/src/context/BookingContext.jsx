import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../data/mockData';
import { seatLockManager, getShowKey, getTabId } from '../services/seatLockManager';

const BookingContext = createContext();

const LOCK_DURATION_SECONDS = 480; // 8 minutes atomic seat lock

export const BookingProvider = ({ children }) => {
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
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt, selectedSeats.length, currentShowKey, selectedShow?.id]);

  // Toggle seat selection with atomic cross-tab lock verification
  const toggleSeatSelection = async (seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'COUNTER_QUOTA' || seat.quota === 'BOX_OFFICE') return;

    const showKey = getShowKey(selectedShow, selectedTheatre, selectedMovie, selectedDate);
    const exists = selectedSeats.find((s) => s.id === seat.id);

    if (exists) {
      // Unselect and release lock
      await seatLockManager.unlockSeat(showKey, seat.id, selectedShow?.id);
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
      return;
    }

    // Check maximum 8 seats
    if (selectedSeats.length >= 8) {
      alert('You can select a maximum of 8 seats per transaction.');
      return;
    }

    // Check if locked by another tab or already booked
    if (seatLockManager.isSeatLockedByOtherTab(showKey, seat.id)) {
      alert(`Seat ${seat.id} is currently locked by another customer in another session.`);
      return;
    }
    if (seatLockManager.isSeatBooked(showKey, seat.id)) {
      alert(`Seat ${seat.id} is already booked.`);
      return;
    }

    // Lock seat atomically
    const result = await seatLockManager.lockSeat(showKey, seat.id, selectedShow?.id);
    if (!result.success) {
      alert(result.message || `Seat ${seat.id} could not be locked. Please select another seat.`);
      return;
    }

    // Set lock expiry timer if first seat
    const expiresAt = result.expiresAt || (Date.now() + LOCK_DURATION_SECONDS * 1000);
    setLockExpiresAt(expiresAt);
    sessionStorage.setItem('cinebook_tab_lock_expires_at', expiresAt.toString());
    if (result.lockToken) {
      setLockToken(result.lockToken);
      sessionStorage.setItem('cinebook_tab_lock_token', result.lockToken);
    }

    setSelectedSeats((prev) => [...prev, seat]);
  };

  const startSeatLock = () => {
    const showKey = getShowKey(selectedShow, selectedTheatre, selectedMovie, selectedDate);
    selectedSeats.forEach((seat) => {
      seatLockManager.lockSeat(showKey, seat.id, selectedShow?.id);
    });
    const token = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
  const baseAmount = selectedSeats.reduce((sum, seat) => sum + (seat.price || 200), 0);
  const convenienceFeePerTicket = 25;
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * convenienceFeePerTicket : 0;
  const gstRate = 0.18;
  const taxes = Math.round(convenienceFee * gstRate);
  const totalAmount = baseAmount + convenienceFee + taxes;

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

