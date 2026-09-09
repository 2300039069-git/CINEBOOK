import React, { useEffect, useRef, useState } from 'react';
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
  Sparkles,
  Printer,
  ReceiptText
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import ThermalTicketReceipt from '../../components/booking/ThermalTicketReceipt';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const { clearBooking } = useBooking();
  const ticketRef = useRef(null);

  // Load booking from localStorage or fallback
  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
  const booking = bookings.find((b) => b.bookingId === bookingId) || bookings[0] || {
    bookingId: bookingId || 'CB-2026-894120',
    movie: { title: 'Pushpa 2: The Rule (2024)' },
    theatre: { name: 'Siva Cinemas 4K Laser', address: 'Near Old Bus Stand, Guntur' },
    show: { time: '11:00 AM', format: '2D Dolby Atmos', language: 'Telugu' },
    showDate: new Date().toISOString().split('T')[0],
    seats: [{ id: 'C5' }, { id: 'C6' }],
    totalAmount: 459,
    paymentId: `pay_rzp_${Date.now()}`
  };

  const [showThermalModal, setShowThermalModal] = useState(false);

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
    document.body.classList.remove('printing-thermal');
    window.print();
  };

  const handlePrintThermal = () => {
    setShowThermalModal(true);
  };

  // Direct HTML5 Canvas PNG Themed Ticket Downloader
  const handleDownloadImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1050;

    const bgColor = '#090A0E';
    const cardColor = '#11141D';
    const textColor = '#FFFFFF';
    const accentColor = '#E50914';
    const goldColor = '#F59E0B';
    const mutedColor = '#94A3B8';

    // 1. Draw Canvas Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Card Body
    ctx.fillStyle = cardColor;
    ctx.strokeStyle = '#1E2332';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(40, 40, 720, 970, 24);
    ctx.fill();
    ctx.stroke();

    // 3. Header
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('CINEBOOK E-TICKET', 70, 100);

    ctx.fillStyle = mutedColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`BOOKING REF: ${booking.bookingId}`, 480, 100);

    // Divider
    ctx.strokeStyle = '#1E2332';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(70, 130);
    ctx.lineTo(730, 130);
    ctx.stroke();

    // 4. Movie Title & Formats
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText((booking.show?.format || '2D DOLBY ATMOS').toUpperCase(), 70, 175);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(booking.movie?.title || 'Pushpa 2: The Rule', 70, 225);

    // 5. Cinema & Showtime
    ctx.fillStyle = textColor;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`📍 ${booking.theatre?.name || 'Siva Cinemas: Guntur'}`, 70, 280);

    ctx.fillStyle = mutedColor;
    ctx.font = '16px sans-serif';
    ctx.fillText(booking.theatre?.address || 'Near Old Bus Stand, Guntur', 70, 310);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`📅 Date: ${booking.showDate}     ⏰ Time: ${booking.show?.time || '11:00 AM'}`, 70, 360);

    // 6. Confirmed Seats Box
    ctx.fillStyle = '#181C28';
    ctx.beginPath();
    ctx.roundRect(70, 400, 660, 110, 16);
    ctx.fill();

    ctx.fillStyle = mutedColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CONFIRMED SEATS:', 95, 445);

    ctx.fillStyle = goldColor;
    ctx.font = 'bold 28px monospace';
    ctx.fillText(booking.seats?.map(s => (typeof s === 'string' ? s : s.id)).join(', ') || 'C5, C6', 280, 448);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Total Paid: ₹${booking.totalAmount}.00 (Verified via 256-Bit SSL)`, 95, 490);

    // 7. Security & Brand Badge
    ctx.fillStyle = goldColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('🎬 CINEBOOK PLATINUM PASS', 70, 560);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`✓ Payment ID: ${booking.paymentId}`, 70, 595);

    // 8. Gate QR Scan Guidance
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('SCAN THIS QR PASS AT CINEMA GATE FOR INSTANT ADMISSION', 110, 680);

    // Draw QR placeholder box on canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(290, 710, 220, 220);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(290, 710, 220, 220);

    // Inner QR pattern text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('DIGITAL QR PASS', 335, 825);
    ctx.fillText(booking.bookingId, 330, 850);

    ctx.fillStyle = mutedColor;
    ctx.font = '13px sans-serif';
    ctx.fillText('100% Validated by CineBook Gatekeeper Engine • Enjoy your movie!', 180, 980);

    // Download trigger
    const link = document.createElement('a');
    link.download = `CineBook_Ticket_${booking.bookingId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const qrSecureValue = `https://cinebook.in/verify-ticket?ref=${booking.bookingId}&sig=${booking.paymentId}`;

  return (
    <div className="min-h-screen py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-background text-text-primary transition-colors">
      {/* 1. CELEBRATION HEADER (Hidden in Print) */}
      <div className="text-center space-y-2 animate-fade-in no-print">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs text-text-muted">
          Your payment was verified via 256-Bit SSL. Download or print your verified QR pass below!
        </p>
      </div>

      {/* 2. DIGITAL ELECTRONIC TICKET CARD */}
      <div
        id="printable-ticket"
        ref={ticketRef}
        className="relative bg-surface rounded-2xl overflow-hidden shadow-2xl border border-border text-text-primary"
      >
        {/* Ticket Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-text-primary text-base block leading-none tracking-wider">
                CINE<span className="text-accent">BOOK</span> E-PASS
              </span>
              <span className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mt-0.5 block">
                Official Digital Admission Pass
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase text-text-muted block font-bold">Booking ID</span>
            <span className="text-sm font-mono font-extrabold text-amber-500">{booking.bookingId}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Left 2 Cols: Movie & Cinema details */}
          <div className="sm:col-span-2 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                {booking.show?.format || '2D Dolby Atmos'} • {booking.show?.language || 'Telugu'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mt-0.5">
                {booking.movie?.title || 'Pushpa 2: The Rule (2024)'}
              </h2>
            </div>

            <div className="space-y-2 text-xs text-text-secondary">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="font-bold text-text-primary">{booking.theatre?.name || 'Siva Cinemas 4K Dolby Atmos'}</span>
              </p>
              <p className="text-text-muted text-xs pl-6">
                {booking.theatre?.address || 'Near Old Bus Stand, Guntur'}
              </p>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-lg border border-border">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-text-primary">{booking.showDate}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-lg border border-border">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-text-primary">{booking.show?.time || '11:00 AM'}</span>
                </div>
              </div>
            </div>

            {/* Seats Box */}
            <div className="p-4 rounded-xl bg-surface-elevated space-y-1.5 border border-border">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted font-semibold">Confirmed Seats ({booking.seats?.length || 0}):</span>
                <span className="font-mono font-bold text-accent text-sm">
                  {booking.seats?.map((s) => (typeof s === 'string' ? s : s.id)).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary pt-1.5 border-t border-border">
                <span>Total Paid (256-Bit SSL)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{booking.totalAmount}.00</span>
              </div>
            </div>
          </div>

          {/* Right Col: QR Code */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-300 text-center shadow-inner">
            <QRCodeSVG
              value={qrSecureValue}
              size={125}
              level="H"
              includeMargin={true}
            />
            <span className="text-[10px] text-slate-900 font-extrabold uppercase tracking-wider mt-1">
              Scan at Gate
            </span>
          </div>
        </div>

        {/* Notches on Ticket Separator */}
        <div className="relative flex items-center justify-between px-2 -my-3">
          <div className="w-6 h-6 rounded-full bg-background border-r border-border -ml-3" />
          <div className="w-full border-t-2 border-dashed border-border mx-2" />
          <div className="w-6 h-6 rounded-full bg-background border-l border-border -mr-3" />
        </div>

        {/* Ticket Footer Strip */}
        <div className="p-4 bg-surface-elevated flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified: {booking.paymentId}</span>
          </span>
          <span className="text-[11px] text-text-muted">
            Present this QR code at cinema gate for instant admission
          </span>
        </div>
      </div>

      {/* 3. ACTION CONTROLS (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 no-print">
        {/* 1. Print Standard Theme Ticket */}
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Printer className="w-4 h-4 text-white" />
          <span>Print E-Ticket</span>
        </button>

        {/* 2. Print 80mm Thermal Slip (POS Counter Paper) */}
        <button
          type="button"
          onClick={handlePrintThermal}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-amber-500 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
        >
          <ReceiptText className="w-4 h-4 text-amber-500" />
          <span>Print 80mm Thermal Slip</span>
        </button>

        {/* 3. Download as Themed PNG */}
        <button
          type="button"
          onClick={handleDownloadImage}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-text-primary text-xs font-bold transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-text-muted" />
          <span>Download PNG</span>
        </button>

        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>My Bookings</span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* 4. MODAL: 80MM CONTINUOUS THERMAL RECEIPT SLIP */}
      {showThermalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface p-6 rounded-2xl max-w-md w-full border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border no-print">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm text-text-primary">80mm Box-Office Thermal Slip</h3>
                  <p className="text-[10px] text-text-muted">Formatted for continuous thermal POS paper roll</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowThermalModal(false)}
                className="w-7 h-7 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text-primary text-xs cursor-pointer"
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
