import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Film,
  Download,
  Share2,
  Home,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const { clearBooking } = useBooking();

  // Load booking from localStorage or fallback
  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
  const booking = bookings.find((b) => b.bookingId === bookingId) || bookings[0];

  useEffect(() => {
    // Fire confetti celebration on successful booking
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Clear active booking context session
    clearBooking();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-black text-theme-primary">Booking Details Not Found</h2>
        <Link to="/" className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black">
          Return Home
        </Link>
      </div>
    );
  }

  const qrSecureValue = `https://cinebook.in/verify-ticket?ref=${booking.bookingId}&sig=${booking.paymentId}`;

  return (
    <div className="min-h-screen py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 transition-colors">
      {/* 1. CELEBRATION HEADER */}
      <div className="text-center space-y-2 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-theme-primary tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs text-theme-muted">
          Your payment was verified. An electronic digital ticket with QR code has been generated.
        </p>
      </div>

      {/* 2. DIGITAL ELECTRONIC TICKET CARD */}
      <div className="relative glass-panel rounded-3xl overflow-hidden shadow-2xl border border-[var(--theme-border)]">
        {/* Ticket Header */}
        <div className="p-6 border-b border-[var(--theme-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <span className="font-display font-black text-theme-primary text-base">
              CINE<span className="text-pink-500">BOOK</span> E-TICKET
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase text-theme-muted block font-black">Booking ID</span>
            <span className="text-xs font-mono font-black text-pink-500">{booking.bookingId}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Left 2 Cols: Movie & Cinema details */}
          <div className="sm:col-span-2 space-y-4">
            <div>
              <span className="text-[11px] font-black text-pink-500 uppercase tracking-wider">
                {booking.show?.format || '2D Dolby Atmos'} • {booking.show?.language || 'Telugu'}
              </span>
              <h2 className="text-2xl font-black text-theme-primary mt-0.5">
                {booking.movie?.title || 'Pushpa 2: The Rule'}
              </h2>
            </div>

            <div className="space-y-2 text-xs text-theme-secondary">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <span className="font-bold text-theme-primary">{booking.theatre?.name || 'Siva Cinemas'}</span>
              </p>
              <p className="text-theme-muted text-[11px] pl-6">
                {booking.theatre?.address || 'Near Old Bus Stand, Guntur'}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 text-pink-500" />
                  <span className="font-bold text-theme-primary">{booking.showDate}</span>
                </div>
                <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold text-theme-primary">{booking.show?.time || '11:00 AM'}</span>
                </div>
              </div>
            </div>

            {/* Seats Box */}
            <div className="p-4 rounded-2xl glass-card space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-theme-muted font-bold">Confirmed Seats ({booking.seats?.length || 0}):</span>
                <span className="font-mono font-black text-pink-500 text-sm">
                  {booking.seats?.map((s) => s.id).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-theme-secondary pt-1 border-t border-[var(--theme-border)]">
                <span>Total Paid (Razorpay)</span>
                <span className="font-black text-emerald-500">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Right Col: QR Code */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-300 text-center shadow-inner">
            <QRCodeSVG
              value={qrSecureValue}
              size={130}
              level="H"
              includeMargin={true}
            />
            <span className="text-[10px] text-slate-800 font-black uppercase tracking-wider mt-1">
              Scan at Gate
            </span>
          </div>
        </div>

        {/* Notches on Ticket Separator */}
        <div className="relative flex items-center justify-between px-2 -my-3">
          <div className="w-6 h-6 rounded-full bg-[var(--theme-bg)] border-r border-[var(--theme-border)] -ml-3" />
          <div className="w-full border-t-2 border-dashed border-[var(--theme-border)] mx-2" />
          <div className="w-6 h-6 rounded-full bg-[var(--theme-bg)] border-l border-[var(--theme-border)] -mr-3" />
        </div>

        {/* Ticket Footer Strip */}
        <div className="p-4 bg-black/10 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-theme-muted">
          <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified: {booking.paymentId}</span>
          </span>
          <span className="text-[11px] text-theme-muted">
            Show this QR code at theatre entrance for instant gate entry
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-panel hover:border-pink-500 text-theme-primary text-xs font-black transition-all"
        >
          <Download className="w-4 h-4 text-pink-500" />
          <span>Download / Print Ticket</span>
        </button>

        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black shadow-glow-pink transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>Go to My Bookings</span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl glass-card text-theme-secondary hover:text-theme-primary text-xs font-bold transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
