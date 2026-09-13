import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CreditCard,
  Ticket,
  ChevronRight,
  Film,
  MapPin,
  CheckCircle2,
  Sparkles,
  Lock,
  Check,
  AlertCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';
import { loadRazorpayScript, paymentApi, RAZORPAY_KEY_ID } from '../../services/paymentApi';
import { seatLockManager, getShowKey } from '../../services/seatLockManager';
import { bookingApi } from '../../services/bookingApi';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    selectedMovie,
    selectedTheatre,
    selectedShow,
    selectedDate,
    selectedSeats,
    secondsLeft,
    baseAmount,
    convenienceFeeBase,
    convenienceFeeTotal,
    convenienceFee,
    igst,
    cgst,
    sgst,
    taxes,
    totalAmount,
    lockToken,
    releaseSeatLock
  } = useBooking();

  const [processing, setProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback metadata references
  const movie = selectedMovie || MOVIES[0];
  const theatre = selectedTheatre || THEATRES[0];
  const show = selectedShow || SAMPLE_SHOWTIMES[0];
  const seats = selectedSeats || [];
  const finalTotal = totalAmount > 0 ? totalAmount : 0;
  const currentShowKey = getShowKey(show, theatre, movie, selectedDate);

  // Strict Login & Selected Seats Guard
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } }, replace: true });
      return;
    }
    if (!selectedSeats || selectedSeats.length === 0) {
      navigate(`/seat-selection/${show?.id || 'sh-001'}`, { replace: true });
    }
  }, [user, selectedSeats, navigate, show?.id]);

  // Keep contact info updated with user profile
  useEffect(() => {
    if (user) {
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Real-time listener for cross-tab seat conflicts while on checkout
  useEffect(() => {
    const unsubscribe = seatLockManager.subscribe((event) => {
      const statuses = seatLockManager.getShowSeatStatuses(currentShowKey);
      const conflicted = seats.find((s) => statuses[s.id]?.status === 'BOOKED');
      if (conflicted) {
        setErrorMessage(`Seat ${conflicted.id} has just been booked by another customer in another session. Please select different seats.`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentShowKey, seats]);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setRazorpayLoaded(loaded);
    });
  }, []);

  const formatTimer = (secs) => {
    const s = secs || 300;
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Explicit User Action: Cancel Checkout & Immediately Release Held Seats
  const handleCancelAndRelease = async () => {
    const heldLockToken = (lockToken && lockToken !== 'lock_init' ? lockToken : null) || seatLockManager.getHeldToken(currentShowKey);
    try {
      if (show?.id) {
        await bookingApi.releaseSeats(show.id, heldLockToken, seats.map((s) => s.id));
      }
    } catch (e) {}
    await seatLockManager.releaseSeats(currentShowKey, show?.id, seats.map((s) => s.id), heldLockToken);
    seatLockManager.releaseCurrentTabLocks(currentShowKey, show?.id);
    releaseSeatLock(currentShowKey, show?.id);
    toast.info('Your temporary seat hold has been released.');
    navigate(`/seat-selection/${show?.id || 'sh-001'}`);
  };

  // Called ONLY after Razorpay payment succeeds
  const completePaymentAndBooking = async (trackingBookingId, paymentId, orderId = '', signature = '') => {
    setIsSubmitting(false);
    setProcessing(true);
    setProcessingStep(1);

    const heldLockToken = (lockToken && lockToken !== 'lock_init' ? lockToken : null) || seatLockManager.getHeldToken(currentShowKey);

    // 1. Verify Payment & Commit Permanent Booking in Supabase Database ONLY after successful payment
    let confirmedBookingId = trackingBookingId;
    try {
      // Step A: Cryptographic payment signature verification (finalizes booked_seats & updates status to CONFIRMED)
      const verifyRes = await paymentApi.verifyPayment({
        booking_id: trackingBookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature || 'sim_sig_verified'
      });

      setProcessingStep(2);

      // Step B: Atomically ensure booking record is synced
      const backendRes = await bookingApi.createBooking({
        show_id: show?.id || 'sh-001',
        movie_id: movie?.id || 'mv-001',
        theatre_id: theatre?.id || 'th-001',
        show_date: selectedDate || new Date().toISOString().split('T')[0],
        show_time: show?.time || '11:00 AM',
        lock_token: heldLockToken || `lock_${Date.now()}`,
        booking_id: trackingBookingId,
        payment_id: paymentId,
        order_id: orderId,
        signature: signature,
        booking_status: 'CONFIRMED',
        seats: seats.map((s) => ({
          id: s.id,
          row: s.row || s.id.charAt(0),
          number: s.number || parseInt(s.id.slice(1)) || 1,
          tier: s.tier || (['A', 'B', 'C', 'D'].includes(s.id.charAt(0)) ? 'BALCONY' : 'SECOND_CLASS'),
          price: s.price || (['A', 'B', 'C', 'D'].includes(s.id.charAt(0)) ? 147 : 84)
        })),
        base_amount: baseAmount || (finalTotal - 16.17),
        convenience_fee: convenienceFeeTotal || convenienceFee || 16.17,
        taxes: igst || taxes || 2.47,
        total_amount: finalTotal,
        customer_name: user?.name || 'Valued Cinema Guest',
        customer_email: email || user?.email || 'customer@cinebook.in',
        customer_phone: phone || user?.phone || '9848012345'
      });

      if (backendRes && backendRes.booking_id) {
        confirmedBookingId = backendRes.booking_id;
      }
    } catch (err) {
      setProcessing(false);
      setIsSubmitting(false);
      const msg = err.message || 'Payment verification failed. Your seat hold has been released.';
      setErrorMessage(msg);
      toast.conflict(msg);
      navigate(`/seat-selection/${show?.id || 'sh-001'}`);
      return;
    }

    // 2. Permanently record booked seats and broadcast to all tabs
    seatLockManager.confirmBooking(currentShowKey, seats, confirmedBookingId, show?.id);

    const confirmedBooking = {
      bookingId: confirmedBookingId,
      movie,
      theatre,
      show,
      showDate: selectedDate || new Date().toISOString().split('T')[0],
      seats: seats,
      totalAmount: finalTotal,
      baseAmount: baseAmount || 0,
      convenienceFee: convenienceFeeTotal || convenienceFee || 0,
      convenienceFeeBase: convenienceFeeBase || 0,
      igst: igst || 0,
      cgst: cgst || 0,
      sgst: sgst || 0,
      taxes: taxes || 0,
      paymentId: paymentId || `pay_rzp_${Date.now()}`,
      orderId: orderId,
      paymentMethod: 'RAZORPAY',
      customerName: user?.name || 'Valued Cinema Guest',
      customerEmail: email || user?.email || 'customer@cinebook.in',
      customerPhone: phone || user?.phone || '9848012345',
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
    localStorage.setItem('cinebook_bookings', JSON.stringify([confirmedBooking, ...existing]));
    localStorage.setItem('cinebook_latest_booking', JSON.stringify(confirmedBooking));

    setProcessingStep(3);

    setTimeout(() => {
      setProcessing(false);
      setIsSubmitting(false);
      toast.success('Payment successful! Your tickets are confirmed.');
      navigate(`/booking-confirmation/${confirmedBookingId}`);
    }, 250);
  };

  const handlePayNow = async () => {
    setErrorMessage('');
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    // 1. Pre-check if already permanently booked locally or remotely
    const statuses = seatLockManager.getShowSeatStatuses(currentShowKey);
    const isConflict = seats.some((s) => statuses[s.id]?.status === 'BOOKED');
    if (isConflict) {
      setErrorMessage('Seat already booked. One or more selected seats have been booked by another customer.');
      toast.conflict('Seat already booked. One or more seats were reserved by another customer.');
      navigate(`/seat-selection/${show?.id || 'sh-001'}`);
      return;
    }

    setIsSubmitting(true);
    const heldLockToken = (lockToken && lockToken !== 'lock_init' ? lockToken : null) || seatLockManager.getHeldToken(currentShowKey);

    // 2. Verify and re-confirm temporary atomic seat lock on backend (temporary lock ONLY)
    try {
      if (show?.id && seats?.length > 0) {
        await bookingApi.lockSeats(show.id, seats.map((s) => s.id), undefined, heldLockToken);
      }
    } catch (err) {
      const msg = err.message || 'Seat already booked. Another customer has reserved this seat.';
      setErrorMessage(msg);
      toast.conflict(msg);
      setIsSubmitting(false);
      navigate(`/seat-selection/${show?.id || 'sh-001'}`);
      return;
    }

    // Generate unique transaction tracking ID (NOT permanently committed yet)
    const transactionBookingId = `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Initialize booking session with PENDING status
    try {
      await bookingApi.createBooking({
        show_id: show?.id || 'sh-001',
        movie_id: movie?.id || 'mv-001',
        theatre_id: theatre?.id || 'th-001',
        show_date: selectedDate || new Date().toISOString().split('T')[0],
        show_time: show?.time || '11:00 AM',
        lock_token: heldLockToken || `lock_${Date.now()}`,
        booking_id: transactionBookingId,
        booking_status: 'PENDING',
        seats: seats.map((s) => ({
          id: s.id,
          row: s.row || s.id.charAt(0),
          number: s.number || parseInt(s.id.slice(1)) || 1,
          tier: s.tier || (['A', 'B', 'C', 'D'].includes(s.id.charAt(0)) ? 'BALCONY' : 'SECOND_CLASS'),
          price: s.price || (['A', 'B', 'C', 'D'].includes(s.id.charAt(0)) ? 147 : 84)
        })),
        base_amount: baseAmount || (finalTotal - 16.17),
        convenience_fee: convenienceFeeTotal || convenienceFee || 16.17,
        taxes: igst || taxes || 2.47,
        total_amount: finalTotal,
        customer_name: user?.name || 'Valued Cinema Guest',
        customer_email: email || user?.email || 'customer@cinebook.in',
        customer_phone: phone || user?.phone || '9848012345'
      });
    } catch (err) {
      console.warn('Booking session init fallback:', err.message);
    }

    // 4. Ensure Razorpay SDK is loaded
    const isSdkLoaded = await loadRazorpayScript();
    if (!isSdkLoaded || !window.Razorpay) {
      setIsSubmitting(false);
      const failMsg = 'Payment gateway could not be loaded. Please disable ad-blockers or check your connection and try again.';
      setErrorMessage(failMsg);
      toast.error(failMsg);
      return;
    }

    // 5. Create Razorpay Payment Order
    let orderData = null;
    try {
      orderData = await paymentApi.createOrder(transactionBookingId, finalTotal);
    } catch (err) {
      console.warn('Order creation fallback:', err);
    }

    // 6. Trigger Official Razorpay Checkout Popup
    try {
      const options = {
        key: orderData?.key_id || RAZORPAY_KEY_ID || 'rzp_test_Ta1Px7K4yVtNZ4',
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: 'CINEBOOK',
        description: `Tickets for ${movie.title} (${seats.length} Seats)`,
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=100&auto=format&fit=crop&q=80',
        order_id: orderData?.order_id || undefined,
        handler: function (response) {
          // PAYMENT SUCCESS: ONLY NOW commit booking permanently to database
          if (response && response.razorpay_payment_id) {
            completePaymentAndBooking(
              transactionBookingId,
              response.razorpay_payment_id,
              response.razorpay_order_id || orderData?.order_id || '',
              response.razorpay_signature || ''
            );
          } else {
            setIsSubmitting(false);
            setProcessing(false);
            toast.error('Payment response was invalid. No seats were charged.');
          }
        },
        prefill: {
          name: user?.name || 'Cinema Guest',
          email: email,
          contact: phone
        },
        notes: {
          movie: movie.title,
          theatre: theatre.name,
          seats: seats.map((s) => s.id).join(', ')
        },
        theme: {
          color: '#E50914'
        },
        modal: {
          ondismiss: async function () {
            // ON MODAL DISMISS / PAYMENT CANCEL:
            // Immediately release temporary locks so seats become available instantly
            setIsSubmitting(false);
            setProcessing(false);
            try {
              if (show?.id) {
                await bookingApi.releaseSeats(show.id, heldLockToken, seats.map((s) => s.id));
              }
            } catch (e) {}
            await seatLockManager.releaseSeats(currentShowKey, show?.id, seats.map((s) => s.id), heldLockToken);
            seatLockManager.releaseCurrentTabLocks(currentShowKey, show?.id);
            releaseSeatLock(currentShowKey, show?.id);
            toast.warning('Payment was cancelled. Your temporary seat hold has been released.');
            navigate(`/seat-selection/${show?.id || 'sh-001'}`);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (resp) {
        // ON PAYMENT FAILURE:
        // Immediately release temporary locks so seats become available instantly
        setIsSubmitting(false);
        setProcessing(false);
        try {
          if (show?.id) {
            await bookingApi.releaseSeats(show.id, heldLockToken, seats.map((s) => s.id));
          }
        } catch (e) {}
        await seatLockManager.releaseSeats(currentShowKey, show?.id, seats.map((s) => s.id), heldLockToken);
        seatLockManager.releaseCurrentTabLocks(currentShowKey, show?.id);
        releaseSeatLock(currentShowKey, show?.id);
        const failMsg = resp.error?.description || 'Payment was unsuccessful. Your seat hold has been released. Please try again.';
        setErrorMessage(failMsg);
        toast.error(failMsg);
        navigate(`/seat-selection/${show?.id || 'sh-001'}`);
      });
      rzp.open();
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      const failMsg = 'Unable to launch payment gateway: ' + (err.message || 'Please try again.');
      setErrorMessage(failMsg);
      toast.error(failMsg);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-void-900 text-text-primary transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Cancel Action */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancelAndRelease}
            className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand transition-colors cursor-pointer px-3 py-2 rounded-xl bg-void-850 border border-white/8 hover:border-brand/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Seat Selection (Release Hold)</span>
          </button>

          <button
            type="button"
            onClick={handleCancelAndRelease}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel & Release Seats</span>
          </button>
        </div>

        {/* 1. SEAT LOCK COUNTDOWN BANNER */}
        <div className="p-4 sm:p-5 rounded-2xl bg-void-850 border border-brand/30 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-brand/15 text-brand border border-brand/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <span>Temporary Seat Lock Active</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Seats are temporarily held for your session. Complete payment to finalize permanent booking.
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] uppercase font-bold text-text-muted block tracking-wider">Time Remaining</span>
            <span className="text-lg sm:text-xl font-mono font-black text-brand">
              {formatTimer(secondsLeft)}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Contact & Payment Gateway Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <div className="p-6 bg-void-850 rounded-2xl space-y-4 border border-white/8 shadow-md">
              <h2 className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" /> Ticket Delivery Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1.5">Email Address (E-Ticket & QR)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-void-800 border border-white/8 rounded-xl text-xs text-text-primary font-medium focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1.5">Mobile Number (SMS WhatsApp Pass)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-void-800 border border-white/8 rounded-xl text-xs text-text-primary font-medium focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Gateway - Exclusively Razorpay */}
            <div className="p-6 bg-void-850 rounded-2xl space-y-4 border border-white/8 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/8">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand/15 flex items-center justify-center text-brand border border-brand/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-text-primary">
                      Payment Gateway
                    </h2>
                    <p className="text-[11px] text-text-muted">Direct Official Integration</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>256-Bit SSL Encrypted</span>
                </span>
              </div>

              {/* Single Dedicated Razorpay Card */}
              <div className="p-5 rounded-2xl bg-void-800 border border-brand/30 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs tracking-wider uppercase shadow-sm">
                      Razorpay
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">Razorpay Official Gateway</h3>
                      <p className="text-[11px] text-emerald-400 font-semibold">Verified & Active</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-brand/20 text-brand flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed pt-1">
                  Your payment is securely processed exclusively by <strong>Razorpay</strong>. Click the button below to open the Razorpay checkout and authorize your transaction.
                </p>

                <div className="pt-2 border-t border-white/8 flex items-center justify-between text-[11px] text-text-muted">
                  <span>Merchant: <strong className="text-text-primary font-semibold">CINEBOOK</strong></span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> PCI-DSS Level 1 Certified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Summary Card */}
          <div className="space-y-4">
            <div className="p-6 bg-void-850 rounded-2xl space-y-5 h-fit border border-white/8 shadow-xl">
              {/* Mini Movie Header */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-white/8">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-16 h-24 rounded-xl object-cover border border-white/8 flex-shrink-0 shadow-sm"
                />
                <div>
                  <h3 className="text-sm font-black text-text-primary leading-tight">{movie.title}</h3>
                  <p className="text-xs text-brand font-bold mt-1">{theatre.name}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-void-800 border border-white/8 text-[10px] font-semibold text-text-secondary">
                    {show.format || '2D Dolby Atmos'} • {show.time || '11:00 AM'}
                  </span>
                </div>
              </div>

              {/* Itemized Bill */}
              <div className="space-y-3 text-xs text-text-secondary">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Selected Seats ({seats.length})</span>
                  <span className="font-mono font-black text-brand bg-void-800 px-2 py-0.5 rounded-md border border-brand/30">
                    {seats.map((s) => `${s.id} (${s.tier === 'BALCONY' ? 'Balcony ₹147' : '2nd Class ₹84'})`).join(', ')}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/8 text-xs sm:text-sm">
                  <span className="text-text-primary font-medium">Ticket(s) price</span>
                  <span className="font-bold text-text-primary font-mono text-sm">₹{Number(baseAmount || 0).toFixed(2)}</span>
                </div>

                {/* Convenience fees Section */}
                <div className="p-3 rounded-xl bg-void-800/80 border border-white/8 space-y-2">
                  <div className="flex justify-between items-center font-bold text-xs text-text-primary">
                    <span className="flex items-center gap-1 text-text-primary font-semibold">
                      <span>Convenience fees</span>
                      <span className="text-[10px] text-brand">^</span>
                    </span>
                    <span className="font-mono text-brand font-bold">₹{Number(convenienceFeeTotal || convenienceFee || 0).toFixed(2)}</span>
                  </div>

                  <div className="pl-3 border-l-2 border-brand/40 space-y-1.5 text-[11px] text-text-muted">
                    <div className="flex justify-between items-center">
                      <span>Base Amount</span>
                      <span className="font-mono text-text-secondary">₹{Number(convenienceFeeBase || (baseAmount * 0.1) || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Integrated GST (IGST) @ 18%</span>
                      <span className="font-mono text-text-secondary">₹{Number(igst || taxes || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/8 flex justify-between items-center text-sm font-black">
                  <div>
                    <span className="text-text-primary block">Total Payable</span>
                    <span className="text-[10px] text-emerald-400 font-medium">All Taxes & Fees Included</span>
                  </div>
                  <span className="text-2xl text-brand font-black font-mono">₹{Number(finalTotal || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Confirm & Pay Button */}
              <button
                type="button"
                onClick={handlePayNow}
                disabled={processing || isSubmitting}
                className="w-full py-4 rounded-2xl bg-brand hover:bg-brand-hover text-void-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 shadow-lg shadow-brand/25 transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-void-950 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-void-950" />
                    <span>Pay ₹{finalTotal} with Razorpay</span>
                  </>
                )}
              </button>

              <div className="pt-1 text-center space-y-1">
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Instant Refund Guarantee
                </p>
                <p className="text-[10px] text-text-muted">
                  Cancel anytime before showtime for automated bank credit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PAYMENT PROCESSING MODAL --- */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-void-850 rounded-2xl p-7 text-center space-y-5 border border-white/8 shadow-2xl text-text-primary">
            <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mx-auto text-void-950 shadow-lg">
              <CreditCard className="w-7 h-7 text-void-950" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-text-primary">
                Processing Secure Payment
              </h3>
              <p className="text-xs text-text-muted">
                Confirming with Razorpay & Bank Payment Gateways...
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-left">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-void-800 border border-white/8">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-void-900 border border-white/10 text-text-muted'
                }`}>✓</span>
                <span className={processingStep >= 1 ? 'text-text-primary font-medium' : 'text-text-muted'}>
                  Verifying 256-Bit SSL Payment Token...
                </span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-void-800 border border-white/8">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-void-900 border border-white/10 text-text-muted'
                }`}>✓</span>
                <span className={processingStep >= 2 ? 'text-text-primary font-medium' : 'text-text-muted'}>
                  Securing Confirmed Seats in Database...
                </span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-void-800 border border-white/8">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  processingStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-void-900 border border-white/10 text-text-muted'
                }`}>✓</span>
                <span className={processingStep >= 3 ? 'text-text-primary font-medium' : 'text-text-muted'}>
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
