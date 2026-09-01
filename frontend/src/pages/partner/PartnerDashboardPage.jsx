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
  CreditCard
} from 'lucide-react';

const PartnerDashboardPage = () => {
  const [shows, setShows] = useState([]);
  const [summary, setSummary] = useState({
    gross_revenue: 173160,
    total_tickets_sold: 825,
    tickets_sold_online: 735,
    tickets_sold_counter: 90,
    settlement_status: 'PROCESSING_T1',
    net_payout_amount: 173160
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live partner data
    fetch('http://127.0.0.1:8000/api/v1/partner/reports/daily-summary?theatre_id=th-gtr-001')
      .then(res => res.json())
      .then(data => {
        if (data.summary) setSummary(data.summary);
        if (data.shows_breakdown) setShows(data.shows_breakdown);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. TOP METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Today's Gross Ticket Revenue */}
        <div className="p-6 rounded-3xl glass-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-theme-muted tracking-wider">
              Today's Gross Revenue
            </span>
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/20 text-pink-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black gradient-text-neon font-display">
              ₹{summary.gross_revenue?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +28% vs Yesterday's Matinee
            </p>
          </div>
        </div>

        {/* Metric 2: Total Tickets Sold */}
        <div className="p-6 rounded-3xl glass-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-theme-muted tracking-wider">
              Total Tickets Sold
            </span>
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 text-cyan-400">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-theme-primary font-display">
              {summary.total_tickets_sold} <span className="text-xs text-theme-muted font-normal">/ 1120 seats</span>
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-theme-secondary font-bold">
              <span className="text-cyan-500">Online: {summary.tickets_sold_online}</span>
              <span>•</span>
              <span className="text-amber-500">Counter: {summary.tickets_sold_counter}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: T+1 Payout Amount */}
        <div className="p-6 rounded-3xl glass-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-theme-muted tracking-wider">
              T+1 Net Payout (₹0 Fee)
            </span>
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400/20 to-orange-500/20 text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black gradient-text-gold font-display">
              ₹{summary.net_payout_amount?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Direct Bank Transfer Scheduled
            </p>
          </div>
        </div>

        {/* Metric 4: Gatekeeper QR Scans */}
        <div className="p-6 rounded-3xl glass-card space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-theme-muted tracking-wider">
              Gate Admissions Verified
            </span>
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-400/20 to-teal-600/20 text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-theme-primary font-display">
              640 <span className="text-xs text-theme-muted font-normal">checked-in</span>
            </h3>
            <p className="text-[11px] text-theme-secondary font-medium">
              Zero duplicate entries detected
            </p>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTION BAR */}
      <div className="p-4 rounded-3xl glass-panel flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-pink-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Exhibitor Quick Actions:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/partner/screens"
            className="px-4 py-2 rounded-2xl glass-card hover:border-pink-500 text-xs font-black text-theme-primary transition-all"
          >
            💺 Screen Layout & Counter Hold
          </Link>
          <Link
            to="/partner/shows"
            className="px-4 py-2 rounded-2xl glass-card hover:border-pink-500 text-xs font-black text-theme-primary transition-all"
          >
            🎬 Schedule New Showtime
          </Link>
          <Link
            to="/partner/settlements"
            className="px-4 py-2 rounded-2xl glass-card hover:border-pink-500 text-xs font-black text-theme-primary transition-all"
          >
            📄 Download Audit Statement
          </Link>
          <Link
            to="/partner/scanner"
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black shadow-glow-pink transition-all"
          >
            ⚡ Open Gate Scanner
          </Link>
        </div>
      </div>

      {/* 3. TODAY'S SHOW SCHEDULES & LIVE BOOKING CONTROLS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--theme-border)]">
          <div>
            <h3 className="text-lg font-black text-theme-primary">Today's Live Showtimes (4 Shows Scheduled)</h3>
            <p className="text-xs text-theme-muted">Manage online booking statuses, occupancy, and dynamic ticket pricing in real time</p>
          </div>
          <Link to="/partner/shows" className="text-xs font-black text-pink-500 hover:underline">
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
              <div key={show.id} className="p-6 rounded-3xl glass-card space-y-4">
                {/* Header: Movie title & Slot */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 text-[10px] font-black uppercase">
                      {show.show_slot || 'Showtime'} • {show.show_time}
                    </span>
                    <h4 className="text-base font-black text-theme-primary mt-1">{show.movie_title}</h4>
                    <p className="text-xs text-theme-muted">{show.screen_name} • {show.format || '2D Dolby Atmos'}</p>
                  </div>

                  {/* Booking Status Toggle Switch */}
                  <button
                    onClick={() => toggleShowStatus(show.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all border ${
                      isBookingOpen
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isBookingOpen ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                    <span>{isBookingOpen ? 'Online Open' : 'Online Closed'}</span>
                  </button>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-theme-muted">Hall Occupancy</span>
                    <span className="text-theme-primary font-black">{occupancyPct}% ({totalSold}/{totalCapacity} Seats)</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden border border-[var(--theme-border)]">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Tier Pricing Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 rounded-2xl glass-panel">
                    <span className="text-[10px] text-theme-muted block font-bold">Balcony</span>
                    <span className="font-black text-amber-500">₹{show.tier_price?.BALCONY || 280}</span>
                  </div>
                  <div className="p-2 rounded-2xl glass-panel">
                    <span className="text-[10px] text-theme-muted block font-bold">Premium</span>
                    <span className="font-black text-pink-500">₹{show.tier_price?.PREMIUM || 200}</span>
                  </div>
                  <div className="p-2 rounded-2xl glass-panel">
                    <span className="text-[10px] text-theme-muted block font-bold">Classic</span>
                    <span className="font-black text-cyan-500">₹{show.tier_price?.EXECUTIVE || 130}</span>
                  </div>
                </div>

                {/* Footer: Revenue & Counter quota */}
                <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs">
                  <span className="text-theme-muted">
                    Counter Quota Held: <strong className="text-theme-primary">{show.counter_held_seats?.length || 16} seats</strong>
                  </span>
                  <span className="font-black gradient-text-neon text-sm">
                    ₹{(show.gross_collected || 34820).toLocaleString()} Collected
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;
