import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { seatLockManager, getShowKey } from '../../services/seatLockManager';
import { bookingApi } from '../../services/bookingApi';
import {
  ShieldCheck,
  Ticket,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Film,
  Clock,
  Sparkles,
  Wallet,
  CreditCard,
  Lock,
  ExternalLink,
  X,
  ChevronRight
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
    convenienceFeeTotal,
    convenienceFee,
    igst,
    taxes,
    totalAmount: contextTotalAmount,
    lockToken,
    clearBooking
  } = useBooking();
  const { toast, addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // CASHU Payment Gateway Modal state
  const [isCashuModalOpen, setIsCashuModalOpen] = useState(false);
  const [cashuTab, setCashuTab] = useState('wallet'); // 'wallet' | 'card' | 'external'
  const [cashuAccount, setCashuAccount] = useState(user?.email || 'customer@cinebook.in');
  const [cashuPassword, setCashuPassword] = useState('pass1234');
  const [cashuCardNumber, setCashuCardNumber] = useState('4589 3200 9811 7642');
  const [cashuCardPin, setCashuCardPin] = useState('8832');
  const [isProcessingCashu, setIsProcessingCashu] = useState(false);

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
  const showDate = bookingDetails.showDate || selectedDate || new Date().toISOString().split('T')[0];

  const totalPayable =
    bookingDetails.totalAmount ||
    contextTotalAmount ||
    (seats.length > 0 ? seats.length * (show?.price || 150) : 150);

  const usdAmount = (totalPayable / 83.5).toFixed(2);
  const currentShowKey = getShowKey(show, theatre, movie, showDate);

  useEffect(() => {
    if (!show || seats.length === 0) {
      navigate('/movies', { replace: true });
    }
  }, [show, seats, navigate]);

  // Open the CASHU Payment Popup Tab
  const handleOpenCashuModal = () => {
    setError(null);
    // Conflict Pre-check before opening modal
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
      return;
    }

    setIsCashuModalOpen(true);
  };

  // Open Live External CASHU Gateway in New Browser Tab
  const handleOpenExternalCashuTab = () => {
    const bookingId = `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const gatewayUrl = 'https://www.cashu.com/cgi-bin/pcashu.cgi';
    
    // Create and submit hidden form to open CASHU in a new tab
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = gatewayUrl;
    form.target = '_blank';

    const params = {
      merchant_id: 'CINEBOOK_SANDBOX',
      token: 'simulated_cashu_token_2026',
      display_text: `CineBook Tickets - ${movie?.title || 'Movie'}`,
      currency: 'USD',
      amount: usdAmount,
      language: 'en',
      session_id: bookingId,
      txt1: user?.email || 'customer@cinebook.in'
    };

    Object.entries(params).forEach(([key, val]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    if (typeof toast?.info === 'function') {
      toast.info('Opened CASHU Gateway in a new tab. You can also complete payment here.');
    } else if (typeof addToast === 'function') {
      addToast('Opened CASHU Gateway in a new tab.', 'info');
    }
  };

  // Complete booking and confirm CASHU transaction
  const handleAuthorizeCashuPayment = async () => {
    setIsProcessingCashu(true);
    setLoading(true);
    setError(null);

    try {
      // 1. Conflict Pre-check
      const statuses = seatLockManager.getShowSeatStatuses(currentShowKey);
      const isConflict = seats.some((s) => {
        const sId = typeof s === 'string' ? s : s?.id;
        return statuses[sId]?.status === 'BOOKED';
      });

      if (isConflict) {
        throw new Error('One or more selected seats have already been reserved by another customer.');
      }

      // Simulate realistic network payment gateway authorization (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 2. Generate Unique IDs
      const bookingId = `CB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const paymentId = `cashu_pay_${Date.now()}`;
      const heldLockToken =
        (lockToken && lockToken !== 'lock_init' ? lockToken : null) ||
        seatLockManager.getHeldToken(currentShowKey) ||
        `lock_${Date.now()}`;

      // 3. Format seat objects
      const formattedSeatsList = seats.map((s) => ({
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

      // 4. Construct Confirmed Booking Record
      const confirmedBooking = {
        bookingId,
        movie: {
          id: movie?.id || 'mv-001',
          title: movie?.title || show?.movieTitle || 'Movie Ticket',
          posterUrl:
            movie?.posterUrl ||
            show?.posterUrl ||
            '/posters/pushpa2.jpg',
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
        baseAmount: baseAmount || totalPayable - 16.17,
        convenienceFee: convenienceFeeTotal || convenienceFee || 16.17,
        taxes: igst || taxes || 2.47,
        totalAmount: totalPayable,
        paymentId,
        orderId: `order_${Date.now()}`,
        paymentMethod: 'CASHU_GATEWAY',
        cashuMethod: cashuTab === 'card' ? 'CASHU_PREPAID_CARD' : 'CASHU_WALLET_ACCOUNT',
        customerName: user?.name || 'Valued Cinema Guest',
        customerEmail: user?.email || cashuAccount || 'customer@cinebook.in',
        customerPhone: user?.phone || '9848012345',
        status: 'CONFIRMED',
        bookedAt: new Date().toISOString()
      };

      // 5. Convert Seat Locks to Confirmed Bookings in local manager & broadcast
      seatLockManager.confirmBooking(currentShowKey, seats, bookingId, show?.id);

      // 6. Persist in Local Storage
      const existingBookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
      localStorage.setItem(
        'cinebook_bookings',
        JSON.stringify([confirmedBooking, ...existingBookings.filter((b) => b.bookingId !== bookingId)])
      );
      localStorage.setItem('cinebook_latest_booking', JSON.stringify(confirmedBooking));

      // 7. Sync with Backend Database API (fail-safe)
      try {
        await bookingApi.createBooking({
          show_id: show?.id || 'sh-001',
          movie_id: movie?.id || 'mv-001',
          theatre_id: theatre?.id || 'th-001',
          show_date: showDate,
          show_time: show?.time || '11:00 AM',
          lock_token: heldLockToken,
          booking_id: bookingId,
          payment_id: paymentId,
          order_id: `order_${Date.now()}`,
          booking_status: 'CONFIRMED',
          seats: formattedSeatsList,
          base_amount: baseAmount || totalPayable - 16.17,
          convenience_fee: convenienceFeeTotal || convenienceFee || 16.17,
          taxes: igst || taxes || 2.47,
          total_amount: totalPayable,
          customer_name: user?.name || 'Valued Cinema Guest',
          customer_email: user?.email || cashuAccount || 'customer@cinebook.in',
          customer_phone: user?.phone || '9848012345'
        });
      } catch (backendErr) {
        console.warn('Backend booking sync notice (local booking confirmed):', backendErr.message);
      }

      setIsCashuModalOpen(false);

      // 8. Notify
      if (typeof toast?.success === 'function') {
        toast.success('CASHU Payment authorized! Generating your tickets...');
      } else if (typeof addToast === 'function') {
        addToast('CASHU Payment authorized! Generating your tickets...', 'success');
      }

      // 9. Immediately Navigate to Confirmation Screen
      navigate(`/booking-confirmation/${bookingId}`, {
        state: { booking: confirmedBooking },
        replace: true
      });
    } catch (err) {
      console.error('CASHU Payment Error:', err);
      const msg = err.message || 'CASHU payment authorization failed. Please try again.';
      setError(msg);
      if (typeof toast?.error === 'function') {
        toast.error(msg);
      } else if (typeof addToast === 'function') {
        addToast(msg, 'error');
      }
      setIsProcessingCashu(false);
      setLoading(false);
    }
  };

  const formattedSeatsText = Array.isArray(seats)
    ? seats.map((s) => (typeof s === 'string' ? s : s?.id || s?.name || s?.number || '')).join(', ')
    : String(seats || '');

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
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
              <ShieldCheck size={14} />
              CASHU Secure Gateway
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
            <div className="border-t border-border pt-4 flex justify-between items-center text-lg font-bold">
              <span className="text-text-primary">Total Payable Amount</span>
              <div className="text-right">
                <span className="text-primary block text-2xl font-black">₹{totalPayable}</span>
                <span className="text-xs text-text-muted font-normal">Approx. ${usdAmount} USD</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenCashuModal}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer text-base active:scale-98"
          >
            <Wallet size={19} className="text-white" />
            <span>Pay ₹{totalPayable} with CASHU</span>
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CASHU PAYMENT POPUP / TAB MODAL                           */}
      {/* ========================================================= */}
      {isCashuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e1626] border border-amber-500/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* CASHU Gateway Header */}
            <div className="bg-[#080d18] border-b border-amber-500/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-black text-black text-sm shadow-md">
                  C
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-amber-400 text-base tracking-wide">CASHU</h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      Payment Gateway
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lock size={11} className="text-emerald-400" /> 256-Bit SSL Encrypted
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isProcessingCashu && setIsCashuModalOpen(false)}
                disabled={isProcessingCashu}
                aria-label="Close"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Order Price & Merchant Summary */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Merchant: CineBook Cinemas</span>
                <span className="text-xs text-slate-200 font-semibold">{movie?.title || 'Movie Tickets'}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Due</span>
                <span className="text-lg font-bold text-amber-400">
                  ₹{totalPayable} <span className="text-xs text-slate-400 font-normal">(${usdAmount} USD)</span>
                </span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="p-6 space-y-5">
              <div className="flex rounded-xl bg-[#060a12] p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCashuTab('wallet')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    cashuTab === 'wallet'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wallet size={14} />
                  <span>CASHU Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCashuTab('card')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    cashuTab === 'card'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>Refill Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCashuTab('external')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    cashuTab === 'external'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ExternalLink size={14} />
                  <span>New Tab</span>
                </button>
              </div>

              {/* Tab 1: CASHU Wallet Account */}
              {cashuTab === 'wallet' && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      CASHU Account (Email or Account ID)
                    </label>
                    <input
                      type="text"
                      value={cashuAccount}
                      onChange={(e) => setCashuAccount(e.target.value)}
                      placeholder="e.g. customer@cinebook.in"
                      className="w-full bg-[#060a12] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      CASHU Password / PIN
                    </label>
                    <input
                      type="password"
                      value={cashuPassword}
                      onChange={(e) => setCashuPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#060a12] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                    💡 Test sandbox credentials active. Click below to authorize instant payment.
                  </div>
                </div>
              )}

              {/* Tab 2: CASHU Refill / Prepaid Card */}
              {cashuTab === 'card' && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      16-Digit CASHU Card / Voucher Number
                    </label>
                    <input
                      type="text"
                      value={cashuCardNumber}
                      onChange={(e) => setCashuCardNumber(e.target.value)}
                      placeholder="4589 3200 9811 7642"
                      className="w-full bg-[#060a12] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      4-Digit Card PIN
                    </label>
                    <input
                      type="password"
                      value={cashuCardPin}
                      onChange={(e) => setCashuCardPin(e.target.value)}
                      placeholder="8832"
                      maxLength={4}
                      className="w-full bg-[#060a12] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none font-mono"
                    />
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                    💳 Supports CASHU Master Refill cards and instant digital vouchers.
                  </div>
                </div>
              )}

              {/* Tab 3: External Gateway Tab */}
              {cashuTab === 'external' && (
                <div className="space-y-3 animate-in fade-in text-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <ExternalLink size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-white">Open Live CASHU Gateway</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Launch the official CASHU payment redirection portal in a separate browser tab to authenticate directly.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenExternalCashuTab}
                    className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <span>Launch External Tab</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              )}

              {/* Authorize & Pay Action */}
              <button
                type="button"
                onClick={handleAuthorizeCashuPayment}
                disabled={isProcessingCashu}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-black font-extrabold rounded-xl transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-98"
              >
                {isProcessingCashu ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-black" />
                    <span>Authorizing CASHU Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} className="text-black" />
                    <span>Authorize & Pay ₹{totalPayable} (${usdAmount} USD)</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => !isProcessingCashu && setIsCashuModalOpen(false)}
                  disabled={isProcessingCashu}
                  className="text-xs text-slate-400 hover:text-white transition underline cursor-pointer"
                >
                  Cancel and return to checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
