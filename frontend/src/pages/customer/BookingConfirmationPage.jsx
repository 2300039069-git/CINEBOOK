import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Ticket,
  Home,
  ReceiptText
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { DigitalTicket } from '../../components/booking/DigitalTicket';
import ThermalTicketReceipt from '../../components/booking/ThermalTicketReceipt';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const { clearBooking } = useBooking();

  // Load booking from localStorage or fallback
  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
  const booking = bookings.find((b) => b.bookingId === bookingId) || bookings[0] || {
    bookingId: bookingId || 'CB-2026-894120',
    movie: { title: 'Pushpa 2: The Rule (2024)', posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop' },
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

  const handlePrintThermal = () => {
    setShowThermalModal(true);
  };

  return (
    <div className="min-h-screen py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 bg-background text-text-primary transition-colors">
      {/* 1. CELEBRATION HEADER (Hidden in Print) */}
      <div className="text-center space-y-2 animate-fade-in no-print">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs text-text-muted">
          Your payment was verified via 256-Bit SSL. Present your verified QR pass below at the cinema gate.
        </p>
      </div>

      {/* 2. DIGITAL ELECTRONIC TICKET COMPONENT */}
      <DigitalTicket booking={booking} />

      {/* 3. ADDITIONAL CONTROLS (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 no-print">
        {/* Print 80mm Thermal Slip (POS Counter Paper) */}
        <button
          type="button"
          onClick={handlePrintThermal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-amber-500 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
        >
          <ReceiptText className="w-4 h-4 text-amber-500" />
          <span>80mm POS Thermal Slip</span>
        </button>

        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
        >
          <Ticket className="w-4 h-4 text-primary" />
          <span>My Bookings</span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Explore More</span>
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
