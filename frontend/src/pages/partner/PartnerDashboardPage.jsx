import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Ticket,
  Users,
  Building,
  QrCode,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Download,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Printer,
  FileSpreadsheet,
  Lock,
  UtensilsCrossed,
  Layers,
  Activity,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Screen 1 Heatmap Matrix
const AUDITORIUM_HEATMAP = {
  screenName: 'Screen 1 4K Laser (Main Hall)',
  capacity: 280,
  tiers: [
    {
      name: 'Balcony (Gold Recliners)',
      price: 280,
      rows: [
        { letter: 'A', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], booked: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], counterQuota: [1, 2], locked: [] },
        { letter: 'B', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], booked: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], counterQuota: [], locked: [12, 13] }
      ]
    },
    {
      name: 'Premium Executive',
      price: 200,
      rows: [
        { letter: 'C', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], booked: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], counterQuota: [1, 2, 3], locked: [14] },
        { letter: 'D', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], booked: [4, 5, 6, 7, 8, 9, 10, 11], counterQuota: [1, 2, 3], locked: [] },
        { letter: 'E', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], booked: [1, 2, 3, 7, 8, 9, 10, 11, 12], counterQuota: [], locked: [5, 6] }
      ]
    },
    {
      name: 'Classic Second Class',
      price: 130,
      rows: [
        { letter: 'F', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], booked: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14], counterQuota: [1, 2, 3, 4], locked: [] },
        { letter: 'G', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], booked: [5, 6, 7, 8, 9, 10], counterQuota: [1, 2, 3, 4], locked: [] },
        { letter: 'H', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], booked: [1, 2, 3, 4, 8, 9, 10, 11, 12], counterQuota: [], locked: [] }
      ]
    }
  ]
};

const PartnerDashboardPage = () => {
  const [shows, setShows] = useState([
    {
      id: 'sh-gtr-01',
      movie_title: 'Pushpa 2: The Rule (2024)',
      show_time: '11:00 AM',
      show_slot: 'Morning Show',
      screen_name: 'Screen 1 4K Laser',
      format: '4K Dolby Atmos',
      booking_status: 'OPEN',
      tickets_sold_online: 210,
      tickets_sold_counter: 45,
      gross_collected: 58650,
      tier_price: { BALCONY: 280, PREMIUM: 200, EXECUTIVE: 130 }
    },
    {
      id: 'sh-gtr-02',
      movie_title: 'Devara: Part 1 (2024)',
      show_time: '02:30 PM',
      show_slot: 'Matinee Show',
      screen_name: 'Screen 1 4K Laser',
      format: '4K Dolby Atmos',
      booking_status: 'OPEN',
      tickets_sold_online: 195,
      tickets_sold_counter: 40,
      gross_collected: 54200,
      tier_price: { BALCONY: 280, PREMIUM: 200, EXECUTIVE: 130 }
    },
    {
      id: 'sh-gtr-03',
      movie_title: 'Kalki 2898 AD (2024)',
      show_time: '06:00 PM',
      show_slot: 'First Show',
      screen_name: 'Screen 1 4K Laser',
      format: 'IMAX 3D',
      booking_status: 'OPEN',
      tickets_sold_online: 240,
      tickets_sold_counter: 35,
      gross_collected: 68400,
      tier_price: { BALCONY: 320, PREMIUM: 240, EXECUTIVE: 160 }
    },
    {
      id: 'sh-gtr-04',
      movie_title: 'Salaar: Part 1 – Ceasefire',
      show_time: '09:30 PM',
      show_slot: 'Second Show',
      screen_name: 'Screen 1 4K Laser',
      format: '4K Dolby Atmos',
      booking_status: 'OPEN',
      tickets_sold_online: 175,
      tickets_sold_counter: 25,
      gross_collected: 44250,
      tier_price: { BALCONY: 280, PREMIUM: 200, EXECUTIVE: 130 }
    }
  ]);

  const [summary, setSummary] = useState({
    gross_revenue: 184650,
    total_tickets_sold: 890,
    tickets_sold_online: 760,
    tickets_sold_counter: 130,
    online_revenue: 156400,
    counter_revenue: 28250,
    occupancy_pct: 79.4,
    settlement_status: 'PROCESSING_T1',
    net_payout_amount: 184650
  });

  const [isDcrModalOpen, setIsDcrModalOpen] = useState(false);

  useEffect(() => {
    // Fetch live partner data if backend available
    fetch('http://127.0.0.1:8000/api/v1/partner/reports/daily-summary?theatre_id=th-gtr-001')
      .then(res => res.json())
      .then(data => {
        if (data.summary) setSummary(prev => ({ ...prev, ...data.summary }));
        if (data.shows_breakdown && data.shows_breakdown.length > 0) setShows(data.shows_breakdown);
      })
      .catch(() => {});
  }, []);

  const toggleShowStatus = (showId) => {
    setShows(prev =>
      prev.map(s => {
        if (s.id === showId) {
          const newStatus = s.booking_status === 'OPEN' ? 'CLOSED' : 'OPEN';
          return { ...s, booking_status: newStatus };
        }
        return s;
      })
    );
  };

  const handlePrintDcr = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in bg-background text-text-primary transition-colors">
      {/* 1. 30-MIN AUTO-RELEASE SAFEGUARD BANNER */}
      <div className="p-4 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-3">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">⚡</span>
          <span>
            <strong className="text-text-primary">30-Min Auto-Release Active:</strong> Unsold app seats release to counter at 06:00 PM
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
          Theatre Protection Active
        </span>
      </div>

      {/* 2. TOP STATS ROW (3-COLUMN GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Today's Gross Collection */}
        <div className="bg-surface rounded-2xl p-6 space-y-3 relative overflow-hidden border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-text-muted tracking-wider">
              Today's Gross Collection
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-amber-500 text-3xl font-extrabold">
              ₹1,84,500
            </h3>
            <div className="flex items-center justify-between text-[11px] text-text-muted font-medium pt-1">
              <span className="text-amber-500 font-bold">Online: ₹1,56,250</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Counter: ₹28,250</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Occupancy Rate */}
        <div className="bg-surface rounded-2xl p-6 space-y-3 relative overflow-hidden border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-text-muted tracking-wider">
              Occupancy Rate
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-text-primary">
                88%
              </h3>
              <span className="text-xs text-text-muted font-medium">350 / 400 Seats Filled</span>
            </div>
            {/* Animated Green Progress Bar */}
            <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: '88%' }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Quota Breakdown */}
        <div className="bg-surface rounded-2xl p-6 space-y-3 relative overflow-hidden border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-text-muted tracking-wider">
              Quota Breakdown
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary leading-tight">
              40 Online <span className="text-xs font-normal text-text-muted">(Cinebook)</span> vs 310 Counter Seats
            </h3>
            <p className="text-[11px] text-text-muted font-medium pt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Guaranteed offline walk-in seats
            </p>
          </div>
        </div>
      </div>

      {/* 3. THEATRE QUICK ACTIONS HUB */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Exhibitor Command Hub:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/partner/counter-pos"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-sm transition-all transform hover:scale-102 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Counter POS & Thermal Print</span>
          </Link>
          <Link
            to="/partner/canteen"
            className="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text-primary font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <UtensilsCrossed className="w-4 h-4 text-amber-500" />
            <span>Canteen Interval Pre-Orders</span>
          </Link>
          <Link
            to="/partner/scanner"
            className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Gatekeeper QR Scanner</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsDcrModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-black font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Daily Collection Sheet (DCR)</span>
          </button>
        </div>
      </div>

      {/* 3. LIVE AUDITORIUM SEATING HEATMAP */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-lg font-bold text-text-primary">{AUDITORIUM_HEATMAP.screenName} — Live Heatmap</h3>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Live seat inventory status for Pushpa 2: The Rule (11:00 AM Morning Show)
            </p>
          </div>

          {/* Heatmap Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-text-muted">
              <span className="w-3.5 h-3.5 rounded bg-surface-elevated border border-border block" /> Free (App)
            </span>
            <span className="flex items-center gap-1 text-accent font-bold">
              <span className="w-3.5 h-3.5 rounded bg-accent text-white flex items-center justify-center text-[8px] font-bold">✓</span> Online Booked
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500 flex items-center justify-center text-[8px]">🔒</span> Counter Quota
            </span>
            <span className="flex items-center gap-1 text-purple-500 font-bold">
              <span className="w-3.5 h-3.5 rounded bg-purple-500/30 border border-purple-400 block" /> Active Lock (8m)
            </span>
          </div>
        </div>

        {/* Visual Seat Map */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[640px] max-w-4xl mx-auto space-y-6">
            {AUDITORIUM_HEATMAP.tiers.map((tier) => (
              <div key={tier.name} className="space-y-2">
                <div className="flex justify-between items-center text-xs pb-1 border-b border-border">
                  <span className="font-bold uppercase tracking-wider text-text-primary">{tier.name}</span>
                  <span className="text-amber-500 font-bold">₹{tier.price} / ticket</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {tier.rows.map((row) => (
                    <div key={row.letter} className="flex items-center justify-center gap-2">
                      <span className="w-5 text-center text-xs font-bold text-text-muted">{row.letter}</span>

                      <div className="flex items-center gap-1.5">
                        {row.seats.map((seatNum) => {
                          const isBooked = row.booked.includes(seatNum);
                          const isCounterQuota = row.counterQuota.includes(seatNum);
                          const isLocked = row.locked.includes(seatNum);

                          return (
                            <React.Fragment key={seatNum}>
                              <div
                                title={`Seat ${row.letter}${seatNum} — ${isBooked ? 'Online Sold' : isCounterQuota ? 'Box Office Held' : isLocked ? 'Locked (Checkout)' : 'Available'}`}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center ${
                                  isBooked
                                    ? 'bg-accent text-white shadow-sm'
                                    : isCounterQuota
                                    ? 'bg-amber-500/20 border border-amber-500 text-amber-500'
                                    : isLocked
                                    ? 'bg-purple-500/30 border border-purple-400 text-purple-600 dark:text-purple-200 animate-pulse'
                                    : 'bg-surface-elevated text-text-secondary border border-border'
                                }`}
                              >
                                {isBooked ? '✓' : isCounterQuota ? '🔒' : isLocked ? '⏳' : seatNum}
                              </div>
                              {seatNum === 4 || seatNum === row.seats.length - 4 ? <div className="w-3 sm:w-4" /> : null}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      <span className="w-5 text-center text-xs font-bold text-text-muted">{row.letter}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Screen Arc */}
            <div className="pt-6 text-center space-y-1.5">
              <div className="h-1.5 w-3/4 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full shadow-sm opacity-90" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                Cinema 4K Silver Screen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TODAY'S SHOW SCHEDULES & LIVE BOOKING CONTROLS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Today's Live Showtimes (4 Shows Scheduled)</h3>
            <p className="text-xs text-text-muted">Manage online booking statuses, occupancy, and dynamic ticket pricing in real time</p>
          </div>
          <Link to="/partner/shows" className="text-xs font-bold text-amber-500 hover:underline">
            Manage All Shows →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {shows.map((show) => {
            const isBookingOpen = show.booking_status === 'OPEN';
            const totalSold = (show.tickets_sold_online || 0) + (show.tickets_sold_counter || 0);
            const totalCapacity = 280;
            const occupancyPct = Math.round((totalSold / totalCapacity) * 100);

            return (
              <div key={show.id} className="p-6 rounded-3xl bg-surface space-y-4 border border-border shadow-sm">
                {/* Header: Movie title & Slot */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase">
                      {show.show_slot || 'Showtime'} • {show.show_time}
                    </span>
                    <h4 className="text-base font-bold text-text-primary mt-1">{show.movie_title}</h4>
                    <p className="text-xs text-text-muted">{show.screen_name} • {show.format || '4K Dolby Atmos'}</p>
                  </div>

                  {/* Booking Status Toggle Switch */}
                  <button
                    onClick={() => toggleShowStatus(show.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border ${
                      isBookingOpen
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isBookingOpen ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                    <span>{isBookingOpen ? 'Online Open' : 'Online Closed'}</span>
                  </button>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-muted">Hall Occupancy</span>
                    <span className="text-text-primary font-bold">{occupancyPct}% ({totalSold}/{totalCapacity} Seats)</span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-elevated rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-accent rounded-full transition-all duration-500"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Tier Pricing Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 rounded-2xl bg-surface-elevated border border-border">
                    <span className="text-[10px] text-text-muted block font-bold">Balcony</span>
                    <span className="font-bold text-amber-500">₹{show.tier_price?.BALCONY || 280}</span>
                  </div>
                  <div className="p-2 rounded-2xl bg-surface-elevated border border-border">
                    <span className="text-[10px] text-text-muted block font-bold">Premium</span>
                    <span className="font-bold text-text-primary">₹{show.tier_price?.PREMIUM || 200}</span>
                  </div>
                  <div className="p-2 rounded-2xl bg-surface-elevated border border-border">
                    <span className="text-[10px] text-text-muted block font-bold">Classic</span>
                    <span className="font-bold text-text-secondary">₹{show.tier_price?.EXECUTIVE || 130}</span>
                  </div>
                </div>

                {/* Footer: Revenue & Counter quota */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    Counter Quota Held: <strong className="text-text-primary">16 seats</strong>
                  </span>
                  <span className="font-extrabold text-amber-500 text-sm">
                    ₹{(show.gross_collected || 54200).toLocaleString()} Collected
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. MODAL: 1-CLICK DAILY COLLECTION REPORT (DCR) */}
      {isDcrModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsDcrModalOpen(false)}
        >
          <div
            className="bg-surface p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-border shadow-2xl space-y-6 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border no-print">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">Daily Collection Report (DCR)</h3>
                  <p className="text-[10px] text-text-muted">Official Single-Screen Exhibitor & Distributor Statement</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDcrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text-primary text-xs cursor-pointer border border-border"
              >
                ✕
              </button>
            </div>

            {/* Printable Statement Document */}
            <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-inner font-mono text-xs space-y-4 border border-slate-200">
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                <h2 className="font-black text-base uppercase">SIVA CINEMAS 4K LASER — GUNTUR</h2>
                <p className="text-[10px] text-slate-600">DAILY COLLECTION REPORT (DCR) • DATE: 02-SEP-2026</p>
                <p className="text-[9px] text-slate-500">GSTIN: 37AAACB2948L1Z9 • THEATRE CODE: GTR-SIVA-01</p>
              </div>

              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-400">
                    <th className="py-1">Show Slot</th>
                    <th className="py-1">Movie</th>
                    <th className="py-1 text-center">Tix</th>
                    <th className="py-1 text-right">Gross (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {shows.map((s) => (
                    <tr key={s.id}>
                      <td className="py-1.5 font-bold">{s.show_slot} ({s.show_time})</td>
                      <td className="py-1.5">{s.movie_title.split('(')[0]}</td>
                      <td className="py-1.5 text-center font-bold">{(s.tickets_sold_online || 0) + (s.tickets_sold_counter || 0)}</td>
                      <td className="py-1.5 text-right font-black">₹{s.gross_collected.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-slate-900 pt-2 space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>TOTAL TICKETS SOLD:</span>
                  <span>{summary.total_tickets_sold} Tickets (84% Online / 16% Counter)</span>
                </div>
                <div className="flex justify-between font-black text-sm">
                  <span>GROSS COLLECTION:</span>
                  <span>₹{summary.gross_revenue.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>LESS: GST @ 18% (CGST 9% + SGST 9%):</span>
                  <span>₹{Math.round(summary.gross_revenue * 0.18 / 1.18).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>NET TICKET REVENUE:</span>
                  <span>₹{Math.round(summary.gross_revenue / 1.18).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-800 font-bold pt-1 border-t border-dotted border-slate-400">
                  <span>DISTRIBUTOR SHARE (50%):</span>
                  <span>₹{Math.round((summary.gross_revenue / 1.18) * 0.5).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-800 font-bold">
                  <span>EXHIBITOR SHARE (50%):</span>
                  <span>₹{Math.round((summary.gross_revenue / 1.18) * 0.5).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>CINEBOOK PLATFORM DEDUCTION:</span>
                  <span>₹0.00 (Zero Fee Guarantee)</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[9px] text-slate-500 border-t border-dashed border-slate-400">
                Generated via CineBook Exhibitor Engine • Verified Bank Reference: SBI ****29481
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 no-print">
              <button
                type="button"
                onClick={handlePrintDcr}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official DCR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboardPage;

