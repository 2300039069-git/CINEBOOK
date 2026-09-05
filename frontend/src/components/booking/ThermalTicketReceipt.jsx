import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, CheckCircle2 } from 'lucide-react';

/**
 * 80mm Continuous Thermal Receipt Component for Cinema Box-Office Counter POS
 * Formatted specifically for standard 80mm (3-1/8") and 58mm thermal roll POS printers.
 */
const ThermalTicketReceipt = ({ booking, onClose, onPrint, autoPrint = false }) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      document.body.classList.add('printing-thermal');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-thermal');
      }, 500);
    }
  };

  React.useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  if (!booking) return null;

  const seatsList = Array.isArray(booking.seats)
    ? booking.seats.map((s) => (typeof s === 'string' ? s : s.id || s.seat_number)).join(', ')
    : booking.seats || 'A1';

  const seatsCount = Array.isArray(booking.seats) ? booking.seats.length : 1;
  const qrData = `https://cinebook.in/verify-ticket?ref=${booking.bookingId}&sig=${booking.paymentId || 'COUNTER_CASH'}`;
  const totalPaid = booking.totalAmount || (booking.seats?.length ? booking.seats.length * 200 : 200);
  const baseFare = Math.round(totalPaid / 1.18);
  const gst = totalPaid - baseFare;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Non-printable Control Actions */}
      <div className="no-print mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-glow-pink transition-all transform hover:scale-105 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print 80mm Thermal Slip</span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl glass-panel hover:border-pink-500 text-theme-muted hover:text-theme-primary text-xs font-bold transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        )}
      </div>

      {/* 80mm Thermal Receipt Slip (Target for Printer & Screen Preview) */}
      <div
        id="thermal-receipt-slip"
        className="thermal-receipt-container bg-white text-black p-5 rounded-lg shadow-2xl border border-slate-300 w-[78mm] max-w-[80mm] font-mono text-xs leading-tight select-none"
        style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
      >
        {/* 1. Header: Theatre Info */}
        <div className="text-center space-y-1 pb-2 border-b border-dashed border-black">
          <h2 className="font-black text-sm tracking-wider uppercase text-black">
            {booking.theatre?.name || 'SIVA CINEMAS'}
          </h2>
          <p className="text-[10px] uppercase font-bold text-gray-800">
            {booking.theatre?.address || 'Near Old Bus Stand, Guntur'}
          </p>
          <p className="text-[9px] text-gray-700">GSTIN: 37AAACB2948L1Z9 • SCREEN 1 4K</p>
          <div className="text-[9px] font-black uppercase tracking-widest pt-0.5 text-black">
            *** CASH BOX-OFFICE PASS ***
          </div>
        </div>

        {/* 2. Booking Ref & Timestamp */}
        <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px] text-black">
          <div className="flex justify-between">
            <span className="font-bold">TOKEN REF:</span>
            <span className="font-black tracking-wider">{booking.bookingId}</span>
          </div>
          <div className="flex justify-between text-gray-700 text-[9px]">
            <span>DATE: {booking.showDate || new Date().toISOString().split('T')[0]}</span>
            <span>TIME: {booking.show?.time || booking.showtime || '11:00 AM'}</span>
          </div>
          <div className="flex justify-between text-gray-700 text-[9px]">
            <span>COUNTER: POS-01</span>
            <span>OPR: CASHIER-04</span>
          </div>
        </div>

        {/* 3. Movie Title & Specs */}
        <div className="py-2.5 border-b border-dashed border-black text-center space-y-1 text-black">
          <p className="text-[10px] font-bold uppercase text-gray-800 tracking-wider">
            {booking.show?.format || '2D DOLBY ATMOS'} • {booking.show?.language || 'TELUGU'}
          </p>
          <h1 className="font-black text-sm uppercase leading-tight tracking-wide text-black">
            {booking.movie?.title || 'PUSHPA 2: THE RULE'}
          </h1>
          <p className="text-[9px] font-bold text-gray-700">CENSOR: UA • AUDI 1</p>
        </div>

        {/* 4. LARGE BOLD SEATS (Physical Box-Office Highlight) */}
        <div className="py-3 border-b-2 border-solid border-black text-center space-y-1 bg-gray-50 my-1 rounded text-black">
          <span className="text-[9px] font-bold uppercase text-gray-600 block">
            CONFIRMED SEATS ({seatsCount} {seatsCount === 1 ? 'SEAT' : 'SEATS'})
          </span>
          <div className="text-base font-black tracking-widest text-black py-0.5">
            {seatsList}
          </div>
          <span className="text-[9px] font-bold uppercase text-gray-800 block">
            CATEGORY: BALCONY / EXECUTIVE
          </span>
        </div>

        {/* 5. Pricing & Tax Breakdown */}
        <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px] text-black">
          <div className="flex justify-between">
            <span>Ticket Base Fare ({seatsCount}x):</span>
            <span>₹{baseFare}.00</span>
          </div>
          <div className="flex justify-between text-gray-700 text-[9px]">
            <span>CGST (9%) + SGST (9%):</span>
            <span>₹{gst}.00</span>
          </div>
          <div className="flex justify-between font-black text-xs pt-1 border-t border-dotted border-gray-400 text-black">
            <span>TOTAL AMOUNT PAID:</span>
            <span>₹{totalPaid}.00</span>
          </div>
          <div className="flex justify-between text-[9px] text-gray-700">
            <span>PAYMENT MODE:</span>
            <span className="font-bold uppercase text-black">{booking.paymentMode || 'COUNTER CASH'}</span>
          </div>
        </div>

        {/* 6. High-Density Gatekeeper Scanner QR Code */}
        <div className="py-3 flex flex-col items-center justify-center space-y-1.5 border-b border-dashed border-black bg-white">
          <QRCodeSVG
            value={qrData}
            size={110}
            level="M"
            includeMargin={true}
          />
          <span className="text-[9px] font-black uppercase tracking-widest text-black text-center">
            SCAN AT GATE FOR ENTRY
          </span>
          <p className="text-[8px] text-gray-600 text-center">
            Valid for 1 Entry • CineBook Gatekeeper Secured
          </p>
        </div>

        {/* 7. Footer Barcode & Legal Notice */}
        <div className="pt-2 text-center space-y-1 text-[8px] text-gray-700">
          <div className="tracking-[3px] font-mono text-[9px] text-black font-bold">
            ||||| | |||| ||||| || |||||| | |||||
          </div>
          <p className="font-mono text-[8px] text-black font-bold">{booking.bookingId}</p>
          <p className="leading-tight text-gray-800">
            * Retain this slip until end of the show.<br />
            * Outside food & beverages strictly not permitted.<br />
            * Non-refundable & non-transferable.
          </p>
          <p className="font-bold text-[8px] text-black pt-1">
            THANK YOU • ENJOY YOUR MOVIE!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThermalTicketReceipt;
