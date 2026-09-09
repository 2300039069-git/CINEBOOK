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
        seats: selectedBookingForCancel.seats?.map((s) => (typeof s === 'string' ? s : s.id)).join(', '),
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
    <div className="min-h-screen py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 bg-[#090A0E] text-slate-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2332]">
        <div>
          <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Cinema History & Digital Passes
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            My Bookings & Tickets
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant 1-click ticket cancellation with direct automated bank account refund
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#11141D] border border-[#1E2332] rounded-xl">
          {['ALL', 'CONFIRMED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#E50914] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Bookings' : tab === 'CONFIRMED' ? 'Confirmed' : 'Cancelled / Refunded'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-[#11141D] border border-[#1E2332] rounded-xl space-y-3">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400">Explore movies currently playing and reserve your seats</p>
          <Link
            to="/movies"
            className="inline-block mt-2 px-5 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold shadow-sm"
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
                className={`p-5 sm:p-6 rounded-xl bg-[#11141D] border border-[#1E2332] transition-all ${
                  isCancelled ? 'opacity-80 border-red-500/20' : 'hover:border-slate-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Movie & Cinema info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={b.movie?.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop'}
                      alt={b.movie?.title}
                      className="w-16 h-22 rounded-lg object-cover border border-[#1E2332] flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCancelled
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-400">Ref: {b.bookingId}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white">{b.movie?.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.theatre?.name}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#E50914]" /> {b.showDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#F59E0B]" /> {b.show?.time || '11:00 AM'}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-white">Seats: {b.seats?.map((s) => (typeof s === 'string' ? s : s.id)).join(', ')}</span>
                      </div>

                      {/* Refund UTR Details badge if cancelled */}
                      {isCancelled && b.refundUtr && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Direct Bank Refund: ₹{b.refundAmount || b.baseAmount}.00 (Ref: {b.refundUtr})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[#1E2332]">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Paid Amount</span>
                      <span className="text-base font-extrabold text-[#F59E0B]">₹{b.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCancelled ? (
                        <>
                          <Link
                            to={`/booking-confirmation/${b.bookingId}`}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181C28] hover:bg-[#1D2232] border border-[#1E2332] text-white text-xs font-semibold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#E50914]" />
                            <span>View Pass</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingForCancel(b);
                              setRefundReceipt(null);
                            }}
                            className="px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Cancel & Refund</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
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
          <div className="max-w-md w-full bg-[#11141D] rounded-2xl p-6 space-y-5 border border-[#1E2332] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2332]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Automated Instant Bank Refund</h3>
                  <p className="text-[11px] text-slate-400">Direct transfer to your original payment account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForCancel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!refundReceipt ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#181C28] space-y-2 border border-[#1E2332]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Movie Title:</span>
                    <span className="font-semibold text-white">{selectedBookingForCancel.movie?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confirmed Seats:</span>
                    <span className="font-mono font-bold text-[#E50914]">
                      {selectedBookingForCancel.seats?.map((s) => (typeof s === 'string' ? s : s.id)).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#1E2332]">
                    <span className="text-slate-400 font-bold">Direct Refund Amount:</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      ₹{selectedBookingForCancel.baseAmount || 400}.00
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-emerald-400">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Instant Direct Bank Payout Policy</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Your base ticket amount will be transferred automatically via instant IMPS/UPI back into your source account within 60 seconds.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForCancel(null)}
                    className="flex-1 py-2.5 rounded-lg bg-[#181C28] hover:bg-[#1D2232] border border-[#1E2332] text-slate-300 hover:text-white font-semibold transition-all"
                  >
                    Keep My Booking
                  </button>

                  <button
                    type="button"
                    disabled={isRefunding}
                    onClick={handleExecuteAutomatedRefund}
                    className="flex-1 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isRefunding ? 'Processing Refund...' : 'Confirm Refund'}
                  </button>
                </div>
              </div>
            ) : (
              /* REFUND RECEIPT DISPLAY */
              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-300">REFUND TRANSFERRED TO BANK</h4>
                  <p className="text-xs text-white font-semibold">
                    ₹{refundReceipt.refundAmount}.00 successfully credited to your bank account.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#181C28] border border-[#1E2332] space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank IMPS UTR:</span>
                    <span className="font-bold text-emerald-400">{refundReceipt.utrRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking Reference:</span>
                    <span className="text-white font-bold">{refundReceipt.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transferred At:</span>
                    <span className="text-slate-300">{refundReceipt.time}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="w-full py-2.5 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white font-bold uppercase shadow-sm cursor-pointer"
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
