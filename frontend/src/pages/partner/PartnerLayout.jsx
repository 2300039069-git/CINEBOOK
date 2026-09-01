import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid3X3,
  CalendarDays,
  ReceiptText,
  QrCode,
  Building2,
  Store,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  LogOut,
  Bell,
  CheckCircle2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { THEATRES } from '../../data/mockData';

const PartnerLayout = () => {
  const navigate = useNavigate();
  const [activeTheatreId, setActiveTheatreId] = useState('th-gtr-001');
  const [isTheatreDropdownOpen, setIsTheatreDropdownOpen] = useState(false);

  const activeTheatre = THEATRES.find(t => t.id === activeTheatreId) || THEATRES[0];

  const navLinks = [
    { to: '/partner', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/partner/screens', label: 'Screen & Seat Layouts', icon: Grid3X3 },
    { to: '/partner/shows', label: 'Show Schedules & Pricing', icon: CalendarDays },
    { to: '/partner/settlements', label: 'Daily T+1 Settlements', icon: ReceiptText },
    { to: '/partner/scanner', label: 'Gatekeeper QR Scanner', icon: QrCode },
    { to: '/partner/profile', label: 'Theatre & Bank Details', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-primary)] flex flex-col md:flex-row transition-colors">
      {/* 1. PARTNER SIDEBAR */}
      <aside className="w-full md:w-72 glass-panel border-r border-[var(--theme-border)] flex flex-col justify-between p-5 space-y-6 flex-shrink-0">
        <div className="space-y-6">
          {/* Exhibitor Brand Header */}
          <div className="flex items-center justify-between">
            <Link to="/partner" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-pink group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black gradient-text-neon font-display leading-none block">
                  PARTNER
                </span>
                <span className="text-[10px] font-black tracking-widest text-theme-muted uppercase">
                  Exhibitor Portal
                </span>
              </div>
            </Link>

            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase border border-emerald-500/30">
              Verified
            </span>
          </div>

          {/* Active Cinema Switcher Dropdown */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-wider text-theme-muted block mb-1">
              Active Multiplex / Cinema
            </label>
            <button
              onClick={() => setIsTheatreDropdownOpen(!isTheatreDropdownOpen)}
              className="w-full p-3 rounded-2xl glass-card flex items-center justify-between text-left hover:border-pink-500 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-theme-primary truncate">{activeTheatre.name}</h4>
                <p className="text-[10px] text-theme-muted capitalize">{activeTheatre.city} • Standalone Screen</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform ${isTheatreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options */}
            {isTheatreDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 p-2 glass-panel rounded-2xl shadow-2xl space-y-1 z-50 animate-fade-in border border-[var(--theme-border)]">
                <p className="text-[10px] font-bold text-theme-muted px-2 py-1 uppercase">Switch Managed Theatre</p>
                {THEATRES.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTheatreId(t.id);
                      setIsTheatreDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTheatreId === t.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                        : 'text-theme-secondary hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="text-[10px] opacity-75 capitalize">{t.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-glow-pink scale-102'
                        : 'text-theme-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-theme-primary'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & T+1 Settlement Summary */}
        <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
          <div className="p-3 rounded-2xl glass-card text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-theme-muted uppercase">T+1 Payout Status</span>
              <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-Settling
              </span>
            </div>
            <p className="text-xs font-black gradient-text-gold">SBI (A/C: ****29481)</p>
            <p className="text-[10px] text-theme-muted">Next batch: 03 Sep, 09:00 AM</p>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl glass-panel text-theme-muted hover:text-theme-primary text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Customer Portal</span>
          </Link>
        </div>
      </aside>

      {/* 2. MAIN PARTNER CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-18 glass-panel border-b border-[var(--theme-border)] px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <h2 className="text-sm font-black text-theme-primary">{activeTheatre.name} Partner Desk</h2>
              <p className="text-[11px] text-theme-muted capitalize">{activeTheatre.city}, AP • Live Online Ticketing Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/partner/scanner"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black shadow-glow-pink transition-all transform hover:scale-105"
            >
              <QrCode className="w-4 h-4" />
              <span>Gatekeeper QR Scanner</span>
            </Link>

            <Link
              to="/partner/shows"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-card hover:border-pink-500 text-xs font-bold text-theme-primary transition-all"
            >
              <Plus className="w-4 h-4 text-pink-500" />
              <span>Schedule Show</span>
            </Link>
          </div>
        </header>

        {/* Render Active View */}
        <main className="p-6 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PartnerLayout;
