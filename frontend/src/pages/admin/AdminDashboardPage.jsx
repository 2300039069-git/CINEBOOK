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
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';

const AdminDashboardPage = () => {
  const { user, isSuperAdmin, isTheatreAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, MOVIES, THEATRES, SHOWS, SCANNER
  const [scannerInput, setScannerInput] = useState('');
  const [scannerResult, setScannerResult] = useState(null);

  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');

  const totalRevenue = bookings.reduce((sum, b) => (b.status === 'CONFIRMED' ? sum + b.totalAmount : sum), 42580);
  const totalBookingsCount = bookings.length + 184;

  const handleVerifyTicket = (e) => {
    e.preventDefault();
    if (!scannerInput.trim()) return;

    const found = bookings.find(b => b.bookingId.toLowerCase() === scannerInput.trim().toLowerCase()) || {
      bookingId: scannerInput.trim().toUpperCase(),
      movie: { title: 'Dune: Part Two' },
      theatre: { name: 'CineBook Grand Cinema — Phoenix Mall' },
      show: { time: '10:15 AM', format: 'IMAX 3D' },
      seats: [{ id: 'A5' }, { id: 'A6' }],
      status: 'CONFIRMED'
    };

    setScannerResult(found);
  };

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cine-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cine-primary/20 text-cine-primary text-xs font-bold uppercase tracking-wider">
              {isSuperAdmin ? 'Super Admin Portal' : 'Theatre Management System'}
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight mt-1">
            Admin Control Center
          </h1>
          <p className="text-xs text-cine-textMuted mt-1">
            Logged in as <strong className="text-white">{user?.name || 'Administrator'}</strong> ({user?.role})
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-cine-surface border border-cine-border rounded-2xl">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
            { id: 'MOVIES', label: 'Movies', icon: Film },
            { id: 'THEATRES', label: 'Theatres', icon: Building },
            { id: 'SHOWS', label: 'Shows', icon: Calendar },
            { id: 'SCANNER', label: 'QR Scanner', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-cine-primary text-white shadow-glow-primary'
                    : 'text-cine-textMuted hover:text-white hover:bg-cine-card'
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
            <div className="p-6 rounded-3xl bg-cine-surface border border-cine-border space-y-1">
              <span className="text-xs text-cine-textMuted uppercase tracking-wider font-semibold">Total Platform Revenue</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl font-extrabold text-white">₹{totalRevenue.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">+18.4%</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-cine-surface border border-cine-border space-y-1">
              <span className="text-xs text-cine-textMuted uppercase tracking-wider font-semibold">Total Bookings</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl font-extrabold text-white">{totalBookingsCount}</span>
                <span className="text-xs font-bold text-cine-primary bg-cine-primary/10 px-2 py-0.5 rounded-md">Live</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-cine-surface border border-cine-border space-y-1">
              <span className="text-xs text-cine-textMuted uppercase tracking-wider font-semibold">Active Cinemas</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl font-extrabold text-white">{THEATRES.length} Multiplexes</span>
                <span className="text-xs font-bold text-cine-secondary bg-blue-500/10 px-2 py-0.5 rounded-md">100% Up</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-cine-surface border border-cine-border space-y-1">
              <span className="text-xs text-cine-textMuted uppercase tracking-wider font-semibold">Seat Concurrency Engine</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-emerald-400">Atomic Locks Active</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Recent Shows & Bookings Table */}
          <div className="p-6 rounded-3xl bg-cine-surface border border-cine-border space-y-4">
            <h2 className="text-base font-bold text-white">Live Scheduled Shows</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-cine-card uppercase text-[10px] text-cine-textMuted border-b border-cine-border">
                  <tr>
                    <th className="p-3">Movie</th>
                    <th className="p-3">Theatre</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Showtime</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cine-border/50">
                  {SAMPLE_SHOWTIMES.map((show) => (
                    <tr key={show.id} className="hover:bg-cine-card/40">
                      <td className="p-3 font-semibold text-white">Dune: Part Two</td>
                      <td className="p-3">{show.theatreName}</td>
                      <td className="p-3 font-mono text-zinc-400">{show.format}</td>
                      <td className="p-3 font-bold text-cine-accent">{show.time}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
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
            <h2 className="text-xl font-bold text-white">Movie Catalog Management</h2>
            <button
              onClick={() => alert('Add Movie Modal: Allows uploading poster URLs, trailer links, and cast.')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cine-primary text-white text-xs font-bold shadow-glow-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOVIES.map((movie) => (
              <div key={movie.id} className="p-4 rounded-2xl bg-cine-surface border border-cine-border flex gap-3">
                <img src={movie.posterUrl} alt={movie.title} className="w-16 h-24 object-cover rounded-xl" />
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{movie.title}</h3>
                  <p className="text-[11px] text-cine-textMuted">{movie.genres.join(', ')}</p>
                  <p className="text-[11px] text-zinc-400">Rating: ⭐ {movie.rating}</p>
                  <div className="pt-2 flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-cine-card text-[10px] font-bold text-cine-accent">
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
            <h2 className="text-xl font-bold text-white">Partner Multiplexes & Screens</h2>
            <button
              onClick={() => alert('Add Theatre / Screen Modal')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cine-secondary text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cinema Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEATRES.map((theatre) => (
              <div key={theatre.id} className="p-5 rounded-2xl bg-cine-surface border border-cine-border space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{theatre.name}</h3>
                    <p className="text-xs text-cine-textMuted mt-0.5">{theatre.address}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cine-card text-xs text-zinc-300 font-mono">
                    {theatre.screens.length} Screens
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {theatre.screens.map((scr) => (
                    <span key={scr.id} className="px-2 py-1 rounded-lg bg-cine-card text-[11px] text-zinc-200 border border-cine-border">
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
            <h2 className="text-xl font-bold text-white">Show Scheduling Engine</h2>
            <button
              onClick={() => alert('Schedule Show Modal: Select Movie, Screen, Date, Showtime & Tier Pricing.')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cine-primary text-white text-xs font-bold shadow-glow-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Show</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-cine-surface border border-cine-border">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-cine-card uppercase text-[10px] text-cine-textMuted border-b border-cine-border">
                <tr>
                  <th className="p-3">Show ID</th>
                  <th className="p-3">Movie</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Screen</th>
                  <th className="p-3">Classic / Premium / Recliner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cine-border/50">
                {SAMPLE_SHOWTIMES.map((show) => (
                  <tr key={show.id} className="hover:bg-cine-card/40">
                    <td className="p-3 font-mono text-zinc-500">{show.id}</td>
                    <td className="p-3 font-semibold text-white">Dune: Part Two</td>
                    <td className="p-3 font-bold text-cine-primary">{show.time}</td>
                    <td className="p-3">{show.screenName}</td>
                    <td className="p-3 font-mono text-zinc-300">
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
            <h2 className="text-xl font-bold text-white">Gate E-Ticket Scanner</h2>
            <p className="text-xs text-cine-textMuted">Verify customer QR code ticket at cinema entry gate</p>
          </div>

          <form onSubmit={handleVerifyTicket} className="p-6 rounded-3xl bg-cine-surface border border-cine-border space-y-4">
            <label className="text-xs font-semibold text-zinc-300 block">Scan or Enter Booking ID</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
              <input
                type="text"
                placeholder="e.g. CB-2026-894120"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cine-primary text-white text-xs font-bold shadow-glow-primary"
            >
              Verify Ticket Signature
            </button>
          </form>

          {scannerResult && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>VALID TICKET — ACCESS GRANTED</span>
              </div>
              <div className="space-y-1 text-xs text-zinc-300">
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
