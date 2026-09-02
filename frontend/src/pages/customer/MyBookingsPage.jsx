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
  Sparkles,
  CreditCard,
  ShieldCheck,
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  
  // Instant Bank Refund Modal State
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReceipt, setRefundReceipt] = useState(null);

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

  // Execute Automated Direct Bank Refund
  const handleExecuteAutomatedRefund = () => {
    if (!selectedBookingForCancel) return;

    setIsRefunding(true);

    setTimeout(() => {
      const utrRef = `UTR-IMPS-RFND-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const refundAmount = selectedBookingForCancel.baseAmount || 400;

      const updated = bookings.map((b) => {
        if (b.bookingId === selectedBookingForCancel.bookingId) {
          return {
            ...b,
            status: 'CANCELLED & REFUNDED',
            refundAmount: refundAmount,
            refundUtr: utrRef,
            refundedAt: new Date().toISOString()
          };
        }
        return b;
      });

      setBookings(updated);
      localStorage.setItem('cinebook_bookings', JSON.stringify(updated));

      setIsRefunding(false);
      setRefundReceipt({
        bookingId: selectedBookingForCancel.bookingId,
        refundAmount,
        utrRef,
        movieTitle: selectedBookingForCancel.movie?.title || 'Pushpa 2: The Rule',
        seats: selectedBookingForCancel.seats?.map((s) => s.id).join(', '),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }, 1500);
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'CANCELLED') return b.status.includes('CANCELLED');
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
            My Bookings & Tickets
          </h1>
          <p className="text-xs text-theme-muted mt-0.5">
            Instant 1-click ticket cancellation with direct automated bank account refund
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl">
          {['ALL', 'CONFIRMED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              {tab === 'ALL' ? 'All Bookings' : tab === 'CONFIRMED' ? 'Confirmed' : 'Cancelled / Refunded'}
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
            const isCancelled = b.status.includes('CANCELLED');
            return (
              <div
                key={b.bookingId}
                className={`p-6 rounded-3xl glass-panel transition-all ${
                  isCancelled ? 'opacity-80 border-rose-500/30' : 'hover:border-pink-500'
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

                      {/* Refund UTR Details badge if cancelled */}
                      {isCancelled && b.refundUtr && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Direct Bank Refund: ₹{b.refundAmount || b.baseAmount}.00 (Ref: {b.refundUtr})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[var(--theme-border)]">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-black text-theme-muted block">Paid Amount</span>
                      <span className="text-base font-black gradient-text-neon">₹{b.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCancelled ? (
                        <>
                          <Link
                            to={`/booking-confirmation/${b.bookingId}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card hover:border-pink-500 text-theme-primary text-xs font-bold transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-pink-500" />
                            <span>View QR Ticket</span>
                          </Link>

                          <button
                            onClick={() => {
                              setSelectedBookingForCancel(b);
                              setRefundReceipt(null);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Cancel & Instant Refund</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> 100% Refunded to Bank
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- AUTOMATED INSTANT BANK REFUND MODAL --- */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full glass-panel rounded-3xl p-6 space-y-5 border border-rose-500/40 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-theme-primary">Automated Instant Bank Refund</h3>
                  <p className="text-[11px] text-theme-muted">Direct transfer to your original payment account</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForCancel(null)}
                className="p-1 rounded-lg text-theme-muted hover:text-theme-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!refundReceipt ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl glass-card space-y-2 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Movie Title:</span>
                    <span className="font-bold text-theme-primary">{selectedBookingForCancel.movie?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Confirmed Seats:</span>
                    <span className="font-mono font-black text-pink-500">
                      {selectedBookingForCancel.seats?.map((s) => s.id).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--theme-border)]">
                    <span className="text-theme-muted font-bold">Direct Refund Amount:</span>
                    <span className="text-base font-black text-emerald-400">
                      ₹{selectedBookingForCancel.baseAmount || 400}.00
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-emerald-400">
                  <div className="flex items-center gap-1.5 font-black">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Instant Direct Bank Payout Policy</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Your base ticket amount will be transferred automatically via instant IMPS/UPI back into your source account within 60 seconds.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForCancel(null)}
                    className="flex-1 py-3 rounded-2xl glass-card text-theme-muted hover:text-theme-primary font-bold transition-all"
                  >
                    Keep My Booking
                  </button>

                  <button
                    type="button"
                    disabled={isRefunding}
                    onClick={handleExecuteAutomatedRefund}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isRefunding ? 'Processing Refund...' : 'Confirm & Transfer to Bank'}
                  </button>
                </div>
              </div>
            ) : (
              /* REFUND RECEIPT DISPLAY */
              <div className="space-y-4 animate-scale-up text-xs">
                <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-black text-emerald-300">REFUND TRANSFERRED TO BANK!</h4>
                  <p className="text-xs text-white font-bold">
                    ₹{refundReceipt.refundAmount}.00 successfully credited to your bank account.
                  </p>
                </div>

                <div className="p-4 rounded-2xl glass-card space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Bank IMPS UTR:</span>
                    <span className="font-bold text-emerald-400">{refundReceipt.utrRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Booking Reference:</span>
                    <span className="text-white font-bold">{refundReceipt.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Transferred At:</span>
                    <span className="text-zinc-300">{refundReceipt.time}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase shadow-glow-pink cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
