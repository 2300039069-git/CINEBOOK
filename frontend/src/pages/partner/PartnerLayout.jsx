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
  Printer,
  Plus,
  UtensilsCrossed
} from 'lucide-react';
import { THEATRES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const PartnerLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTheatreId, setActiveTheatreId] = useState('th-gtr-001');
  const [isTheatreDropdownOpen, setIsTheatreDropdownOpen] = useState(false);

  const activeTheatre = THEATRES.find(t => t.id === activeTheatreId) || THEATRES[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/partner', label: 'Overview Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/partner/counter-pos', label: 'Box-Office Counter POS', icon: Printer },
    { to: '/partner/canteen', label: 'Interval Canteen Orders', icon: UtensilsCrossed },
    { to: '/partner/screens', label: 'Screen & Seat Layouts', icon: Grid3X3 },
    { to: '/partner/shows', label: 'Show Schedules & Pricing', icon: CalendarDays },
    { to: '/partner/settlements', label: 'Daily T+1 Settlements', icon: ReceiptText },
    { to: '/partner/scanner', label: 'Gatekeeper QR Scanner', icon: QrCode },
    { to: '/partner/profile', label: 'Theatre & Bank Details', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col md:flex-row transition-colors">
      {/* 1. PARTNER SIDEBAR */}
      <aside className="w-full md:w-72 bg-surface border-r border-border flex flex-col justify-between p-5 space-y-6 flex-shrink-0">
        <div className="space-y-6">
          {/* Exhibitor Brand Header */}
          <div className="flex items-center justify-between">
            <Link to="/partner" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-text-primary tracking-tight leading-none block">
                  PARTNER<span className="text-amber-500">.</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                  Exhibitor Portal
                </span>
              </div>
            </Link>

            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase border border-emerald-500/20">
              Verified
            </span>
          </div>

          {/* Active Cinema Switcher Dropdown */}
          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              Active Multiplex / Cinema
            </label>
            <button
              onClick={() => setIsTheatreDropdownOpen(!isTheatreDropdownOpen)}
              className="w-full p-3 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between text-left hover:border-amber-500 transition-all group cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-text-primary truncate">{activeTheatre.name}</h4>
                <p className="text-[10px] text-text-muted capitalize">{activeTheatre.city} • Single-Screen 4K Laser</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isTheatreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options */}
            {isTheatreDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 p-2 bg-surface border border-border rounded-2xl shadow-xl space-y-1 z-50 animate-fade-in">
                <p className="text-[10px] font-bold text-text-muted px-2 py-1 uppercase">Switch Managed Theatre</p>
                {THEATRES.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTheatreId(t.id);
                      setIsTheatreDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      activeTheatreId === t.id
                        ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                        : 'text-text-secondary hover:bg-surface-elevated'
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
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'
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

        {/* Bottom Status & Actions */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted uppercase">T+1 Payout Status</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-Settling
              </span>
            </div>
            <p className="text-xs font-bold text-amber-500">SBI (A/C: ****29481)</p>
            <p className="text-[10px] text-text-muted">Next payout: Tomorrow, 09:00 AM</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-surface-elevated border border-border text-text-muted hover:text-text-primary text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer App</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN PARTNER CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-18 bg-surface/90 border-b border-border px-6 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <h2 className="text-sm font-bold text-text-primary">{activeTheatre.name} Partner Desk</h2>
              <p className="text-[11px] text-text-muted capitalize">{activeTheatre.city}, AP • Live Online Ticketing Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/partner/counter-pos"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-sm transition-all transform hover:scale-105"
            >
              <Printer className="w-4 h-4 text-black" />
              <span>Counter POS</span>
            </Link>

            <Link
              to="/partner/scanner"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm transition-all transform hover:scale-105"
            >
              <QrCode className="w-4 h-4" />
              <span>Gatekeeper Scanner</span>
            </Link>

            <Link
              to="/partner/shows"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated border border-border hover:border-amber-500 text-xs font-bold text-text-primary transition-all"
            >
              <Plus className="w-4 h-4 text-amber-500" />
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

