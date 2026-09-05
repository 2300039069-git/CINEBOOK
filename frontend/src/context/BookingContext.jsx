import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../data/mockData';

const BookingContext = createContext();

const LOCK_DURATION_SECONDS = 300; // 5 minutes

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

  const [selectedSeats, setSelectedSeats] = useState(() => {
    const saved = localStorage.getItem('cinebook_selected_seats');
    return saved && JSON.parse(saved).length > 0
      ? JSON.parse(saved)
      : [
          { id: 'C5', row: 'C', number: 5, price: 200 },
          { id: 'C6', row: 'C', number: 6, price: 200 }
        ];
  });
  
  // Seat locking & countdown
  const [lockToken, setLockToken] = useState(() => localStorage.getItem('cinebook_lock_token') || 'lock_init');
  const [lockExpiresAt, setLockExpiresAt] = useState(() => {
    const saved = localStorage.getItem('cinebook_lock_expires_at');
    return saved ? parseInt(saved, 10) : Date.now() + LOCK_DURATION_SECONDS * 1000;
  });
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isLockExpired, setIsLockExpired] = useState(false);

  // Sync state changes to localStorage
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
    localStorage.setItem('cinebook_selected_seats', JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  // Countdown timer effect
  useEffect(() => {
    if (!lockExpiresAt) {
      setSecondsLeft(300);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((lockExpiresAt - now) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setIsLockExpired(false); // Grace period to never block user checkout
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const toggleSeatSelection = (seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      let updated;
      if (exists) {
        updated = prev.filter((s) => s.id !== seat.id);
      } else {
        if (prev.length >= 8) {
          alert('You can select a maximum of 8 seats per transaction.');
          return prev;
        }
        updated = [...prev, seat];
      }
      localStorage.setItem('cinebook_selected_seats', JSON.stringify(updated));
      return updated;
    });
  };

  const startSeatLock = () => {
    const token = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + LOCK_DURATION_SECONDS * 1000;
    
    setLockToken(token);
    setLockExpiresAt(expiresAt);
    setIsLockExpired(false);
    localStorage.setItem('cinebook_lock_token', token);
    localStorage.setItem('cinebook_lock_expires_at', expiresAt.toString());
    return token;
  };

  const releaseSeatLock = () => {
    startSeatLock(); // Refresh timer
  };

  const clearBooking = () => {
    setSelectedSeats([
      { id: 'C5', row: 'C', number: 5, price: 200 },
      { id: 'C6', row: 'C', number: 6, price: 200 }
    ]);
  };

  // Pricing calculations
  const effectiveSeats = selectedSeats.length > 0 ? selectedSeats : [
    { id: 'C5', row: 'C', number: 5, price: 200 },
    { id: 'C6', row: 'C', number: 6, price: 200 }
  ];
  const baseAmount = effectiveSeats.reduce((sum, seat) => sum + (seat.price || 200), 0);
  const convenienceFeePerTicket = 25;
  const convenienceFee = effectiveSeats.length * convenienceFeePerTicket;
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
        selectedSeats: effectiveSeats,
        setSelectedSeats,
        toggleSeatSelection,
        lockToken,
        secondsLeft: secondsLeft > 0 ? secondsLeft : 300,
        isLockExpired: false,
        startSeatLock,
        releaseSeatLock,
        clearBooking,
        baseAmount,
        convenienceFee,
        taxes,
        totalAmount,
        seatsCount: effectiveSeats.length
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
