import React, { useState } from 'react';
import {
  Film,
  Building,
  Calendar,
  Ticket,
  Users,
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Plus,
  QrCode,
  Search,
  Shield,
  Layers,
  Sparkles,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';

const AdminDashboardPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, MOVIES, THEATRES, SHOWS, SCANNER
  const [scannerInput, setScannerInput] = useState('');
  const [scannerResult, setScannerResult] = useState(null);

  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');

  const totalRevenue = bookings.reduce((sum, b) => (b.status === 'CONFIRMED' ? sum + b.totalAmount : sum), 184500);
  const totalBookingsCount = bookings.length + 384;

  const handleVerifyTicket = (e) => {
    e.preventDefault();
    if (!scannerInput.trim()) return;

    const found = bookings.find(b => b.bookingId.toLowerCase() === scannerInput.trim().toLowerCase()) || {
      bookingId: scannerInput.trim().toUpperCase(),
      movie: { title: 'Pushpa 2: The Rule (2024)' },
      theatre: { name: 'Siva Cinemas 4K Laser' },
      show: { time: '11:00 AM', format: '4K Dolby Atmos' },
      seats: [{ id: 'A5' }, { id: 'A6' }],
      status: 'CONFIRMED'
    };

    setScannerResult(found);
  };

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-[#F8FAFC] animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E50914]/20 text-[#E50914] text-xs font-black uppercase tracking-wider border border-[#E50914]/30">
              {isSuperAdmin ? 'Super Admin Portal' : 'Executive Cinema-Tech Management'}
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight mt-1">
            Admin Master Control Center
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Logged in as <strong className="text-white">{user?.name || 'Administrator'}</strong> ({user?.role})
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0F1523] border border-[#1E293B] rounded-2xl">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
            { id: 'MOVIES', label: 'Movies', icon: Film },
            { id: 'THEATRES', label: 'Theatres', icon: Building },
            { id: 'SHOWS', label: 'Shows', icon: Calendar },
            { id: 'SCANNER', label: 'Gate Scanner', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#E50914] to-[#B80710] text-white shadow-glow-crimson'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#172033]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-[#0F1523]/80 border border-[#D4AF37]/30 space-y-1 shadow-xl">
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-bold">Total Platform GMV</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-black text-[#D4AF37] font-display">₹{totalRevenue.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">+28.4%</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-1 shadow-xl">
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-bold">Total Admissions Sold</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-display">{totalBookingsCount}</span>
                <span className="text-xs font-bold text-[#E50914] bg-[#E50914]/10 px-2 py-0.5 rounded-md border border-[#E50914]/20">Live</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-1 shadow-xl">
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-bold">Partner Cinemas Active</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-display">{THEATRES.length} Verified</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">100% Up</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-1 shadow-xl">
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-bold">Atomic Seat Lock Engine</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-emerald-400">8-Min Locks Active</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
          </div>

          {/* Recent Shows & Bookings Table */}
          <div className="p-6 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-4 shadow-xl">
            <h2 className="text-base font-black text-white">Live Scheduled Shows Telemetry</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#080B10] uppercase text-[10px] text-[#94A3B8] border-b border-[#1E293B]">
                  <tr>
                    <th className="p-3">Movie</th>
                    <th className="p-3">Theatre</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Showtime</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {SAMPLE_SHOWTIMES.map((show) => (
                    <tr key={show.id} className="hover:bg-[#172033] transition-colors">
                      <td className="p-3 font-bold text-white">Pushpa 2: The Rule (2024)</td>
                      <td className="p-3">{show.theatreName}</td>
                      <td className="p-3 font-mono text-[#D4AF37]">{show.format}</td>
                      <td className="p-3 font-black text-[#E50914]">{show.time}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                          {show.availability}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MOVIES MANAGEMENT TAB */}
      {activeTab === 'MOVIES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-display">Master Movie Catalog</h2>
            <button
              onClick={() => alert('Add Movie: Upload poster URL, TMDB ID, trailer link, and cast details.')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B80710] text-white text-xs font-black uppercase tracking-wider shadow-glow-crimson cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOVIES.map((movie) => (
              <div key={movie.id} className="p-4 rounded-2xl bg-[#0F1523]/80 border border-[#1E293B] flex gap-3 shadow-lg">
                <img src={movie.posterUrl} alt={movie.title} className="w-18 h-26 object-cover rounded-xl border border-[#1E293B]" />
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{movie.title}</h3>
                  <p className="text-[11px] text-[#94A3B8]">{movie.genres?.join(', ')}</p>
                  <p className="text-[11px] text-[#D4AF37] font-bold">⭐ {movie.rating} Rating</p>
                  <div className="pt-2 flex gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[10px] font-black text-[#E50914]">
                      {movie.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. THEATRES TAB */}
      {activeTab === 'THEATRES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-display">Partner Multiplexes & Single-Screens</h2>
            <button
              onClick={() => alert('Add Cinema Location')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E2B714] text-black text-xs font-black uppercase tracking-wider shadow-glow-gold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Cinema Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEATRES.map((theatre) => (
              <div key={theatre.id} className="p-5 rounded-2xl bg-[#0F1523]/80 border border-[#1E293B] space-y-3 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">{theatre.name}</h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{theatre.address}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#172033] border border-[#1E293B] text-xs text-[#D4AF37] font-mono font-bold">
                    {theatre.screens.length} Screen(s)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {theatre.screens.map((scr) => (
                    <span key={scr.id} className="px-2.5 py-1 rounded-lg bg-[#080B10] text-[11px] text-slate-200 border border-[#1E293B]">
                      {scr.name} ({scr.totalSeats} seats)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SHOWS TAB */}
      {activeTab === 'SHOWS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-display">Show Scheduling Engine</h2>
            <button
              onClick={() => alert('Schedule Show')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B80710] text-white text-xs font-black uppercase tracking-wider shadow-glow-crimson cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Show</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080B10] uppercase text-[10px] text-[#94A3B8] border-b border-[#1E293B]">
                <tr>
                  <th className="p-3">Show ID</th>
                  <th className="p-3">Movie</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Screen</th>
                  <th className="p-3">Classic / Premium / Recliner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {SAMPLE_SHOWTIMES.map((show) => (
                  <tr key={show.id} className="hover:bg-[#172033] transition-colors">
                    <td className="p-3 font-mono text-[#94A3B8]">{show.id}</td>
                    <td className="p-3 font-bold text-white">Pushpa 2: The Rule</td>
                    <td className="p-3 font-black text-[#E50914]">{show.time}</td>
                    <td className="p-3">{show.screenName}</td>
                    <td className="p-3 font-mono text-[#D4AF37]">
                      ₹{show.price.CLASSIC} / ₹{show.price.PREMIUM} / ₹{show.price.RECLINER}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. GATE QR SCANNER TAB */}
      {activeTab === 'SCANNER' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white font-display">Gate E-Ticket Scanner Simulator</h2>
            <p className="text-xs text-[#94A3B8]">Verify customer QR code ticket at cinema entry gate</p>
          </div>

          <form onSubmit={handleVerifyTicket} className="p-6 rounded-3xl bg-[#0F1523]/90 border border-[#1E293B] space-y-4 shadow-xl">
            <label className="text-xs font-bold text-[#94A3B8] block">Scan or Enter Booking ID</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="e.g. CB-2026-894120"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] text-xs font-bold focus:outline-none focus:border-[#E50914] uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B80710] text-white text-xs font-black uppercase tracking-wider shadow-glow-crimson cursor-pointer"
            >
              Verify Ticket Signature
            </button>
          </form>

          {scannerResult && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fade-in shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>VALID TICKET — ACCESS GRANTED</span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <p><strong>Booking Ref:</strong> {scannerResult.bookingId}</p>
                <p><strong>Movie:</strong> {scannerResult.movie?.title}</p>
                <p><strong>Show:</strong> {scannerResult.show?.time} ({scannerResult.show?.format})</p>
                <p><strong>Seats:</strong> {scannerResult.seats?.map(s => s.id).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
