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
  Activity,
  Zap,
  Clock
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

    const found = bookings.find(b => b.bookingId?.toLowerCase() === scannerInput.trim().toLowerCase()) || {
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
      {/* 1. Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{isSuperAdmin ? 'Super Admin Portal' : 'Executive Cinema Management'}</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight mt-1 font-sans">
            Admin Master Control Center
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Logged in as <strong className="text-text-primary">{user?.name || 'Administrator'}</strong> ({user?.role || 'SUPER_ADMIN'})
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface border border-border rounded-2xl shadow-card">
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
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-cta'
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
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-1 shadow-card hover:border-amber-500/40 transition-all">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Total Platform GMV</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-500 font-sans">₹{totalRevenue.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">+28.4%</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border space-y-1 shadow-card hover:border-primary/40 transition-all">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Admissions Sold</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-black text-text-primary font-sans">{totalBookingsCount}</span>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">Live Sync</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border space-y-1 shadow-card hover:border-emerald-500/40 transition-all">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Partner Cinemas</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-black text-text-primary font-sans">{THEATRES.length} Verified</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">100% Up</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border space-y-1 shadow-card hover:border-blue-500/40 transition-all">
              <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Atomic Seat Locks</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">8-Min Atomic Engine</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>
          </div>

          {/* Recent Shows & Bookings Table */}
          <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-card">
            <h2 className="text-base font-bold text-text-primary font-sans">Live Scheduled Shows Telemetry</h2>
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
                      <td className="p-3 font-bold text-primary">{show.time}</td>
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
            <h2 className="text-xl font-bold text-text-primary font-sans">Master Movie Catalog</h2>
            <button
              type="button"
              onClick={() => alert('Add Movie: Upload poster URL, TMDB ID, trailer link, and cast details.')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider shadow-cta cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOVIES.map((movie) => (
              <div key={movie.id} className="p-4 rounded-3xl bg-surface border border-border flex gap-4 shadow-card hover:border-primary/40 transition-all">
                <img
                  src={movie.poster || movie.posterUrl || movie.poster_url || '/posters/pushpa2.jpg'}
                  alt={movie.title}
                  onError={(e) => {
                    const t = ((movie.title || '')).toLowerCase();
                    let fb = '/posters/pushpa2.jpg';
                    if (t.includes('devara')) fb = '/posters/devara.jpg';
                    else if (t.includes('kalki')) fb = '/posters/kalki.webp';
                    else if (t.includes('og')) fb = '/posters/og.jpg';
                    if (e.target.src !== fb && !e.target.src.endsWith(fb)) {
                      e.target.src = fb;
                    }
                  }}
                  className="w-20 h-28 object-cover rounded-2xl border border-border shadow-sm"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-text-primary truncate font-sans">{movie.title}</h3>
                  <p className="text-[11px] text-text-muted">{movie.genres?.join(', ')}</p>
                  <p className="text-[11px] text-amber-500 font-bold">⭐ {movie.rating} Rating</p>
                  <div className="pt-2 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                      {movie.status || 'NOW SHOWING'}
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
            <h2 className="text-xl font-bold text-text-primary font-sans">Partner Multiplexes & Single-Screens</h2>
            <button
              type="button"
              onClick={() => alert('Onboard Cinema Location')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Cinema</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {THEATRES.map((theatre) => (
              <div key={theatre.id} className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text-primary font-sans">{theatre.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{theatre.address}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-surface-elevated border border-border text-xs text-amber-500 font-mono font-bold">
                    {theatre.screens?.length || 1} Screen(s)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {theatre.screens?.map((scr) => (
                    <span key={scr.id} className="px-3 py-1 rounded-xl bg-surface-elevated text-[11px] text-text-secondary border border-border font-medium">
                      {scr.name} ({scr.totalSeats || 449} seats)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SHOWS MANAGEMENT TAB */}
      {activeTab === 'SHOWS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary font-sans">Active Showtime Schedule</h2>
            <button
              type="button"
              onClick={() => alert('Add Showtime Slot')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider shadow-cta cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Show</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_SHOWTIMES.map((st) => (
              <div key={st.id} className="p-5 rounded-3xl bg-surface border border-border space-y-2 shadow-card">
                <span className="text-xs font-mono font-bold text-amber-500">{st.format}</span>
                <h3 className="text-sm font-bold text-text-primary">{st.theatreName}</h3>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-black text-primary">{st.time}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                    {st.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GATE SCANNER SIMULATOR TAB */}
      {activeTab === 'SCANNER' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-8 rounded-3xl bg-surface border border-border space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center mx-auto text-primary shadow-md">
                <QrCode className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-text-primary font-sans">Turnstile Gate Scanner Simulator</h2>
              <p className="text-xs text-text-muted">Enter or scan ticket reference ID to verify turnstile admission</p>
            </div>

            <form onSubmit={handleVerifyTicket} className="space-y-3">
              <input
                type="text"
                placeholder="Enter Booking ID (e.g. CB-2026-894120)"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted text-xs font-mono font-bold focus:outline-none focus:border-primary text-center"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider shadow-cta cursor-pointer active:scale-95"
              >
                Scan & Verify Admission
              </button>
            </form>

            {scannerResult && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>TICKET VERIFIED — ADMISSION GRANTED</span>
                </div>
                <div className="space-y-1 text-text-secondary">
                  <p><strong>Booking Ref:</strong> <span className="font-mono text-text-primary">{scannerResult.bookingId}</span></p>
                  <p><strong>Movie:</strong> {scannerResult.movie?.title}</p>
                  <p><strong>Auditorium:</strong> {scannerResult.theatre?.name} (Audi 1)</p>
                  <p><strong>Seats:</strong> <span className="font-bold text-amber-500">{scannerResult.seats?.map(s => s.id).join(', ')}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
