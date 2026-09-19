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
  verifyUpiUtr,
  confirmBookingDirect
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
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CheckoutPage = () => {
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

  // Customer Contact for Multi-Channel Ticket Delivery (Email, SMS, WhatsApp)
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  // Fallback UTR manual verification state
  const [showUtrFallback, setShowUtrFallback] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);

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
  const calculatedBasePrice = numSeats * 1.00; // Flat ₹1.00 per ticket for testing

  const baseTicketPrice = calculatedBasePrice;
  const flatConvenienceFee = 0.00;
  const gstOnConvenienceFee = 0.00;
  const totalPayable = Number(baseTicketPrice.toFixed(2));

  const currentShowKey = getShowKey(show, theatre, movie, showDate);

  useEffect(() => {
    if (!show || seats.length === 0) {
      navigate('/movies', { replace: true });
    }
  }, [show, seats, navigate]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (fiveSecTimerRef.current) clearTimeout(fiveSecTimerRef.current);
    };
  }, []);

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
      price: 1
    }));
  };

  const finalizeBooking = async (orderId, paymentId, utrNumber = '') => {
    const bookingId = upiOrder?.booking_id || `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const heldLockToken =
      (lockToken && lockToken !== 'lock_init' ? lockToken : null) ||
      seatLockManager.getHeldToken(currentShowKey) ||
      `lock_${Date.now()}`;

    const formattedSeatsList = getFormattedSeats();

    const activeEmail = customerEmail.trim() || user?.email || 'customer@cinebook.in';
    const activePhone = customerPhone.trim() || user?.phone || '9848012345';
    const activeName = user?.name || 'Valued Cinema Guest';

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
      customerName: activeName,
      customerEmail: activeEmail,
      customerPhone: activePhone,
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString()
    };

    seatLockManager.confirmBooking(currentShowKey, seats, bookingId, show?.id);

    const existingBookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
    localStorage.setItem(
      'cinebook_bookings',
      JSON.stringify([confirmedBooking, ...existingBookings.filter((b) => b.bookingId !== bookingId)])
    );
    localStorage.setItem('cinebook_latest_booking', JSON.stringify(confirmedBooking));

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
        customer_name: activeName,
        customer_email: activeEmail,
        customer_phone: activePhone
      });
    } catch (backendErr) {
      console.warn('Backend booking sync notice (local booking confirmed):', backendErr.message);
    }

    try {
      await confirmBookingDirect(bookingId, utrNumber, paymentId, orderId, {
        show_id: show?.id || 'sh-001',
        movie_id: movie?.id || 'mv-001',
        theatre_id: theatre?.id || 'th-001',
        show_date: showDate,
        show_time: show?.time || '11:00 AM',
        lock_token: heldLockToken,
        seats: formattedSeatsList,
        base_amount: baseTicketPrice,
        convenience_fee: flatConvenienceFee,
        taxes: gstOnConvenienceFee,
        total_amount: totalPayable,
        customer_name: activeName,
        customer_email: activeEmail,
        customer_phone: activePhone
      });
    } catch (syncErr) {
      console.warn('Direct confirm sync fallback:', syncErr.message);
    }

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (fiveSecTimerRef.current) clearTimeout(fiveSecTimerRef.current);

    setPaymentSuccess(true);
    setIsPolling(false);

    if (typeof toast?.success === 'function') {
      toast.success('UPI Payment verified successfully! Generating digital pass...');
    }

    setTimeout(() => {
      setIsUpiModalOpen(false);
      navigate(`/booking-confirmation/${bookingId}`, {
        state: { booking: confirmedBooking },
        replace: true
      });
    }, 1200);
  };

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

  const handleOpenUpiPaymentModal = async () => {
    setError(null);
    setLoading(true);

    const statuses = seatLockManager.getShowSeatStatuses(currentShowKey);
    const isConflict = seats.some((s) => {
      const sId = typeof s === 'string' ? s : s?.id;
      return statuses[sId]?.status === 'BOOKED';
    });

    if (isConflict) {
      const msg = 'One or more selected seats have already been booked by another user.';
      setError(msg);
      if (typeof toast?.error === 'function') toast.error(msg);
      setLoading(false);
      return;
    }

    const activeEmail = customerEmail.trim() || user?.email || 'customer@cinebook.in';
    const activePhone = customerPhone.trim() || user?.phone || '9848012345';
    const activeName = user?.name || 'Valued Cinema Guest';

    try {
      const bookingId = `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const order = await createUpiQrOrder(
        bookingId,
        totalPayable,
        movie?.title || 'Movie Ticket',
        {
          customer_name: activeName,
          customer_email: activeEmail,
          customer_phone: activePhone
        }
      );

      setUpiOrder(order);
      setIsUpiModalOpen(true);
      setShowUtrFallback(false);
      setUtrInput('');
      setSecondsRemaining(order.expires_in_seconds || 480);
      setPaymentSuccess(false);

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

      if (fiveSecTimerRef.current) clearTimeout(fiveSecTimerRef.current);
      fiveSecTimerRef.current = setTimeout(() => {
        setShowUtrFallback(true);
      }, 5000);

      startStatusPolling(order.order_id);
    } catch (err) {
      console.error('Failed to create UPI QR order:', err);
      const msg = err.message || 'Failed to initialize UPI QR payment session. Please try again.';
      setError(msg);
      if (typeof toast?.error === 'function') toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUpi = () => {
    const upiToCopy = upiOrder?.merchant_upi_id || upiOrder?.upi_id || 'BHARATPE2J0J0S7M9F14832@unitype';
    navigator.clipboard.writeText(upiToCopy);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    if (typeof toast?.info === 'function') toast.info('Payee UPI ID copied to clipboard');
  };

  const handleVerifyUtr = async (e) => {
    e?.preventDefault();
    const cleanUtr = utrInput.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      if (typeof toast?.error === 'function') {
        toast.error('Please enter a valid 12-digit UPI Reference Number / UTR.');
      }
      return;
    }

    setIsVerifyingUtr(true);
    const targetOrderId = upiOrder?.order_id || `upi_${Date.now()}`;
    const targetBookingId = upiOrder?.booking_id || `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const verifyRes = await verifyUpiUtr(targetOrderId, cleanUtr, targetBookingId);
      if (verifyRes?.success || verifyRes?.status === 'PAID') {
        await finalizeBooking(targetOrderId, `upi_${cleanUtr}`, cleanUtr);
      } else {
        throw new Error(verifyRes?.message || 'UTR verification failed. Please try again.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Payment not yet credited. Please allow 30 seconds and try again.';
      if (typeof toast?.error === 'function') {
        toast.error(errMsg);
      }
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
    <div className="min-h-screen bg-background text-text-primary pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Seat Map</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: BOOKING DETAILS & ITEMIZED BREAKDOWN */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h1 className="text-2xl font-black text-text-primary font-display">Booking Checkout</h1>
                <p className="text-xs text-text-muted mt-0.5">Itemized Ticket & Tax Breakdown</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Movie Info Card */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-elevated border border-border">
              <img
                src={movie?.posterUrl || '/posters/pushpa2.jpg'}
                alt={movie?.title}
                className="w-16 h-22 rounded-xl object-cover shrink-0 border border-border shadow-sm"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-black text-text-primary truncate font-display">{movie?.title}</h3>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-primary" />
                  <span>{theatre?.name}</span>
                </p>
                <p className="text-xs text-text-secondary font-bold">
                  {showDate} • {show?.time || '11:00 AM'} ({show?.format || '4K Laser'})
                </p>
                <div className="pt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/30 text-[10px] font-extrabold">
                    Seats: {formattedSeatsText}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Delivery Details (Email, SMS, WhatsApp) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-black uppercase text-text-primary flex items-center gap-1.5 font-display">
                  <Smartphone className="w-3.5 h-3.5 text-primary" /> Ticket Delivery Information
                </span>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Instant Auto-Delivery
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-text-muted block mb-1">
                    Email Address <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-text-primary font-bold text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-[9px] text-text-muted mt-0.5">E-Ticket pass with QR code sent here</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-muted block mb-1">
                    WhatsApp & Mobile Number <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9848012345"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full pl-11 pr-3 py-2.5 bg-surface border border-border rounded-xl text-text-primary font-bold text-xs focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <p className="text-[9px] text-text-muted mt-0.5">WhatsApp pass & SMS confirmation sent here</p>
                </div>
              </div>
            </div>

            {/* Itemized Fare Breakdown (SAC 998599 Compliant) */}
            <div className="space-y-3 pt-2 text-xs">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                Itemized Fare Breakdown
              </span>

              <div className="flex justify-between items-center text-text-secondary">
                <span>Base Ticket Price ({seats.length} {seats.length === 1 ? 'Seat' : 'Seats'})</span>
                <span className="font-bold text-text-primary font-mono">₹{baseTicketPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-text-secondary">
                <span>Internet Handling Fee (Flat ₹10)</span>
                <span className="font-bold text-text-primary font-mono">₹{flatConvenienceFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-text-secondary">
                <span>GST on Handling Fee (18% SAC 998599)</span>
                <span className="font-bold text-text-primary font-mono">₹{gstOnConvenienceFee.toFixed(2)}</span>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <div>
                  <span className="text-sm font-black text-text-primary block font-display">Total Payable Amount</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">0% Surcharge • Direct Bank Credit</span>
                </div>
                <span className="text-2xl font-black text-primary font-mono">₹{totalPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: SELECTABLE PAYMENT METHODS */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-base font-black text-text-primary font-display uppercase tracking-wider">
              Select Payment Method
            </h2>

            <div className="space-y-3 text-xs">
              {/* VyaparGateway Instant UPI QR */}
              <div
                onClick={handleOpenUpiPaymentModal}
                className="p-4 rounded-2xl bg-surface-elevated border-2 border-primary hover:border-primary-hover shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-text-primary group-hover:text-primary transition-colors">
                        Instant UPI Dynamic QR
                      </h4>
                      <p className="text-[10px] text-text-muted">PhonePe • GPay • Paytm • BHIM • CRED</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                    ✓
                  </span>
                </div>
              </div>

              {/* Debit / Credit Cards */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-border opacity-70 hover:opacity-100 transition-all flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-surface text-text-muted flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">Credit / Debit Cards</h4>
                    <p className="text-[10px] text-text-muted">Visa, Mastercard, RuPay</p>
                  </div>
                </div>
                <span className="text-[10px] text-text-muted font-bold">UPI Preferred</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleOpenUpiPaymentModal}
              isLoading={loading}
              className="w-full"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Pay ₹{totalPayable.toFixed(2)} via UPI QR
            </Button>
          </div>
        </div>
      </div>

      {/* VYAPARGATEWAY INSTANT UPI QR MODAL */}
      {isUpiModalOpen && upiOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-primary/40 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="bg-surface-elevated border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-sm">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-text-primary text-base font-display">UPI Payment</h3>
                  <p className="text-[11px] text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent" />
                    Seat hold: <span className="font-bold font-mono text-accent">{formatTimer(secondsRemaining)}</span>
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
                className="p-2 rounded-xl bg-surface hover:bg-surface-elevated text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Area */}
            <div className="p-6 flex flex-col items-center space-y-5">
              {paymentSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-black text-white font-display">Payment Received!</h3>
                  <p className="text-xs text-text-muted">Confirming your e-ticket pass...</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <span className="text-xs text-text-muted font-medium block">Total Payable</span>
                    <span className="text-3xl font-black text-primary font-mono">₹{upiOrder.amount.toFixed(2)}</span>
                  </div>

                  {upiOrder.qr_code ? (
                    <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-primary/30 flex items-center justify-center">
                      <img src={upiOrder.qr_code} alt="UPI QR" className="w-[195px] h-[195px] object-contain rounded-xl" />
                    </div>
                  ) : (
                    <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-primary/30 flex items-center justify-center">
                      <QRCodeSVG value={upiOrder.upi_string || upiOrder.qr_data || upiOrder.upi_intent_url} size={195} level="H" includeMargin={false} />
                    </div>
                  )}

                  {/* Auto-polling radar */}
                  <div className="w-full p-3 rounded-2xl bg-surface-elevated border border-primary/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                      </span>
                      <p className="text-xs font-bold text-text-primary">Listening for instant payment alert...</p>
                    </div>
                    <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  </div>

                  {/* UTR Fallback Input */}
                  <div className="w-full text-center">
                    {!showUtrFallback && secondsRemaining > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowUtrFallback(true)}
                        className="text-[11px] text-text-muted hover:text-text-primary underline transition cursor-pointer"
                      >
                        Paid but not redirected? Verify 12-digit UTR manually
                      </button>
                    ) : (
                      <form onSubmit={handleVerifyUtr} className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left animate-in fade-in duration-300">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                          <span className="flex items-center gap-1.5"><Info className="w-4 h-4" /> Enter 12-Digit UTR</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={utrInput}
                            onChange={(e) => setUtrInput(e.target.value)}
                            placeholder="e.g. 426811902847"
                            maxLength={16}
                            className="flex-1 bg-surface border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-text-primary font-mono outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isVerifyingUtr || !utrInput.trim()}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold rounded-xl text-xs transition cursor-pointer"
                          >
                            {isVerifyingUtr ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : 'Confirm'}
                          </button>
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
};

export default CheckoutPage;
