import React, { useState, useEffect, useCallback } from 'react';
import {
  Printer,
  Ticket,
  DollarSign,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Sparkles,
  Building,
  RefreshCw,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  ReceiptText,
  X,
  Lock,
  Ban
} from 'lucide-react';
import { MOVIES, THEATRES } from '../../data/mockData';
import ThermalTicketReceipt from '../../components/booking/ThermalTicketReceipt';

// Base Screen 1 Seat Layout Template
const BASE_SEAT_LAYOUT = {
  screen_name: 'Screen 1 4K Laser',
  tiers: [
    {
      id: 'BALCONY',
      name: 'Balcony (Gold Recliner)',
      price: 280,
      rows: [
        { rowLetter: 'A', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], counterHeld: [1, 2], initialBooked: [5, 6, 7] },
        { rowLetter: 'B', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], counterHeld: [], initialBooked: [8, 9] }
      ]
    },
    {
      id: 'PREMIUM',
      name: 'Premium Executive',
      price: 200,
      rows: [
        { rowLetter: 'C', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], counterHeld: [1, 2, 3], initialBooked: [10, 11, 12] },
        { rowLetter: 'D', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], counterHeld: [1, 2, 3], initialBooked: [4, 5] },
        { rowLetter: 'E', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], counterHeld: [], initialBooked: [] }
      ]
    },
    {
      id: 'EXECUTIVE',
      name: 'Classic Second Class',
      price: 130,
      rows: [
        { rowLetter: 'F', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], counterHeld: [1, 2, 3, 4], initialBooked: [8, 9, 10] },
        { rowLetter: 'G', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], counterHeld: [1, 2, 3, 4], initialBooked: [] },
        { rowLetter: 'H', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], counterHeld: [], initialBooked: [11, 12] }
      ]
    }
  ]
};

const SHOWTIMES = [
  { id: 'sh-1', time: '11:00 AM', slot: 'Morning Show', format: '2D Dolby Atmos' },
  { id: 'sh-2', time: '02:30 PM', slot: 'Matinee Show', format: '2D Dolby Atmos' },
  { id: 'sh-3', time: '06:00 PM', slot: 'First Show', format: '4K Laser 3D' },
  { id: 'sh-4', time: '09:30 PM', slot: 'Second Show', format: '2D Dolby Atmos' }
];

const PartnerCounterPosPage = () => {
  // Cinema selection (Defaults to Guntur Siva Cinemas)
  const [selectedTheatre, setSelectedTheatre] = useState(THEATRES[0]);
  const [selectedMovie, setSelectedMovie] = useState(MOVIES[0]);
  const [selectedShow, setSelectedShow] = useState(SHOWTIMES[0]);
  const [showDate, setShowDate] = useState(new Date().toISOString().split('T')[0]);

  // Customer info & tender
  const [customerName, setCustomerName] = useState('Walk-in Cash Guest');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH_COUNTER'); // CASH_COUNTER, UPI_QR, CARD_POS
  const [cashTendered, setCashTendered] = useState('');

  // Selected seats state: array of { id: 'A5', tier: 'BALCONY', price: 280 }
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Active printed receipt modal
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Dynamic Blocked/Booked Seats per Show Key
  const getShowKey = (theatreId, movieId, showId, date) =>
    `cinebook_booked_${theatreId || 'th-gtr-001'}_${movieId || 'mov-pushpa-2'}_${showId || 'sh-1'}_${date || 'today'}`;

  const [bookedSeatsSet, setBookedSeatsSet] = useState(new Set());

  // Load booked seats when theatre, movie, show, or date changes
  useEffect(() => {
    const key = getShowKey(selectedTheatre.id, selectedMovie.id, selectedShow.id, showDate);
    const saved = localStorage.getItem(key);
    let initialList = [];

    if (saved) {
      try {
        initialList = JSON.parse(saved);
      } catch (e) {}
    } else {
      // Collect baseline initial booked seats from template
      BASE_SEAT_LAYOUT.tiers.forEach((tier) => {
        tier.rows.forEach((row) => {
          (row.initialBooked || []).forEach((seatNum) => {
            initialList.push(`${row.rowLetter}${seatNum}`);
          });
        });
      });
      // Save initial baseline
      try {
        localStorage.setItem(key, JSON.stringify(initialList));
      } catch (e) {}
    }

    setBookedSeatsSet(new Set(initialList));
    setSelectedSeats([]); // Clear current selection on show change
  }, [selectedTheatre.id, selectedMovie.id, selectedShow.id, showDate]);

  // Counter transaction history loaded from localStorage
  const [counterHistory, setCounterHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('cinebook_counter_pos_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        bookingId: 'CB-POS-892101',
        movie: { title: 'Pushpa 2: The Rule (2024)' },
        theatre: { name: 'Siva Cinemas', address: 'Near Old Bus Stand, Guntur' },
        show: { time: '11:00 AM', format: '2D Dolby Atmos', language: 'Telugu' },
        showDate: new Date().toISOString().split('T')[0],
        seats: [{ id: 'A1', price: 280 }, { id: 'A2', price: 280 }],
        totalAmount: 560,
        paymentMode: 'COUNTER CASH',
        bookedAt: '10:15 AM'
      },
      {
        bookingId: 'CB-POS-892102',
        movie: { title: 'Pushpa: The Rise (2021)' },
        theatre: { name: 'Siva Cinemas', address: 'Near Old Bus Stand, Guntur' },
        show: { time: '02:30 PM', format: '2D Dolby Atmos', language: 'Telugu' },
        showDate: new Date().toISOString().split('T')[0],
        seats: [{ id: 'C1', price: 200 }, { id: 'C2', price: 200 }, { id: 'C3', price: 200 }],
        totalAmount: 600,
        paymentMode: 'COUNTER CASH',
        bookedAt: '10:45 AM'
      }
    ];
  });

  // Calculate pricing
  const baseTotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = 0; // ₹0 fee at physical cinema box-office counter
  const totalPayable = baseTotal + convenienceFee;
  const changeDue = Number(cashTendered) > totalPayable ? Number(cashTendered) - totalPayable : 0;

  // Toggle seat selection
  const handleToggleSeat = (seatId, tierName, price, isBlocked) => {
    if (isBlocked) return;
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seatId);
      if (exists) {
        return prev.filter((s) => s.id !== seatId);
      }
      return [...prev, { id: seatId, tier: tierName, price }];
    });
  };

  // Issue Ticket and Block Seats Permanently
  const handleIssueTicket = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to issue counter ticket.');
      return;
    }

    const bookingId = `CB-POS-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReceipt = {
      bookingId,
      movie: {
        title: selectedMovie.title,
        censorRating: selectedMovie.censorRating || 'UA'
      },
      theatre: {
        name: selectedTheatre.name,
        address: selectedTheatre.address || `${selectedTheatre.city}, AP`
      },
      show: {
        time: selectedShow.time,
        format: selectedShow.format,
        language: 'Telugu'
      },
      showtime: selectedShow.time,
      showDate: showDate,
      seats: selectedSeats,
      totalAmount: totalPayable,
      paymentMode: paymentMode === 'CASH_COUNTER' ? 'COUNTER CASH' : paymentMode === 'UPI_QR' ? 'COUNTER UPI' : 'CARD POS',
      customerName: customerName || 'Walk-in Guest',
      customerPhone: customerPhone || 'N/A',
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. BLOCK THE SEATS PERMANENTLY IN STATE & STORAGE
    const newBookedSeatIds = selectedSeats.map((s) => s.id);
    const updatedBookedSet = new Set([...bookedSeatsSet, ...newBookedSeatIds]);
    setBookedSeatsSet(updatedBookedSet);

    const key = getShowKey(selectedTheatre.id, selectedMovie.id, selectedShow.id, showDate);
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(updatedBookedSet)));
    } catch (e) {}

    // 2. Save transaction locally
    const updatedHistory = [newReceipt, ...counterHistory];
    setCounterHistory(updatedHistory);
    try {
      localStorage.setItem('cinebook_counter_pos_history', JSON.stringify(updatedHistory));

      // Register in global cinebook_bookings for Gatekeeper QR Scanner verification
      const existingAll = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
      localStorage.setItem('cinebook_bookings', JSON.stringify([newReceipt, ...existingAll]));
    } catch (e) {}

    // 3. Post to backend server if online
    try {
      fetch('http://localhost:5000/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReceipt)
      }).catch(() => {});
    } catch (e) {}

    // 4. Open Modal for 80mm Print
    setActiveReceipt(newReceipt);
    setIsSuccessModalOpen(true);

    // 5. Reset selection for next customer
    setSelectedSeats([]);
    setCashTendered('');
  };

  // Modal Close handler
  const handleCloseModal = useCallback(() => {
    setIsSuccessModalOpen(false);
    setActiveReceipt(null);
  }, []);

  // Print execution handler
  const handleTriggerPrint = useCallback(() => {
    document.body.classList.add('printing-thermal');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-thermal');
    }, 500);
  }, []);

  // Global Keyboard listener for modal: Escape to close, Enter to print
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSuccessModalOpen) return;
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSuccessModalOpen, handleCloseModal]);

  const handleReprint = (receipt) => {
    setActiveReceipt(receipt);
    setIsSuccessModalOpen(true);
  };

  // Today's counter summary stats
  const totalCounterSales = counterHistory.reduce((acc, h) => acc + (h.totalAmount || 0), 0);
  const totalCounterTickets = counterHistory.reduce((acc, h) => acc + (h.seats?.length || 1), 0);

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* 1. HEADER & REALTIME POS DESK STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
            <ReceiptText className="w-4 h-4 text-[#D4AF37]" /> Theatre Box-Office POS Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 font-display">
            Physical Cash Counter Ticket Terminal
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Fast walk-in ticket issuing with continuous 80mm / 58mm thermal paper roll printing
          </p>
        </div>

        {/* Counter Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-[#0F1523] border border-[#1E293B] text-right">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Today's Counter Cash</span>
            <span className="text-base font-black text-[#D4AF37]">₹{totalCounterSales.toLocaleString()}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-[#0F1523] border border-[#1E293B] text-right">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Slips Printed</span>
            <span className="text-base font-black text-emerald-400">{totalCounterTickets} Tickets</span>
          </div>
        </div>
      </div>

      {/* 2. MOVIE & SHOW SELECTION STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cinema Selector */}
        <div className="p-4 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-1.5 shadow-xl">
          <label className="text-[10px] font-black uppercase text-[#94A3B8] tracking-wider block">
            1. Multiplex / Standalone Audi
          </label>
          <select
            value={selectedTheatre.id}
            onChange={(e) => {
              const found = THEATRES.find((t) => t.id === e.target.value);
              if (found) setSelectedTheatre(found);
            }}
            className="w-full p-2.5 rounded-xl bg-[#080B10] border border-[#1E293B] text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
          >
            {THEATRES.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#080B10] text-white">
                {t.name} ({t.city.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Movie Selector */}
        <div className="p-4 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-1.5 shadow-xl">
          <label className="text-[10px] font-black uppercase text-[#E50914] tracking-wider block">
            2. Screening Movie
          </label>
          <select
            value={selectedMovie.id}
            onChange={(e) => {
              const found = MOVIES.find((m) => m.id === e.target.value);
              if (found) setSelectedMovie(found);
            }}
            className="w-full p-2.5 rounded-xl bg-[#080B10] border border-[#1E293B] text-xs font-bold text-white focus:outline-none focus:border-[#E50914]"
          >
            {MOVIES.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#080B10] text-white">
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Showtime Selector */}
        <div className="p-4 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-1.5 shadow-xl">
          <label className="text-[10px] font-black uppercase text-[#D4AF37] tracking-wider block">
            3. Showtime & Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SHOWTIMES.map((sh) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => setSelectedShow(sh)}
                className={`p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                  selectedShow.id === sh.id
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] text-black border-[#D4AF37] shadow-sm'
                    : 'bg-[#080B10] border-[#1E293B] text-slate-300 hover:border-[#D4AF37]'
                }`}
              >
                <span>{sh.time}</span>
                <span className="text-[9px] opacity-80">{sh.slot}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: SEAT MATRIX + BILLING PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: VISUAL HALL SEATING MATRIX */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B] text-xs">
            <div>
              <h3 className="font-black text-white text-base">
                {selectedMovie.title} • {selectedShow.time}
              </h3>
              <p className="text-[#94A3B8] text-xs">
                Selected: <strong className="text-[#E50914]">{selectedSeats.length} seats</strong> • Blocked / Sold: <strong className="text-rose-400">{bookedSeatsSet.size} seats</strong>
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-[#94A3B8]">
                <span className="w-3.5 h-3.5 rounded bg-[#080B10] border border-[#1E293B] block" /> Available
              </span>
              <span className="flex items-center gap-1 text-[#D4AF37] font-bold">
                <span className="w-3.5 h-3.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[8px]">🔒</span> Counter Quota
              </span>
              <span className="flex items-center gap-1 text-[#E50914] font-bold">
                <span className="w-3.5 h-3.5 rounded bg-[#E50914] block" /> Selected
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="w-3.5 h-3.5 rounded bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-[9px] text-rose-400 font-black">✕</span> Blocked / Sold
              </span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[620px] mx-auto space-y-6">
              {BASE_SEAT_LAYOUT.tiers.map((tier) => (
                <div key={tier.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs pb-1 border-b border-[#1E293B]">
                    <span className="font-black uppercase tracking-wider text-slate-300">{tier.name}</span>
                    <span className="font-black text-[#D4AF37]">₹{tier.price}</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {tier.rows.map((row) => (
                      <div key={row.rowLetter} className="flex items-center justify-center gap-2">
                        <span className="w-5 text-center text-xs font-black text-[#94A3B8]">{row.rowLetter}</span>

                        <div className="flex items-center gap-1.5">
                          {row.seats.map((seatNum) => {
                            const seatId = `${row.rowLetter}${seatNum}`;
                            const isBlocked = bookedSeatsSet.has(seatId);
                            const isCounterHeld = row.counterHeld.includes(seatNum) && !isBlocked;
                            const isSelected = selectedSeats.some((s) => s.id === seatId);

                            return (
                              <React.Fragment key={seatNum}>
                                <button
                                  type="button"
                                  disabled={isBlocked}
                                  onClick={() => handleToggleSeat(seatId, tier.name, tier.price, isBlocked)}
                                  title={
                                    isBlocked
                                      ? `Seat ${seatId} is BLOCKED / ALREADY BOOKED`
                                      : isCounterHeld
                                      ? `Seat ${seatId} (Counter Quota) - ₹${tier.price}`
                                      : `Seat ${seatId} - ₹${tier.price}`
                                  }
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center relative cursor-pointer ${
                                    isBlocked
                                      ? 'bg-[#080B10]/90 border border-[#1E293B] text-slate-600 cursor-not-allowed opacity-50 line-through'
                                      : isSelected
                                      ? 'bg-[#E50914] text-white shadow-glow-crimson scale-110 ring-2 ring-[#FF4B55]'
                                      : isCounterHeld
                                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] hover:scale-105'
                                      : 'bg-[#080B10] border border-[#1E293B] text-slate-300 hover:border-[#D4AF37] hover:scale-105'
                                  }`}
                                >
                                  {isBlocked ? '✕' : isSelected ? '✓' : isCounterHeld ? '🔒' : seatNum}
                                </button>
                                {seatNum === 4 || seatNum === row.seats.length - 4 ? <div className="w-3 sm:w-4" /> : null}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        <span className="w-5 text-center text-xs font-black text-[#94A3B8]">{row.rowLetter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Curved Screen Banner */}
              <div className="pt-6 text-center space-y-1.5">
                <div className="h-1.5 w-3/4 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full shadow-glow-gold opacity-80" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                  Cinema 4K RGB Silver Screen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: INSTANT BILLING & 80MM PRINT CONTROLS */}
        <div className="p-6 rounded-3xl bg-[#0F1523]/90 border border-[#1E293B] shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <h3 className="font-black text-base text-white flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span>Counter Checkout</span>
              </h3>
              <span className="text-xs font-bold text-emerald-400">Zero Fee (₹0)</span>
            </div>

            {/* Selected Seats Pill Display */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[#94A3B8] tracking-wider block">
                Selected Seats ({selectedSeats.length})
              </label>
              {selectedSeats.length === 0 ? (
                <div className="p-3 rounded-2xl bg-[#080B10] border border-[#1E293B] text-center text-xs text-[#94A3B8]">
                  No seats selected yet. Click seats in the hall layout.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1 rounded-xl bg-[#E50914]/20 border border-[#E50914]/40 text-red-400 text-xs font-black flex items-center gap-1.5"
                    >
                      <span>{s.id}</span>
                      <span className="text-[10px] text-[#94A3B8]">(₹{s.price})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Contact Details (Optional) */}
            <div className="space-y-2 pt-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Guest Name (e.g. Walk-in Guest)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080B10] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Mobile for SMS (Optional)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080B10] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-black uppercase text-[#94A3B8] tracking-wider block">
                Counter Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH_COUNTER')}
                  className={`p-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                    paymentMode === 'CASH_COUNTER'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-[#080B10] text-[#94A3B8] border-[#1E293B] hover:border-emerald-500'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI_QR')}
                  className={`p-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                    paymentMode === 'UPI_QR'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] text-black border-[#D4AF37] shadow-sm'
                      : 'bg-[#080B10] text-[#94A3B8] border-[#1E293B] hover:border-[#D4AF37]'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CARD_POS')}
                  className={`p-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                    paymentMode === 'CARD_POS'
                      ? 'bg-gradient-to-r from-[#E50914] to-red-700 text-white border-[#E50914] shadow-sm'
                      : 'bg-[#080B10] text-[#94A3B8] border-[#1E293B] hover:border-[#E50914]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card POS</span>
                </button>
              </div>
            </div>

            {/* Cash Calculator (if cash mode selected) */}
            {paymentMode === 'CASH_COUNTER' && (
              <div className="p-3 rounded-2xl bg-[#080B10] space-y-2 border border-[#1E293B]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8] font-bold">Cash Tendered:</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder="₹ Received"
                    className="w-24 px-2 py-1 rounded-lg bg-[#0F1523] border border-[#1E293B] text-right font-bold text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {Number(cashTendered) > totalPayable && (
                  <div className="flex justify-between text-xs font-black text-emerald-400 pt-1 border-t border-[#1E293B]">
                    <span>Return Change Due:</span>
                    <span>₹{changeDue}.00</span>
                  </div>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-[#080B10] border border-[#1E293B] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tickets Base Amount:</span>
                <span className="font-bold text-white">₹{baseTotal}.00</span>
              </div>
              <div className="flex justify-between text-[#94A3B8] text-[11px]">
                <span>GST (18% Included):</span>
                <span>₹{Math.round(baseTotal - baseTotal / 1.18)}.00</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#1E293B]">
                <span>Total Amount:</span>
                <span className="text-[#D4AF37]">₹{totalPayable}.00</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON: ISSUE & PRINT 80MM SLIP */}
          <div className="pt-4 space-y-2">
            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={handleIssueTicket}
              className={`w-full py-4 px-6 rounded-2xl text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer ${
                selectedSeats.length === 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] hover:from-[#E2B714] hover:to-[#D4AF37] shadow-glow-gold transform hover:scale-102'
              }`}
            >
              <Printer className="w-5 h-5 text-black" />
              <span>Issue Ticket & Print 80mm Slip</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENT COUNTER ISSUES AUDIT TABLE */}
      <div className="p-6 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div>
            <h3 className="text-base font-black text-white">Recent Box-Office Slips Issued Today</h3>
            <p className="text-xs text-[#94A3B8]">Audit log of tickets issued at this counter terminal with 1-click re-print</p>
          </div>
          <span className="text-xs font-bold text-[#D4AF37]">{counterHistory.length} Total Slips</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#94A3B8] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Token Ref</th>
                <th className="py-2.5 px-3">Movie & Show</th>
                <th className="py-2.5 px-3">Seats</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {counterHistory.map((item) => (
                <tr key={item.bookingId} className="hover:bg-[#172033] transition-colors">
                  <td className="py-3 px-3 font-mono font-black text-[#D4AF37]">{item.bookingId}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{item.movie?.title}</span>
                    <span className="text-[10px] text-[#94A3B8]">{item.show?.time || item.showtime}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {Array.isArray(item.seats)
                      ? item.seats.map((s) => (typeof s === 'string' ? s : s.id)).join(', ')
                      : item.seats}
                  </td>
                  <td className="py-3 px-3 font-black text-emerald-400">₹{item.totalAmount}.00</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      {item.paymentMode || 'CASH'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#94A3B8]">{item.bookedAt || 'Just now'}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleReprint(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080B10] border border-[#1E293B] hover:border-[#D4AF37] text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Re-Print 80mm</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: 80MM THERMAL SLIP PREVIEW & BULLETPROOF PRINT / CLOSE CONTROLS */}
      {isSuccessModalOpen && activeReceipt && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-3 sm:p-6"
          onClick={handleCloseModal}
        >
          {/* MODAL WRAPPER */}
          <div
            className="bg-[#0F1523] p-4 sm:p-6 rounded-3xl max-w-lg w-full border border-[#D4AF37]/40 shadow-2xl space-y-4 my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Fixed Control Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#1E293B] no-print">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Ticket Issued & Blocked!</h3>
                  <p className="text-[10px] text-[#D4AF37] font-mono">{activeReceipt.bookingId}</p>
                </div>
              </div>

              {/* Close Button (X) */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 text-xs font-black transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close (Esc)</span>
              </button>
            </div>

            {/* Quick Action Buttons on Top of Ticket */}
            <div className="flex items-center justify-center gap-3 no-print">
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E2B714] hover:from-[#E2B714] hover:to-[#D4AF37] text-black text-xs font-black uppercase tracking-wider shadow-glow-gold transition-all transform hover:scale-102 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-black" />
                <span>🖨️ Print 80mm Slip Now</span>
              </button>
            </div>

            {/* Receipt Preview Component Container */}
            <div className="flex justify-center bg-[#080B10] p-2 sm:p-4 rounded-2xl border border-[#1E293B]">
              <ThermalTicketReceipt
                booking={activeReceipt}
                onPrint={handleTriggerPrint}
                onClose={handleCloseModal}
              />
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1E293B] no-print">
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#080B10] border border-[#1E293B] hover:border-[#D4AF37] text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#D4AF37]" />
                <span>Print Copy</span>
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-black transition-all cursor-pointer"
              >
                ✓ Done • Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerCounterPosPage;

