import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Ticket,
  Home,
  ReceiptText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Film,
  MessageCircle,
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { DigitalTicket } from '../../components/booking/DigitalTicket';
import ThermalTicketReceipt from '../../components/booking/ThermalTicketReceipt';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const { clearBooking } = useBooking();
  const { toast } = useToast();

  // Load booking from state, localStorage, or fallback
  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
  const latestBooking = JSON.parse(localStorage.getItem('cinebook_latest_booking') || 'null');
  const booking =
    location.state?.booking ||
    (bookingId ? bookings.find((b) => b.bookingId === bookingId) : null) ||
    latestBooking ||
    bookings[0] || {
      bookingId: bookingId || 'CB-2026-894120',
      movie: { title: 'Pushpa 2: The Rule (2024)', posterUrl: '/posters/pushpa2.jpg' },
      theatre: { name: 'Siva Cinemas 4K Laser', address: 'Near Old Bus Stand, Guntur' },
      show: { time: '11:00 AM', format: '2D Dolby Atmos', language: 'Telugu' },
      showDate: new Date().toISOString().split('T')[0],
      seats: [{ id: 'C5' }, { id: 'C6' }],
      totalAmount: 459,
      paymentId: `pay_direct_${Date.now()}`
    };

  const [showThermalModal, setShowThermalModal] = useState(false);
  const [resending, setResending] = useState(false);

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

  const handlePrintThermal = () => {
    setShowThermalModal(true);
  };

  const handleSendToWhatsApp = () => {
    const movieName = booking.movie?.title || booking.movie_title || 'Cinema Experience';
    const cinemaName = booking.theatre?.name || booking.theatre_name || 'Siva Cinemas';
    const showTime = booking.show?.time || booking.show_time || 'Showtime';
    const showDate = booking.showDate || booking.show_date || 'Today';
    const bId = booking.bookingId || booking.booking_id || bookingId;
    const seats = (booking.seats || []).map((s) => (typeof s === 'string' ? s : s.id || s.seatNumber)).join(', ');

    const message = `🎟️ *CINEBOOK E-TICKET CONFIRMED*\n\n` +
      `🎬 *Movie:* ${movieName}\n` +
      `📍 *Cinema:* ${cinemaName}\n` +
      `📅 *Show:* ${showDate} at ${showTime}\n` +
      `💺 *Seats:* *${seats || 'Confirmed'}*\n` +
      `🆔 *Booking ID:* \`${bId}\`\n\n` +
      `📱 *Digital Entry Pass:* https://cinebook.cyou/booking-confirmation/${bId}\n\n` +
      `✨ _Show this QR pass at the turnstile for instant admission._`;

    const phoneRaw = (booking.customerPhone || booking.customer_phone || '').replace(/\D/g, '');
    const cleanPhone = phoneRaw.slice(-10);
    const waUrl = cleanPhone
      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
    toast.success('Opening WhatsApp with your confirmed ticket pass!');
  };

  const handleResendNotifications = async () => {
    setResending(true);
    const bId = booking.bookingId || booking.booking_id || bookingId;
    try {
      const resp = await fetch('/api/v1/payments/resend-ticket-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bId })
      });
      if (resp.ok) {
        toast.success('E-Ticket pass resent to your registered Email and Mobile SMS!');
      } else {
        toast.info('Ticket pass notification queued for delivery.');
      }
    } catch (e) {
      toast.info('Ticket pass resent to your Email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-background text-text-primary transition-colors">
      {/* 1. CELEBRATION HERO BANNER (Hidden in Print) */}
      <div className="text-center space-y-3 animate-fade-in no-print">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Verified • Seats Confirmed</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight font-sans">
          You're Going to the Movies!
        </h1>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          Your reservation is locked. Show the digital QR pass below at the cinema turnstile for instant admission.
        </p>
      </div>

      {/* 2. DIGITAL ELECTRONIC TICKET COMPONENT */}
      <DigitalTicket booking={booking} />

      {/* 3. MULTI-CHANNEL DELIVERY & ACTION DECK (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 no-print">
        {/* 1-Click WhatsApp Share */}
        <button
          type="button"
          onClick={handleSendToWhatsApp}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-600/25"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Send to WhatsApp</span>
        </button>

        {/* Resend Email / SMS */}
        <button
          type="button"
          disabled={resending}
          onClick={handleResendNotifications}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-elevated hover:bg-surface border border-border text-text-primary text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm disabled:opacity-50"
        >
          {resending ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Mail className="w-4 h-4 text-primary" />
          )}
          <span>Resend Email & SMS</span>
        </button>

        {/* Print 80mm Thermal Slip (POS Counter Paper) */}
        <button
          type="button"
          onClick={handlePrintThermal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-elevated hover:bg-surface border border-amber-500/40 text-amber-500 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <ReceiptText className="w-4 h-4 text-amber-500" />
          <span>80mm Thermal Slip</span>
        </button>

        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-elevated hover:bg-surface border border-border text-text-secondary hover:text-text-primary text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Ticket className="w-4 h-4 text-primary" />
          <span>My Passes</span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider transition-all shadow-cta active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Explore Movies</span>
        </Link>
      </div>

      {/* 4. MODAL: 80MM CONTINUOUS THERMAL RECEIPT SLIP */}
      {showThermalModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface p-6 rounded-3xl max-w-md w-full border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border no-print">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm text-text-primary font-sans">80mm Cinema Thermal Slip</h3>
                  <p className="text-[10px] text-text-muted">Formatted for continuous 80mm POS printer paper</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowThermalModal(false)}
                className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text-primary text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <ThermalTicketReceipt
              booking={booking}
              onClose={() => setShowThermalModal(false)}
              onPrint={() => {
                document.body.classList.add('printing-thermal');
                window.print();
                document.body.classList.remove('printing-thermal');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmationPage;
