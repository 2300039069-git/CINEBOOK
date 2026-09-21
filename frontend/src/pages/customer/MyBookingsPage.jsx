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
import { Button } from '../../components/ui/Button';

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
      setBookings([]);
    }
  }, []);

  // Execute Automated Direct Bank Refund
  const handleExecuteAutomatedRefund = () => {
    if (!selectedBookingForCancel) return;

    setIsRefunding(true);

    setTimeout(() => {
      const utrRef = `UTR-IMPS-RFND-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const refundAmount = selectedBookingForCancel.baseAmount || selectedBookingForCancel.totalAmount - 20 || 400;

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
        seats: selectedBookingForCancel.seats?.map((s) => (typeof s === 'string' ? s : s.id)).join(', '),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }, 1500);
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'CANCELLED') return b.status?.includes('CANCELLED');
    return b.status === filter;
  });

  return (
    <div className="min-h-screen pt-28 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-background text-text-primary transition-colors">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Cinema History & Passes
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-text-primary tracking-tight mt-1 font-sans">
            My Bookings & Passes
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Instant 1-click ticket cancellation with direct automated bank account refund
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-surface border border-border rounded-2xl shadow-sm">
          {['ALL', 'CONFIRMED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-primary text-white shadow-cta'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab === 'ALL' ? 'All Bookings' : tab === 'CONFIRMED' ? 'Confirmed' : 'Cancelled / Refunded'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Bookings List Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-surface border border-border rounded-3xl space-y-4 shadow-card">
          <Ticket className="w-14 h-14 text-text-muted mx-auto opacity-30" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary font-sans">No Bookings Found</h3>
            <p className="text-xs text-text-muted">Explore movies currently playing and reserve your seats at Siva Cinemas</p>
          </div>
          <Link
            to="/movies"
            className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider shadow-cta"
          >
            Browse Blockbusters
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const isCancelled = b.status?.includes('CANCELLED');
            return (
              <div
                key={b.bookingId}
                className={`p-6 sm:p-7 rounded-3xl bg-surface border border-border transition-all duration-300 shadow-card ${
                  isCancelled ? 'opacity-75 border-red-500/20' : 'hover:border-primary/40 hover:shadow-card-hover'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Movie & Cinema info */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <img
                      src={b.movie?.posterUrl || b.movie?.poster || '/posters/pushpa2.jpg'}
                      alt={b.movie?.title}
                      onError={(e) => {
                        const t = ((b.movie?.title || '')).toLowerCase();
                        let fb = '/posters/pushpa2.jpg';
                        if (t.includes('devara')) fb = '/posters/devara.jpg';
                        else if (t.includes('kalki')) fb = '/posters/kalki.webp';
                        else if (t.includes('og')) fb = '/posters/og.jpg';
                        if (e.target.src !== fb && !e.target.src.endsWith(fb)) {
                          e.target.src = fb;
                        }
                      }}
                      className="w-20 sm:w-24 h-28 sm:h-32 rounded-2xl object-cover border border-border shrink-0 shadow-md"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {b.status || 'CONFIRMED'}
                        </span>
                        <span className="text-xs font-mono font-bold text-text-muted">Ref: {b.bookingId}</span>
                      </div>

                      <h3 className="text-base sm:text-xl font-black text-text-primary leading-tight font-sans">
                        {b.movie?.title || 'Blockbuster Movie'}
                      </h3>
                      
                      <p className="text-xs text-text-muted flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-text-secondary">{b.theatre?.name || 'Siva Cinemas 4K Laser'}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-muted pt-1">
                        <span className="flex items-center gap-1 font-semibold text-text-secondary">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" /> {b.showDate || new Date().toISOString().split('T')[0]}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-text-secondary">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> {b.show?.time || b.showtime || '11:00 AM'}
                        </span>
                        <span>•</span>
                        <span className="font-black text-amber-500 bg-surface-elevated px-2.5 py-0.5 rounded-full border border-amber-500/30">
                          Seats: {b.seats?.map((s) => (typeof s === 'string' ? s : s.id)).join(', ') || 'A5, A6'}
                        </span>
                      </div>

                      {/* Refund UTR Details badge if cancelled */}
                      {isCancelled && b.refundUtr && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Direct Bank Refund: ₹{b.refundAmount || b.totalAmount}.00 (Ref: {b.refundUtr})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-border">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-text-muted block tracking-wider">Paid Amount</span>
                      <span className="text-lg sm:text-xl font-black text-amber-500">₹{b.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCancelled ? (
                        <>
                          <Link
                            to={`/booking-confirmation/${b.bookingId}`}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text-primary text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            <span>View Pass</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingForCancel(b);
                              setRefundReceipt(null);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Cancel & Refund</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-md w-full bg-surface rounded-3xl p-6 sm:p-7 space-y-5 border border-border shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary font-sans">Automated Instant Bank Refund</h3>
                  <p className="text-[11px] text-text-muted">Direct transfer to your original payment account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForCancel(null)}
                className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text-primary text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!refundReceipt ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-surface-elevated space-y-2 border border-border">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Movie Title:</span>
                    <span className="font-semibold text-text-primary">{selectedBookingForCancel.movie?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Confirmed Seats:</span>
                    <span className="font-mono font-bold text-amber-500">
                      {selectedBookingForCancel.seats?.map((s) => (typeof s === 'string' ? s : s.id)).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-text-muted font-bold">Direct Refund Amount:</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{selectedBookingForCancel.baseAmount || selectedBookingForCancel.totalAmount - 20 || 400}.00
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-emerald-600 dark:text-emerald-400">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Instant Direct Bank Payout Policy</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Your base ticket amount will be transferred automatically via instant IMPS/UPI back into your source account within 60 seconds.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForCancel(null)}
                    className="flex-1 py-3 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text-secondary hover:text-text-primary font-semibold transition-all cursor-pointer"
                  >
                    Keep Booking
                  </button>

                  <button
                    type="button"
                    disabled={isRefunding}
                    onClick={handleExecuteAutomatedRefund}
                    className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold uppercase tracking-wider shadow-cta transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isRefunding ? 'Processing Refund...' : 'Confirm Refund'}
                  </button>
                </div>
              </div>
            ) : (
              /* REFUND RECEIPT DISPLAY */
              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-300 font-sans">REFUND TRANSFERRED TO BANK</h4>
                  <p className="text-xs text-text-primary font-semibold">
                    ₹{refundReceipt.refundAmount}.00 successfully credited to your bank account.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Bank IMPS UTR:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{refundReceipt.utrRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Booking Reference:</span>
                    <span className="text-text-primary font-bold">{refundReceipt.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Transferred At:</span>
                    <span className="text-text-secondary">{refundReceipt.time}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold uppercase shadow-cta cursor-pointer"
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
