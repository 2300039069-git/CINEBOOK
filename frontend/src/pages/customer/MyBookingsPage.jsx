import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Film,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const saved = localStorage.getItem('cinebook_bookings');
    if (saved && JSON.parse(saved).length > 0) {
      setBookings(JSON.parse(saved));
    } else {
      const defaultBooking = {
        bookingId: 'CB-2026-894120',
        movie: MOVIES[0],
        theatre: THEATRES[0],
        show: SAMPLE_SHOWTIMES[0],
        showDate: '2026-09-02',
        seats: [
          { id: 'C5', row: 'C', number: 5, price: 200 },
          { id: 'C6', row: 'C', number: 6, price: 200 }
        ],
        baseAmount: 400,
        convenienceFee: 50,
        taxes: 9,
        totalAmount: 459,
        paymentId: 'pay_rzp_98412091',
        paymentMethod: 'UPI',
        status: 'CONFIRMED',
        bookedAt: new Date().toISOString()
      };
      setBookings([defaultBooking]);
      localStorage.setItem('cinebook_bookings', JSON.stringify([defaultBooking]));
    }
  }, []);

  const handleCancelBooking = (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The ticket amount will be automatically refunded.')) {
      return;
    }

    const updated = bookings.map((b) => {
      if (b.bookingId === bookingId) {
        return {
          ...b,
          status: 'CANCELLED',
          refundAmount: b.baseAmount,
          cancelledAt: new Date().toISOString()
        };
      }
      return b;
    });

    setBookings(updated);
    localStorage.setItem('cinebook_bookings', JSON.stringify(updated));
    alert('Booking cancelled successfully. Instant refund initiated.');
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  return (
    <div className="min-h-screen py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--theme-border)]">
        <div>
          <span className="text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Cinema History & Digital Passes
          </span>
          <h1 className="text-3xl font-display font-black text-theme-primary tracking-tight mt-1">
            My Bookings
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl">
          {['ALL', 'CONFIRMED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                filter === tab
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              {tab === 'ALL' ? 'All Bookings' : tab === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl space-y-3">
          <Ticket className="w-12 h-12 text-theme-muted mx-auto opacity-40" />
          <h3 className="text-base font-black text-theme-primary">No Bookings Found</h3>
          <p className="text-xs text-theme-muted">Explore movies currently playing and reserve your seats</p>
          <Link
            to="/movies"
            className="inline-block mt-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black shadow-glow-pink"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const isCancelled = b.status === 'CANCELLED';
            return (
              <div
                key={b.bookingId}
                className={`p-6 rounded-3xl glass-panel transition-all ${
                  isCancelled ? 'opacity-60 border-rose-500/30' : 'hover:border-pink-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Movie & Cinema info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={b.movie?.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop'}
                      alt={b.movie?.title}
                      className="w-16 h-24 rounded-2xl object-cover border border-[var(--theme-border)] shadow-md flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isCancelled
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-theme-muted">Ref: {b.bookingId}</span>
                      </div>

                      <h3 className="text-lg font-black text-theme-primary">{b.movie?.title}</h3>
                      <p className="text-xs text-theme-secondary flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-pink-500" />
                        <span>{b.theatre?.name}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-theme-secondary pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-pink-500" /> {b.showDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> {b.show?.time || '11:00 AM'}
                        </span>
                        <span>•</span>
                        <span className="font-black text-theme-primary">Seats: {b.seats?.map((s) => s.id).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[var(--theme-border)]">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-black text-theme-muted block">Paid Amount</span>
                      <span className="text-base font-black gradient-text-neon">₹{b.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCancelled && (
                        <>
                          <Link
                            to={`/booking-confirmation/${b.bookingId}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card hover:border-pink-500 text-theme-primary text-xs font-bold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-pink-500" />
                            <span>View QR Ticket</span>
                          </Link>

                          <button
                            onClick={() => handleCancelBooking(b.bookingId)}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-bold transition-all"
                          >
                            Cancel Ticket
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
