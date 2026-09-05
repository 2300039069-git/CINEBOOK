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
  Image as ImageIcon,
  ReceiptText,
  FileText
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useTheme } from '../../context/ThemeContext';
import ThermalTicketReceipt from '../../components/booking/ThermalTicketReceipt';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const { clearBooking } = useBooking();
  const { currentTheme, theme } = useTheme();
  const ticketRef = useRef(null);

  // Load booking from localStorage or fallback
  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
  const booking = bookings.find((b) => b.bookingId === bookingId) || bookings[0] || {
    bookingId: bookingId || 'CB-2026-894120',
    movie: { title: 'Pushpa 2: The Rule (2024)' },
    theatre: { name: 'Siva Cinemas', address: 'Near Old Bus Stand, Guntur' },
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

    const isLight = currentTheme === 'LUXE_WHITE';
    const bgColor = isLight ? '#FFFFFF' : currentTheme === 'MIDNIGHT_BLACK' ? '#070709' : '#0A0B14';
    const cardColor = isLight ? '#F8FAFC' : currentTheme === 'MIDNIGHT_BLACK' ? '#111116' : '#131527';
    const textColor = isLight ? '#0F172A' : '#FFFFFF';
    const accentColor = isLight ? '#4F46E5' : currentTheme === 'MIDNIGHT_BLACK' ? '#FF003A' : '#EC4899';
    const mutedColor = isLight ? '#64748B' : '#94A3B8';

    // 1. Draw Canvas Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Card Body
    ctx.fillStyle = cardColor;
    ctx.strokeStyle = accentColor;
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
    ctx.strokeStyle = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.15)';
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
    ctx.font = 'bold 36px sans-serif';
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
    ctx.fillStyle = isLight ? '#EEF2F6' : 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(70, 400, 660, 110, 16);
    ctx.fill();

    ctx.fillStyle = mutedColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CONFIRMED SEATS:', 95, 445);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 28px monospace';
    ctx.fillText(booking.seats?.map(s => s.id).join(', ') || 'C5, C6', 280, 448);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Total Paid: ₹${booking.totalAmount}.00 (Verified via 256-Bit SSL)`, 95, 490);

    // 7. Security & Active Theme Badge
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`🎨 CineBook Theme: ${theme.name} ${theme.icon}`, 70, 560);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`✓ Payment ID: ${booking.paymentId}`, 70, 595);

    // 8. Gate QR Scan Guidance
    ctx.fillStyle = isLight ? '#0F172A' : '#FFFFFF';
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
    link.download = `CineBook_Ticket_${booking.bookingId}_${currentTheme.toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const qrSecureValue = `https://cinebook.in/verify-ticket?ref=${booking.bookingId}&sig=${booking.paymentId}`;

  return (
    <div className="min-h-screen py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 transition-colors">
      {/* 1. CELEBRATION HEADER (Hidden in Print) */}
      <div className="text-center space-y-2 animate-fade-in no-print">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-theme-primary tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs text-theme-muted">
          Your payment was verified. Download or print your ticket with your active <strong className="text-pink-500">{theme.name} {theme.icon}</strong> theme!
        </p>
      </div>

      {/* 2. DIGITAL ELECTRONIC TICKET CARD (Preserves exact active theme) */}
      <div
        id="printable-ticket"
        ref={ticketRef}
        className="relative glass-panel rounded-3xl overflow-hidden shadow-2xl border border-[var(--theme-border)] transition-colors"
      >
        {/* Ticket Header */}
        <div className="p-6 border-b border-[var(--theme-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-theme-primary text-base block leading-none">
                CINE<span className="text-pink-500">BOOK</span> E-TICKET
              </span>
              <span className="text-[10px] text-theme-muted uppercase font-bold tracking-wider mt-0.5 block">
                Theme: {theme.name} {theme.icon}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase text-theme-muted block font-black">Booking ID</span>
            <span className="text-sm font-mono font-black text-pink-500">{booking.bookingId}</span>
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
                <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-xl border border-[var(--theme-border)]">
                  <Calendar className="w-3.5 h-3.5 text-pink-500" />
                  <span className="font-bold text-theme-primary">{booking.showDate}</span>
                </div>
                <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-xl border border-[var(--theme-border)]">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold text-theme-primary">{booking.show?.time || '11:00 AM'}</span>
                </div>
              </div>
            </div>

            {/* Seats Box */}
            <div className="p-4 rounded-2xl glass-card space-y-1.5 border border-[var(--theme-border)]">
              <div className="flex justify-between text-xs">
                <span className="text-theme-muted font-bold">Confirmed Seats ({booking.seats?.length || 0}):</span>
                <span className="font-mono font-black text-pink-500 text-sm">
                  {booking.seats?.map((s) => s.id).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-theme-secondary pt-1 border-t border-[var(--theme-border)]">
                <span>Total Paid (256-Bit SSL)</span>
                <span className="font-black text-emerald-500">₹{booking.totalAmount}.00</span>
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

      {/* 3. ACTION CONTROLS (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 no-print">
        {/* 1. Print in Exact Theme */}
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black uppercase tracking-wider shadow-glow-pink transition-all transform hover:scale-105 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print {theme.name} Ticket</span>
        </button>

        {/* 2. Print 80mm Thermal Slip (POS Counter Paper) */}
        <button
          type="button"
          onClick={handlePrintThermal}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all transform hover:scale-105 cursor-pointer"
        >
          <ReceiptText className="w-4 h-4" />
          <span>Print 80mm Thermal Slip</span>
        </button>

        {/* 3. Download as Themed PNG */}
        <button
          type="button"
          onClick={handleDownloadImage}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glass-panel hover:border-pink-500 text-theme-primary text-xs font-black transition-all cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4 text-pink-500" />
          <span>Download Themed PNG</span>
        </button>

        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-card text-theme-secondary hover:text-theme-primary text-xs font-bold transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>My Bookings</span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl glass-card text-theme-secondary hover:text-theme-primary text-xs font-bold transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* 4. MODAL: 80MM CONTINUOUS THERMAL RECEIPT SLIP */}
      {showThermalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-[var(--theme-border)] shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)] no-print">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-black text-sm text-theme-primary">80mm Box-Office Thermal Slip</h3>
                  <p className="text-[10px] text-theme-muted">Formatted for continuous thermal POS paper roll</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowThermalModal(false)}
                className="w-7 h-7 rounded-full glass-card flex items-center justify-center text-theme-muted hover:text-theme-primary text-xs cursor-pointer"
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
