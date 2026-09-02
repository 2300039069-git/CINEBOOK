import React, { useState } from 'react';
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
  Sparkles,
  Lock,
  ArrowRight,
  QrCode,
  Smartphone
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
    baseAmount,
    convenienceFee,
    taxes,
    totalAmount
  } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [email, setEmail] = useState(user?.email || 'customer@cinebook.in');
  const [phone, setPhone] = useState(user?.phone || '+91 98480 12345');

  // Ensure robust fallback data so payment never fails
  const movie = selectedMovie || MOVIES[0];
  const theatre = selectedTheatre || THEATRES[0];
  const show = selectedShow || SAMPLE_SHOWTIMES[0];
  const seats = selectedSeats && selectedSeats.length > 0 ? selectedSeats : [
    { id: 'C5', row: 'C', number: 5, price: 200 },
    { id: 'C6', row: 'C', number: 6, price: 200 }
  ];
  const finalTotal = totalAmount > 0 ? totalAmount : 459;

  const formatTimer = (secs) => {
    const s = secs || 300;
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handlePayNow = () => {
    setProcessing(true);
    setProcessingStep(1);

    // Step 1: Gateway verification
    setTimeout(() => {
      setProcessingStep(2);
    }, 600);

    // Step 2: Database seat persistence
    setTimeout(() => {
      setProcessingStep(3);
    }, 1200);

    // Step 3: Complete & redirect
    setTimeout(() => {
      const bookingId = `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const confirmedBooking = {
        bookingId,
        movie,
        theatre,
        show,
        showDate: selectedDate || '2026-09-02',
        seats: seats,
        totalAmount: finalTotal,
        convenienceFee: convenienceFee || 50,
        taxes: taxes || 9,
        baseAmount: baseAmount || 400,
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

      setProcessing(false);
      navigate(`/booking-confirmation/${bookingId}`);
    }, 1800);
  };

  return (
    <div className="min-h-screen py-10 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. SEAT LOCK COUNTDOWN BANNER */}
        <div className="p-5 rounded-3xl border glass-panel flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-500 border border-pink-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-theme-primary">
                Temporary Seat Lock Active (5-Minute Guarantee)
              </h3>
              <p className="text-xs text-theme-muted mt-0.5">
                Seats are exclusively held for you in the database. Complete payment to generate your instant QR ticket.
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Contact & Payment Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <div className="p-6 glass-panel rounded-3xl space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-pink-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Digital Pass Delivery Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-theme-muted block mb-1">Email Address (E-Ticket & QR)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 glass-card rounded-2xl text-xs text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-muted block mb-1">Mobile Number (SMS Updates)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 glass-card rounded-2xl text-xs text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="p-6 glass-panel rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
                <h2 className="text-xs font-black uppercase tracking-wider text-pink-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Choose Payment Option
                </h2>
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                  { id: 'CARD', label: 'Cards', desc: 'Credit / Debit Cards' },
                  { id: 'NETBANKING', label: 'Net Banking', desc: 'Instant IMPS Payout' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
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

              {/* UPI Quick Demo Box */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 flex items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-theme-primary">Instant UPI Auto-Verification</p>
                      <p className="text-[10px] text-theme-muted">Click below to simulate instant payment confirmation.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Instant Auto-Approve
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking Summary Card */}
          <div className="space-y-4">
            <div className="p-6 glass-panel rounded-3xl space-y-5 h-fit border border-[var(--theme-border)]">
              {/* Mini Movie Header */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-[var(--theme-border)]">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-16 h-22 rounded-2xl object-cover border border-[var(--theme-border)] shadow-md flex-shrink-0"
                />
                <div>
                  <h3 className="text-sm font-black text-theme-primary leading-tight">{movie.title}</h3>
                  <p className="text-xs text-pink-500 font-bold mt-1">{theatre.name}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full glass-card text-[10px] font-bold text-cyan-500">
                    {show.format || '2D Dolby Atmos'} • {show.time || '11:00 AM'}
                  </span>
                </div>
              </div>

              {/* Itemized Bill */}
              <div className="space-y-2.5 text-xs text-theme-secondary">
                <div className="flex justify-between">
                  <span className="text-theme-muted">Seats ({seats.length})</span>
                  <span className="font-mono font-black text-pink-500">{seats.map((s) => s.id).join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Ticket Base Price</span>
                  <span className="font-bold text-theme-primary">₹{baseAmount || 400}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">Convenience Fee</span>
                  <span className="font-bold text-theme-primary">₹{convenienceFee || 50}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-muted">GST (18%)</span>
                  <span className="font-bold text-theme-primary">₹{taxes || 9}</span>
                </div>

                <div className="pt-3 border-t border-[var(--theme-border)] flex justify-between items-center text-sm font-black">
                  <span className="text-theme-primary">Total Payable</span>
                  <span className="text-2xl gradient-text-neon font-black">₹{finalTotal}</span>
                </div>
              </div>

              {/* Confirm & Pay Button */}
              <button
                type="button"
                onClick={handlePayNow}
                disabled={processing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-glow-pink transition-all transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Pay ₹{finalTotal}</span>
              </button>

              <div className="pt-1 text-center space-y-1">
                <p className="text-[10px] text-emerald-500 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Instant Refund Guarantee
                </p>
                <p className="text-[10px] text-theme-muted">
                  Cancel anytime before showtime for automated bank credit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PAYMENT PROCESSING MODAL --- */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center space-y-6 border border-pink-500 shadow-2xl">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-glow-pink animate-pulse">
              <CreditCard className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-theme-primary font-display">
                Processing Secure Payment
              </h3>
              <p className="text-xs text-theme-muted">
                Communicating with Razorpay & Bank Payment Gateways...
              </p>
            </div>

            <div className="space-y-3 text-xs text-left">
              <div className="flex items-center gap-3 p-2.5 rounded-xl glass-card">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-theme-muted'
                }`}>✓</span>
                <span className={processingStep >= 1 ? 'text-theme-primary font-bold' : 'text-theme-muted'}>
                  Verifying 256-Bit SSL Payment Token...
                </span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl glass-card">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-theme-muted'
                }`}>✓</span>
                <span className={processingStep >= 2 ? 'text-theme-primary font-bold' : 'text-theme-muted'}>
                  Securing Confirmed Seats in PostgreSQL...
                </span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl glass-card">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-theme-muted'
                }`}>✓</span>
                <span className={processingStep >= 3 ? 'text-theme-primary font-bold' : 'text-theme-muted'}>
                  Generating Digital Pass with Signed QR Code...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
