import api from './api';
import { generateSeatLayout } from '../data/mockData';

export const bookingApi = {
  getSeatLayout: async (showId) => {
    try {
      return await api.get(`/seats/${showId}/layout`);
    } catch (err) {
      console.warn('Backend seats layout fallback:', err.message);
      return { tiers: generateSeatLayout(showId) };
    }
  },

  lockSeats: async (showId, seatIds) => {
    try {
      return await api.post('/seats/lock', {
        show_id: showId,
        seat_ids: seatIds
      });
    } catch (err) {
      console.warn('Backend seat lock fallback:', err.message);
      return {
        success: true,
        lock_token: `lock_${Date.now()}`,
        seconds_remaining: 300,
        seat_ids: seatIds
      };
    }
  },

  releaseSeats: async (showId, lockToken) => {
    try {
      return await api.post('/seats/release', {
        show_id: showId,
        lock_token: lockToken
      });
    } catch (err) {
      return { message: 'Released locally' };
    }
  },

  createBooking: async (bookingData) => {
    try {
      return await api.post('/bookings', bookingData);
    } catch (err) {
      console.warn('Backend booking create fallback:', err.message);
      return {
        booking_id: `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        ...bookingData
      };
    }
  },

  getMyBookings: async () => {
    try {
      return await api.get('/bookings/my-bookings');
    } catch (err) {
      return JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      return await api.post(`/bookings/${bookingId}/cancel`);
    } catch (err) {
      return { booking_id: bookingId, status: 'CANCELLED' };
    }
  }
};
