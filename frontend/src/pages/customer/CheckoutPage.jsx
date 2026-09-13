import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Ticket, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { selectedSeats, selectedShow, clearBooking } = useBooking();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bookingDetails = location.state || {};
  const show = bookingDetails.show || selectedShow;
  const seats = bookingDetails.seats || selectedSeats || [];
  const totalAmount = bookingDetails.totalAmount || (seats.length * (show?.price || 150));

  useEffect(() => {
    if (!show || seats.length === 0) {
      navigate('/movies');
    }
  }, [show, seats, navigate]);

  const handleCashfreePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.Cashfree) {
        throw new Error("Cashfree SDK not loaded. Please refresh the page.");
      }

      // 1. Create order on your backend
      const res = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          bookingId: `BK_${Date.now()}`,
          customerPhone: user?.phone || '9999999999',
          customerEmail: user?.email || 'guest@cinebook.in',
          customerName: user?.name || 'Cinebook Viewer'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.payment_session_id) {
        throw new Error(data.message || data.detail || 'Failed to initialize payment session.');
      }

      // 2. Launch Cashfree Sandbox Checkout
      const cashfree = window.Cashfree({ mode: 'sandbox' });
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_self'
      });
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.message || 'Payment initiation failed.');
      addToast(err.message || 'Failed to launch payment', 'error');
      setLoading(false);
    }
  };

  const formattedSeats = Array.isArray(seats)
    ? seats.map((s) => (typeof s === 'string' ? s : s?.id || s?.name || s?.number || '')).join(', ')
    : String(seats || '');

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Back to Seat Selection</span>
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold">Booking Checkout</h1>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              <ShieldCheck size={14} />
              Cashfree Sandbox Secured
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center text-slate-300">
              <span>Movie</span>
              <span className="font-semibold text-white">{show?.movieTitle || show?.title || 'Movie Ticket'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Theatre & Time</span>
              <span className="font-semibold text-white">
                {show?.theatreName || show?.theatre || 'Cinebook Cinema'} | {show?.time || 'Showtime'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Seats ({seats.length})</span>
              <span className="font-semibold text-white">{formattedSeats || 'Selected Seats'}</span>
            </div>
            <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-lg font-bold">
              <span>Total Payable Amount</span>
              <span className="text-rose-400">₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handleCashfreePayment}
            disabled={loading}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Redirecting to Cashfree...</span>
              </>
            ) : (
              <>
                <Ticket size={18} />
                <span>Pay ₹{totalAmount} with Cashfree</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
