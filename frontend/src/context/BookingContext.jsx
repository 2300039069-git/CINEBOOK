import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

const LOCK_DURATION_SECONDS = 300; // 5 minutes

export const BookingProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Seat locking & countdown
  const [lockToken, setLockToken] = useState(null);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [isLockExpired, setIsLockExpired] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (!lockExpiresAt) {
      setSecondsLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((lockExpiresAt - now) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setIsLockExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const toggleSeatSelection = (seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      } else {
        if (prev.length >= 8) {
          alert('You can select a maximum of 8 seats per transaction.');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const startSeatLock = () => {
    if (selectedSeats.length === 0) return null;
    const token = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + LOCK_DURATION_SECONDS * 1000;
    
    setLockToken(token);
    setLockExpiresAt(expiresAt);
    setIsLockExpired(false);
    return token;
  };

  const releaseSeatLock = () => {
    setLockToken(null);
    setLockExpiresAt(null);
    setSecondsLeft(null);
    setIsLockExpired(false);
    setSelectedSeats([]);
  };

  const clearBooking = () => {
    setSelectedMovie(null);
    setSelectedTheatre(null);
    setSelectedShow(null);
    setSelectedSeats([]);
    releaseSeatLock();
  };

  // Pricing calculations
  const baseAmount = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  const convenienceFeePerTicket = 25;
  const convenienceFee = selectedSeats.length * convenienceFeePerTicket;
  const subtotal = baseAmount + convenienceFee;
  const gstRate = 0.18; // 18% GST on convenience fee
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
        secondsLeft,
        isLockExpired,
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
