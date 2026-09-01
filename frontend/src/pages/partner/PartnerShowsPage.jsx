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
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { MOVIES } from '../../data/mockData';

const INITIAL_SHOWS = [
  {
    id: 'sh-gtr-01',
    screen_name: 'Screen 1 4K Laser',
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
    screen_name: 'Screen 1 4K Laser',
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
    screen_name: 'Screen 1 4K Laser',
    movie_id: 'mov-pushpa-1',
    movie_title: 'Pushpa: The Rise (2021)',
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
    screen_name: 'Screen 1 4K Laser',
    movie_id: 'mov-ala-vaikunthapurramuloo',
    movie_title: 'Ala Vaikunthapurramuloo (2020)',
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
    movie_id: MOVIES[0].id,
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
      screen_name: 'Screen 1 4K Laser',
      movie_id: newShow.movie_id,
      movie_title: movieObj.title,
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
    <div className="space-y-8 animate-fade-in">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
        <div>
          <span className="text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" /> Showtime Scheduling & Price Override
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight mt-1 font-display">
            Show Schedules & Dynamic Pricing
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Assign blockbuster titles to screens, configure weekend price surges, and open advance bookings online
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black uppercase tracking-wider shadow-glow-pink transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Showtime</span>
        </button>
      </div>

      {/* 2. SCHEDULED SHOWS LIST WITH DYNAMIC PRICING OVERRIDE */}
      <div className="space-y-4">
        {shows.map((show) => {
          const isBookingOpen = show.booking_status === 'OPEN';
          return (
            <div
              key={show.id}
              className="p-6 rounded-3xl glass-panel space-y-4 border border-[var(--theme-border)] hover:border-pink-500/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[var(--theme-border)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-500 text-[10px] font-black uppercase border border-pink-500/30">
                      {show.show_slot} • {show.show_time}
                    </span>
                    <span className="text-xs font-bold text-cyan-500">{show.format}</span>
                    <span className="text-xs text-theme-muted">• Date: {show.show_date}</span>
                  </div>
                  <h3 className="text-lg font-black text-theme-primary">{show.movie_title}</h3>
                </div>

                {/* 1-Click Toggle Switch to Open/Close Booking */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleStatus(show.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all border ${
                      isBookingOpen
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-sm'
                        : 'bg-rose-500/20 border-rose-500 text-rose-500'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isBookingOpen ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                    <span>{isBookingOpen ? 'Online Advance Booking OPEN' : 'Online Advance Booking CLOSED'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Price Override Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3.5 rounded-2xl glass-card space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-amber-500 block">
                    Balcony Recliner Price (₹)
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.BALCONY}
                    onChange={(e) => handlePriceChange(show.id, 'BALCONY', e.target.value)}
                    className="w-full px-3 py-1.5 glass-panel rounded-xl text-sm font-black text-amber-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl glass-card space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-pink-500 block">
                    Premium Executive Price (₹)
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.PREMIUM}
                    onChange={(e) => handlePriceChange(show.id, 'PREMIUM', e.target.value)}
                    className="w-full px-3 py-1.5 glass-panel rounded-xl text-sm font-black text-pink-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl glass-card space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-cyan-500 block">
                    Classic Second Class Price (₹)
                  </label>
                  <input
                    type="number"
                    value={show.tier_price.EXECUTIVE}
                    onChange={(e) => handlePriceChange(show.id, 'EXECUTIVE', e.target.value)}
                    className="w-full px-3 py-1.5 glass-panel rounded-xl text-sm font-black text-cyan-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. SCHEDULE SHOW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-lg w-full glass-panel rounded-3xl p-6 space-y-5 border border-[var(--theme-border)] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
              <h3 className="text-base font-black text-theme-primary flex items-center gap-2">
                <Plus className="w-5 h-5 text-pink-500" /> Schedule New Showtime
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-theme-muted hover:text-theme-primary text-xs font-bold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
              <div>
                <label className="text-theme-muted font-bold block mb-1">Select Movie Title</label>
                <select
                  value={newShow.movie_id}
                  onChange={(e) => setNewShow({ ...newShow, movie_id: e.target.value })}
                  className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                >
                  {MOVIES.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#131527] text-white">
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-theme-muted font-bold block mb-1">Show Date</label>
                  <input
                    type="date"
                    value={newShow.show_date}
                    onChange={(e) => setNewShow({ ...newShow, show_date: e.target.value })}
                    className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-theme-muted font-bold block mb-1">Showtime Slot</label>
                  <select
                    value={newShow.show_time}
                    onChange={(e) => setNewShow({ ...newShow, show_time: e.target.value })}
                    className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                  >
                    <option value="11:00 AM" className="bg-[#131527] text-white">Morning (11:00 AM)</option>
                    <option value="02:30 PM" className="bg-[#131527] text-white">Matinee (02:30 PM)</option>
                    <option value="06:15 PM" className="bg-[#131527] text-white">First Show (06:15 PM)</option>
                    <option value="09:45 PM" className="bg-[#131527] text-white">Second Show (09:45 PM)</option>
                  </select>
                </div>
              </div>

              {/* Pricing Defaults */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <label className="text-amber-500 font-bold block mb-1 text-[10px] uppercase">Balcony (₹)</label>
                  <input
                    type="number"
                    value={newShow.balconyPrice}
                    onChange={(e) => setNewShow({ ...newShow, balconyPrice: e.target.value })}
                    className="w-full p-2 glass-card rounded-xl text-amber-500 font-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-pink-500 font-bold block mb-1 text-[10px] uppercase">Premium (₹)</label>
                  <input
                    type="number"
                    value={newShow.premiumPrice}
                    onChange={(e) => setNewShow({ ...newShow, premiumPrice: e.target.value })}
                    className="w-full p-2 glass-card rounded-xl text-pink-500 font-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-cyan-500 font-bold block mb-1 text-[10px] uppercase">Classic (₹)</label>
                  <input
                    type="number"
                    value={newShow.executivePrice}
                    onChange={(e) => setNewShow({ ...newShow, executivePrice: e.target.value })}
                    className="w-full p-2 glass-card rounded-xl text-cyan-500 font-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-black uppercase tracking-wider shadow-glow-pink"
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
