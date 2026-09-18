import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { seatLockManager, getShowKey } from '../../services/seatLockManager';
import { bookingApi } from '../../services/bookingApi';
import {
  createUpiQrOrder,
  getUpiPaymentStatus,
  simulateUpiPaymentSuccess,
  verifyUpiUtr
} from '../../services/paymentApi';
import {
  ShieldCheck,
  Ticket,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  QrCode,
  Clock,
  Sparkles,
  Smartphone,
  CreditCard,
  Lock,
  ExternalLink,
  X,
  ChevronRight,
  Copy,
  Check,
  Zap,
  Info
} from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedDate,
    selectedSeats,
    baseAmount,
    totalAmount: contextTotalAmount,
    lockToken,
    clearBooking
  } = useBooking();
  const { toast, addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UPI Payment Modal State
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiOrder, setUpiOrder] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);

  // Fallback UTR manual verification state
  const [showUtrFallback, setShowUtrFallback] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Refs for polling, countdown, and 5-second panic-free UTR auto-reveal
  const pollIntervalRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const fiveSecTimerRef = useRef(null);

  const bookingDetails = location.state || {};
  const movie = bookingDetails.movie || selectedMovie || {
    title: 'Pushpa 2: The Rule (2024)',
    posterUrl: '/posters/pushpa2.jpg'
  };
  const theatre = bookingDetails.theatre || selectedTheatre || {
    name: 'Siva Cinemas 4K Laser',
    address: 'Near Old Bus Stand, Guntur'
  };
  const show = bookingDetails.show || selectedShow;
  const seats = bookingDetails.seats || selectedSeats || [];
  const showDate = bookingDetails.date || selectedDate || new Date().toISOString().split('T')[0];

  const numSeats = seats.length > 0 ? seats.length : 1;
  const calculatedBasePrice = seats.reduce((acc, s) => {
    const p = typeof s === 'object' && s?.price ? Number(s.price) : (show?.price || 150);
    return acc + p;
  }, 0) || (numSeats * (show?.price || 150));

  const baseTicketPrice = baseAmount || calculatedBasePrice;
  const flatConvenienceFee = 10.00;
  const gstOnConvenienceFee = 1.80; // 18% GST on ₹10 (SAC 998599)
  const totalPayable = Number((baseTicketPrice + flatConvenienceFee + gstOnConvenienceFee).toFixed(2));

  const currentShowKey = getShowKey(show, theatre, movie, showDate);

  useEffect(() => {
    if (!show || seats.length === 0) {
      navigate('/movies', { replace: true });
    }
  }, [show, seats, navigate]);

  // Clean up polling and timer intervals on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (fiveSecTimerRef.current) clearTimeout(fiveSecTimerRef.current);
    };
  }, []);

  // Format seat objects helper
  const getFormattedSeats = () => {
    return seats.map((s) => ({
      id: typeof s === 'string' ? s : s.id,
      row: typeof s === 'string' ? s.charAt(0) : s.row || s.id?.charAt(0) || 'A',
      number: typeof s === 'string' ? parseInt(s.slice(1)) || 1 : s.number || 1,
      tier:
        typeof s === 'object' && s.tier
          ? s.tier
          : ['A', 'B', 'C', 'D'].includes(typeof s === 'string' ? s.charAt(0) : s.id?.charAt(0))
          ? 'BALCONY'
          : 'SECOND_CLASS',
      price:
        typeof s === 'object' && s.price
          ? s.price
          : ['A', 'B', 'C', 'D'].includes(typeof s === 'string' ? s.charAt(0) : s.id?.charAt(0))
          ? 147
          : 84
    }));
  };

  // Complete and finalize the booking once payment is confirmed
  const finalizeBooking = async (orderId, paymentId, utrNumber = '') => {
    const bookingId = upiOrder?.booking_id || `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const heldLockToken =
      (lockToken && lockToken !== 'lock_init' ? lockToken : null) ||
      seatLockManager.getHeldToken(currentShowKey) ||
      `lock_${Date.now()}`;

    const formattedSeatsList = getFormattedSeats();

    const confirmedBooking = {
      bookingId,
      movie: {
        id: movie?.id || 'mv-001',
        title: movie?.title || show?.movieTitle || 'Movie Ticket',
        posterUrl: movie?.posterUrl || show?.posterUrl || '/posters/pushpa2.jpg',
        genre: movie?.genre || 'Action, Drama',
        language: movie?.language || 'Telugu'
      },
      theatre: {
        id: theatre?.id || 'th-001',
        name: theatre?.name || show?.theatreName || 'Cinebook Cinema',
        address: theatre?.address || 'Main Screen'
      },
      show: {
        id: show?.id || 'sh-001',
        time: show?.time || '11:00 AM',
        format: show?.format || '2D Dolby Atmos',
        language: show?.language || 'Telugu',
        price: show?.price || 150
      },
      showDate,
      seats: formattedSeatsList,
      baseAmount: baseTicketPrice,
      convenienceFee: flatConvenienceFee,
      taxes: gstOnConvenienceFee,
      totalAmount: totalPayable,
      paymentId: paymentId || `upi_pay_${Date.now()}`,
      orderId: orderId || `upi_ord_${Date.now()}`,
      paymentMethod: 'UPI_QR',
      utrNumber: utrNumber || `UPI-${Date.now()}`,
      customerName: user?.name || 'Valued Cinema Guest',
      customerEmail: user?.email || 'customer@cinebook.in',
      customerPhone: user?.phone || '9848012345',
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString()
    };

    // 1. Convert Seat Locks to Confirmed Bookings in local manager & broadcast
    seatLockManager.confirmBooking(currentShowKey, seats, bookingId, show?.id);

    // 2. Persist in Local Storage
    const existingBookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
    localStorage.setItem(
      'cinebook_bookings',
      JSON.stringify([confirmedBooking, ...existingBookings.filter((b) => b.bookingId !== bookingId)])
    );
    localStorage.setItem('cinebook_latest_booking', JSON.stringify(confirmedBooking));

    // 3. Sync with Backend Database API (fail-safe)
    try {
      await bookingApi.createBooking({
        show_id: show?.id || 'sh-001',
        movie_id: movie?.id || 'mv-001',
        theatre_id: theatre?.id || 'th-001',
        show_date: showDate,
        show_time: show?.time || '11:00 AM',
        lock_token: heldLockToken,
        booking_id: bookingId,
        payment_id: paymentId || `upi_pay_${Date.now()}`,
        order_id: orderId,
        booking_status: 'CONFIRMED',
        seats: formattedSeatsList,
        base_amount: baseTicketPrice,
        convenience_fee: flatConvenienceFee,
        taxes: gstOnConvenienceFee,
        total_amount: totalPayable,
        customer_name: user?.name || 'Valued Cinema Guest',
        customer_email: user?.email || 'customer@cinebook.in',
        customer_phone: user?.phone || '9848012345'
      });
    } catch (backendErr) {
      console.warn('Backend booking sync notice (local booking confirmed):', backendErr.message);
    }

    // Stop polling and timers
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (fiveSecTimerRef.current) clearTimeout(fiveSecTimerRef.current);

    setPaymentSuccess(true);
    setIsPolling(false);

    if (typeof toast?.success === 'function') {
      toast.success('UPI Payment verified successfully! Generating e-ticket...');
    } else if (typeof addToast === 'function') {
      addToast('UPI Payment verified successfully! Generating e-ticket...', 'success');
    }

    // Zero customer typing: automatically redirect to confirmation page after short celebration animation
    setTimeout(() => {
      setIsUpiModalOpen(false);
      navigate(`/booking-confirmation/${bookingId}`, {
        state: { booking: confirmedBooking },
        replace: true
      });
    }, 1200);
  };

  // Start polling backend status every 2 seconds
  const startStatusPolling = (orderId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsPolling(true);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusRes = await getUpiPaymentStatus(orderId);
        if (statusRes.paid === true || statusRes.status === 'PAID') {
          clearInterval(pollIntervalRef.current);
          if (fiveSecTimerRef.current) clearTimeout(fiveSecTimerRef.current);
          await finalizeBooking(orderId, statusRes.utr_number || `upi_${orderId}`, statusRes.utr_number);
        }
      } catch (pollErr) {
        console.warn('UPI status poll check:', pollErr.message);
      }
    }, 2000);
  };

  // Open dynamic UPI QR payment modal
  const handleOpenUpiPaymentModal = async () => {
    setError(null);
    setLoading(true);

    // 1. Conflict Pre-check before opening modal
    const statuses = seatLockManager.getShowSeatStatuses(currentShowKey);
    const isConflict = seats.some((s) => {
      const sId = typeof s === 'string' ? s : s?.id;
      return statuses[sId]?.status === 'BOOKED';
    });

    if (isConflict) {
      const msg = 'One or more selected seats have already been booked by another user.';
      setError(msg);
      if (typeof toast?.error === 'function') toast.error(msg);
      else if (typeof addToast === 'function') addToast(msg, 'error');
      setLoading(false);
      return;
    }

    try {
      const bookingId = `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const order = await createUpiQrOrder(
        bookingId,
        totalPayable,
        movie?.title || 'Movie Ticket',
        {
          customer_name: user?.name || 'Valued Cinema Guest',
          customer_email: user?.email || 'customer@cinebook.in',
          customer_phone: user?.phone || '9848012345'
        }
      );

      setUpiOrder(order);
      setIsUpiModalOpen(true);
      setShowUtrFallback(false);
      setUtrInput('');
      setSecondsRemaining(order.expires_in_seconds || 300);
      setPaymentSuccess(false);

      // Start countdown timer (5 minutes total seat hold)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            setShowUtrFallback(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 5-Second Panic-Free Auto-Reveal: If payment is not auto-confirmed within 5s,
      // seamlessly reveal the 12-digit UTR input field so the user never panics,
      // while background auto-polling continues running in parallel!
      if (fiveSecTimerRef.current) clearTimeout(fiveSecTimerRef.current);
      fiveSecTimerRef.current = setTimeout(() => {
        setShowUtrFallback(true);
      }, 5000);

      // Start auto-polling (every 2 seconds)
      startStatusPolling(order.order_id);
    } catch (err) {
      console.error('Failed to create UPI QR order:', err);
      const msg = err.message || 'Failed to initialize UPI QR payment session. Please try again.';
      setError(msg);
      if (typeof toast?.error === 'function') toast.error(msg);
      else if (typeof addToast === 'function') addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Copy UPI ID to clipboard
  const handleCopyUpi = () => {
    if (!upiOrder?.upi_id) return;
    navigator.clipboard.writeText(upiOrder.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    if (typeof toast?.info === 'function') toast.info('UPI ID copied to clipboard');
  };

  // Instant simulation helper for test/demo mode
  const handleSimulatePayment = async () => {
    if (!upiOrder?.order_id) return;
    setIsSimulating(true);
    try {
      const res = await simulateUpiPaymentSuccess(upiOrder.order_id);
      if (res.success) {
        await finalizeBooking(upiOrder.order_id, res.utr_number, res.utr_number);
      }
    } catch (err) {
      console.error('Simulation error:', err);
      if (typeof toast?.error === 'function') toast.error(err.message || 'Simulation failed.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Manual fallback UTR verification
  const handleVerifyUtr = async (e) => {
    e?.preventDefault();
    if (!utrInput.trim() || utrInput.trim().length < 6) {
      if (typeof toast?.error === 'function') toast.error('Please enter a valid 12-digit UPI Reference Number / UTR.');
      return;
    }

    setIsVerifyingUtr(true);
    try {
      const res = await verifyUpiUtr(upiOrder.order_id, utrInput.trim(), upiOrder.booking_id);
      if (res.success) {
        await finalizeBooking(upiOrder.order_id, `upi_${utrInput.trim()}`, utrInput.trim());
      }
    } catch (err) {
      console.error('UTR Verification Error:', err);
      const msg = err.response?.data?.detail || err.message || 'Invalid UTR or verification failed.';
      if (typeof toast?.error === 'function') toast.error(msg);
    } finally {
      setIsVerifyingUtr(false);
    }
  };

  const formattedSeatsText = Array.isArray(seats)
    ? seats.map((s) => (typeof s === 'string' ? s : s?.id || s?.name || s?.number || '')).join(', ')
    : String(seats || '');

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-sm font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back to Seat Selection</span>
        </button>

        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-text-primary">Booking Checkout</h1>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full">
              <ShieldCheck size={14} />
              All UPI Apps Supported
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-sm">Movie</span>
              <span className="font-semibold text-text-primary text-sm sm:text-base">
                {movie?.title || show?.movieTitle || 'Movie Ticket'}
              </span>
            </div>
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-sm">Theatre & Time</span>
              <span className="font-semibold text-text-primary text-sm sm:text-base">
                {theatre?.name || show?.theatreName || 'Cinebook Cinema'} | {show?.time || 'Showtime'}
              </span>
            </div>
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-sm">Date</span>
              <span className="font-semibold text-text-primary text-sm sm:text-base">{showDate}</span>
            </div>
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-sm">Seats ({seats.length})</span>
              <span className="font-semibold text-primary text-sm sm:text-base">{formattedSeatsText || 'Selected Seats'}</span>
            </div>

            {/* Itemized Price Breakdown (GST SAC 998599 Compliant) */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                <span className="font-bold text-text-primary uppercase tracking-wider">Itemized Fare Breakdown</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                  0% Gateway Fee • Instant Bank Credit
                </span>
              </div>

              {/* 1. Base Ticket Price */}
              <div className="flex justify-between items-center text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-text-muted" />
                  <span>Base Ticket Price ({seats.length} {seats.length === 1 ? 'Seat' : 'Seats'})</span>
                  <span className="text-[10px] text-text-muted">(Cinema Tax Included)</span>
                </span>
                <span className="font-bold text-text-primary">₹{baseTicketPrice}</span>
              </div>

              {/* 2. Internet Handling Fee */}
              <div className="flex justify-between items-center text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <span>Internet Handling / Convenience Fee</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                    Lowest Fee • Flat ₹10
                  </span>
                </span>
                <span className="font-bold text-text-primary">₹{flatConvenienceFee.toFixed(2)}</span>
              </div>

              {/* 3. Integrated GST on Handling Fee */}
              <div className="flex justify-between items-center text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <span>Integrated GST on Convenience Fee (18%)</span>
                  <span className="text-[10px] text-text-muted">(SAC 998599)</span>
                </span>
                <span className="font-bold text-text-primary">₹{gstOnConvenienceFee.toFixed(2)}</span>
              </div>

              {/* 4. Total Payable Row */}
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <div>
                  <span className="text-sm sm:text-base font-black text-text-primary block">Total Payable Amount</span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    Direct NPCI UPI Transfer to Savings Bank Account
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-primary block text-2xl font-black">₹{totalPayable}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Zero Surcharge</span>
                </div>
              </div>
            </div>

            {/* UPI Supported Apps Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface-elevated border border-border text-xs text-text-secondary">
              <span className="flex items-center gap-2 font-medium">
                <Smartphone className="w-4 h-4 text-primary shrink-0" />
                <span>Supports all UPI Apps:</span>
                <span className="font-bold text-text-primary">PhonePe • GPay • Paytm • BHIM • CRED</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                <Lock className="w-3 h-3" /> Multi-Channel Instant Verification
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenUpiPaymentModal}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer text-base active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 size={19} className="animate-spin text-white" />
                <span>Generating Dynamic UPI QR...</span>
              </>
            ) : (
              <>
                <QrCode size={19} className="text-white" />
                <span>Pay ₹{totalPayable} via UPI Apps / QR Code</span>
                <ChevronRight size={18} className="ml-1" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ZERO-TYPING DYNAMIC SAVINGS ACCOUNT UPI QR MODAL          */}
      {/* ========================================================= */}
      {isUpiModalOpen && upiOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0c121e] border border-primary/40 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="bg-[#080d17] border-b border-border/40 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-sm">
                  <QrCode size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-text-primary text-base tracking-wide">Pay via Any UPI App</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Auto-Verify
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted flex items-center gap-1">
                    <Clock size={11} className={secondsRemaining <= 60 ? "text-red-400 animate-pulse" : "text-amber-400"} />
                    Seat hold expires in: <span className={`font-bold font-mono ${secondsRemaining <= 60 ? "text-red-400" : "text-amber-400"}`}>{formatTimer(secondsRemaining)}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                  if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                  if (fiveSecTimerRef.current) clearTimeout(fiveSecTimerRef.current);
                  setIsUpiModalOpen(false);
                }}
                disabled={paymentSuccess}
                aria-label="Close"
                className="w-8 h-8 rounded-lg bg-surface-elevated hover:bg-surface text-text-muted hover:text-text-primary flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Dynamic QR Code & Amount Area */}
            <div className="p-6 flex flex-col items-center space-y-5">
              
              {/* Payment Success Splash */}
              {paymentSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30 animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-black text-white">Payment Received!</h3>
                  <p className="text-xs text-text-muted">Converting held seats & confirming your tickets...</p>
                </div>
              ) : (
                <>
                  {/* Amount Badge */}
                  <div className="text-center">
                    <span className="text-xs text-text-muted font-medium block">Total Payable Amount</span>
                    <span className="text-3xl font-black text-primary tracking-tight">₹{upiOrder.amount.toFixed(2)}</span>
                    <span className="text-[11px] text-text-muted block mt-0.5 font-medium">
                      Payee: <span className="text-text-primary font-bold">{upiOrder.payee_name}</span>
                    </span>
                  </div>

                  {/* High Resolution Dynamic QR Code */}
                  <div className="relative p-3.5 bg-white rounded-2xl shadow-xl shadow-black/40 border-4 border-primary/30 flex items-center justify-center">
                    <QRCodeSVG
                      value={upiOrder.qr_data || upiOrder.upi_intent_url}
                      size={195}
                      level="H"
                      includeMargin={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-200">
                        <span className="text-xs font-black text-primary">CB</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Auto-Polling Status Radar */}
                  <div className="w-full p-3 rounded-2xl bg-surface-elevated border border-primary/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <div className="text-left">
                        <p className="text-xs font-bold text-text-primary">Waiting for payment...</p>
                        <p className="text-[10px] text-text-muted">Listening for PhonePe / GPay / Paytm / SMS / Email Alert</p>
                      </div>
                    </div>
                    <Loader2 size={16} className="animate-spin text-primary shrink-0" />
                  </div>

                  {/* Mobile Deep-link Intent Buttons for All Major UPI Apps */}
                  <div className="w-full space-y-2">
                    <p className="text-[11px] font-semibold text-text-muted text-center uppercase tracking-wider">
                      Tap to Open Your UPI App Directly
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={upiOrder.upi_intent_url}
                        onClick={() => setShowUtrFallback(true)}
                        className="py-2.5 px-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-[11px] font-bold text-text-primary flex flex-col items-center justify-center gap-1 transition text-center shadow-sm active:scale-95"
                      >
                        <span className="text-purple-400 font-extrabold">PhonePe</span>
                        <span className="text-[9px] text-text-muted">Instant</span>
                      </a>
                      <a
                        href={upiOrder.upi_intent_url}
                        onClick={() => setShowUtrFallback(true)}
                        className="py-2.5 px-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-[11px] font-bold text-text-primary flex flex-col items-center justify-center gap-1 transition text-center shadow-sm active:scale-95"
                      >
                        <span className="text-blue-400 font-extrabold">Google Pay</span>
                        <span className="text-[9px] text-text-muted">Instant</span>
                      </a>
                      <a
                        href={upiOrder.upi_intent_url}
                        onClick={() => setShowUtrFallback(true)}
                        className="py-2.5 px-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-[11px] font-bold text-text-primary flex flex-col items-center justify-center gap-1 transition text-center shadow-sm active:scale-95"
                      >
                        <span className="text-sky-400 font-extrabold">Paytm / BHIM</span>
                        <span className="text-[9px] text-text-muted">Instant</span>
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={upiOrder.upi_intent_url}
                        onClick={() => setShowUtrFallback(true)}
                        className="py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs font-semibold text-text-secondary flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <span>CRED UPI</span>
                        <ExternalLink size={12} className="text-text-muted" />
                      </a>
                      <a
                        href={upiOrder.upi_intent_url}
                        onClick={() => setShowUtrFallback(true)}
                        className="py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs font-semibold text-text-secondary flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <span>Any UPI App</span>
                        <ExternalLink size={12} className="text-text-muted" />
                      </a>
                    </div>
                  </div>

                  {/* Savings UPI ID Copy Bar */}
                  <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border text-xs">
                    <div className="truncate text-left pr-2">
                      <span className="text-[10px] text-text-muted block">Direct Payee UPI ID:</span>
                      <span className="font-mono text-xs font-bold text-text-primary truncate block">
                        {upiOrder.upi_id}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition"
                    >
                      {copiedUpi ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Test Mode Simulation Button for Instant Verification */}
                  <div className="w-full pt-1 border-t border-border/40">
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isSimulating}
                      className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSimulating ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-emerald-400" />
                          <span>Simulating Instant Credit...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={14} className="text-emerald-400" />
                          <span>Simulate UPI Payment (Instant Test Confirm)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 5-Second Panic-Free Auto-Reveal & Manual 12-Digit UTR Input Form */}
                  <div className="w-full text-center">
                    {!showUtrFallback && secondsRemaining > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowUtrFallback(true)}
                        className="text-[11px] text-text-muted hover:text-text-primary underline transition cursor-pointer"
                      >
                        Paid but not redirected? Click to verify 12-digit UTR manually
                      </button>
                    ) : (
                      <form onSubmit={handleVerifyUtr} className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                            <Info size={15} className="shrink-0" />
                            <span>Enter 12-Digit UPI Reference (UTR)</span>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                            Auto-Polling Active
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          Paid on PhonePe, GPay, or Paytm? Paste the 12-digit <strong>UPI Ref / UTR number</strong> from your payment receipt to confirm instantly if bank alerts take a moment!
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={utrInput}
                            onChange={(e) => setUtrInput(e.target.value)}
                            placeholder="e.g. 426811902847"
                            maxLength={16}
                            autoFocus
                            className="flex-1 bg-surface border border-amber-500/40 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-text-primary font-mono outline-none shadow-inner"
                          />
                          <button
                            type="submit"
                            disabled={isVerifyingUtr || !utrInput.trim()}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 shadow-md"
                          >
                            {isVerifyingUtr ? <Loader2 size={14} className="animate-spin text-black" /> : 'Confirm Seat'}
                          </button>
                        </div>
                        <div className="p-2.5 bg-black/40 rounded-xl text-[10px] text-text-muted space-y-1">
                          <p>💡 <strong>Where to find your 12-Digit UTR:</strong></p>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                            <li><strong>PhonePe</strong>: Tap Payment Details $\rightarrow$ <em>"UTR"</em> or <em>"Debited from"</em></li>
                            <li><strong>Google Pay</strong>: Tap Transaction $\rightarrow$ <em>"UPI transaction ID"</em></li>
                            <li><strong>Paytm</strong>: Tap Order Details $\rightarrow$ <em>"UPI Ref No"</em></li>
                          </ul>
                        </div>
                      </form>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


