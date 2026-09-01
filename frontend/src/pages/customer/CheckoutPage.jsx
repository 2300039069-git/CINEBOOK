import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CreditCard,
  Ticket,
  ChevronRight,
  RotateCcw,
  Film,
  MapPin,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedDate,
    selectedSeats,
    secondsLeft,
    isLockExpired,
    baseAmount,
    convenienceFee,
    taxes,
    totalAmount,
    releaseSeatLock
  } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState(user?.email || 'kancharladhanush2003@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');

  const movie = selectedMovie || MOVIES[0];
  const theatre = selectedTheatre || THEATRES[0];
  const show = selectedShow || SAMPLE_SHOWTIMES[0];

  useEffect(() => {
    if (selectedSeats.length === 0) {
      navigate('/movies');
    }
  }, [selectedSeats, navigate]);

  const formatTimer = (secs) => {
    if (secs === null || secs === undefined) return '05:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePayNow = () => {
    if (isLockExpired) {
      alert('Your seat reservation has expired. Please reselect your seats.');
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      const bookingId = `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const confirmedBooking = {
        bookingId,
        movie,
        theatre,
        show,
        showDate: selectedDate || '2026-09-02',
        seats: selectedSeats,
        totalAmount,
        convenienceFee,
        taxes,
        baseAmount,
        paymentId: `pay_rzp_${Date.now()}`,
        paymentMethod,
        customerName: user?.name || 'Dhanush Kancharla',
        customerEmail: email,
        customerPhone: phone,
        status: 'CONFIRMED',
        bookedAt: new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
      localStorage.setItem('cinebook_bookings', JSON.stringify([confirmedBooking, ...existing]));

      navigate(`/booking-confirmation/${bookingId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen py-10 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. SEAT LOCK COUNTDOWN BANNER */}
        <div className={`p-5 rounded-3xl border flex items-center justify-between shadow-md transition-all ${
          isLockExpired
            ? 'bg-rose-500/15 border-rose-500 text-rose-400'
            : (secondsLeft || 300) < 60
            ? 'bg-amber-500/15 border-amber-500 text-amber-400 animate-pulse'
            : 'glass-panel'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-500 border border-pink-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-theme-primary">
                {isLockExpired ? 'Reservation Expired' : 'Temporary Seat Lock Active (5-Minute Guarantee)'}
              </h3>
              <p className="text-xs text-theme-muted mt-0.5">
                {isLockExpired
                  ? 'Your 5-minute seat reservation has expired. Please reselect seats.'
                  : 'Seats are exclusively held for you in the database. Complete checkout before timer ends.'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-black text-theme-muted block tracking-wider">Time Left</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-pink-500">
              {formatTimer(secondsLeft)}
            </span>
          </div>
        </div>

        {/* Lock Expired Modal */}
        {isLockExpired && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="max-w-md w-full glass-panel rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-rose-500">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-theme-primary">Seat Reservation Expired</h2>
              <p className="text-xs text-theme-muted">
                The 5-minute temporary reservation timer elapsed. Please re-select your seats.
              </p>
              <button
                onClick={() => {
                  releaseSeatLock();
                  navigate(`/seat-selection/${show.id}`);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black shadow-md"
              >
                Re-select Seats
              </button>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Contact & Payment Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <div className="p-6 glass-panel rounded-3xl space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-pink-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Share Ticket Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-theme-muted block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 glass-card rounded-2xl text-xs text-theme-primary focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-muted block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 glass-card rounded-2xl text-xs text-theme-primary focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="p-6 glass-panel rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
                <h2 className="text-xs font-black uppercase tracking-wider text-pink-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Instant Payment Method
                </h2>
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                  { id: 'CARD', label: 'Cards', desc: 'Visa, MasterCard, RuPay' },
                  { id: 'NETBANKING', label: 'Net Banking', desc: 'All Major Banks' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      paymentMethod === m.id
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 shadow-md scale-102'
                        : 'glass-card hover:border-pink-500/40'
                    }`}
                  >
                    <p className="text-xs font-black text-theme-primary">{m.label}</p>
                    <p className="text-[10px] text-theme-muted mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl glass-panel text-xs text-emerald-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real-time Concurrency Engine & Instant QR</span>
                </div>
                <p className="text-[11px] text-theme-muted">
                  Seats are permanently saved to Supabase PostgreSQL database immediately upon transaction completion.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Booking Summary Card */}
          <div className="space-y-4">
            <div className="p-6 glass-panel rounded-3xl space-y-5 h-fit">
              {/* Mini Movie Header */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-[var(--theme-border)]">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-14 h-20 rounded-xl object-cover border border-[var(--theme-border)] shadow-md flex-shrink-0"
                />
                <div>
                  <h3 className="text-sm font-black text-theme-primary">{movie.title}</h3>
                  <p className="text-xs text-theme-secondary mt-0.5">{theatre.name}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full glass-card text-[10px] font-bold text-cyan-500">
                    {show.format || '2D'} • {show.time}
                  </span>
                </div>
              </div>

              {/* Itemized Bill */}
              <div className="space-y-2.5 text-xs text-theme-secondary">
                <div className="flex justify-between">
                  <span className="text-theme-muted">Seats ({selectedSeats.length})</span>
                  <span className="font-bold text-theme-primary">{selectedSeats.map((s) => s.id).join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Ticket Base Price</span>
                  <span className="font-semibold text-theme-primary">₹{baseAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Convenience Fee (₹25/seat)</span>
                  <span className="font-semibold text-theme-primary">₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Integrated GST (18%)</span>
                  <span className="font-semibold text-theme-primary">₹{taxes}</span>
                </div>

                <div className="pt-3 border-t border-[var(--theme-border)] flex justify-between items-center text-sm font-black">
                  <span className="text-theme-primary">Total Payable</span>
                  <span className="text-xl gradient-text-neon font-black">₹{totalAmount}</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
                disabled={processing || isLockExpired}
                className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  processing
                    ? 'bg-white/10 text-theme-muted cursor-wait'
                    : 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-glow-pink transform hover:scale-102'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{processing ? 'Processing Payment...' : `Pay ₹${totalAmount}`}</span>
              </button>

              <p className="text-[10px] text-center text-theme-muted">
                100% Refundable up to 2 hours before showtime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
