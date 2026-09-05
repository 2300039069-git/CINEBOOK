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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
        <div>
          <span className="text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-1.5">
            <ReceiptText className="w-4 h-4" /> Theatre Box-Office POS Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight mt-1 font-display">
            Physical Cash Counter Ticket Terminal
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Fast walk-in ticket issuing with continuous 80mm / 58mm thermal paper roll printing
          </p>
        </div>

        {/* Counter Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl glass-card text-right">
            <span className="text-[10px] uppercase font-bold text-theme-muted block">Today's Counter Cash</span>
            <span className="text-base font-black gradient-text-gold">₹{totalCounterSales.toLocaleString()}</span>
          </div>
          <div className="px-4 py-2 rounded-2xl glass-card text-right">
            <span className="text-[10px] uppercase font-bold text-theme-muted block">Slips Printed</span>
            <span className="text-base font-black text-emerald-500">{totalCounterTickets} Tickets</span>
          </div>
        </div>
      </div>

      {/* 2. MOVIE & SHOW SELECTION STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cinema Selector */}
        <div className="p-4 rounded-3xl glass-panel space-y-1.5">
          <label className="text-[10px] font-black uppercase text-theme-muted tracking-wider block">
            1. Multiplex / Standalone Audi
          </label>
          <select
            value={selectedTheatre.id}
            onChange={(e) => {
              const found = THEATRES.find((t) => t.id === e.target.value);
              if (found) setSelectedTheatre(found);
            }}
            className="w-full p-2.5 rounded-2xl bg-black/10 dark:bg-white/5 border border-[var(--theme-border)] text-xs font-bold text-theme-primary focus:outline-none focus:border-pink-500"
          >
            {THEATRES.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                {t.name} ({t.city.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Movie Selector */}
        <div className="p-4 rounded-3xl glass-panel space-y-1.5">
          <label className="text-[10px] font-black uppercase text-pink-500 tracking-wider block">
            2. Screening Movie
          </label>
          <select
            value={selectedMovie.id}
            onChange={(e) => {
              const found = MOVIES.find((m) => m.id === e.target.value);
              if (found) setSelectedMovie(found);
            }}
            className="w-full p-2.5 rounded-2xl bg-black/10 dark:bg-white/5 border border-[var(--theme-border)] text-xs font-bold text-theme-primary focus:outline-none focus:border-pink-500"
          >
            {MOVIES.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Showtime Selector */}
        <div className="p-4 rounded-3xl glass-panel space-y-1.5">
          <label className="text-[10px] font-black uppercase text-cyan-500 tracking-wider block">
            3. Showtime & Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SHOWTIMES.map((sh) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => setSelectedShow(sh)}
                className={`p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border ${
                  selectedShow.id === sh.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500 shadow-sm'
                    : 'glass-card text-theme-secondary hover:border-pink-500'
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
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--theme-border)] text-xs">
            <div>
              <h3 className="font-black text-theme-primary text-base">
                {selectedMovie.title} • {selectedShow.time}
              </h3>
              <p className="text-theme-muted text-xs">
                Selected: <strong className="text-pink-500">{selectedSeats.length} seats</strong> • Blocked / Sold: <strong className="text-rose-400">{bookedSeatsSet.size} seats</strong>
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-theme-muted">
                <span className="w-3.5 h-3.5 rounded glass-panel border border-[var(--theme-border)] block" /> Available
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <span className="w-3.5 h-3.5 rounded bg-amber-500/30 border border-amber-500 flex items-center justify-center text-[8px]">🔒</span> Counter Quota
              </span>
              <span className="flex items-center gap-1 text-pink-500 font-bold">
                <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-pink-500 to-purple-600 block" /> Selected
              </span>
              <span className="flex items-center gap-1 text-rose-500 font-bold">
                <span className="w-3.5 h-3.5 rounded bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-[9px] text-rose-400 font-black">✕</span> Blocked / Sold
              </span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[620px] mx-auto space-y-6">
              {BASE_SEAT_LAYOUT.tiers.map((tier) => (
                <div key={tier.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs pb-1 border-b border-[var(--theme-border)]">
                    <span className="font-black uppercase tracking-wider text-theme-primary">{tier.name}</span>
                    <span className="font-black text-amber-500">₹{tier.price}</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {tier.rows.map((row) => (
                      <div key={row.rowLetter} className="flex items-center justify-center gap-2">
                        <span className="w-5 text-center text-xs font-black text-theme-muted">{row.rowLetter}</span>

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
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center relative ${
                                    isBlocked
                                      ? 'bg-rose-950/60 border border-rose-500/50 text-rose-400 cursor-not-allowed opacity-60 line-through'
                                      : isSelected
                                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-glow-pink scale-110 ring-2 ring-pink-400'
                                      : isCounterHeld
                                      ? 'bg-amber-500/20 border border-amber-500 text-amber-400 hover:scale-105'
                                      : 'glass-panel text-theme-primary hover:border-pink-500 hover:scale-105'
                                  }`}
                                >
                                  {isBlocked ? '✕' : isSelected ? '✓' : isCounterHeld ? '🔒' : seatNum}
                                </button>
                                {seatNum === 4 || seatNum === row.seats.length - 4 ? <div className="w-3 sm:w-4" /> : null}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        <span className="w-5 text-center text-xs font-black text-theme-muted">{row.rowLetter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Curved Screen Banner */}
              <div className="pt-6 text-center space-y-1.5">
                <div className="h-1.5 w-3/4 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-glow-screen opacity-90" />
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500">
                  Cinema 4K Silver Screen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: INSTANT BILLING & 80MM PRINT CONTROLS */}
        <div className="p-6 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--theme-border)]">
              <h3 className="font-black text-base text-theme-primary flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-pink-500" />
                <span>Counter Checkout</span>
              </h3>
              <span className="text-xs font-bold text-emerald-500">Zero Fee (₹0)</span>
            </div>

            {/* Selected Seats Pill Display */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-theme-muted tracking-wider block">
                Selected Seats ({selectedSeats.length})
              </label>
              {selectedSeats.length === 0 ? (
                <div className="p-3 rounded-2xl glass-card text-center text-xs text-theme-muted">
                  No seats selected yet. Click seats in the hall layout.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/40 text-pink-400 text-xs font-black flex items-center gap-1.5"
                    >
                      <span>{s.id}</span>
                      <span className="text-[10px] text-theme-muted">(₹{s.price})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Contact Details (Optional) */}
            <div className="space-y-2 pt-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-theme-muted" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Guest Name (e.g. Walk-in Guest)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/10 dark:bg-white/5 border border-[var(--theme-border)] text-xs text-theme-primary focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-theme-muted" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Mobile for SMS (Optional)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/10 dark:bg-white/5 border border-[var(--theme-border)] text-xs text-theme-primary focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-black uppercase text-theme-muted tracking-wider block">
                Counter Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH_COUNTER')}
                  className={`p-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 border ${
                    paymentMode === 'CASH_COUNTER'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-sm'
                      : 'glass-card text-theme-secondary hover:border-emerald-500'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI_QR')}
                  className={`p-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 border ${
                    paymentMode === 'UPI_QR'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-500 shadow-sm'
                      : 'glass-card text-theme-secondary hover:border-cyan-500'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CARD_POS')}
                  className={`p-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 border ${
                    paymentMode === 'CARD_POS'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500 shadow-sm'
                      : 'glass-card text-theme-secondary hover:border-pink-500'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card POS</span>
                </button>
              </div>
            </div>

            {/* Cash Calculator (if cash mode selected) */}
            {paymentMode === 'CASH_COUNTER' && (
              <div className="p-3 rounded-2xl glass-card space-y-2 border border-[var(--theme-border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-theme-muted font-bold">Cash Tendered:</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder="₹ Received"
                    className="w-24 px-2 py-1 rounded-lg bg-black/20 dark:bg-white/10 border border-[var(--theme-border)] text-right font-bold text-xs text-theme-primary focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {Number(cashTendered) > totalPayable && (
                  <div className="flex justify-between text-xs font-black text-emerald-400 pt-1 border-t border-[var(--theme-border)]">
                    <span>Return Change Due:</span>
                    <span>₹{changeDue}.00</span>
                  </div>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl glass-card space-y-1.5 text-xs">
              <div className="flex justify-between text-theme-secondary">
                <span>Tickets Base Amount:</span>
                <span className="font-bold">₹{baseTotal}.00</span>
              </div>
              <div className="flex justify-between text-theme-muted text-[11px]">
                <span>GST (18% Included):</span>
                <span>₹{Math.round(baseTotal - baseTotal / 1.18)}.00</span>
              </div>
              <div className="flex justify-between text-base font-black text-theme-primary pt-2 border-t border-[var(--theme-border)]">
                <span>Total Amount:</span>
                <span className="gradient-text-gold">₹{totalPayable}.00</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON: ISSUE & PRINT 80MM SLIP */}
          <div className="pt-4 space-y-2">
            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={handleIssueTicket}
              className={`w-full py-4 px-6 rounded-2xl text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer ${
                selectedSeats.length === 0
                  ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 shadow-glow-pink transform hover:scale-102'
              }`}
            >
              <Printer className="w-5 h-5" />
              <span>Issue Ticket & Print 80mm Slip</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENT COUNTER ISSUES AUDIT TABLE */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--theme-border)]">
          <div>
            <h3 className="text-base font-black text-theme-primary">Recent Box-Office Slips Issued Today</h3>
            <p className="text-xs text-theme-muted">Audit log of tickets issued at this counter terminal with 1-click re-print</p>
          </div>
          <span className="text-xs font-bold text-pink-500">{counterHistory.length} Total Slips</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--theme-border)] text-theme-muted uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Token Ref</th>
                <th className="py-2.5 px-3">Movie & Show</th>
                <th className="py-2.5 px-3">Seats</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--theme-border)]">
              {counterHistory.map((item) => (
                <tr key={item.bookingId} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-black text-pink-500">{item.bookingId}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-theme-primary block">{item.movie?.title}</span>
                    <span className="text-[10px] text-theme-muted">{item.show?.time || item.showtime}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-theme-primary">
                    {Array.isArray(item.seats)
                      ? item.seats.map((s) => (typeof s === 'string' ? s : s.id)).join(', ')
                      : item.seats}
                  </td>
                  <td className="py-3 px-3 font-black text-emerald-500">₹{item.totalAmount}.00</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      {item.paymentMode || 'CASH'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-theme-muted">{item.bookedAt || 'Just now'}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleReprint(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card hover:border-pink-500 text-xs font-bold text-theme-primary transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-pink-500" />
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
          {/* MODAL WRAPPER (Stops Propagation so clicking receipt won't close) */}
          <div
            className="glass-panel p-4 sm:p-6 rounded-3xl max-w-lg w-full border border-pink-500/30 shadow-2xl space-y-4 my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Fixed Control Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--theme-border)] no-print">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-theme-primary">Ticket Issued & Blocked!</h3>
                  <p className="text-[10px] text-theme-muted font-mono">{activeReceipt.bookingId}</p>
                </div>
              </div>

              {/* Close Button (X) */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1 text-xs font-black transition-all cursor-pointer"
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
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black uppercase tracking-wider shadow-glow-pink transition-all transform hover:scale-102 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Print 80mm Slip Now</span>
              </button>
            </div>

            {/* Receipt Preview Component Container */}
            <div className="flex justify-center bg-slate-900/50 p-2 sm:p-4 rounded-2xl border border-[var(--theme-border)]">
              <ThermalTicketReceipt
                booking={activeReceipt}
                onPrint={handleTriggerPrint}
                onClose={handleCloseModal}
              />
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-[var(--theme-border)] no-print">
              <button
                type="button"
                onClick={handleTriggerPrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card hover:border-pink-500 text-xs font-bold text-theme-primary transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-pink-500" />
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
