import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Flame,
  Film,
  Building,
  Save,
  Trash2,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { MOVIES } from '../../data/mockData';

const INITIAL_SHOWS = [
  {
    id: 'sh-gtr-01',
    screen_name: 'Screen 1 • 4K Laser RGB',
    movie_id: 'mov-pushpa-2',
    movie_title: 'Pushpa 2: The Rule (2024)',
    language: 'Telugu',
    format: '2D Dolby Atmos',
    show_date: '2026-09-02',
    show_time: '11:00 AM',
    show_slot: 'Morning',
    tier_price: { BALCONY: 280, PREMIUM: 200, EXECUTIVE: 130 },
    booking_status: 'OPEN'
  },
  {
    id: 'sh-gtr-02',
    screen_name: 'Screen 1 • 4K Laser RGB',
    movie_id: 'mov-pushpa-2',
    movie_title: 'Pushpa 2: The Rule (2024)',
    language: 'Telugu',
    format: '2D Dolby Atmos',
    show_date: '2026-09-02',
    show_time: '02:30 PM',
    show_slot: 'Matinee',
    tier_price: { BALCONY: 280, PREMIUM: 200, EXECUTIVE: 130 },
    booking_status: 'OPEN'
  },
  {
    id: 'sh-gtr-03',
    screen_name: 'Screen 1 • 4K Laser RGB',
    movie_id: 'mov-devara',
    movie_title: 'Devara: Part 1 (2024)',
    language: 'Telugu',
    format: '2D Dolby Atmos',
    show_date: '2026-09-02',
    show_time: '06:15 PM',
    show_slot: 'First Show',
    tier_price: { BALCONY: 250, PREMIUM: 180, EXECUTIVE: 120 },
    booking_status: 'OPEN'
  },
  {
    id: 'sh-gtr-04',
    screen_name: 'Screen 1 • 4K Laser RGB',
    movie_id: 'mov-kalki-2898',
    movie_title: 'Kalki 2898 AD (2024)',
    language: 'Telugu',
    format: '2D Dolby Atmos',
    show_date: '2026-09-02',
    show_time: '09:45 PM',
    show_slot: 'Second Show',
    tier_price: { BALCONY: 250, PREMIUM: 180, EXECUTIVE: 120 },
    booking_status: 'OPEN'
  }
];

const PartnerShowsPage = () => {
  const [shows, setShows] = useState(INITIAL_SHOWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShow, setNewShow] = useState({
    movie_id: MOVIES[0]?.id || 'mov-pushpa-2',
    show_slot: 'Matinee',
    show_time: '02:30 PM',
    show_date: '2026-09-03',
    format: '2D Dolby Atmos',
    language: 'Telugu',
    balconyPrice: 280,
    premiumPrice: 200,
    executivePrice: 130
  });

  const handleToggleStatus = (showId) => {
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

  const handlePriceChange = (showId, tierKey, newPrice) => {
    setShows(prev =>
      prev.map(s => {
        if (s.id === showId) {
          return {
            ...s,
            tier_price: { ...s.tier_price, [tierKey]: Number(newPrice) }
          };
        }
        return s;
      })
    );
  };

  const handleCreateShow = (e) => {
    e.preventDefault();
    const movieObj = MOVIES.find(m => m.id === newShow.movie_id) || MOVIES[0];
    const created = {
      id: `sh-gtr-${Date.now()}`,
      screen_name: 'Screen 1 • 4K Laser RGB',
      movie_id: newShow.movie_id,
      movie_title: movieObj?.title || 'Pushpa 2: The Rule (2024)',
      language: newShow.language,
      format: newShow.format,
      show_date: newShow.show_date,
      show_time: newShow.show_time,
      show_slot: newShow.show_slot,
      tier_price: {
        BALCONY: Number(newShow.balconyPrice),
        PREMIUM: Number(newShow.premiumPrice),
        EXECUTIVE: Number(newShow.executivePrice)
      },
      booking_status: 'OPEN'
    };

    setShows([created, ...shows]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-primary">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-black text-gold uppercase tracking-widest flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-gold" /> Showtime Scheduling & Live Price Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1 font-display">
            Show Schedules & Dynamic Pricing
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Assign blockbuster titles to screens, configure weekend price surges, and control advance online bookings
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black text-xs font-black uppercase tracking-wider shadow-gold-glow transition-all transform hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Schedule New Showtime</span>
        </button>
      </div>

      {/* 2. AUTO-RELEASE SAFEGUARD CALLOUT */}
      <div className="p-4 rounded-2xl bg-surface border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-gold uppercase tracking-wider">30-Minute Auto-Release Active</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">Zero Empty Seats</span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              All unsold online quota seats are automatically unlocked to your Box Office Counter exactly 30 minutes before showtime.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-gold">
          <Zap className="w-4 h-4 text-gold" />
          <span>Real-time Counter Sync</span>
        </div>
      </div>

      {/* 3. SCHEDULED SHOWS LIST WITH DYNAMIC PRICING OVERRIDE */}
      <div className="space-y-4">
        {shows.map((show) => {
          const isBookingOpen = show.booking_status === 'OPEN';
          return (
            <div
              key={show.id}
              className="p-6 rounded-3xl bg-surface border border-border hover:border-gold/50 transition-all space-y-4 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-gold/15 text-gold text-[11px] font-black uppercase border border-gold/30">
                      {show.show_slot} • {show.show_time}
                    </span>
                    <span className="text-xs font-bold text-text-secondary bg-surface-elevated px-2.5 py-0.5 rounded-lg border border-border">
                      {show.format}
                    </span>
                    <span className="text-xs text-text-muted">• Date: {show.show_date}</span>
                    <span className="text-xs text-text-muted">• {show.screen_name}</span>
                  </div>
                  <h3 className="text-lg font-black text-text-primary">{show.movie_title}</h3>
                </div>

                {/* 1-Click Toggle Switch to Open/Close Booking */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleStatus(show.id)}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      isBookingOpen
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isBookingOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span>{isBookingOpen ? 'Online Ticketing OPEN' : 'Online Ticketing CLOSED'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Price Override Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gold block flex items-center justify-between">
                    <span>Balcony Recliner (₹)</span>
                    <span className="text-text-muted font-normal">VIP Tier</span>
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.BALCONY}
                    onChange={(e) => handlePriceChange(show.id, 'BALCONY', e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-sm font-black text-gold focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-accent block flex items-center justify-between">
                    <span>Premium Executive (₹)</span>
                    <span className="text-text-muted font-normal">Middle Rows</span>
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.PREMIUM}
                    onChange={(e) => handlePriceChange(show.id, 'PREMIUM', e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-sm font-black text-accent focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary block flex items-center justify-between">
                    <span>Executive Classic (₹)</span>
                    <span className="text-text-muted font-normal">Front Tiers</span>
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.EXECUTIVE}
                    onChange={(e) => handlePriceChange(show.id, 'EXECUTIVE', e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-sm font-black text-text-primary focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. SCHEDULE SHOW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="max-w-lg w-full bg-surface rounded-3xl p-6 space-y-5 border border-gold/40 shadow-2xl text-text-primary">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-text-primary flex items-center gap-2">
                <Plus className="w-5 h-5 text-gold" /> Schedule New Showtime
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary text-xs font-bold px-2 py-1 rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
              <div>
                <label className="text-text-muted font-bold block mb-1">Select Movie Title</label>
                <select
                  value={newShow.movie_id}
                  onChange={(e) => setNewShow({ ...newShow, movie_id: e.target.value })}
                  className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
                >
                  {MOVIES.map((m) => (
                    <option key={m.id} value={m.id} className="bg-surface text-text-primary">
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted font-bold block mb-1">Show Date</label>
                  <input
                    type="date"
                    value={newShow.show_date}
                    onChange={(e) => setNewShow({ ...newShow, show_date: e.target.value })}
                    className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-text-muted font-bold block mb-1">Showtime Slot</label>
                  <select
                    value={newShow.show_time}
                    onChange={(e) => setNewShow({ ...newShow, show_time: e.target.value })}
                    className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
                  >
                    <option value="11:00 AM" className="bg-surface text-text-primary">Morning (11:00 AM)</option>
                    <option value="02:30 PM" className="bg-surface text-text-primary">Matinee (02:30 PM)</option>
                    <option value="06:15 PM" className="bg-surface text-text-primary">First Show (06:15 PM)</option>
                    <option value="09:45 PM" className="bg-surface text-text-primary">Second Show (09:45 PM)</option>
                  </select>
                </div>
              </div>

              {/* Pricing Defaults */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <label className="text-gold font-bold block mb-1 text-[10px] uppercase">Balcony (₹)</label>
                  <input
                    type="number"
                    value={newShow.balconyPrice}
                    onChange={(e) => setNewShow({ ...newShow, balconyPrice: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-gold font-black focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-accent font-bold block mb-1 text-[10px] uppercase">Premium (₹)</label>
                  <input
                    type="number"
                    value={newShow.premiumPrice}
                    onChange={(e) => setNewShow({ ...newShow, premiumPrice: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-accent font-black focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-text-secondary font-bold block mb-1 text-[10px] uppercase">Classic (₹)</label>
                  <input
                    type="number"
                    value={newShow.executivePrice}
                    onChange={(e) => setNewShow({ ...newShow, executivePrice: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-text-primary font-black focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black font-black uppercase tracking-wider shadow-gold-glow cursor-pointer transition-all"
                >
                  Publish Show & Open Online Ticketing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerShowsPage;

