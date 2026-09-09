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
    <div className="space-y-8 animate-fade-in text-[#F8FAFC]">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-[#D4AF37]" /> Showtime Scheduling & Live Price Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 font-display">
            Show Schedules & Dynamic Pricing
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Assign blockbuster titles to screens, configure weekend price surges, and control advance online bookings
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E2B714] hover:from-[#E2B714] hover:to-[#D4AF37] text-black text-xs font-black uppercase tracking-wider shadow-glow-gold transition-all transform hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Schedule New Showtime</span>
        </button>
      </div>

      {/* 2. AUTO-RELEASE SAFEGUARD CALLOUT */}
      <div className="p-4 rounded-2xl bg-[#0F1523]/90 border border-[#D4AF37]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider">30-Minute Auto-Release Active</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">Zero Empty Seats</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              All unsold online quota seats are automatically unlocked to your Box Office Counter exactly 30 minutes before showtime.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-[#F3E5AB]">
          <Zap className="w-4 h-4 text-[#D4AF37]" />
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
              className="p-6 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] hover:border-[#D4AF37]/50 transition-all space-y-4 shadow-xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] text-[11px] font-black uppercase border border-[#D4AF37]/30">
                      {show.show_slot} • {show.show_time}
                    </span>
                    <span className="text-xs font-bold text-slate-300 bg-[#172033] px-2.5 py-0.5 rounded-lg border border-[#1E293B]">
                      {show.format}
                    </span>
                    <span className="text-xs text-[#94A3B8]">• Date: {show.show_date}</span>
                    <span className="text-xs text-[#94A3B8]">• {show.screen_name}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{show.movie_title}</h3>
                </div>

                {/* 1-Click Toggle Switch to Open/Close Booking */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleStatus(show.id)}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      isBookingOpen
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isBookingOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <span>{isBookingOpen ? 'Online Ticketing OPEN' : 'Online Ticketing CLOSED'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Price Override Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3.5 rounded-2xl bg-[#080B10] border border-[#1E293B] space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[#D4AF37] block flex items-center justify-between">
                    <span>Balcony Recliner (₹)</span>
                    <span className="text-slate-500 font-normal">VIP Tier</span>
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.BALCONY}
                    onChange={(e) => handlePriceChange(show.id, 'BALCONY', e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0F1523] border border-[#1E293B] rounded-xl text-sm font-black text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#080B10] border border-[#1E293B] space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[#E50914] block flex items-center justify-between">
                    <span>Premium Executive (₹)</span>
                    <span className="text-slate-500 font-normal">Middle Rows</span>
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.PREMIUM}
                    onChange={(e) => handlePriceChange(show.id, 'PREMIUM', e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0F1523] border border-[#1E293B] rounded-xl text-sm font-black text-[#E50914] focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#080B10] border border-[#1E293B] space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-300 block flex items-center justify-between">
                    <span>Executive Classic (₹)</span>
                    <span className="text-slate-500 font-normal">Front Tiers</span>
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.EXECUTIVE}
                    onChange={(e) => handlePriceChange(show.id, 'EXECUTIVE', e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0F1523] border border-[#1E293B] rounded-xl text-sm font-black text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. SCHEDULE SHOW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-lg w-full bg-[#0F1523] rounded-3xl p-6 space-y-5 border border-[#D4AF37]/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#D4AF37]" /> Schedule New Showtime
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
              <div>
                <label className="text-[#94A3B8] font-bold block mb-1">Select Movie Title</label>
                <select
                  value={newShow.movie_id}
                  onChange={(e) => setNewShow({ ...newShow, movie_id: e.target.value })}
                  className="w-full p-3 bg-[#080B10] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                >
                  {MOVIES.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#080B10] text-white">
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94A3B8] font-bold block mb-1">Show Date</label>
                  <input
                    type="date"
                    value={newShow.show_date}
                    onChange={(e) => setNewShow({ ...newShow, show_date: e.target.value })}
                    className="w-full p-3 bg-[#080B10] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[#94A3B8] font-bold block mb-1">Showtime Slot</label>
                  <select
                    value={newShow.show_time}
                    onChange={(e) => setNewShow({ ...newShow, show_time: e.target.value })}
                    className="w-full p-3 bg-[#080B10] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="11:00 AM" className="bg-[#080B10] text-white">Morning (11:00 AM)</option>
                    <option value="02:30 PM" className="bg-[#080B10] text-white">Matinee (02:30 PM)</option>
                    <option value="06:15 PM" className="bg-[#080B10] text-white">First Show (06:15 PM)</option>
                    <option value="09:45 PM" className="bg-[#080B10] text-white">Second Show (09:45 PM)</option>
                  </select>
                </div>
              </div>

              {/* Pricing Defaults */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <label className="text-[#D4AF37] font-bold block mb-1 text-[10px] uppercase">Balcony (₹)</label>
                  <input
                    type="number"
                    value={newShow.balconyPrice}
                    onChange={(e) => setNewShow({ ...newShow, balconyPrice: e.target.value })}
                    className="w-full p-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-[#D4AF37] font-black focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[#E50914] font-bold block mb-1 text-[10px] uppercase">Premium (₹)</label>
                  <input
                    type="number"
                    value={newShow.premiumPrice}
                    onChange={(e) => setNewShow({ ...newShow, premiumPrice: e.target.value })}
                    className="w-full p-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-[#E50914] font-black focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-[10px] uppercase">Classic (₹)</label>
                  <input
                    type="number"
                    value={newShow.executivePrice}
                    onChange={(e) => setNewShow({ ...newShow, executivePrice: e.target.value })}
                    className="w-full p-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-slate-200 font-black focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E2B714] hover:from-[#E2B714] hover:to-[#D4AF37] text-black font-black uppercase tracking-wider shadow-glow-gold cursor-pointer transition-all"
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

