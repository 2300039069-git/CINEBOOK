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
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-background text-text-primary animate-fade-in transition-colors">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider border border-accent/20">
              {isSuperAdmin ? 'Super Admin Portal' : 'Executive Cinema-Tech Management'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mt-1">
            Admin Master Control Center
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Logged in as <strong className="text-text-primary">{user?.name || 'Administrator'}</strong> ({user?.role})
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface border border-border rounded-2xl">
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
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
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-1 shadow-sm">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Total Platform GMV</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">₹{totalRevenue.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">+28.4%</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border space-y-1 shadow-sm">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Total Admissions Sold</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-text-primary">{totalBookingsCount}</span>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">Live</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border space-y-1 shadow-sm">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Partner Cinemas Active</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-text-primary">{THEATRES.length} Verified</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">100% Up</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border space-y-1 shadow-sm">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Atomic Seat Lock Engine</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">8-Min Locks Active</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>
          </div>

          {/* Recent Shows & Bookings Table */}
          <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-text-primary">Live Scheduled Shows Telemetry</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead className="bg-surface-elevated uppercase text-[10px] text-text-muted border-b border-border">
                  <tr>
                    <th className="p-3 font-bold">Movie</th>
                    <th className="p-3 font-bold">Theatre</th>
                    <th className="p-3 font-bold">Format</th>
                    <th className="p-3 font-bold">Showtime</th>
                    <th className="p-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {SAMPLE_SHOWTIMES.map((show) => (
                    <tr key={show.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="p-3 font-bold text-text-primary">Pushpa 2: The Rule (2024)</td>
                      <td className="p-3">{show.theatreName}</td>
                      <td className="p-3 font-mono font-bold text-amber-500">{show.format}</td>
                      <td className="p-3 font-bold text-accent">{show.time}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
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
            <h2 className="text-xl font-bold text-text-primary">Master Movie Catalog</h2>
            <button
              onClick={() => alert('Add Movie: Upload poster URL, TMDB ID, trailer link, and cast details.')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOVIES.map((movie) => (
              <div key={movie.id} className="p-4 rounded-2xl bg-surface border border-border flex gap-3 shadow-sm">
                <img src={movie.posterUrl} alt={movie.title} className="w-18 h-26 object-cover rounded-xl border border-border" />
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-text-primary truncate">{movie.title}</h3>
                  <p className="text-[11px] text-text-muted">{movie.genres?.join(', ')}</p>
                  <p className="text-[11px] text-amber-500 font-bold">⭐ {movie.rating} Rating</p>
                  <div className="pt-2 flex gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent">
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
            <h2 className="text-xl font-bold text-text-primary">Partner Multiplexes & Single-Screens</h2>
            <button
              onClick={() => alert('Add Cinema Location')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Cinema Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEATRES.map((theatre) => (
              <div key={theatre.id} className="p-5 rounded-2xl bg-surface border border-border space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{theatre.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{theatre.address}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-xs text-amber-500 font-mono font-bold">
                    {theatre.screens.length} Screen(s)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {theatre.screens.map((scr) => (
                    <span key={scr.id} className="px-2.5 py-1 rounded-lg bg-surface-elevated text-[11px] text-text-secondary border border-border">
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
            <h2 className="text-xl font-bold text-text-primary">Show Scheduling Engine</h2>
            <button
              onClick={() => alert('Schedule Show')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Show</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="bg-surface-elevated uppercase text-[10px] text-text-muted border-b border-border">
                <tr>
                  <th className="p-3 font-bold">Show ID</th>
                  <th className="p-3 font-bold">Movie</th>
                  <th className="p-3 font-bold">Time</th>
                  <th className="p-3 font-bold">Screen</th>
                  <th className="p-3 font-bold">Classic / Premium / Recliner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SAMPLE_SHOWTIMES.map((show) => (
                  <tr key={show.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="p-3 font-mono text-text-muted">{show.id}</td>
                    <td className="p-3 font-bold text-text-primary">Pushpa 2: The Rule</td>
                    <td className="p-3 font-bold text-accent">{show.time}</td>
                    <td className="p-3">{show.screenName}</td>
                    <td className="p-3 font-mono text-amber-500 font-bold">
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
            <h2 className="text-xl font-bold text-text-primary">Gate E-Ticket Scanner Simulator</h2>
            <p className="text-xs text-text-muted">Verify customer QR code ticket at cinema entry gate</p>
          </div>

          <form onSubmit={handleVerifyTicket} className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
            <label className="text-xs font-bold text-text-muted block">Scan or Enter Booking ID</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="e.g. CB-2026-894120"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted text-xs font-bold focus:outline-none focus:border-accent uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
            >
              Verify Ticket Signature
            </button>
          </form>

          {scannerResult && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>VALID TICKET — ACCESS GRANTED</span>
              </div>
              <div className="space-y-1 text-xs text-text-secondary">
                <p><strong className="text-text-primary">Booking Ref:</strong> {scannerResult.bookingId}</p>
                <p><strong className="text-text-primary">Movie:</strong> {scannerResult.movie?.title}</p>
                <p><strong className="text-text-primary">Show:</strong> {scannerResult.show?.time} ({scannerResult.show?.format})</p>
                <p><strong className="text-text-primary">Seats:</strong> {scannerResult.seats?.map(s => s.id).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

