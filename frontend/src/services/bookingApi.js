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
      if (err.status === 409 || err.response?.status === 409 || err.message?.toLowerCase().includes('already booked')) {
        const conflictErr = new Error(err.message || 'Seat already booked');
        conflictErr.status = 409;
        conflictErr.response = err.response;
        throw conflictErr;
      }
      if (err.status === 401 || err.response?.status === 401) {
        const authErr = new Error('Authentication required to reserve seats. Please log in.');
        authErr.status = 401;
        authErr.response = err.response;
        throw authErr;
      }
      console.warn('Backend seat lock error:', err.message);
      throw err;
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
      if (err.status === 409 || err.response?.status === 409 || err.message?.toLowerCase().includes('already booked')) {
        const conflictErr = new Error(err.message || 'Seat already booked');
        conflictErr.status = 409;
        conflictErr.response = err.response;
        throw conflictErr;
      }
      if (err.status === 401 || err.response?.status === 401) {
        const authErr = new Error('Authentication required. Please sign in to book.');
        authErr.status = 401;
        authErr.response = err.response;
        throw authErr;
      }
      console.warn('Backend booking error:', err.message);
      throw err;
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
